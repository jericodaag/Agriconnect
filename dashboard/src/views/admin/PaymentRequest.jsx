import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { confirm_payment_request, get_payment_request, messageClear } from '../../store/Reducers/PaymentReducer';
import moment from 'moment';
import toast from 'react-hot-toast';

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { ScrollArea } from "../../components/ui/scroll-area"

const PaymentRequest = () => {
    const dispatch = useDispatch()
    const { successMessage, errorMessage, pendingWithdrows, loader } = useSelector(state => state.payment)
    const [paymentId, setPaymentId] = useState('')

    useEffect(() => { 
        dispatch(get_payment_request())
    }, [dispatch])

    const confirm_request = (id) => {
        setPaymentId(id)
        dispatch(confirm_payment_request(id))
    }

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [successMessage, errorMessage, dispatch])

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Withdrawal Request</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingWithdrows.map((withdraw, index) => (
                                <TableRow key={withdraw._id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>₱{withdraw.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {withdraw.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{moment(withdraw.createdAt).format('LL')}</TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="default" 
                                            size="sm"
                                            disabled={loader && paymentId === withdraw._id}
                                            onClick={() => confirm_request(withdraw._id)}
                                        >
                                            {(loader && paymentId === withdraw._id) ? 'Loading...' : 'Confirm'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default PaymentRequest;