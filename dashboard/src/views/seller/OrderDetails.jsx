import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { get_seller_order, messageClear, seller_order_status_update } from '../../store/Reducers/OrderReducer';
import { Package, Truck, MapPin, Calendar, Box, Home, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetails = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const [status, setStatus] = useState('');
    const { order, errorMessage, successMessage } = useSelector(state => state.order);

    useEffect(() => {
        setStatus(order?.delivery_status);
    }, [order]);

    useEffect(() => {
        dispatch(get_seller_order(orderId));
    }, [orderId]);

    const status_update = (e) => {
        dispatch(seller_order_status_update({ orderId, info: { status: e.target.value } }));
        setStatus(e.target.value);
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage]);

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-500 text-white';
            case 'processing': return 'bg-blue-500 text-white';
            case 'warehouse': return 'bg-indigo-500 text-white';
            case 'placed': return 'bg-green-500 text-white';
            case 'cancelled': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F7FC] p-4 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <Box className="h-4 w-4" />
                                <span>Order ID</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">#{order._id}</h1>
                            <div className="flex items-center gap-2 text-gray-500 mt-2">
                                <Calendar className="h-4 w-4" />
                                <span>{order.date}</span>
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            <p className="text-sm font-medium text-gray-700 mb-1">Order Status</p>
                            <select 
                                onChange={status_update} 
                                value={status}
                                className="w-full md:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg 
                                         text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                         focus:border-transparent transition-all duration-200"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="warehouse">Warehouse</option>
                                <option value="placed">Placed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                            {status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Products Section */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4">
                            <div className="flex items-center gap-2 mb-4">
                                <ShoppingBag className="h-5 w-5 text-gray-700" />
                                <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                            </div>
                            <div className="space-y-4">
                                {order?.products?.map((p, i) => (
                                    <div key={i} 
                                         className="flex flex-col md:flex-row items-start gap-4 p-4 bg-gray-50 rounded-xl
                                                  transition-all duration-200 hover:shadow-md">
                                        <img 
                                            className="w-full md:w-24 h-48 md:h-24 object-cover rounded-lg" 
                                            src={p.images[0]} 
                                            alt={p.name} 
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg text-gray-900">{p.name}</h4>
                                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                                                <span>Brand: {p.brand}</span>
                                                <span className="hidden md:block text-gray-300">|</span>
                                                <span>Quantity: {p.quantity}</span>
                                                <span className="hidden md:block text-gray-300">|</span>
                                                <span>Price: ₱{p.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Home className="h-5 w-5 text-gray-700" />
                                <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Delivery Address</p>
                                    <p className="font-medium text-gray-900 mt-1">{order.shippingInfo}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Section */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Truck className="h-5 w-5 text-gray-700" />
                            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-900">₱{order.price}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <span className="text-gray-600">Commission (3%)</span>
                                <span className="font-medium text-gray-900">₱{(order.price * 0.03).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-gray-900 font-medium">Total Amount</span>
                                <span className="text-xl font-bold text-green-600">₱{order.price}</span>
                            </div>
                            <div className="pt-4">
                                <p className="text-sm text-gray-500">Payment Status</p>
                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;