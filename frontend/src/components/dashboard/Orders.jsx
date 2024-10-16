import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { get_orders } from '../../store/reducers/orderReducer';

const Orders = () => {
    const [state, setState] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
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

    const redirect = (ord) => {
        let items = 0;
        for (let i = 0; i < ord.products.length; i++) {
            items += ord.products[i].quantity;
        }
        navigate('/payment', {
            state: {
                price: ord.price,
                items,
                orderId: ord._id
            }
        });
    };

    if (loading) {
        return <div className="text-center py-4">Loading orders...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    return (
        <div className='bg-white p-4 rounded-md'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-slate-600'>My Orders </h2>
                <select 
                    className='outline-none px-3 py-1 border rounded-md text-slate-600' 
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

            {myOrders.length === 0 ? (
                <p className="text-center py-4">No orders found.</p>
            ) : (
                <div className='relative overflow-x-auto rounded-md'>
                    <table className='w-full text-sm text-left text-gray-500'>
                        <thead className='text-xs text-gray-700 uppercase bg-gray-200'>
                            <tr>
                                <th scope='col' className='px-6 py-3'>Order Id</th>
                                <th scope='col' className='px-6 py-3'>Price</th>
                                <th scope='col' className='px-6 py-3'>Payment Status</th>
                                <th scope='col' className='px-6 py-3'>Order Status</th>
                                <th scope='col' className='px-6 py-3'>Action</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders.map((o, i) => (
                                <tr key={o._id} className='bg-white border-b'>
                                    <td className='px-6 py-4 font-medium whitespace-nowrap'>#{o._id}</td>
                                    <td className='px-6 py-4 font-medium whitespace-nowrap'>₱{o.price}</td>
                                    <td className='px-6 py-4 font-medium whitespace-nowrap'>{o.payment_status}</td>
                                    <td className='px-6 py-4 font-medium whitespace-nowrap'>{o.delivery_status}</td>
                                    <td className='px-6 py-4 font-medium whitespace-nowrap'>
                                        <Link to={`/dashboard/order/details/${o._id}`}>
                                            <span className='bg-green-200 text-green-800 text-md font-semibold mr-2 px-3 py-[2px] rounded'>View</span>
                                        </Link>
                                        {o.payment_status !== 'paid' && (
                                            <span onClick={() => redirect(o)} className='bg-green-200 text-green-800 text-md font-semibold mr-2 px-3 py-[2px] rounded cursor-pointer'>
                                                Pay Now
                                            </span>
                                        )}
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