import React, { useEffect, useState } from 'react';
import { LuArrowDownSquare, LuArrowUpSquare, LuSearch, LuEye } from "react-icons/lu";
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import { useDispatch, useSelector } from 'react-redux';
import { get_admin_orders } from '../../store/Reducers/OrderReducer';

const Orders = () => {
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [parPage, setParPage] = useState(5);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const { myOrders, totalOrder } = useSelector(state => state.order);

    useEffect(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        };
        dispatch(get_admin_orders(obj));
    }, [searchValue, currentPage, parPage, dispatch]);

    const toggleOrderExpansion = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

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
        <div className='p-6 min-h-screen'>
            <div className='bg-white rounded-xl shadow-lg p-6'>
                <h2 className='text-3xl font-bold text-[#438206] mb-6'>Orders Management</h2>
                <div className='flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0'>
                    <div className='w-full md:w-auto'>
                        <select 
                            onChange={(e) => setParPage(parseInt(e.target.value))} 
                            className='w-full md:w-auto px-4 py-2 border border-[#61BD12] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#438206] transition duration-300 ease-in-out'
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option> 
                        </select>
                    </div>
                    <div className='relative w-full md:w-64'>
                        <input 
                            onChange={e => setSearchValue(e.target.value)} 
                            value={searchValue} 
                            className='w-full pl-10 pr-4 py-2 border border-[#61BD12] rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#438206] transition duration-300 ease-in-out' 
                            type="text" 
                            placeholder='Search orders' 
                        />
                        <LuSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    </div>
                </div>

                <div className='overflow-x-auto'>
                    <table className='w-full text-sm text-left text-gray-500'>
                        <thead className='text-xs text-[#438206] uppercase bg-gray-50'>
                            <tr>
                                <th className='px-6 py-3'>Order ID</th>
                                <th className='px-6 py-3'>Price</th>
                                <th className='px-6 py-3'>Payment Status</th>
                                <th className='px-6 py-3'>Order Status</th>
                                <th className='px-6 py-3'>Action</th>
                                <th className='px-6 py-3'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders.map((order) => (
                                <React.Fragment key={order._id}>
                                    <tr className='bg-white border-b hover:bg-gray-50 transition duration-150 ease-in-out'>
                                        <td className='px-6 py-4 font-medium text-gray-900'>#{order._id}</td>
                                        <td className='px-6 py-4'>${order.price.toFixed(2)}</td>
                                        <td className='px-6 py-4'>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.payment_status)}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.delivery_status)}`}>
                                                {order.delivery_status}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <Link to={`/admin/dashboard/order/details/${order._id}`} className='text-[#438206] hover:text-[#61BD12] transition duration-300 ease-in-out flex items-center'>
                                                <LuEye className="mr-1" /> View
                                            </Link>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <button 
                                                onClick={() => toggleOrderExpansion(order._id)} 
                                                className='text-[#438206] hover:text-[#61BD12] transition duration-300 ease-in-out'
                                            >
                                                {expandedOrder === order._id ? <LuArrowUpSquare size={20} /> : <LuArrowDownSquare size={20} />}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedOrder === order._id && order.suborder && (
                                        <tr>
                                            <td colSpan="6" className='px-6 py-4 bg-gray-50'>
                                                <div className='pl-4 space-y-4'>
                                                    <h4 className='font-semibold text-[#438206] mb-2'>Suborders:</h4>
                                                    {order.suborder.map((suborder) => (
                                                        <div key={suborder._id} className='bg-white rounded-lg shadow-sm p-4 transition duration-300 ease-in-out hover:shadow-md'>
                                                            <p><span className='font-medium text-[#438206]'>ID:</span> #{suborder._id}</p>
                                                            <p><span className='font-medium text-[#438206]'>Price:</span> ${suborder.price.toFixed(2)}</p>
                                                            <p><span className='font-medium text-[#438206]'>Payment:</span> 
                                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(suborder.payment_status)}`}>
                                                                    {suborder.payment_status}
                                                                </span>
                                                            </p>
                                                            <p><span className='font-medium text-[#438206]'>Delivery:</span> 
                                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(suborder.delivery_status)}`}>
                                                                    {suborder.delivery_status}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalOrder > parPage && (
                    <div className='mt-6 flex justify-end'>
                        <Pagination 
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalOrder}
                            parPage={parPage}
                            showItem={4}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;