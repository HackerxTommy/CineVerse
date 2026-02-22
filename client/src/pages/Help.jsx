import React, { useState } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';

const Help = () => {
    const [activeCategory, setActiveCategory] = useState('booking');
    const [activeFaq, setActiveFaq] = useState(null);

    const categories = [
        { id: 'booking', label: 'Booking', icon: '🎫' },
        { id: 'payment', label: 'Payments', icon: '💳' },
        { id: 'account', label: 'Account', icon: '👤' },
        { id: 'refund', label: 'Refunds', icon: '↩️' }
    ];

    const faqs = {
        booking: [
            {
                q: 'How do I book movie tickets?',
                a: 'Simply browse movies on the home page, select a movie, choose your preferred showtime, select seats, and complete the payment. You\'ll receive a QR code ticket instantly!'
            },
            {
                q: 'Can I choose my seats?',
                a: 'Yes! After selecting a showtime, you\'ll see an interactive seat map. Available seats are shown in color, and you can click to select them. Premium seats (recliner, balcony) are highlighted.'
            },
            {
                q: 'How far in advance can I book?',
                a: 'You can book tickets up to 7 days in advance, depending on theater availability. Some premieres may open earlier.'
            },
            {
                q: 'Can I book for someone else?',
                a: 'Absolutely! Just share the QR code ticket with them. The ticket is valid regardless of who presents it.'
            }
        ],
        payment: [
            {
                q: 'What payment methods are accepted?',
                a: 'We accept all major credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, and popular digital wallets.'
            },
            {
                q: 'Is my payment information secure?',
                a: 'Yes! All payments are processed through PCI-DSS compliant payment gateways with 256-bit SSL encryption.'
            },
            {
                q: 'Why was my payment declined?',
                a: 'Common reasons include insufficient funds, card limits, or bank restrictions. Please try another payment method or contact your bank.'
            },
            {
                q: 'Will I get a payment receipt?',
                a: 'Yes, a digital receipt is sent to your registered email immediately after successful payment.'
            }
        ],
        account: [
            {
                q: 'How do I create an account?',
                a: 'Click "Login" and then "Sign up". You can register with email/password or quickly sign up with Google.'
            },
            {
                q: 'How do I enable Two-Factor Authentication?',
                a: 'Go to Profile → Security Settings → Enable 2FA. Scan the QR code with Google Authenticator and enter the verification code.'
            },
            {
                q: 'I forgot my password. What do I do?',
                a: 'Click "Forgot Password" on the login page. We\'ll send a reset link to your registered email.'
            },
            {
                q: 'How do I update my profile?',
                a: 'Navigate to your Profile page from the navbar dropdown. You can update your name, email, phone, and other details.'
            }
        ],
        refund: [
            {
                q: 'Can I cancel my booking?',
                a: 'Yes, you can cancel up to 4 hours before showtime. Go to My Tickets, select the booking, and click Cancel.'
            },
            {
                q: 'How long does a refund take?',
                a: 'Refunds are processed within 24-48 hours. The amount will reflect in your original payment method within 5-7 business days.'
            },
            {
                q: 'Is there a cancellation fee?',
                a: 'A convenience fee of ₹30 per ticket is deducted from refunds. Bookings cancelled within 4-6 hours of showtime have a 25% fee.'
            },
            {
                q: 'What if the show is cancelled by the theater?',
                a: 'You\'ll receive a full refund automatically within 24 hours. No cancellation fees apply in this case.'
            }
        ]
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <AnimatedBackground variant="default" />

            <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '50px' }}
                >
                    <h1 style={{ marginBottom: '15px' }}>
                        Help <span style={{ color: 'var(--primary)' }}>Center</span>
                    </h1>
                    <p style={{ color: '#888', fontSize: '1.1rem' }}>
                        Find answers to frequently asked questions
                    </p>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '15px',
                        marginBottom: '50px'
                    }}
                >
                    {categories.map((cat, i) => (
                        <motion.button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            whileHover={{ scale: 1.03, y: -3 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                padding: '20px',
                                background: activeCategory === cat.id
                                    ? 'linear-gradient(135deg, var(--primary), #b20710)'
                                    : 'rgba(255,255,255,0.05)',
                                border: '1px solid',
                                borderColor: activeCategory === cat.id ? 'transparent' : 'rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                            {cat.label}
                        </motion.button>
                    ))}
                </motion.div>

                {/* FAQ Section */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
                    >
                        {faqs[activeCategory]?.map((faq, i) => (
                            <motion.div
                                key={i}
                                className="glass-panel"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <motion.div
                                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                    whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                                    style={{
                                        padding: '25px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <h3 style={{ margin: 0, color: '#fff', fontWeight: 500, fontSize: '1.05rem' }}>
                                        {faq.q}
                                    </h3>
                                    <motion.span
                                        animate={{ rotate: activeFaq === i ? 180 : 0 }}
                                        style={{ color: 'var(--primary)', fontSize: '1.2rem' }}
                                    >
                                        ▼
                                    </motion.span>
                                </motion.div>

                                <AnimatePresence>
                                    {activeFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{
                                                padding: '0 25px 25px',
                                                color: '#aaa',
                                                lineHeight: 1.7,
                                                borderTop: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <p style={{ marginTop: '20px' }}>{faq.a}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Still Need Help */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="glass-panel"
                    style={{
                        marginTop: '50px',
                        padding: '40px',
                        textAlign: 'center'
                    }}
                >
                    <h3 style={{ marginBottom: '15px' }}>Still need help?</h3>
                    <p style={{ color: '#888', marginBottom: '25px' }}>
                        Our support team is available 24/7
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <motion.a
                            href="/contact"
                            className="btn btn-primary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ textDecoration: 'none' }}
                        >
                            Contact Support
                        </motion.a>
                        <motion.a
                            href="mailto:support@cineverse.com"
                            className="btn btn-outline"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ textDecoration: 'none' }}
                        >
                            Email Us
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Help;
