import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { get_orders } from '../../store/reducers/orderReducer';
import { FaBox, FaBoxOpen, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { MdPendingActions } from 'react-icons/md';
import { BiSearchAlt } from 'react-icons/bi';

const Orders = () => {
    const [state, setState] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { myOrders } = useSelector(state => state.order);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                await dispatch(get_orders({ status: state, customerId: userInfo.id }));
            } catch (err) {
                setError('Failed to fetch orders. Please try again.');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        if (userInfo && userInfo.id) {
            fetchOrders();
        }
    }, [state, dispatch, userInfo]);

    const getOrderStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <MdPendingActions className="text-yellow-500" />;
            case 'processing':
                return <FaBox className="text-blue-500" />;
            case 'shipped':
                return <FaTruck className="text-purple-500" />;
            case 'delivered':
                return <FaCheckCircle className="text-green-500" />;
            case 'cancelled':
                return <FaBoxOpen className="text-red-500" />;
            default:
                return <FaBox className="text-gray-500" />;
        }
    };

    const getStatusBadge = (status, type = 'delivery') => {
        let className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ';
        
        if (type === 'payment') {
            switch(status) {
                case 'paid':
                    className += 'bg-green-100 text-green-800';
                    break;
                case 'unpaid':
                    className += 'bg-red-100 text-red-800';
                    break;
                case 'pending':
                    className += 'bg-yellow-100 text-yellow-800';
                    break;
                default:
                    className += 'bg-gray-100 text-gray-800';
            }
        } else {
            switch(status) {
                case 'delivered':
                    className += 'bg-green-100 text-green-800';
                    break;
                case 'shipped':
                    className += 'bg-blue-100 text-blue-800';
                    break;
                case 'processing':
                    className += 'bg-purple-100 text-purple-800';
                    break;
                case 'pending':
                    className += 'bg-yellow-100 text-yellow-800';
                    break;
                case 'cancelled':
                    className += 'bg-red-100 text-red-800';
                    break;
                default:
                    className += 'bg-gray-100 text-gray-800';
            }
        }

        return (
            <span className={className}>
                {type === 'delivery' && getOrderStatusIcon(status)}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredOrders = myOrders.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.delivery_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.payment_status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-white p-4 rounded-md shadow-sm'>
            <div className='flex justify-between items-center mb-4'>
                <div className='flex items-center gap-4'>
                    <h2 className='text-xl font-semibold text-gray-800'>Order History</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <BiSearchAlt className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                    </div>
                </div>
                <select 
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    value={state} 
                    onChange={(e) => setState(e.target.value)}
                >
                    <option value="all">All Orders</option>
                    <option value="placed">Placed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="warehouse">Warehouse</option>
                </select>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                    <FaBox className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
                    <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-medium text-gray-900">#{order._id}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">₱{order.price.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(order.delivery_status, 'delivery')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(order.payment_status, 'payment')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Link
                                            to={`/dashboard/order/details/${order._id}`}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Orders;