import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Stripe from '../components/Stripe';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { place_order } from '../store/reducers/orderReducer';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [orderId, setOrderId] = useState(null);

    const {
        price = 0,
        products = [],
        shipping_fee = 0,
        shippingInfo = {},
        userId = '',
        items = 0,
    } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    useEffect(() => {
        if (!location.state) {
            toast.error('Please complete your order first');
            navigate('/cart');
        }
    }, [location.state, navigate]);

    const handleOrder = async (payment_method) => {
        try {
            setLoading(true);
            const orderData = {
                price,
                products,
                shipping_fee,
                shippingInfo,
                userId,
                payment_method,
                payment_status: payment_method === 'cod' ? 'unpaid' : 'pending'
            };

            const result = await dispatch(place_order(orderData)).unwrap();
            
            if (payment_method === 'cod') {
                toast.success('Order placed successfully!');
                navigate('/dashboard/my-orders');
            } else {
                setOrderId(result.orderId);
            }
        } catch (error) {
            console.error('Order placement error:', error);
            toast.error(error?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const handleCODOrder = () => {
        if (!termsAccepted) {
            toast.error('Please accept the terms and conditions');
            return;
        }
        handleOrder('cod');
    };

    const handleStripeOrder = async () => {
        await handleOrder('stripe');
    };

    return (
        <div>
            <Header />
            <section className='bg-[#eeeeee]'>
                <div className='w-[85%] lg:w-[90%] md:w-[90%] sm:w-[90%] mx-auto py-16 mt-4'>
                    <div className='flex flex-wrap md:flex-col-reverse'>
                        <div className='w-7/12 md:w-full'>
                            <div className='pr-2 md:pr-0'>
                                <div className='flex flex-wrap'>
                                    <div 
                                        onClick={() => setPaymentMethod('stripe')} 
                                        className={`w-[20%] border-r cursor-pointer py-8 px-12 ${paymentMethod === 'stripe' ? 'bg-white' : 'bg-slate-100'}`}
                                    >
                                        <div className='flex flex-col gap-[3px] justify-center items-center'>
                                            <img src="http://localhost:3000/images/payment/stripe.png" alt="Stripe" />
                                            <span className='text-slate-600'>Stripe</span>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => setPaymentMethod('cod')} 
                                        className={`w-[20%] border-r cursor-pointer py-8 px-12 ${paymentMethod === 'cod' ? 'bg-white' : 'bg-slate-100'}`}
                                    >
                                        <div className='flex flex-col gap-[3px] justify-center items-center'>
                                            <img src="http://localhost:3000/images/payment/cod.jpg" alt="COD" />
                                            <span className='text-slate-600'>COD</span>
                                        </div>
                                    </div>
                                </div>

                                {paymentMethod === 'stripe' && (
                                    <div>
                                        {!orderId ? (
                                            <button 
                                                onClick={handleStripeOrder}
                                                disabled={loading}
                                                className='px-10 py-[6px] rounded-sm hover:shadow-green-700/30 hover:shadow-lg bg-green-700 text-white'
                                            >
                                                {loading ? 'Processing...' : 'Place Order'}
                                            </button>
                                        ) : (
                                            <Stripe price={price + shipping_fee} orderId={orderId} />
                                        )}
                                    </div>
                                )}

                                {paymentMethod === 'cod' && (
                                    <div className="w-full px-4 py-8 bg-white shadow-sm">
                                        <div className="bg-white p-6 rounded-lg shadow">
                                            <div className="mb-6">
                                                <h2 className="text-2xl font-semibold text-[#059473] mb-2">Cash on Delivery</h2>
                                                <p className="text-gray-600">Complete your order using Cash on Delivery</p>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Order Summary */}
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>Items ({items})</span>
                                                            <span>₱{Number(price).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Shipping Fee</span>
                                                            <span>₱{Number(shipping_fee).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between font-semibold pt-2 border-t">
                                                            <span>Total Amount</span>
                                                            <span className="text-[#059473]">₱{(Number(price) + Number(shipping_fee)).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Products List */}
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                                                    {products.map((product, index) => (
                                                        <div key={index} className="border-b pb-4">
                                                            <p className="font-medium text-gray-800">{product.shopName}</p>
                                                            {product.products.map((item, idx) => (
                                                                <div key={idx} className="flex items-center mt-2">
                                                                    <img 
                                                                        src={item.productInfo.images?.[0]} 
                                                                        alt={item.productInfo.name} 
                                                                        className="w-16 h-16 object-cover rounded"
                                                                    />
                                                                    <div className="ml-4">
                                                                        <p className="text-gray-800">{item.productInfo.name}</p>
                                                                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                                                                        <p className="text-[#059473]">₱{item.productInfo.price.toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* COD Terms */}
                                                <div className="space-y-3">
                                                    <h3 className="text-lg font-medium text-gray-900">Important Information</h3>
                                                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 ml-2">
                                                        <li>Payment will be collected upon delivery</li>
                                                        <li>Please prepare the exact amount: ₱{(Number(price) + Number(shipping_fee)).toLocaleString()}</li>
                                                        <li>Verify your package before accepting and paying</li>
                                                        <li>Our delivery partner cannot provide change</li>
                                                        <li>You can track your order status in your dashboard</li>
                                                    </ul>
                                                </div>

                                                {/* Terms Acceptance */}
                                                <div className="flex items-center space-x-2 my-6">
                                                    <input
                                                        type="checkbox"
                                                        id="terms"
                                                        checked={termsAccepted}
                                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                                        className="w-4 h-4 text-[#059473] border-gray-300 rounded focus:ring-[#059473]"
                                                    />
                                                    <label htmlFor="terms" className="text-sm text-gray-600">
                                                        I understand and agree to the COD payment terms and conditions
                                                    </label>
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                    onClick={handleCODOrder}
                                                    disabled={loading || !termsAccepted}
                                                    className={`w-full py-3 px-4 rounded-md text-white font-medium flex items-center justify-center
                                                        ${loading || !termsAccepted 
                                                            ? 'bg-gray-400 cursor-not-allowed' 
                                                            : 'bg-[#059473] hover:bg-[#048063] transition-colors'
                                                        }`}
                                                >
                                                    {loading ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                                            <span>Processing...</span>
                                                        </div>
                                                    ) : (
                                                        <span>Place COD Order</span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='w-5/12 md:w-full'>
                            <div className='pl-2 md:pl-0 md:mb-0'>
                            <div className='bg-white shadow p-5 text-slate-600 flex flex-col gap-3'>
                                    <h2 className='font-bold text-lg'>Order Summary</h2>
                                    <div className='flex justify-between items-center'>
                                        <span>{items} Items and Shipping Fee Included</span>
                                        <span>₱{price.toLocaleString()}</span>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span>Shipping Fee</span>
                                        <span>₱{shipping_fee.toLocaleString()}</span>
                                    </div>
                                    <div className='flex justify-between items-center font-semibold'>
                                        <span>Total Amount</span>
                                        <span className='text-lg text-[#059473]'>₱{(price + shipping_fee).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Payment;