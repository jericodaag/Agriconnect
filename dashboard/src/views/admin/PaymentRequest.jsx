import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { confirm_payment_request, get_payment_request, get_withdrawal_history, messageClear } from '../../store/Reducers/PaymentReducer';
import moment from 'moment';
import toast from 'react-hot-toast';

const PaymentRequest = () => {
    const dispatch = useDispatch();
    const { 
        successMessage, 
        errorMessage, 
        pendingWithdrows, 
        withdrawalHistory = [], 
        loader 
    } = useSelector(state => state.payment);
    
    const [paymentId, setPaymentId] = useState('');
    const [withdrawalCodes, setWithdrawalCodes] = useState({});
    const [currentTab, setCurrentTab] = useState('pending');

    useEffect(() => {
        dispatch(get_payment_request());
        dispatch(get_withdrawal_history());
    }, [dispatch]);

    const handleCodeChange = (withdrawId, e) => {
        const value = e.target.value;
        setWithdrawalCodes(prev => ({
            ...prev,
            [withdrawId]: value
        }));
    };

    const confirm_request = (withdraw) => {
        if (withdraw.payment_method === 'cod') {
            const code = withdrawalCodes[withdraw._id];
            if (!code) {
                toast.error('Please enter withdrawal code');
                return;
            }
            if (code !== withdraw.withdrawalCode) {
                toast.error('Invalid withdrawal code');
                return;
            }
        }

        setPaymentId(withdraw._id);
        dispatch(confirm_payment_request({
            paymentId: withdraw._id,
            withdrawalCode: withdrawalCodes[withdraw._id]
        }));
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            if (paymentId) {
                setWithdrawalCodes(prev => {
                    const newCodes = { ...prev };
                    delete newCodes[paymentId];
                    return newCodes;
                });
                setPaymentId('');
            }
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, paymentId]);

    const WithdrawalTable = ({ withdrawals, showActions = false }) => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference No.</th>
                        {showActions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">Action</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {withdrawals.map((withdraw, index) => (
                        <tr key={withdraw._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{withdraw.sellerId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">₱{withdraw.amount.toLocaleString('en-PH')}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    withdraw.payment_method === 'stripe' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {withdraw.payment_method}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    withdraw.status === 'pending' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {withdraw.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{moment(withdraw.createdAt).format('LL')}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono text-sm">{withdraw._id}</span>
                            </td>
                            {showActions && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {withdraw.payment_method === 'cod' ? (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                placeholder="Enter code"
                                                value={withdrawalCodes[withdraw._id] || ''}
                                                onChange={(e) => handleCodeChange(withdraw._id, e)}
                                                className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                disabled={loader && paymentId === withdraw._id}
                                                onClick={() => confirm_request(withdraw)}
                                                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {(loader && paymentId === withdraw._id) ? 'Loading...' : 'Confirm'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            disabled={loader && paymentId === withdraw._id}
                                            onClick={() => confirm_request(withdraw)}
                                            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {(loader && paymentId === withdraw._id) ? 'Loading...' : 'Confirm'}
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="w-full bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Withdrawal Management</h2>
            </div>
            
            <div className="p-6">
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setCurrentTab('pending')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                currentTab === 'pending'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Pending Requests
                        </button>
                        <button
                            onClick={() => setCurrentTab('history')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                currentTab === 'history'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Withdrawal History
                        </button>
                    </nav>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                        {currentTab === 'pending' && (
                            <WithdrawalTable withdrawals={pendingWithdrows} showActions={true} />
                        )}
                        {currentTab === 'history' && (
                            <WithdrawalTable withdrawals={withdrawalHistory} showActions={false} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentRequest;