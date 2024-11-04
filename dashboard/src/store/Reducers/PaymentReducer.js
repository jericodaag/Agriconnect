import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 
 
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
  // End Method 


export const send_withdrowal_request = createAsyncThunk(
    'payment/send_withdrowal_request',
    async( info,{rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.post(`/payment/withdrowal-request`,info,{withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
) 
  // End Method 

  export const get_payment_request = createAsyncThunk(
    'payment/get_payment_request',
    async(_,{rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.get(`/payment/request`,{withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
) 
  // End Method 

  export const confirm_payment_request = createAsyncThunk(
    'payment/confirm_payment_request',
    async(paymentId ,{rejectWithValue, fulfillWithValue}) => { 
        try { 
            const {data} = await api.post(`/payment/request-confirm`,{paymentId},{withCredentials: true})  
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
) 
  // End Method 

 

 
  export const PaymentReducer = createSlice({
    name: 'payment',
    initialState: {
        totalAmount: 0,
        pendingAmount: 0,
        withdrowAmount: 0,
        availableAmount: 0,
        pendingWithdrows: [],
        successWithdrows: [],
        salesData: {
            total: 0,
            stripe: { amount: 0, count: 0 },
            cod: { amount: 0, count: 0 }
        },
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
                state.totalAmount = payload.totalAmount;
                state.pendingAmount = payload.pendingAmount;
                state.withdrowAmount = payload.withdrowAmount;
                state.availableAmount = payload.availableAmount;
                state.pendingWithdrows = payload.pendingWithdrows;
                state.successWithdrows = payload.successWithdrows;
                state.salesData = payload.salesData;
            })
            .addCase(get_seller_payment_details.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.message;
            })

        .addCase(send_withdrowal_request.pending, (state, { payload }) => {
            state.loader = true  
        })
        .addCase(send_withdrowal_request.rejected, (state, { payload }) => {
            state.loader = false  
            state.errorMessage = payload.message; 
        })
        .addCase(send_withdrowal_request.fulfilled, (state, { payload }) => {
            state.loader = false  
            state.successMessage = payload.message; 
            state.pendingWithdrows = [...state.pendingWithdrows,payload.withdrowal]; 
            state.availableAmount = state.availableAmount - payload.withdrowal.amount; 
            state.pendingAmount = payload.withdrowal.amount; 
        })

        .addCase(get_payment_request.fulfilled, (state, { payload }) => {
            state.pendingWithdrows = payload.withdrowalRequest  
        })

        .addCase(confirm_payment_request.pending, (state, { payload }) => {
            state.loader = true  
        })
        .addCase(confirm_payment_request.rejected, (state, { payload }) => {
            state.loader = false  
            state.errorMessage = payload.message; 
        })
        .addCase(confirm_payment_request.fulfilled, (state, { payload }) => {
            const temp = state.pendingWithdrows.filter(r => r._id !== payload.payment._id)
            state.loader = false  
            state.successMessage = payload.message;
            state.pendingWithdrows = temp  
        })
       

    }

})
export const {messageClear} = PaymentReducer.actions
export default PaymentReducer.reducer