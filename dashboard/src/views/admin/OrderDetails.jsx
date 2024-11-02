import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { admin_order_status_update, get_admin_order, messageClear } from '../../store/Reducers/OrderReducer';
import toast from 'react-hot-toast';
import { 
    Package, 
    CreditCard, 
    Truck, 
    User, 
    MapPin, 
    Phone,
    ShoppingBag,
    Store,
    Save,
    Calendar
} from 'lucide-react';

const OrderDetails = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const [deliveryStatus, setDeliveryStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const { order, errorMessage, successMessage } = useSelector(state => state.order);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        dispatch(get_admin_order(orderId));
        setTimeout(() => setIsLoaded(true), 300);
    }, [orderId, dispatch]);

    useEffect(() => {
        if (order) {
            setDeliveryStatus(order.delivery_status || '');
            setPaymentStatus(order.payment_status || '');
        }
    }, [order]);

    const update_status = async () => {
        setIsUpdating(true);
        try {
            await dispatch(admin_order_status_update({
                orderId,
                info: {
                    delivery_status: deliveryStatus,
                    payment_status: paymentStatus
                }
            })).unwrap();
            
            await dispatch(get_admin_order(orderId));
            // Remove this toast since we'll handle it in the useEffect
            // toast.success('Status updated successfully');
        } catch (error) {
            // Remove this toast since we'll handle it in the useEffect
            // toast.error('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
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
    }, [successMessage, errorMessage, dispatch]);

    const StatusBadge = ({ status, type = 'delivery' }) => {
        let color = 'bg-yellow-100 text-yellow-800';
        if (type === 'payment') {
            if (status === 'paid') {
                color = 'bg-green-100 text-green-800';
            } else if (status === 'unpaid') {
                color = 'bg-red-100 text-red-800';
            }
        } else {
            if (status === 'delivered' || status === 'placed') {
                color = 'bg-green-100 text-green-800';
            } else if (status === 'cancelled') {
                color = 'bg-red-100 text-red-800';
            }
        }
        return (
            <span className={`${color} text-xs font-medium px-2 py-1 rounded-full`}>
                {status}
            </span>
        );
    };

    return (
        <div className={`bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-7xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package className="w-6 h-6 text-[#059473]" />
                            <h1 className="text-2xl font-semibold text-gray-800">Order #{order._id}</h1>
                        </div>
                        
                        {/* Status Update Section */}
                        <div className="flex items-center gap-4">
                            {/* Status Dropdowns */}
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-1">
                                            <Truck className="w-4 h-4" />
                                            Delivery Status
                                        </div>
                                    </label>
                                    <select
                                        onChange={(e) => setDeliveryStatus(e.target.value)}
                                        value={deliveryStatus}
                                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#059473] focus:border-[#059473] min-w-[150px]"
                                        disabled={isUpdating}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="warehouse">Warehouse</option>
                                        <option value="placed">Placed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center gap-1">
                                            <CreditCard className="w-4 h-4" />
                                            Payment Status
                                        </div>
                                    </label>
                                    <select
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        value={paymentStatus}
                                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#059473] focus:border-[#059473] min-w-[150px]"
                                        disabled={isUpdating}
                                    >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                            </div>

                            {/* Update Button */}
                            <button
                                onClick={update_status}
                                disabled={isUpdating}
                                className={`px-4 py-2 text-white rounded-md transition-colors h-[42px] self-end flex items-center gap-2 ${
                                    isUpdating 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-[#059473] hover:bg-[#048063]'
                                }`}
                            >
                                {isUpdating ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        <span>Updating...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Update Status
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-4 text-gray-500">
                        <p className="text-sm flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Order Date: {order.date}
                        </p>
                    </div>
                </div>
                
                {/* Order Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Products Section */}
                    <div className="space-y-6 md:col-span-2">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-[#059473]" />
                                Order Items
                            </h2>
                            <div className="space-y-4">
                                {order.products?.map((p, i) => (
                                    <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                                        <img className="w-16 h-16 object-cover rounded" src={p.images[0]} alt={p.name} />
                                        <div className="flex-grow">
                                            <h3 className="text-gray-800">{p.name}</h3>
                                            <p className="text-sm text-gray-500">Quantity: {p.quantity}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Store className="w-4 h-4" />
                                                {p.shopName}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-800 font-semibold">₱{p.price - Math.floor((p.price * p.discount) / 100)}</p>
                                            {p.discount > 0 && (
                                                <p className="text-xs text-gray-500">
                                                    <span className="line-through">₱{p.price}</span>
                                                    <span className="ml-1 text-green-600">-{p.discount}%</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Section */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#059473]" />
                                Order Summary
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Total Price</span>
                                    <span className="text-xl font-semibold text-gray-800">₱{order.price}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Payment Method</span>
                                    <span className="font-medium">{order.payment_method?.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Payment Status</span>
                                    <StatusBadge status={order.payment_status} type="payment" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Delivery Status</span>
                                    <StatusBadge status={order.delivery_status} />
                                </div>
                            </div>
                        </div>
                        
                        {/* Shipping Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-[#059473]" />
                                Shipping Information
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p className="text-gray-600 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {order.shippingInfo?.name}
                                </p>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {order.shippingInfo?.address}
                                </p>
                                <p className="text-gray-600 pl-6">
                                    {order.shippingInfo?.city}, {order.shippingInfo?.province}
                                </p>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {order.shippingInfo?.phone}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;