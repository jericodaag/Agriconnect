import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

export const place_order = createAsyncThunk(
    'order/place_order',
    async({ price, products, shipping_fee, items, shippingInfo, userId, navigate }) => {
        try {
            const { data } = await api.post('/home/order/place-order', {
                price,
                products,
                shipping_fee,
                items,
                shippingInfo,
                userId,
                navigate
            })
            navigate('/payment', {
                state: {
                    price: price + shipping_fee,
                    items,
                    orderId: data.orderId 
                }
            })
            console.log(data)
            return data
        } catch (error) {
            console.log(error.response)
            throw error
        }
    }
)

export const get_orders = createAsyncThunk(
    'order/get_orders',
    async({ customerId, status }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/home/coustomer/get-orders/${customerId}/${status}`) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_order_details = createAsyncThunk(
    'order/get_order_details',
    async(orderId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/home/coustomer/get-order-details/${orderId}`) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_admin_order = createAsyncThunk(
    'order/get_admin_order',
    async(orderId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/admin/order-details/${orderId}`)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const orderReducer = createSlice({
    name: 'order',
    initialState: {
        myOrders: [], 
        errorMessage: '',
        successMessage: '',  
        myOrder: {},
        order: {},
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(get_orders.fulfilled, (state, { payload }) => { 
            state.myOrders = payload.orders; 
        })
        .addCase(get_order_details.fulfilled, (state, { payload }) => { 
            state.myOrder = payload.order; 
        })
        .addCase(get_admin_order.fulfilled, (state, { payload }) => {
            state.order = payload.order;
        })
        .addCase(place_order.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message;
        })
    }
})

export const { messageClear } = orderReducer.actions
export default orderReducer.reducer