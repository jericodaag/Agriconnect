import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { place_order } from '../store/reducers/orderReducer';

const CODPayment = ({ 
    price = 0, 
    orderId, 
    items = 0, 
    products = [], 
    shipping_fee = 0, 
    shippingInfo = {}, 
    userId 
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const confirmCODOrder = async () => {
        if (!termsAccepted) {
            toast.error('Please accept the terms and conditions');
            return;
        }

        if (!userId || !shippingInfo) {
            toast.error('Missing required information');
            return;
        }

        setLoading(true);
        try {
            await dispatch(place_order({
                price,
                products,
                shipping_fee,
                items,
                shippingInfo,
                userId,
                payment_method: 'cod',
                // Explicitly set payment status as unpaid for COD orders
                payment_status: 'unpaid'
            })).unwrap();

            toast.success('Order placed successfully!');
            navigate('/dashboard/my-orders');
        } catch (error) {
            console.error('Order placement error:', error);
            toast.error(error?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
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
                        onClick={confirmCODOrder}
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
    );
};

export default CODPayment;