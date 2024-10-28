import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe('pk_test_51Phb3kLs4PUYCdHCe1x3xhgRZ8dePWghwL4V69cBNxdd0FLkpZwGBCBTIxwRTLKMin6GGKIvFYbFiDbck0PR55xy00Nu31co7H');

const Stripe = ({ price }) => {
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState('');

    const appearance = {
        theme: 'stripe'
    };

    const options = {
        appearance,
        clientSecret
    };

    const create_payment = async () => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/order/create-payment', 
                { price, currency: 'php' },
                { withCredentials: true }
            );
            setClientSecret(data.clientSecret);
            setError('');
        } catch (error) {
            console.error('Payment creation error:', error);
            setError(error.response?.data?.message || 'Failed to create payment');
            toast.error(error.response?.data?.message || 'Failed to create payment');
        }
    };

    return (
        <div className='mt-4'>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {clientSecret ? (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            ) : (
                <button 
                    onClick={create_payment} 
                    className='px-10 py-[6px] rounded-sm hover:shadow-green-700/30 hover:shadow-lg bg-green-700 text-white'
                >
                    Start Payment
                </button>
            )}
        </div>
    );
}; 

export default Stripe;