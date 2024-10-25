import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

export const get_seller_request = createAsyncThunk(
    'seller/get_seller_request',
    async({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/request-seller-get?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, { withCredentials: true }) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_seller = createAsyncThunk(
    'seller/get_seller',
    async(sellerId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/get-seller/${sellerId}`, { withCredentials: true }) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const seller_status_update = createAsyncThunk(
    'seller/seller_status_update',
    async(info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post(`/seller-status-update`, info, { withCredentials: true }) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const verify_seller_id = createAsyncThunk(
    'seller/verify_seller_id',
    async(sellerId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.put(`/verify-seller-id/${sellerId}`, {}, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const reject_seller_id = createAsyncThunk(
    'seller/reject_seller_id',
    async({ sellerId, reason }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.put(`/reject-seller-id/${sellerId}`, { reason }, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_active_sellers = createAsyncThunk(
    'seller/get_active_sellers',
    async({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/get-sellers?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, { withCredentials: true }) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_deactive_sellers = createAsyncThunk(
    'seller/get_deactive_sellers',
    async({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/get-deactive-sellers?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, { withCredentials: true }) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const create_stripe_connect_account = createAsyncThunk(
    'seller/create_stripe_connect_account',
    async() => { 
        try { 
            const { data: { url } } = await api.get(`/payment/create-stripe-connect-account`, { withCredentials: true }) 
            window.location.href = url
        } catch (error) {
            console.error(error)
        }
    }
)

export const active_stripe_connect_account = createAsyncThunk(
    'seller/active_stripe_connect_account',
    async(activeCode, { rejectWithValue, fulfillWithValue }) => { 
        try { 
            const { data } = await api.put(`/payment/active-stripe-connect-account/${activeCode}`, {}, { withCredentials: true }) 
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const sellerReducer = createSlice({
    name: 'seller',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        sellers: [], 
        totalSeller: 0,
        seller: ''
    },
    reducers: {
        messageClear: (state, _) => {
            state.successMessage = ""
            state.errorMessage = ""
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_seller_request.fulfilled, (state, { payload }) => {
                state.sellers = payload.sellers;
                state.totalSeller = payload.totalSeller; 
            })
            .addCase(get_seller.fulfilled, (state, { payload }) => {
                state.seller = payload.seller; 
            })
            .addCase(seller_status_update.fulfilled, (state, { payload }) => {
                state.seller = payload.seller; 
                state.successMessage = payload.message; 
            })
            .addCase(get_active_sellers.fulfilled, (state, { payload }) => {
                state.sellers = payload.sellers; 
                state.totalSeller = payload.totalSeller; 
            })
            .addCase(get_deactive_sellers.fulfilled, (state, { payload }) => {
                state.sellers = payload.sellers; 
                state.totalSeller = payload.totalSeller; 
            })
            .addCase(active_stripe_connect_account.pending, (state) => {
                state.loader = true;  
            })
            .addCase(active_stripe_connect_account.rejected, (state, { payload }) => {
                state.loader = false; 
                state.errorMessage = payload.message; 
            })
            .addCase(active_stripe_connect_account.fulfilled, (state, { payload }) => {
                state.loader = false; 
                state.successMessage = payload.message; 
            })
            // New ID verification reducers
            .addCase(verify_seller_id.pending, (state) => {
                state.loader = true;
            })
            .addCase(verify_seller_id.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                if (state.seller._id === payload.seller._id) {
                    state.seller = payload.seller;
                }
                state.sellers = state.sellers.map(seller => 
                    seller._id === payload.seller._id ? payload.seller : seller
                );
            })
            .addCase(verify_seller_id.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })
            .addCase(reject_seller_id.pending, (state) => {
                state.loader = true;
            })
            .addCase(reject_seller_id.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                if (state.seller._id === payload.seller._id) {
                    state.seller = payload.seller;
                }
                state.sellers = state.sellers.map(seller => 
                    seller._id === payload.seller._id ? payload.seller : seller
                );
            })
            .addCase(reject_seller_id.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            });
    }
})

export const { messageClear } = sellerReducer.actions;
export default sellerReducer.reducer;