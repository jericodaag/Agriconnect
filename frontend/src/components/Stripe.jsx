import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe('pk_test_51Phb3kLs4PUYCdHCe1x3xhgRZ8dePWghwL4V69cBNxdd0FLkpZwGBCBTIxwRTLKMin6GGKIvFYbFiDbck0PR55xy00Nu31co7H');

const Stripe = ({ price, orderId }) => {
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(false);

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#059473',
        }
    };

    const create_payment = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post(
                'http://localhost:5000/api/order/create-payment',
                { 
                    price, // Remove the multiplication here
                    currency: 'php'  // Keep PHP if that's your desired currency
                },
                { withCredentials: true }
            );

            if (data?.clientSecret) {
                localStorage.setItem('orderId', orderId);
                localStorage.setItem('orderAmount', price.toString());
                setClientSecret(data.clientSecret);
            } else {
                throw new Error('No client secret received');
            }
        } catch (error) {
            console.error('Payment creation error:', error);
            toast.error(error.response?.data?.message || 'Failed to create payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto mt-8">
            <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-xl p-8 border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Secure Checkout
                    </h2>
                    <div className="h-1 w-20 bg-green-700 mx-auto rounded-full mb-4"></div>
                    <p className="text-gray-600">
                        Complete your purchase securely with Stripe
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    {/* Order Summary */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-gray-600 text-sm font-medium mb-3">Order Summary</div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-medium">Order Total:</span>
                            <span className="text-2xl font-bold text-green-700">₱{price.toFixed(2)}</span>
                        </div>
                    </div>

                    {clientSecret ? (
                        <div className="transition-all duration-300 ease-in-out">
                            <Elements 
                                stripe={stripePromise} 
                                options={{
                                    clientSecret,
                                    appearance
                                }}
                            >
                                <CheckoutForm />
                            </Elements>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Security Badges */}
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="text-xl mb-2">🔒</div>
                                    <div className="text-sm font-medium text-gray-800">Encrypted & Secure</div>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="text-xl mb-2">💳</div>
                                    <div className="text-sm font-medium text-gray-800">Safe Payment</div>
                                </div>
                            </div>
                            
                            {/* Payment Button */}
                            <button
                                onClick={create_payment}
                                disabled={loading}
                                className="w-full py-4 px-6 bg-green-700 text-white text-lg rounded-lg font-semibold
                                         transition-all duration-300 ease-in-out
                                         hover:bg-green-800 hover:shadow-lg hover:shadow-green-700/20
                                         transform hover:-translate-y-0.5
                                         disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                                         focus:outline-none focus:ring-4 focus:ring-green-700/20"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-3">
                                        <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
                                        <span>Preparing Secure Checkout...</span>
                                    </div>
                                ) : (
                                    'Proceed to Payment'
                                )}
                            </button>

                            {/* Additional Info */}
                            <div className="text-center text-sm text-gray-500">
                                By proceeding, you agree to our terms of service and privacy policy
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Stripe;