import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { get_seller_order, messageClear, seller_order_status_update } from '../../store/Reducers/OrderReducer';
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
    }, [orderId, dispatch]);

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
    }, [successMessage, errorMessage, dispatch]);

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'warehouse': return 'bg-indigo-100 text-indigo-800';
            case 'placed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-[#F7F7FC] min-h-screen p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#438206]">Order Details</h2>
                    <select 
                        onChange={status_update} 
                        value={status} 
                        className="px-4 py-2 bg-white border border-[#61BD12] rounded-md text-[#438206] focus:outline-none focus:ring-2 focus:ring-[#61BD12]"
                    >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="warehouse">Warehouse</option>
                        <option value="placed">Placed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center text-lg text-gray-600 mb-2">
                        <h2 className="font-semibold">Order #{order._id}</h2>
                        <span>{order.date}</span>
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(status)}`}>
                        {status}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2">
                        <h3 className="text-lg font-semibold text-[#438206] mb-3">Products</h3>
                        {order?.products?.map((p, i) => (
                            <div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-md mb-3">
                                <img className="w-20 h-20 object-cover rounded" src={p.images[0]} alt={p.name} />
                                <div>
                                    <h4 className="font-semibold">{p.name}</h4>
                                    <p className="text-sm text-gray-600">
                                        Brand: {p.brand} | Quantity: {p.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[#438206] mb-3">Order Info</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <p className="mb-2"><span className="font-semibold">Deliver To:</span> {order.shippingInfo}</p>
                            <p className="mb-2">
                                <span className="font-semibold">Payment Status:</span> 
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {order.payment_status}
                                </span>
                            </p>
                            <p><span className="font-semibold">Price:</span> ₱{order.price}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;