const Stripe = require('stripe');

class StripeService {
    constructor() {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            console.warn('Warning: STRIPE_SECRET_KEY not configured');
        }
        this.stripe = secretKey ? new Stripe(secretKey) : null;
    }

    /**
     * Create a payment intent for booking
     * @param {number} amount - Amount in dollars
     * @param {string} currency - Currency code
     * @param {object} metadata - Additional metadata
     */
    async createPaymentIntent(amount, currency = 'inr', metadata = {}) {
        if (!this.stripe) {
            // Return null to indicate demo mode
            return null;
        }

        // Convert to smallest currency unit (paise for INR, cents for USD)
        const amountInSmallestUnit = Math.round(amount * 100);

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: amountInSmallestUnit,
            currency: currency.toLowerCase(),
            payment_method_types: ['card'],
            metadata: {
                ...metadata,
                integration: 'cinema_booking'
            }
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    }

    /**
     * Retrieve payment intent status
     * @param {string} paymentIntentId - Stripe payment intent ID
     */
    async getPaymentIntent(paymentIntentId) {
        if (!this.stripe) {
            throw new Error('Stripe is not configured');
        }

        return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    }

    /**
     * Confirm payment was successful
     * @param {string} paymentIntentId - Stripe payment intent ID
     */
    async confirmPayment(paymentIntentId) {
        // Handle demo mode payments
        if (!this.stripe || paymentIntentId.startsWith('demo_') || paymentIntentId.startsWith('upi_')) {
            return true; // Demo mode - always succeed
        }
        const paymentIntent = await this.getPaymentIntent(paymentIntentId);
        return paymentIntent.status === 'succeeded';
    }
}

module.exports = new StripeService();
