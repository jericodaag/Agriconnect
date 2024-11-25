import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { confirm_payment_request, get_payment_request, get_withdrawal_history, messageClear } from '../../store/Reducers/PaymentReducer';
import moment from 'moment';
import toast from 'react-hot-toast';
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

// Mobile Withdrawal Card Component
const WithdrawalCard = ({ withdraw, index, showActions, onConfirm, withdrawalCode, onCodeChange, loading, paymentId }) => (
  <Card className="mb-4 p-4">
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <span className="text-sm text-gray-500">#{index + 1}</span>
        <Badge
          variant={withdraw.status === 'pending' ? 'warning' : 'success'}
        >
          {withdraw.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500 block">Amount</span>
          <span className="font-medium">₱{withdraw.amount.toLocaleString('en-PH')}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Method</span>
          <Badge variant="outline">
            {withdraw.payment_method}
          </Badge>
        </div>
      </div>

      <div className="text-sm">
        <span className="text-gray-500 block">Seller ID</span>
        <span className="font-medium">{withdraw.sellerId}</span>
      </div>

      <div className="text-sm">
        <span className="text-gray-500 block">Date</span>
        <span>{moment(withdraw.createdAt).format('LL')}</span>
      </div>

      <div className="text-sm">
        <span className="text-gray-500 block">Reference No.</span>
        <span className="font-mono text-xs break-all">{withdraw._id}</span>
      </div>

      {showActions && (
        <div className="pt-2">
          {withdraw.payment_method === 'cod' ? (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter withdrawal code"
                value={withdrawalCode || ''}
                onChange={(e) => onCodeChange(withdraw._id, e)}
                className="w-full"
              />
              <Button
                className="w-full"
                disabled={loading && paymentId === withdraw._id}
                onClick={() => onConfirm(withdraw)}
              >
                {(loading && paymentId === withdraw._id) ? 'Loading...' : 'Confirm'}
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              disabled={loading && paymentId === withdraw._id}
              onClick={() => onConfirm(withdraw)}
            >
              {(loading && paymentId === withdraw._id) ? 'Loading...' : 'Confirm'}
            </Button>
          )}
        </div>
      )}
    </div>
  </Card>
);

// Desktop Table Component
const WithdrawalTable = ({ withdrawals, showActions, onConfirm, withdrawalCodes, onCodeChange, loader, paymentId }) => (
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
              <Badge variant="outline">{withdraw.payment_method}</Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge variant={withdraw.status === 'pending' ? 'warning' : 'success'}>
                {withdraw.status}
              </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">{moment(withdraw.createdAt).format('LL')}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="font-mono text-sm">{withdraw._id}</span>
            </td>
            {showActions && (
              <td className="px-6 py-4 whitespace-nowrap">
                {withdraw.payment_method === 'cod' ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Enter code"
                      value={withdrawalCodes[withdraw._id] || ''}
                      onChange={(e) => onCodeChange(withdraw._id, e)}
                      className="w-32"
                    />
                    <Button
                      disabled={loader && paymentId === withdraw._id}
                      onClick={() => onConfirm(withdraw)}
                      size="sm"
                    >
                      {(loader && paymentId === withdraw._id) ? 'Loading...' : 'Confirm'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    disabled={loader && paymentId === withdraw._id}
                    onClick={() => onConfirm(withdraw)}
                    size="sm"
                  >
                    {(loader && paymentId === withdraw._id) ? 'Loading...' : 'Confirm'}
                  </Button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

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

    return (
        <div className="w-full bg-white rounded-lg shadow-sm">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Withdrawal Management</h2>
            </div>
            
            <div className="p-4 md:p-6">
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

                {/* Desktop View */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
                    <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                        {currentTab === 'pending' && (
                            <WithdrawalTable 
                                withdrawals={pendingWithdrows} 
                                showActions={true}
                                onConfirm={confirm_request}
                                withdrawalCodes={withdrawalCodes}
                                onCodeChange={handleCodeChange}
                                loader={loader}
                                paymentId={paymentId}
                            />
                        )}
                        {currentTab === 'history' && (
                            <WithdrawalTable 
                                withdrawals={withdrawalHistory} 
                                showActions={false}
                            />
                        )}
                    </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                    {currentTab === 'pending' && pendingWithdrows.map((withdraw, index) => (
                        <WithdrawalCard
                            key={withdraw._id}
                            withdraw={withdraw}
                            index={index}
                            showActions={true}
                            onConfirm={confirm_request}
                            withdrawalCode={withdrawalCodes[withdraw._id]}
                            onCodeChange={handleCodeChange}
                            loading={loader}
                            paymentId={paymentId}
                        />
                    ))}
                    {currentTab === 'history' && withdrawalHistory.map((withdraw, index) => (
                        <WithdrawalCard
                            key={withdraw._id}
                            withdraw={withdraw}
                            index={index}
                            showActions={false}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PaymentRequest;