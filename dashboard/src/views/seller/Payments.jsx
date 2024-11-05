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
import { Badge } from "../../components/ui/badge";
import { downloadReceipt, downloadWithdrawalCode } from '../../utils/receiptGenerator';

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
    const [codAmount, setCodAmount] = useState(0);
    const [showCodWithdraw, setShowCodWithdraw] = useState(false);
    const [lastWithdrawalCode, setLastWithdrawalCode] = useState('');

    // Calculate available amounts for each payment method
    const codAvailableAmount = salesData.cod.amount - 
        pendingWithdrows
            .filter(w => w.payment_method === 'cod')
            .reduce((sum, w) => sum + w.amount, 0);

    const stripeAvailableAmount = salesData.stripe.amount - 
        pendingWithdrows
            .filter(w => w.payment_method === 'stripe')
            .reduce((sum, w) => sum + w.amount, 0);

    const sendRequest = (e) => {
        e.preventDefault();
        if (stripeAvailableAmount - amount > 10) {
            dispatch(send_withdrowal_request({ 
                amount, 
                sellerId: userInfo._id,
                payment_method: 'stripe'
            }));
            setAmount(0);
        } else {
            toast.error('Insufficient Stripe Balance');
        }
    };

    const sendCodRequest = (e) => {
        e.preventDefault();
        if (codAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (codAmount > codAvailableAmount) {
            toast.error('Insufficient COD balance');
            return;
        }
        dispatch(send_withdrowal_request({ 
            amount: codAmount, 
            sellerId: userInfo._id,
            payment_method: 'cod'
        }));
        setCodAmount(0);
        setShowCodWithdraw(false);
    };

    useEffect(() => {
        if (userInfo?._id) {
            dispatch(get_seller_payment_details(userInfo._id))
                .then(() => setIsLoading(false));
        }
    }, [dispatch, userInfo]);

    useEffect(() => {
        if (successMessage) {
            // Check if message contains withdrawal code
            if (successMessage.includes('withdrawal code')) {
                // Extract and save the code
                const code = successMessage.split('withdrawal code is: ')[1];
                setLastWithdrawalCode(code);
            }
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
                    {/* Stripe Card */}
                    <div className='bg-white rounded-lg shadow-sm p-4'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center'>
                                <div className='bg-indigo-500 text-white p-3 rounded-full mr-4'>
                                    <FaStripe size={24} />
                                </div>
                                <div>
                                    <p className='text-sm text-gray-500'>Stripe Payments</p>
                                    <h3 className='text-xl font-bold text-gray-800'>
                                        ₱{salesData.stripe.amount.toLocaleString('en-PH')}
                                    </h3>
                                    <p className='text-xs text-gray-500'>
                                        Available: ₱{stripeAvailableAmount.toLocaleString('en-PH')}
                                    </p>
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
                                <form onSubmit={sendRequest} className='mt-2'>
                                    <input
                                        type="number"
                                        min='0'
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className='w-full px-2 py-1 text-sm border rounded mb-2'
                                        placeholder='Amount'
                                    />
                                    <button
                                        disabled={loader}
                                        className='w-full px-3 py-1 bg-indigo-500 text-white text-sm rounded'
                                    >
                                        {loader ? 'Processing...' : 'Withdraw'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* COD Card */}
                    <div className='bg-white rounded-lg shadow-sm p-4'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center'>
                                <div className='bg-green-500 text-white p-3 rounded-full mr-4'>
                                    <BsCashStack size={24} />
                                </div>
                                <div>
                                    <p className='text-sm text-gray-500'>COD Payments</p>
                                    <h3 className='text-xl font-bold text-gray-800'>
                                        ₱{salesData.cod.amount.toLocaleString('en-PH')}
                                    </h3>
                                    <p className='text-xs text-gray-500'>
                                        Available: ₱{codAvailableAmount.toLocaleString('en-PH')}
                                    </p>
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
                                <button
                                    onClick={() => setShowCodWithdraw(true)}
                                    className='mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded w-full'
                                >
                                    Request Cash
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Withdrawal History */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Pending Withdrawals */}
                    <div className='bg-white rounded-xl shadow-md p-6'>
                        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Pending Requests</h2>
                        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
                            <div className='flex bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold'>
                                <div className='w-1/5 p-3'>No</div>
                                <div className='w-1/5 p-3'>Amount</div>
                                <div className='w-1/5 p-3'>Method</div>
                                <div className='w-1/5 p-3'>Status</div>
                                <div className='w-1/5 p-3'>Date</div>
                            </div>
                            <List
                                className='List'
                                height={300}
                                itemCount={pendingWithdrows.length}
                                itemSize={40}
                                outerElementType={outerElementType}
                            >
                                {({ index, style }) => (
                                    <div style={style} className='flex items-center text-sm border-b'>
                                        <div className='w-1/5 p-3'>{index + 1}</div>
                                        <div className='w-1/5 p-3'>₱{pendingWithdrows[index]?.amount.toLocaleString('en-PH')}</div>
                                        <div className='w-1/5 p-3'>
                                            <Badge variant={pendingWithdrows[index]?.payment_method === 'stripe' ? 'default' : 'outline'}>
                                                {pendingWithdrows[index]?.payment_method}
                                            </Badge>
                                        </div>
                                        <div className='w-1/5 p-3'>
                                            <Badge variant="secondary">
                                                {pendingWithdrows[index]?.status}
                                            </Badge>
                                        </div>
                                        <div className='w-1/5 p-3'>
                                            {moment(pendingWithdrows[index]?.createdAt).format('MMM D, YYYY')}
                                        </div>
                                    </div>
                                )}
                            </List>
                        </div>
                    </div>

                    {/* Successful Withdrawals */}
                    <div className='bg-white rounded-xl shadow-md p-6'>
                        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Successful Withdrawals</h2>
                        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
                            <div className='flex bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold'>
                                <div className='w-1/6 p-3'>No</div>
                                <div className='w-1/6 p-3'>Amount</div>
                                <div className='w-1/6 p-3'>Method</div>
                                <div className='w-1/6 p-3'>Status</div>
                                <div className='w-1/6 p-3'>Date</div>
                                <div className='w-1/6 p-3'>Action</div>
                            </div>
                            <List
                            className='List'
                            height={350}
                            itemCount={successWithdrows.length}
                            itemSize={40}
                            outerElementType={outerElementType}
                        >
                            {({ index, style }) => {
                                // Sort withdrawals by date, newest first
                                const sortedWithdraws = [...successWithdrows].sort((a, b) => 
                                    new Date(b.createdAt) - new Date(a.createdAt)
                                );
                                const withdraw = sortedWithdraws[index];

                                return (
                                    <div style={style} className='flex items-center text-sm border-b hover:bg-gray-50'>
                                        <div className='w-1/6 p-3'>{index + 1}</div>
                                        <div className='w-1/6 p-3'>₱{withdraw?.amount.toLocaleString('en-PH')}</div>
                                        <div className='w-1/6 p-3'>
                                            <Badge variant={withdraw?.payment_method === 'stripe' ? 'default' : 'outline'}>
                                                {withdraw?.payment_method}
                                            </Badge>
                                        </div>
                                        <div className='w-1/6 p-3'>
                                            <Badge variant="success">
                                                {withdraw?.status}
                                            </Badge>
                                        </div>
                                        <div className='w-1/6 p-3'>
                                            {moment(withdraw?.createdAt).format('MMM D, YYYY')}
                                        </div>
                                        <div className='w-1/6 p-3 flex gap-2'>
                                            <button
                                                onClick={() => downloadReceipt(withdraw)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Download Receipt"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </button>
                                            {withdraw?.payment_method === 'cod' && withdraw?.withdrawalCode && (
                                                <button
                                                    onClick={() => downloadWithdrawalCode(withdraw)}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="Download Withdrawal Code"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-3 3m0 0l-3-3m3 3V4" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19H5c-1.105 0-2-.895-2-2V7c0-1.105.895-2 2-2h14c1.105 0 2 .895 2 2v10c0 1.105-.895 2-2 2h-7z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            }}
                        </List>
                        </div>
                    </div>
                </div>

                {/* COD Withdrawal Modal */}
                {showCodWithdraw && (
                    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                        <div className='bg-white rounded-lg p-6 w-96 max-w-full mx-4'>
                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Request COD Withdrawal</h3>
                            <form onSubmit={sendCodRequest}>
                                <div className='mb-4'>
                                    <label className='block text-sm text-gray-600 mb-2'>
                                        Available Balance: ₱{codAvailableAmount.toLocaleString('en-PH')}
                                    </label>
                                    <input
                                        type="number"
                                        value={codAmount}
                                        onChange={(e) => setCodAmount(e.target.value)}
                                        max={codAvailableAmount}
                                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200'
                                        placeholder='Enter amount'
                                    />
                                </div>
                                <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                                    <p className='text-sm text-gray-600 mb-2'>Important Notes:</p>
                                    <ul className='text-xs text-gray-500 space-y-1 list-disc pl-4'>
                                        <li>A unique withdrawal code will be generated</li>
                                        <li>Keep the code safe - it's required for verification</li>
                                        <li>Processing may take 1-3 business days</li>
                                        <li>Minimum withdrawal amount is ₱100</li>
                                    </ul>
                                </div>

                                {/* Add the withdrawal code display here */}
                                {lastWithdrawalCode && (
                                <div className='mt-4 p-4 bg-white rounded-lg mb-4 shadow-lg border border-green-200'>
                                    <h3 className='text-lg font-semibold text-gray-800 mb-2'>Withdrawal Code Generated</h3>
                                    
                                    <div className='bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4'>
                                        <p className='text-sm text-gray-600 mb-2'>Amount:</p>
                                        <p className='text-2xl font-bold text-gray-800'>₱{codAmount.toLocaleString('en-PH')}</p>
                                        
                                        <p className='text-sm text-gray-600 mt-4 mb-2'>Code:</p>
                                        <p className='text-xl font-mono bg-white p-3 rounded border border-gray-200 text-center'>
                                            {lastWithdrawalCode}
                                        </p>
                                    </div>

                                    <div className='flex justify-center'>
                                        <button
                                            onClick={() => downloadWithdrawalCode({
                                                withdrawalCode: lastWithdrawalCode,
                                                amount: codAmount,
                                                createdAt: new Date(),
                                                _id: 'temp-' + Date.now()
                                            })}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                                                    flex items-center gap-2 transition-colors duration-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" 
                                                stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download Code Image
                                        </button>
                                    </div>
                                </div>
                            )}

                                <div className='flex justify-end space-x-2'>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setShowCodWithdraw(false);
                                            setCodAmount(0);
                                        }}
                                        className='px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        disabled={loader || codAmount <= 0 || codAmount > codAvailableAmount}
                                        className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                                    >
                                        {loader ? (
                                            <span className='flex items-center'>
                                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            'Submit Request'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payments;