import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            toast.error('Stripe not initialized');
            return;
        }

        const orderId = localStorage.getItem('orderId');
        if (!orderId) {
            toast.error('Order information not found');
            return;
        }

        setLoading(true);

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order/confirm`
                }
            });

            if (error) {
                throw error;
            }
        } catch (err) {
            console.error('Payment error:', err);
            toast.error(err.message || 'Payment failed');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || loading}
                className={`w-full py-3 px-4 rounded-md text-white font-medium
                    ${loading || !stripe 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#059473] hover:bg-[#048063] transition-colors'
                    }`}
            >
                {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Processing...</span>
                    </div>
                ) : (
                    'Pay Now'
                )}
            </button>
        </form>
    );
};

export default CheckoutForm;