import React, { useEffect, useState } from 'react'; 
import Search from '../components/Search';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination'; 
import { FaEye } from 'react-icons/fa'; 
import { useDispatch, useSelector } from 'react-redux';
import { get_seller_orders } from '../../store/Reducers/OrderReducer';

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
        <div className="bg-[#F7F7FC] min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-[#438206] mb-6">Orders</h1>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-6">
                        <Search setParPage={setParPage} setSearchValue={setSearchValue} searchValue={searchValue} />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-[#438206] uppercase bg-[#F7F7FC] border-b border-[#61BD12]">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Order ID</th>
                                    <th scope="col" className="px-6 py-3">Price</th>
                                    <th scope="col" className="px-6 py-3">Payment Status</th>
                                    <th scope="col" className="px-6 py-3">Order Status</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myOrders.map((order, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">#{order._id}</td>
                                        <td className="px-6 py-4">${order.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.payment_status)}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.delivery_status)}`}>
                                                {order.delivery_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{order.date}</td>
                                        <td className="px-6 py-4">
                                            <Link to={`/seller/dashboard/order/details/${order._id}`} className="text-[#438206] hover:text-[#61BD12] transition-colors duration-200">
                                                <FaEye className="inline-block mr-1" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalOrder > parPage && (
                        <div className="mt-6 flex justify-end">
                            <Pagination 
                                pageNumber={currentPage}
                                setPageNumber={setCurrentPage}
                                totalItem={totalOrder}
                                parPage={parPage}
                                showItem={3}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;