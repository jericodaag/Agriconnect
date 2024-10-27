import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { get_dashboard_index_data } from '../../store/reducers/dashboardReducer';
import { FaBox, FaBan } from 'react-icons/fa';
import { MdPendingActions } from 'react-icons/md';

const Index = () => {
    const dispatch = useDispatch()
    const {userInfo} = useSelector(state => state.auth)
    const {recentOrders,totalOrder,pendingOrder,cancelledOrder} = useSelector(state => state.dashboard)

    useEffect(() => {
        dispatch(get_dashboard_index_data(userInfo.id))
    },[dispatch, userInfo.id])

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

        return <span className={className}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    }

    return (
        <div>
            <div className='grid grid-cols-3 md:grid-cols-1 gap-5'>
                <div className='flex justify-center items-center p-5 bg-white rounded-md gap-5'>
                    <div className='bg-green-100 w-[47px] h-[47px] rounded-full flex justify-center items-center text-xl'>
                        <span className='text-xl text-green-800'><FaBox /></span>
                    </div>
                    <div className='flex flex-col justify-start items-start text-slate-600'>
                        <h2 className='text-3xl font-bold'>{totalOrder}</h2>
                        <span>Orders</span>
                    </div>     
                </div>

                <div className='flex justify-center items-center p-5 bg-white rounded-md gap-5'>
                    <div className='bg-yellow-100 w-[47px] h-[47px] rounded-full flex justify-center items-center text-xl'>
                        <span className='text-xl text-yellow-800'><MdPendingActions /></span>
                    </div>
                    <div className='flex flex-col justify-start items-start text-slate-600'>
                        <h2 className='text-3xl font-bold'>{pendingOrder}</h2>
                        <span>Pending Orders</span>
                    </div>     
                </div>

                <div className='flex justify-center items-center p-5 bg-white rounded-md gap-5'>
                    <div className='bg-red-100 w-[47px] h-[47px] rounded-full flex justify-center items-center text-xl'>
                        <span className='text-xl text-red-800'><FaBan /></span>
                    </div>
                    <div className='flex flex-col justify-start items-start text-slate-600'>
                        <h2 className='text-3xl font-bold'>{cancelledOrder}</h2>
                        <span>Cancelled Orders</span>
                    </div>     
                </div> 
            </div>

            <div className='bg-white p-5 mt-5 rounded-md'>
                <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
                <div className='pt-4'>
                    <div className='relative overflow-x-auto rounded-md'>
                        <table className='w-full text-sm text-left text-gray-500'>
                            <thead className='text-xs text-gray-700 uppercase bg-gray-200'>
                                <tr>
                                    <th scope='col' className='px-6 py-3'>Order Id</th>
                                    <th scope='col' className='px-6 py-3'>Amount</th>
                                    <th scope='col' className='px-6 py-3'>Payment Status</th>
                                    <th scope='col' className='px-6 py-3'>Order Status</th>
                                    <th scope='col' className='px-6 py-3'>Date</th>
                                    <th scope='col' className='px-6 py-3'>Action</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((o,i) => (
                                    <tr key={i} className='bg-white border-b hover:bg-gray-50'>
                                        <td className='px-6 py-4 font-medium whitespace-nowrap'>#{o._id}</td>
                                        <td className='px-6 py-4 font-medium whitespace-nowrap'>₱{o.price.toLocaleString()}</td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            {getStatusBadge(o.payment_status, 'payment')}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            {getStatusBadge(o.delivery_status, 'delivery')}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className="text-sm text-gray-900">
                                                {new Date(o.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(o.createdAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <Link to={`/dashboard/order/details/${o._id}`}>
                                                <span className='bg-green-200 text-green-800 text-sm font-semibold px-3 py-1.5 rounded hover:bg-green-300 transition-colors'>
                                                    View
                                                </span>
                                            </Link>
                                        </td> 
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;