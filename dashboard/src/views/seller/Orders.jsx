import React, { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom';
import { FaEye, FaSearch } from 'react-icons/fa'; 
import { useDispatch, useSelector } from 'react-redux';
import { get_seller_orders } from '../../store/Reducers/OrderReducer';
import Pagination from '../Pagination';

const Orders = () => {
    const dispatch = useDispatch();
    const { myOrders, totalOrder } = useSelector(state => state.order);
    const { userInfo } = useSelector(state => state.auth);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(5);

    useEffect(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue,
            sellerId: userInfo._id
        }
        dispatch(get_seller_orders(obj));
    }, [searchValue, currentPage, parPage, dispatch, userInfo._id]);

    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'warehouse':
                return 'bg-indigo-100 text-indigo-800';
            case 'placed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'paid':
                return 'bg-emerald-100 text-emerald-800';
            case 'unpaid':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and track your orders</p>
                    </div>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 sm:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search orders..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>
                        <select
                            className="w-full sm:w-32 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={parPage}
                            onChange={(e) => setParPage(e.target.value)}
                        >
                            <option value="5">5 / page</option>
                            <option value="10">10 / page</option>
                            <option value="15">15 / page</option>
                            <option value="20">20 / page</option>
                        </select>
                    </div>
                </div>

                {/* Orders Table - Desktop */}
                <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {myOrders.map((order, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">#{order._id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">₱{order.price}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.delivery_status)}`}>
                                                {order.delivery_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">{order.date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link 
                                                to={`/seller/dashboard/order/details/${order._id}`}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                                            >
                                                <FaEye className="mr-2 text-gray-400" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Orders List - Mobile */}
                <div className="md:hidden space-y-4">
                    {myOrders.map((order, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-900">#{order._id}</span>
                                    <div className="text-sm text-gray-500 mt-1">{order.date}</div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">₱{order.price}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                                    {order.payment_status}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.delivery_status)}`}>
                                    {order.delivery_status}
                                </span>
                            </div>
                            <div className="flex justify-end">
                                <Link 
                                    to={`/seller/dashboard/order/details/${order._id}`}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <FaEye className="mr-2 text-gray-400" />
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalOrder > parPage && (
                    <div className="flex justify-end py-4">
                        <div className="inline-block">
                            <Pagination 
                                pageNumber={currentPage}
                                setPageNumber={setCurrentPage}
                                totalItem={totalOrder}
                                parPage={parPage}
                                showItem={3}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;