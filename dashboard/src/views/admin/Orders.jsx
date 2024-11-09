import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaSearch, FaChevronDown } from 'react-icons/fa';
import { LuRefreshCw, LuArrowDownSquare, LuArrowUpSquare } from "react-icons/lu";
import { useDispatch, useSelector } from 'react-redux';
import { get_admin_orders } from '../../store/Reducers/OrderReducer';
import Pagination from '../Pagination';

const Orders = () => {
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(5);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { myOrders, totalOrder } = useSelector(state => state.order);

    const fetchOrders = useCallback(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        };
        dispatch(get_admin_orders(obj));
    }, [dispatch, parPage, currentPage, searchValue]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const refreshOrders = () => {
        setIsRefreshing(true);
        setCurrentPage(1);
        fetchOrders();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const toggleOrderExpansion = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'warehouse': return 'bg-indigo-100 text-indigo-800';
            case 'placed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'paid': return 'bg-emerald-100 text-emerald-800';
            case 'unpaid': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#438206] flex items-center gap-2">
                            Orders Management
                            <button 
                                onClick={refreshOrders} 
                                className={`p-1 hover:text-[#61BD12] transition duration-200 ${isRefreshing ? 'animate-spin' : ''}`}
                                disabled={isRefreshing}
                            >
                                <LuRefreshCw size={20} />
                            </button>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and track all orders</p>
                    </div>
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 sm:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search orders..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm 
                                         focus:outline-none focus:ring-2 focus:ring-[#438206] focus:border-[#438206]
                                         transition duration-200"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>
                        <select
                            className="w-full sm:w-32 px-4 py-2 border border-gray-200 rounded-lg text-sm 
                                     focus:outline-none focus:ring-2 focus:ring-[#438206] focus:border-[#438206]
                                     transition duration-200"
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
                                    <th className="text-left py-4 px-6 text-xs font-medium text-[#438206] uppercase">Order ID</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-[#438206] uppercase">Price</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-[#438206] uppercase">Payment</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-[#438206] uppercase">Status</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-[#438206] uppercase">Date</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-[#438206] uppercase">Action</th>
                                    <th className="text-left py-4 px-6 text-xs font-medium text-[#438206] uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {myOrders.map((order) => (
                                    <React.Fragment key={order._id}>
                                        <tr className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">#{order._id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">₱{order.price.toFixed(2)}</span>
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
                                                    to={`/admin/dashboard/order/details/${order._id}`}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-[#438206] bg-white hover:bg-gray-50 transition-colors duration-200"
                                                >
                                                    <FaEye className="mr-2" />
                                                    View
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => toggleOrderExpansion(order._id)}
                                                    className="text-[#438206] hover:text-[#61BD12] transition duration-200"
                                                >
                                                    {expandedOrder === order._id ? 
                                                        <LuArrowUpSquare size={20} /> : 
                                                        <LuArrowDownSquare size={20} />
                                                    }
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrder === order._id && order.suborder && (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-4 bg-gray-50">
                                                    <div className="pl-4 space-y-3">
                                                        <h4 className="font-medium text-[#438206]">Suborders:</h4>
                                                        <div className="grid gap-3">
                                                            {order.suborder.map((suborder) => (
                                                                <div key={suborder._id} 
                                                                     className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-all duration-200">
                                                                    <div className="flex flex-wrap justify-between gap-4">
                                                                        <div>
                                                                            <p className="text-sm text-gray-500">ID: <span className="text-gray-900">#{suborder._id}</span></p>
                                                                            <p className="text-sm text-gray-500 mt-1">Price: <span className="text-gray-900 font-medium">₱{suborder.price.toFixed(2)}</span></p>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(suborder.payment_status)}`}>
                                                                                {suborder.payment_status}
                                                                            </span>
                                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(suborder.delivery_status)}`}>
                                                                                {suborder.delivery_status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Orders List - Mobile */}
                <div className="md:hidden space-y-4">
                    {myOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-900">#{order._id}</span>
                                    <div className="text-sm text-gray-500 mt-1">{order.date}</div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">₱{order.price.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                                    {order.payment_status}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.delivery_status)}`}>
                                    {order.delivery_status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <button 
                                    onClick={() => toggleOrderExpansion(order._id)}
                                    className="text-[#438206] hover:text-[#61BD12] transition duration-200"
                                >
                                    {expandedOrder === order._id ? 
                                        <LuArrowUpSquare size={20} /> : 
                                        <LuArrowDownSquare size={20} />
                                    }
                                </button>
                                <Link 
                                    to={`/admin/dashboard/order/details/${order._id}`}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-[#438206] bg-white hover:bg-gray-50"
                                >
                                    <FaEye className="mr-2" />
                                    View Details
                                </Link>
                            </div>
                            {expandedOrder === order._id && order.suborder && (
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                    <h4 className="font-medium text-[#438206]">Suborders:</h4>
                                    {order.suborder.map((suborder) => (
                                        <div key={suborder._id} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm text-gray-900">#{suborder._id}</span>
                                                <span className="text-sm font-medium">₱{suborder.price.toFixed(2)}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(suborder.payment_status)}`}>
                                                    {suborder.payment_status}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(suborder.delivery_status)}`}>
                                                    {suborder.delivery_status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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