import React, { forwardRef, useEffect, useState } from 'react';
import { HiCurrencyDollar, HiCash, HiClock, HiExclamationCircle } from "react-icons/hi";
import { FaStripe } from "react-icons/fa";
import { BsCashStack } from "react-icons/bs";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import { get_seller_payment_details, messageClear, send_withdrowal_request } from '../../store/Reducers/PaymentReducer';
import toast from 'react-hot-toast';
import moment from 'moment';

const outerElementType = forwardRef((props, ref) => (
    <div ref={ref} onWheel={({ deltaY }) => console.log('handleOnWheel', deltaY)} {...props} />
));

const Payments = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const [isLoading, setIsLoading] = useState(true);
    const { 
        successMessage, 
        errorMessage, 
        loader, 
        pendingWithdrows = [], 
        successWithdrows = [], 
        totalAmount = 0, 
        withdrowAmount = 0, 
        pendingAmount = 0, 
        availableAmount = 0,
        salesData = {
            total: 0,
            stripe: { amount: 0, count: 0 },
            cod: { amount: 0, count: 0 }
        }
    } = useSelector(state => state.payment);

    const [amount, setAmount] = useState(0);

    const sendRequest = (e) => {
        e.preventDefault();
        if (availableAmount - amount > 10) {
            dispatch(send_withdrowal_request({ amount, sellerId: userInfo._id }));
            setAmount(0);
        } else {
            toast.error('Insufficient Balance');
        }
    };

    const Row = ({ index, style }) => (
        <div style={style} className='flex items-center text-sm text-gray-600 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ease-in-out'>
            <div className='w-1/4 p-3'>{index + 1}</div>
            <div className='w-1/4 p-3 font-medium'>₱{(pendingWithdrows[index]?.amount || 0).toLocaleString('en-PH')}</div>
            <div className='w-1/4 p-3'>
                <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold'>
                    {pendingWithdrows[index]?.status || 'pending'}
                </span>
            </div>
            <div className='w-1/4 p-3'>{moment(pendingWithdrows[index]?.createdAt).format('MMM D, YYYY')}</div>
        </div>
    );

    const Rows = ({ index, style }) => (
        <div style={style} className='flex items-center text-sm text-gray-600 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ease-in-out'>
            <div className='w-1/4 p-3'>{index + 1}</div>
            <div className='w-1/4 p-3 font-medium'>₱{(successWithdrows[index]?.amount || 0).toLocaleString('en-PH')}</div>
            <div className='w-1/4 p-3'>
                <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold'>
                    {successWithdrows[index]?.status || 'success'}
                </span>
            </div>
            <div className='w-1/4 p-3'>{moment(successWithdrows[index]?.createdAt).format('MMM D, YYYY')}</div>
        </div>
    );

    useEffect(() => {
        if (userInfo?._id) {
            dispatch(get_seller_payment_details(userInfo._id))
                .then(() => setIsLoading(false));
        }
    }, [dispatch, userInfo]);

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

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className='bg-gray-50 min-h-screen p-6'>
            <div className='max-w-7xl mx-auto space-y-6'>
                <h1 className='text-3xl font-bold text-gray-800'>Financial Overview</h1>
                
                {/* Main Stats */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {[
                        { 
                            title: 'Total Revenue', 
                            amount: totalAmount, 
                            icon: HiCurrencyDollar, 
                            color: 'bg-blue-500', 
                            trend: <FiArrowUpRight className="text-green-500" /> 
                        },
                        { 
                            title: 'Available Balance', 
                            amount: availableAmount, 
                            icon: HiCash, 
                            color: 'bg-green-500', 
                            trend: <FiArrowUpRight className="text-green-500" /> 
                        },
                        { 
                            title: 'Withdrawn Amount', 
                            amount: withdrowAmount, 
                            icon: HiClock, 
                            color: 'bg-yellow-500', 
                            trend: <FiArrowDownRight className="text-red-500" /> 
                        },
                        { 
                            title: 'Pending Amount', 
                            amount: pendingAmount, 
                            icon: HiExclamationCircle, 
                            color: 'bg-red-500', 
                            trend: <FiArrowUpRight className="text-green-500" /> 
                        },
                    ].map((item, index) => (
                        <div key={index} className='bg-white rounded-xl shadow-md overflow-hidden'>
                            <div className={`${item.color} p-4`}>
                                <item.icon className="h-8 w-8 text-white" />
                            </div>
                            <div className='p-4'>
                                <p className='text-sm text-gray-500 mb-1'>{item.title}</p>
                                <div className='flex items-center justify-between'>
                                    <h3 className='text-2xl font-bold text-gray-700'>₱{item.amount.toLocaleString('en-PH')}</h3>
                                    {item.trend}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment Method Stats */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
                    <div className='bg-white rounded-lg shadow-sm p-4 flex items-center justify-between'>
                        <div className='flex items-center'>
                            <div className='bg-indigo-500 text-white p-3 rounded-full mr-4'>
                                <FaStripe size={24} />
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Stripe Payments</p>
                                <h3 className='text-xl font-bold text-gray-800'>
                                    ₱{salesData.stripe.amount.toLocaleString('en-PH')}
                                </h3>
                                <p className='text-xs text-gray-500'>{salesData.stripe.count} orders</p>
                            </div>
                        </div>
                        <div className='text-right'>
                            <p className='text-sm font-semibold text-indigo-600'>
                                {salesData.total ? 
                                    ((salesData.stripe.amount / salesData.total) * 100).toFixed(1) 
                                    : 0}%
                            </p>
                            <p className='text-xs text-gray-500'>of total sales</p>
                        </div>
                    </div>

                    <div className='bg-white rounded-lg shadow-sm p-4 flex items-center justify-between'>
                        <div className='flex items-center'>
                            <div className='bg-green-500 text-white p-3 rounded-full mr-4'>
                                <BsCashStack size={24} />
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>COD Payments</p>
                                <h3 className='text-xl font-bold text-gray-800'>
                                    ₱{salesData.cod.amount.toLocaleString('en-PH')}
                                </h3>
                                <p className='text-xs text-gray-500'>{salesData.cod.count} orders</p>
                            </div>
                        </div>
                        <div className='text-right'>
                            <p className='text-sm font-semibold text-green-600'>
                                {salesData.total ? 
                                    ((salesData.cod.amount / salesData.total) * 100).toFixed(1) 
                                    : 0}%
                            </p>
                            <p className='text-xs text-gray-500'>of total sales</p>
                        </div>
                    </div>
                </div>

                {/* Withdrawal Section */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div className='bg-white rounded-xl shadow-md p-6'>
                        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Withdrawal Request</h2>
                        <form onSubmit={sendRequest} className='space-y-4'>
                            <div className='flex items-center space-x-4'>
                                <input
                                    type="number"
                                    min='0'
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className='flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200'
                                    placeholder='Enter amount'
                                />
                                <button
                                    disabled={loader}
                                    className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200'
                                >
                                    {loader ? 'Processing...' : 'Request'}
                                </button>
                            </div>
                        </form>

                        <h2 className='text-xl font-semibold text-gray-800 mt-8 mb-4'>Pending Requests</h2>
                        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
                            <div className='flex bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold'>
                                <div className='w-1/4 p-3'>No</div>
                                <div className='w-1/4 p-3'>Amount</div>
                                <div className='w-1/4 p-3'>Status</div>
                                <div className='w-1/4 p-3'>Date</div>
                            </div>
                            <List
                                className='List'
                                height={300}
                                itemCount={pendingWithdrows.length}
                                itemSize={40}
                                outerElementType={outerElementType}
                            >
                                {Row}
                            </List>
                        </div>
                    </div>

                    <div className='bg-white rounded-xl shadow-md p-6'>
                        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Successful Withdrawals</h2>
                        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
                            <div className='flex bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold'>
                                <div className='w-1/4 p-3'>No</div>
                                <div className='w-1/4 p-3'>Amount</div>
                                <div className='w-1/4 p-3'>Status</div>
                                <div className='w-1/4 p-3'>Date</div>
                            </div>
                            <List
                                className='List'
                                height={350}
                                itemCount={successWithdrows.length}
                                itemSize={40}
                                outerElementType={outerElementType}
                            >
                                {Rows}
                            </List>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;