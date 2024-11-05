import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { confirm_payment_request, get_payment_request, get_withdrawal_history, messageClear } from '../../store/Reducers/PaymentReducer';
import moment from 'moment';
import toast from 'react-hot-toast';

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";

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

    const handleCodeChange = (withdrawId, code) => {
        setWithdrawalCodes(prev => ({
            ...prev,
            [withdrawId]: code
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
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference No.</TableHead>
                    {showActions && <TableHead className="w-[200px]">Action</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {withdrawals.map((withdraw, index) => (
                    <TableRow key={withdraw._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{withdraw.sellerId}</TableCell>
                        <TableCell>₱{withdraw.amount.toLocaleString('en-PH')}</TableCell>
                        <TableCell>
                            <Badge variant={withdraw.payment_method === 'stripe' ? 'default' : 'outline'}>
                                {withdraw.payment_method}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={withdraw.status === 'pending' ? 'secondary' : 'success'}>
                                {withdraw.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{moment(withdraw.createdAt).format('LL')}</TableCell>
                        <TableCell>
                            <span className="font-mono text-sm">{withdraw._id}</span>
                        </TableCell>
                        {showActions && (
                            <TableCell>
                                {withdraw.payment_method === 'cod' ? (
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            type="text"
                                            placeholder="Enter code"
                                            value={withdrawalCodes[withdraw._id] || ''}
                                            onChange={(e) => handleCodeChange(withdraw._id, e.target.value)}
                                            className="w-32"
                                        />
                                        <Button
                                            variant="default"
                                            size="sm"
                                            disabled={loader && paymentId === withdraw._id}
                                            onClick={() => confirm_request(withdraw)}
                                        >
                                            {(loader && paymentId === withdraw._id) ? 'Loading...' : 'Confirm'}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        disabled={loader && paymentId === withdraw._id}
                                        onClick={() => confirm_request(withdraw)}
                                    >
                                        {(loader && paymentId === withdraw._id) ? 'Loading...' : 'Confirm'}
                                    </Button>
                                )}
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Withdrawal Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs 
                    defaultValue="pending" 
                    value={currentTab}
                    onValueChange={setCurrentTab} 
                    className="space-y-4"
                >
                    <TabsList>
                        <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                        <TabsTrigger value="history">Withdrawal History</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pending">
                        <ScrollArea className="h-[600px] rounded-md border">
                            <WithdrawalTable withdrawals={pendingWithdrows} showActions={true} />
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="history">
                        <ScrollArea className="h-[600px] rounded-md border">
                            <WithdrawalTable withdrawals={withdrawalHistory} showActions={false} />
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default PaymentRequest;