import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

export const place_order = createAsyncThunk(
    'order/place_order',
    async (orderData, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/home/order/place-order', orderData);
            return data;
        } catch (error) {
            console.error('Place order error:', error);
            return rejectWithValue(error.response?.data || { 
                message: 'Failed to place order' 
            });
        }
    }
);

export const get_orders = createAsyncThunk(
    'order/get_orders',
    async({ customerId, status }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/home/coustomer/get-orders/${customerId}/${status}`);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const get_order_details = createAsyncThunk(
    'order/get_order_details',
    async(orderId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/home/coustomer/get-order-details/${orderId}`);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const get_admin_order = createAsyncThunk(
    'order/get_admin_order',
    async(orderId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/admin/order-details/${orderId}`);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const orderReducer = createSlice({
    name: 'order',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        myOrders: [],
        myOrder: {}, // Add this
        order: {}
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(place_order.pending, (state) => {
                state.loader = true;
            })
            .addCase(place_order.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
            })
            .addCase(place_order.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.message || "Order placement failed";
            })
            .addCase(get_orders.fulfilled, (state, { payload }) => { 
                state.myOrders = payload.orders; 
            })
            .addCase(get_order_details.fulfilled, (state, { payload }) => { 
                state.myOrder = payload.order; 
            })
            .addCase(get_admin_order.fulfilled, (state, { payload }) => {
                state.order = payload.order;
            });
    }
});

export const { messageClear } = orderReducer.actions;
export default orderReducer.reducer;