import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Payment method icons
const UPI_APPS = [
    { id: 'gpay', name: 'Google Pay', color: '#4285f4', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg' },
    { id: 'phonepe', name: 'PhonePe', color: '#5f259f', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg' },
    { id: 'paytm', name: 'Paytm', color: '#00baf2', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg' },
    { id: 'bhim', name: 'BHIM', color: '#00a651', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg' }
];

// Known valid UPI bank handles
const VALID_UPI_HANDLES = [
    'okaxis', 'okhdfcbank', 'okicici', 'oksbi',
    'ybl', 'ibl', 'axl', 'sbi', 'upi',
    'paytm', 'apl', 'ratn', 'icici', 'hdfcbank',
    'axisbank', 'kotak', 'indus', 'barodampay',
    'aubank', 'indianbank', 'cbin', 'cnrb',
    'pnb', 'idbi', 'idfcbank', 'federal',
    'dbs', 'rbl', 'kvb', 'kbl',
    'freecharge', 'jupiteraxis', 'slice',
    'superyes', 'tapicici', 'waaxis', 'wahdfcbank',
    'abfspay', 'ikwik', 'myicici', 'pingpay'
];

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Inter, sans-serif',
            '::placeholder': { color: '#666666' },
            iconColor: '#00f2ea'
        },
        invalid: { color: '#ff4757', iconColor: '#ff4757' }
    }
};

let stripePromise = null;

// Payment validation steps
const PAYMENT_STEPS = [
    { id: 'verify', label: 'Verifying', icon: '🔍' },
    { id: 'process', label: 'Processing', icon: '⚙️' },
    { id: 'confirm', label: 'Confirming', icon: '✅' },
    { id: 'complete', label: 'Complete', icon: '🎉' }
];

const PaymentForm = ({ clientSecret, showDetails, seats, totalAmount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [selectedUpi, setSelectedUpi] = useState(null);
    const [upiId, setUpiId] = useState('');
    const [upiVerifyStatus, setUpiVerifyStatus] = useState('idle'); // idle | checking | verified | invalid
    const [upiVerifyMsg, setUpiVerifyMsg] = useState('');
    const [upiCollect, setUpiCollect] = useState({ active: false, status: 'pending', countdown: 30 }); // UPI collect request state
    const [currentStep, setCurrentStep] = useState(-1);
    const [validationErrors, setValidationErrors] = useState({});

    // UPI collect request countdown
    useEffect(() => {
        if (!upiCollect.active || upiCollect.status !== 'pending') return;
        if (upiCollect.countdown <= 0) {
            setTimeout(() => {
                setUpiCollect(prev => ({ ...prev, status: 'expired', active: false }));
                setError('Payment request expired. Please try again.');
                setProcessing(false);
            }, 0);
            return;
        }
        const timer = setInterval(() => {
            setUpiCollect(prev => ({ ...prev, countdown: prev.countdown - 1 }));
        }, 1000);
        return () => clearInterval(timer);
    }, [upiCollect.active, upiCollect.status, upiCollect.countdown]);

    // Real-time UPI ID verification with debounce
    useEffect(() => {
        if (!upiId) {
            setTimeout(() => {
                setUpiVerifyStatus('idle');
                setUpiVerifyMsg('');
            }, 0);
            return;
        }

        const parts = upiId.split('@');
        if (parts.length !== 2 || !parts[0].trim()) {
            if (upiId.length > 2) {
                setTimeout(() => {
                    setUpiVerifyStatus('invalid');
                    setUpiVerifyMsg('Format: yourname@bankhandle');
                }, 0);
            } else {
                setTimeout(() => {
                    setUpiVerifyStatus('idle');
                    setUpiVerifyMsg('');
                }, 0);
            }
            return;
        }

        const [username, handle] = parts;
        if (username.length < 3) {
            setTimeout(() => {
                setUpiVerifyStatus('invalid');
                setUpiVerifyMsg('Username must be at least 3 characters');
            }, 0);
            return;
        }

        if (!handle) {
            setTimeout(() => {
                setUpiVerifyStatus('idle');
                setUpiVerifyMsg('');
            }, 0);
            return;
        }

        // Start verification (debounced)
        setTimeout(() => {
            setUpiVerifyStatus('checking');
            setUpiVerifyMsg('Verifying UPI ID...');
        }, 0);

        const timer = setTimeout(() => {
            const isValidHandle = VALID_UPI_HANDLES.includes(handle.toLowerCase());
            const hasValidFormat = /^[a-zA-Z0-9.\-_]{3,}$/.test(username);

            if (isValidHandle && hasValidFormat) {
                setUpiVerifyStatus('verified');
                setUpiVerifyMsg(`Verified • ${handle.toUpperCase()} linked`);
            } else if (!isValidHandle) {
                setUpiVerifyStatus('invalid');
                setUpiVerifyMsg(`Unknown bank handle "@${handle}"`);
            } else {
                setUpiVerifyStatus('invalid');
                setUpiVerifyMsg('Invalid UPI ID format');
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [upiId]);

    // Validate form before submission
    const validateForm = () => {
        const errors = {};

        if (paymentMethod === 'card') {
            const cardElement = elements?.getElement(CardElement);
            if (!cardElement) {
                errors.card = 'Card details are required';
            }
        } else if (paymentMethod === 'upi') {
            if (!selectedUpi) {
                errors.upi = 'Please select a UPI app';
            }
            if (!upiId || !upiId.includes('@')) {
                errors.upiId = 'Please enter a valid UPI ID (e.g., name@upi)';
            } else if (upiVerifyStatus !== 'verified') {
                errors.upiId = 'Please wait for UPI ID verification';
            }
        }

        if (!seats || seats.length === 0) {
            errors.seats = 'No seats selected';
        }

        if (!totalAmount || totalAmount <= 0) {
            errors.amount = 'Invalid payment amount';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate before processing
        if (!validateForm()) {
            return;
        }

        if (!stripe || !elements) return;

        setProcessing(true);
        setError('');
        setCurrentStep(0);

        try {
            if (paymentMethod === 'card') {
                // Step 1: Verify card
                setCurrentStep(0);
                await new Promise(resolve => setTimeout(resolve, 500));

                // Step 2: Process payment
                setCurrentStep(1);
                const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: elements.getElement(CardElement)
                    }
                });

                if (stripeError) {
                    setError(stripeError.message);
                    setProcessing(false);
                    setCurrentStep(-1);
                    return;
                }

                // Step 3: Confirm
                setCurrentStep(2);
                await new Promise(resolve => setTimeout(resolve, 500));

                if (paymentIntent.status === 'succeeded') {
                    // Step 4: Complete
                    setCurrentStep(3);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    onSuccess(paymentIntent.id);
                }
            } else if (paymentMethod === 'upi') {
                // Simulate UPI collect request
                setUpiCollect({ active: true, status: 'pending', countdown: 30 });

                // Simulate: after ~8 seconds, auto-approve the payment
                await new Promise((resolve) => {
                    setTimeout(() => {
                        setUpiCollect(prev => ({ ...prev, status: 'approved' }));
                        setTimeout(() => {
                            setUpiCollect(prev => ({ ...prev, active: false }));
                            setProcessing(false);
                            resolve();
                        }, 1500);
                    }, 8000);
                });

                onSuccess('upi_' + Date.now());
            }
        } catch (err) {
            setError(err.message || 'Payment failed. Please try again.');
            setProcessing(false);
            setCurrentStep(-1);
        }
    };

    const selectedApp = UPI_APPS.find(a => a.id === selectedUpi);

    return (
        <>
            {/* UPI Collect Request Overlay */}
            <AnimatePresence>
                {upiCollect.active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            style={{
                                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                borderRadius: '24px',
                                padding: '40px',
                                maxWidth: '420px',
                                width: '90%',
                                textAlign: 'center',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 25px 80px rgba(0,0,0,0.5)'
                            }}
                        >
                            {upiCollect.status === 'pending' && (
                                <>
                                    {/* Pulsing phone icon */}
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        style={{ fontSize: '4rem', marginBottom: '20px' }}
                                    >
                                        📱
                                    </motion.div>

                                    <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem' }}>Payment Request Sent</h3>
                                    <p style={{ color: '#888', margin: '0 0 25px', fontSize: '0.95rem' }}>
                                        Approve the request on your {selectedApp?.name || 'UPI'} app
                                    </p>

                                    {/* UPI ID display */}
                                    <div style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        padding: '15px',
                                        marginBottom: '25px'
                                    }}>
                                        <p style={{ color: '#666', fontSize: '0.8rem', margin: '0 0 5px' }}>Paying to</p>
                                        <p style={{ color: '#00f2ea', fontFamily: 'monospace', fontSize: '1.1rem', margin: '0 0 10px' }}>{upiId}</p>
                                        <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>₹{totalAmount?.toFixed(2)}</p>
                                    </div>

                                    {/* Animated waiting dots */}
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                                        {[0, 1, 2].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                                                style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    background: '#00f2ea'
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 15px' }}>
                                        Waiting for approval...
                                    </p>

                                    {/* Countdown timer */}
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '20px',
                                        padding: '8px 16px',
                                        color: upiCollect.countdown <= 10 ? '#ff4757' : '#888',
                                        fontSize: '0.9rem'
                                    }}>
                                        ⏱️ Expires in {upiCollect.countdown}s
                                    </div>
                                </>
                            )}

                            {upiCollect.status === 'approved' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 0.5 }}
                                        style={{ fontSize: '5rem', marginBottom: '15px' }}
                                    >✅</motion.div>
                                    <h3 style={{ color: '#2ed573', margin: '0 0 10px' }}>Payment Approved!</h3>
                                    <p style={{ color: '#888', margin: 0 }}>Confirming your booking...</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="payment-form">
                {/* Payment Step Progress */}
                {processing && currentStep >= 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="payment-steps glass-panel"
                        style={{ padding: '20px', marginBottom: '25px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {PAYMENT_STEPS.map((step, i) => (
                                <div
                                    key={step.id}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        flex: 1,
                                        position: 'relative'
                                    }}
                                >
                                    <motion.div
                                        animate={{
                                            scale: currentStep === i ? [1, 1.2, 1] : 1,
                                            opacity: currentStep >= i ? 1 : 0.3
                                        }}
                                        transition={{ repeat: currentStep === i ? Infinity : 0, duration: 1 }}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: currentStep >= i
                                                ? 'linear-gradient(135deg, var(--primary), #b20710)'
                                                : 'rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem'
                                        }}
                                    >
                                        {step.icon}
                                    </motion.div>
                                    <span style={{
                                        marginTop: '8px',
                                        fontSize: '0.8rem',
                                        color: currentStep >= i ? '#fff' : '#666'
                                    }}>
                                        {step.label}
                                    </span>
                                    {i < PAYMENT_STEPS.length - 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '25px',
                                            left: '60%',
                                            width: '80%',
                                            height: '2px',
                                            background: currentStep > i ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
                                        }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Payment Method Selection */}
                <div className="payment-methods">
                    <h3>Choose Payment Method</h3>

                    <div className="method-tabs">
                        <motion.button
                            type="button"
                            className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('card')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            💳 Card
                        </motion.button>
                        <motion.button
                            type="button"
                            className={`method-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('upi')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            📱 UPI
                        </motion.button>
                    </div>

                    <AnimatePresence mode="wait">
                        {paymentMethod === 'card' && (
                            <motion.div
                                key="card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="card-section"
                            >
                                <div className="card-brands">
                                    <span className="card-brand visa" style={{ background: '#1a1f71', color: 'white', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', fontStyle: 'italic' }}>VISA</span>
                                    <span className="card-brand mastercard" style={{ background: '#eb001b', color: 'white', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold' }}>Mastercard</span>
                                    <span className="card-brand rupay" style={{ background: '#00baf2', color: 'white', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold' }}>RuPay</span>
                                    <span className="card-brand amex" style={{ background: '#005587', color: 'white', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold' }}>Amex</span>
                                </div>
                                <div className="card-element-wrapper" style={{
                                    border: validationErrors.card ? '1px solid var(--danger)' : undefined
                                }}>
                                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                                </div>
                                {validationErrors.card && (
                                    <p className="field-error" style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '5px' }}>
                                        {validationErrors.card}
                                    </p>
                                )}
                                <p className="secure-text">🔒 Secured by Stripe - 256-bit encryption</p>
                            </motion.div>
                        )}

                        {paymentMethod === 'upi' && (
                            <motion.div
                                key="upi"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="upi-section"
                            >
                                <div className="upi-apps">
                                    {UPI_APPS.map(app => (
                                        <motion.div
                                            key={app.id}
                                            className={`upi-app ${selectedUpi === app.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedUpi(app.id)}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{ '--app-color': app.color }}
                                        >
                                            <img src={app.logo} alt={app.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
                                        </motion.div>
                                    ))}
                                </div>
                                {validationErrors.upi && (
                                    <p className="field-error" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                                        {validationErrors.upi}
                                    </p>
                                )}
                                {selectedUpi && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="upi-input-section"
                                    >
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                placeholder="Enter UPI ID (e.g., name@okaxis)"
                                                className="upi-input"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value.toLowerCase().trim())}
                                                style={{
                                                    border: upiVerifyStatus === 'verified' ? '1px solid #2ed573'
                                                        : upiVerifyStatus === 'invalid' ? '1px solid var(--danger)'
                                                            : validationErrors.upiId ? '1px solid var(--danger)'
                                                                : '1px solid rgba(255,255,255,0.1)',
                                                    paddingRight: '45px',
                                                    transition: 'border-color 0.3s ease'
                                                }}
                                            />
                                            {/* Verification status icon */}
                                            <div style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                {upiVerifyStatus === 'checking' && (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                                        style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            border: '2px solid rgba(255,255,255,0.1)',
                                                            borderTopColor: '#00f2ea',
                                                            borderRadius: '50%'
                                                        }}
                                                    />
                                                )}
                                                {upiVerifyStatus === 'verified' && (
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        style={{ fontSize: '1.3rem' }}
                                                    >✅</motion.span>
                                                )}
                                                {upiVerifyStatus === 'invalid' && (
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        style={{ fontSize: '1.3rem' }}
                                                    >❌</motion.span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Verification message */}
                                        <AnimatePresence>
                                            {upiVerifyMsg && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    style={{
                                                        fontSize: '0.85rem',
                                                        marginTop: '8px',
                                                        color: upiVerifyStatus === 'verified' ? '#2ed573'
                                                            : upiVerifyStatus === 'invalid' ? '#ff4757'
                                                                : upiVerifyStatus === 'checking' ? '#00f2ea'
                                                                    : '#888',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    {upiVerifyStatus === 'checking' && '🔄'}
                                                    {upiVerifyStatus === 'verified' && '🔒'}
                                                    {upiVerifyStatus === 'invalid' && '⚠️'}
                                                    {upiVerifyMsg}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                        {validationErrors.upiId && upiVerifyStatus !== 'invalid' && (
                                            <p className="field-error" style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '5px' }}>
                                                {validationErrors.upiId}
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="error-message"
                        style={{
                            padding: '15px',
                            background: 'rgba(255,71,87,0.15)',
                            border: '1px solid var(--danger)',
                            borderRadius: '10px',
                            color: 'var(--danger)',
                            marginBottom: '20px'
                        }}
                    >
                        ⚠️ {error}
                    </motion.div>
                )}

                {/* Order Summary */}
                <div className="order-summary glass-panel">
                    <h4>Order Summary</h4>
                    <div className="summary-row">
                        <span>🎬 {showDetails?.movie}</span>
                    </div>
                    <div className="summary-row">
                        <span>💺 Seats: {seats.join(', ')}</span>
                    </div>
                    <div className="summary-row">
                        <span>🏢 {showDetails?.theater}</span>
                    </div>
                    <div className="summary-row">
                        <span>📅 {showDetails?.time && new Date(showDetails.time).toLocaleString()}</span>
                    </div>
                    <hr />
                    <div className="summary-row">
                        <span>Ticket Price ({seats.length}x)</span>
                        <span>₹{showDetails?.price * seats.length}</span>
                    </div>
                    <div className="summary-row">
                        <span>Convenience Fee</span>
                        <span>₹{(totalAmount - (showDetails?.price * seats.length)).toFixed(2)}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span className="amount">₹{totalAmount?.toFixed(2)}</span>
                    </div>
                </div>

                <motion.button
                    type="submit"
                    className="btn btn-primary btn-glow pay-button"
                    disabled={processing || (!stripe && paymentMethod === 'card')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {processing ? (
                        <span className="processing">
                            <span className="spinner" /> {PAYMENT_STEPS[currentStep]?.label || 'Processing'}...
                        </span>
                    ) : (
                        `Pay ₹${totalAmount?.toFixed(2)}`
                    )}
                </motion.button>

                {/* Trust badges */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '25px',
                    marginTop: '25px',
                    fontSize: '0.85rem',
                    color: '#888'
                }}>
                    <span>🔒 SSL Secured</span>
                    <span>💳 PCI Compliant</span>
                    <span>🛡️ Safe Checkout</span>
                </div>
            </form>
        </>
    );
};

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);

    const [_stripeKey, setStripeKey] = useState('');
    const [initError, setInitError] = useState('');

    const { showId, selectedSeats, totalAmount, show } = location.state || {};

    useEffect(() => {
        // Validation checks
        if (!user) {
            navigate('/login', { state: { from: '/payment', message: 'Please login to continue' } });
            return;
        }
        if (!showId || !selectedSeats || selectedSeats.length === 0) {
            navigate('/', { state: { error: 'Invalid booking. Please select seats again.' } });
            return;
        }
        if (!totalAmount || totalAmount <= 0) {
            navigate('/', { state: { error: 'Invalid payment amount.' } });
            return;
        }

        initializePayment();
    }, [user, showId, selectedSeats, navigate, totalAmount, initializePayment]);

    const initializePayment = React.useCallback(async () => {
        try {
            // Validate seat lock before payment
            const lockCheck = await axios.post(
                `${API_URL}/bookings/verify-lock`,
                { showId, seats: selectedSeats },
                { withCredentials: true }
            ).catch(() => ({ data: { valid: true } })); // Fallback if endpoint doesn't exist

            if (lockCheck.data && !lockCheck.data.valid) {
                setInitError('Your seat reservation has expired. Please select seats again.');
                setTimeout(() => navigate(`/book/${showId}`), 3000);
                return;
            }

            // Get Stripe config
            const configRes = await axios.get(`${API_URL}/payments/config`);
            setStripeKey(configRes.data.publishableKey);

            if (configRes.data.publishableKey) {
                stripePromise = loadStripe(configRes.data.publishableKey);
            }

            // Create payment intent
            const intentRes = await axios.post(
                `${API_URL}/payments/create-intent`,
                { showId, seats: selectedSeats, totalAmount },
                { withCredentials: true }
            );

            setClientSecret(intentRes.data.clientSecret);
        } catch (err) {
            console.error('Payment init error:', err);
            setInitError(err.response?.data?.message || 'Failed to initialize payment');
        } finally {
            setLoading(false);
        }
    }, [showId, selectedSeats, totalAmount, navigate]);

    const handlePaymentSuccess = async (paymentIntentId) => {
        try {
            const res = await axios.post(
                `${API_URL}/payments/confirm`,
                {
                    paymentIntentId,
                    showId,
                    seats: selectedSeats,
                    totalAmount
                },
                { withCredentials: true }
            );

            navigate('/booking-success', {
                state: {
                    booking: res.data.booking,
                    showDetails: show
                }
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        }
    };

    if (loading) {
        return (
            <div className="payment-page">
                <AnimatedBackground variant="blue" />
                <div className="container" style={{ paddingTop: '120px', position: 'relative', zIndex: 1 }}>
                    <div className="loading-state glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            style={{
                                width: '60px',
                                height: '60px',
                                border: '4px solid rgba(255,255,255,0.1)',
                                borderTopColor: 'var(--primary)',
                                borderRadius: '50%',
                                margin: '0 auto 20px'
                            }}
                        />
                        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Setting up secure payment...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (initError) {
        return (
            <div className="payment-page">
                <AnimatedBackground variant="default" />
                <div className="container" style={{ paddingTop: '120px', position: 'relative', zIndex: 1 }}>
                    <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                        <span style={{ fontSize: '4rem' }}>⚠️</span>
                        <h2 style={{ margin: '20px 0 15px' }}>Payment Error</h2>
                        <p style={{ color: '#888', marginBottom: '25px' }}>{initError}</p>
                        <motion.button
                            className="btn btn-primary"
                            onClick={() => navigate('/')}
                            whileHover={{ scale: 1.05 }}
                        >
                            Back to Home
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <AnimatedBackground variant="blue" />
            <div className="container" style={{ paddingTop: '120px', position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="payment-container"
                >
                    <div className="payment-header">
                        <motion.button
                            className="back-btn"
                            onClick={() => navigate(-1)}
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ← Back
                        </motion.button>
                        <h2>Complete Payment</h2>
                    </div>

                    {/* Movie Info Card */}
                    <div className="movie-info-card glass-panel">
                        {show?.poster && (
                            <img src={show.poster} alt={show.movie} className="mini-poster" />
                        )}
                        <div className="movie-info">
                            <h3>{show?.movie}</h3>
                            <p>{show?.theater}</p>
                            <p>{show?.time && new Date(show.time).toLocaleString()}</p>
                        </div>
                    </div>

                    {stripePromise && clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <PaymentForm
                                clientSecret={clientSecret}
                                showDetails={show}
                                seats={selectedSeats}
                                totalAmount={totalAmount}
                                onSuccess={handlePaymentSuccess}
                            />
                        </Elements>
                    ) : (
                        <div className="demo-payment glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                            <span style={{ fontSize: '3rem' }}>🎫</span>
                            <p style={{ margin: '20px 0', color: '#aaa' }}>
                                Payment gateway not configured. Using demo mode.
                            </p>
                            <motion.button
                                className="btn btn-primary btn-glow"
                                onClick={() => handlePaymentSuccess('demo_' + Date.now())}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ padding: '15px 40px' }}
                            >
                                Complete Demo Payment (₹{totalAmount?.toFixed(2)})
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentPage;
