import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FadeLoader } from 'react-spinners';
import error from '../assets/error.png';
import success from '../assets/success.png';

const stripePromise = loadStripe('pk_test_51Phb3kLs4PUYCdHCe1x3xhgRZ8dePWghwL4V69cBNxdd0FLkpZwGBCBTIxwRTLKMin6GGKIvFYbFiDbck0PR55xy00Nu31co7H');

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('processing');
    const orderAmount = localStorage.getItem('orderAmount');

    useEffect(() => {
        const confirmPayment = async () => {
            const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
            const orderId = localStorage.getItem('orderId');

            if (!clientSecret || !orderId) {
                setStatus('failed');
                setLoading(false);
                return;
            }

            try {
                await axios.get(`http://localhost:5000/api/order/confirm/${orderId}`, {
                    withCredentials: true
                });

                setStatus('success');
                localStorage.removeItem('orderId');
                localStorage.removeItem('orderAmount');

                setTimeout(() => {
                    navigate('/dashboard/my-orders');
                }, 2000);
            } catch (error) {
                console.error('Payment confirmation error:', error);
                setStatus('failed');
            } finally {
                setLoading(false);
            }
        };

        confirmPayment();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500">
                    {loading ? (
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 mx-auto bg-green-50 rounded-full flex items-center justify-center">
                                <FadeLoader color="#059473" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
                                <p className="text-gray-600">Please wait while we confirm your order...</p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-700 h-2 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    ) : status === 'success' ? (
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 mx-auto bg-green-50 rounded-full flex items-center justify-center p-2 animate-bounce">
                                <img src={success} alt="Success" className="w-16 h-16" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                                <p className="text-gray-600 mb-2">Thank you for your order.</p>
                                {orderAmount && (
                                    <p className="text-2xl font-bold text-green-700">₱{parseFloat(orderAmount).toFixed(2)}</p>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                    <span className="block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <p>Redirecting to your orders...</p>
                                </div>
                                <div className="pt-2">
                                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-700 rounded-full w-full animate-progress"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center p-2">
                                <img src={error} alt="Error" className="w-16 h-16" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
                                <p className="text-gray-600 mb-4">Something went wrong with your payment.</p>
                                <div className="bg-red-50 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-red-800">
                                        Please check your payment details and try again, or contact our support team for assistance.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate('/dashboard/my-orders')}
                                    className="w-full py-3 bg-green-700 text-white rounded-lg font-semibold
                                             transition-all duration-300 ease-in-out
                                             hover:bg-green-800 hover:shadow-lg hover:shadow-green-700/20
                                             focus:outline-none focus:ring-4 focus:ring-green-700/20"
                                >
                                    Go to Orders
                                </button>
                                <button
                                    onClick={() => navigate('/support')}
                                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold
                                             transition-all duration-300 ease-in-out
                                             hover:bg-gray-200
                                             focus:outline-none focus:ring-4 focus:ring-gray-200"
                                >
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                @keyframes progress {
                    0% { width: 0% }
                    100% { width: 100% }
                }
                .animate-progress {
                    animation: progress 2s linear;
                }
            `}</style>
        </div>
    );
};

const ConfirmOrder = () => {
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        const secret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
        if (secret) {
            setClientSecret(secret);
        }
    }, []);

    if (!clientSecret) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <FadeLoader color="#059473" />
                    <p className="mt-4 text-gray-600">Initializing payment confirmation...</p>
                </div>
            </div>
        );
    }

    return (
        <Elements 
            stripe={stripePromise} 
            options={{
                clientSecret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#059473',
                    }
                }
            }}
        >
            <OrderConfirmation />
        </Elements>
    );
};

export default ConfirmOrder;