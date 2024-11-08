import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

// Async thunks remain the same
export const get_seller_payment_details = createAsyncThunk(
    'payment/get_seller_payment_details',
    async (sellerId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/payment/seller-payment-details/${sellerId}`, { 
                withCredentials: true 
            });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const send_withdrowal_request = createAsyncThunk(
    'payment/send_withdrowal_request',
    async(info, {rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.post(`/payment/withdrowal-request`, info, {withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
); 

export const get_payment_request = createAsyncThunk(
    'payment/get_payment_request',
    async(_, {rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.get(`/payment/request`, {withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
);

export const get_withdrawal_history = createAsyncThunk(
    'payment/get_withdrawal_history',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get('/payment/withdrawal-history', { 
                withCredentials: true 
            });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const confirm_payment_request = createAsyncThunk(
    'payment/confirm_payment_request',
    async({ paymentId, withdrawalCode }, {rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.post(`/payment/request-confirm`, {
                paymentId,
                withdrawalCode
            }, {withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
); 

export const PaymentReducer = createSlice({
    name: 'payment',
    initialState: {
        // Financial Overview
        totalAmount: 0,          // Gross sales
        netAmount: 0,            // Total after commission (97% of gross)
        commission: 0,           // Total platform fee (3% of gross)
        pendingAmount: 0,        // Total pending withdrawals
        withdrowAmount: 0,       // Total completed withdrawals
        availableAmount: 0,      // Current available for withdrawal

        // Withdrawal Records
        pendingWithdrows: [],    // Pending withdrawal requests
        successWithdrows: [],    // Completed withdrawals
        withdrawalHistory: [],   // Complete withdrawal history

        // Sales Data by Payment Method
        salesData: {
            total: 0,            // Total gross sales across all methods
            stripe: {
                gross: 0,        // Total stripe sales before commission
                amount: 0,       // Available for withdrawal
                netAmount: 0,    // After commission
                commission: 0,   // Platform fee
                count: 0,        // Number of orders
                withdrawn: 0,    // Total withdrawn
                pending: 0       // Pending withdrawals
            },
            cod: {
                gross: 0,        // Total COD sales before commission
                amount: 0,       // Available for withdrawal
                netAmount: 0,    // After commission
                commission: 0,   // Platform fee
                count: 0,        // Number of orders
                withdrawn: 0,    // Total withdrawn
                pending: 0       // Pending withdrawals
            }
        },

        // UI States
        successMessage: '',
        errorMessage: '',
        loader: false
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_seller_payment_details.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_seller_payment_details.fulfilled, (state, { payload }) => {
                state.loader = false;

                // Update main financial totals
                state.totalAmount = payload.totalAmount;
                state.netAmount = payload.netAmount;
                state.commission = payload.commission;
                state.pendingAmount = payload.pendingAmount;
                state.withdrowAmount = payload.withdrowAmount;
                state.availableAmount = payload.availableAmount;

                // Update withdrawal records
                state.pendingWithdrows = payload.pendingWithdrows;
                state.successWithdrows = payload.successWithdrows;

                // Update detailed sales data
                state.salesData = {
                    total: payload.salesData.total,
                    stripe: {
                        gross: payload.salesData.stripe.total || 0,
                        amount: payload.salesData.stripe.amount || 0,
                        netAmount: payload.salesData.stripe.netAmount || 0,
                        commission: payload.salesData.stripe.commission || 0,
                        count: payload.salesData.stripe.count || 0,
                        withdrawn: payload.salesData.stripe.withdrawn || 0,
                        pending: payload.salesData.stripe.pending || 0
                    },
                    cod: {
                        gross: payload.salesData.cod.total || 0,
                        amount: payload.salesData.cod.amount || 0,
                        netAmount: payload.salesData.cod.netAmount || 0,
                        commission: payload.salesData.cod.commission || 0,
                        count: payload.salesData.cod.count || 0,
                        withdrawn: payload.salesData.cod.withdrawn || 0,
                        pending: payload.salesData.cod.pending || 0
                    }
                };
            })
            .addCase(get_seller_payment_details.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.message;
            })

            .addCase(send_withdrowal_request.pending, (state) => {
                state.loader = true;
            })
            .addCase(send_withdrowal_request.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.pendingWithdrows = [...state.pendingWithdrows, payload.withdrawal];
                
                const withdrawalAmount = payload.withdrawal.amount;
                
                // Update available amounts
                state.availableAmount -= withdrawalAmount;
                if (payload.withdrawal.payment_method === 'stripe') {
                    state.salesData.stripe.amount -= withdrawalAmount;
                    state.salesData.stripe.pending += withdrawalAmount;
                } else if (payload.withdrawal.payment_method === 'cod') {
                    state.salesData.cod.amount -= withdrawalAmount;
                    state.salesData.cod.pending += withdrawalAmount;
                }
                
                // Update pending amount
                state.pendingAmount = state.pendingWithdrows.reduce((sum, w) => sum + w.amount, 0);

                // Add withdrawal code to message if present
                if (payload.withdrawal.withdrawalCode) {
                    state.successMessage = `Withdrawal request submitted. Your withdrawal code is: ${payload.withdrawal.withdrawalCode}`;
                }
            })
            .addCase(send_withdrowal_request.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.message;
            })

            .addCase(get_payment_request.fulfilled, (state, { payload }) => {
                state.pendingWithdrows = payload.withdrowalRequest;
            })

            .addCase(get_withdrawal_history.fulfilled, (state, { payload }) => {
                state.withdrawalHistory = payload.withdrawals;
            })

            .addCase(confirm_payment_request.pending, (state) => {
                state.loader = true;
            })
            .addCase(confirm_payment_request.fulfilled, (state, { payload }) => {
                const temp = state.pendingWithdrows.filter(r => r._id !== payload.payment._id);
                state.loader = false;
                state.successMessage = payload.message;
                state.pendingWithdrows = temp;
                
                // Update withdrawal tracking
                state.withdrowAmount += payload.payment.amount;
                state.pendingAmount = temp.reduce((sum, w) => sum + w.amount, 0);
                
                // Update per payment method tracking
                if (payload.payment.payment_method === 'stripe') {
                    state.salesData.stripe.withdrawn += payload.payment.amount;
                    state.salesData.stripe.pending -= payload.payment.amount;
                } else if (payload.payment.payment_method === 'cod') {
                    state.salesData.cod.withdrawn += payload.payment.amount;
                    state.salesData.cod.pending -= payload.payment.amount;
                }
                
                // Update withdrawal history
                if (state.withdrawalHistory) {
                    state.withdrawalHistory = [payload.payment, ...state.withdrawalHistory];
                }
            })
            .addCase(confirm_payment_request.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.message;
            })
    }
});

export const { messageClear } = PaymentReducer.actions;
export default PaymentReducer.reducer;