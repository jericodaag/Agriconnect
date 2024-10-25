import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import { jwtDecode } from "jwt-decode";

// Existing auth actions
export const admin_login = createAsyncThunk(
    'auth/admin_login',
    async(info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/admin-login', info, { withCredentials: true });
            localStorage.setItem('accessToken', data.token);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const seller_login = createAsyncThunk(
    'auth/seller_login',
    async(info, { rejectWithValue, fulfillWithValue, dispatch }) => {
        try {
            const { data } = await api.post('/seller-login', info, { withCredentials: true });
            localStorage.setItem('accessToken', data.token);
            dispatch(get_user_info());
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const get_user_info = createAsyncThunk(
    'auth/get_user_info',
    async(_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get('/get-user', { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const profile_image_upload = createAsyncThunk(
    'auth/profile_image_upload',
    async(image, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/profile-image-upload', image, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const profile_info_add = createAsyncThunk(
    'auth/profile_info_add',
    async(info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/profile-info-add', info, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// New action for seller registration with ID
export const seller_register = createAsyncThunk(
    'auth/seller_register',
    async(formData, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/seller-register', formData, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            localStorage.setItem('accessToken', data.token);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// New action for ID renewal
export const renew_seller_id = createAsyncThunk(
    'auth/renew_seller_id',
    async(formData, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/renew-seller-id', formData, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const verify_seller_id = createAsyncThunk(
    'auth/verify_seller_id',
    async(sellerId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.put(`/verify-seller-id/${sellerId}`, {}, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const reject_seller_id = createAsyncThunk(
    'auth/reject_seller_id',
    async({ sellerId, reason }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.put(`/reject-seller-id/${sellerId}`, { reason }, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const returnRole = (token) => {
    if (token) {
        const decodeToken = jwtDecode(token);
        const expireTime = new Date(decodeToken.exp * 1000);
        if (new Date() > expireTime) {
            localStorage.removeItem('accessToken');
            return '';
        } else {
            return decodeToken.role;
        }
    } else {
        return '';
    }
};

export const logout = createAsyncThunk(
    'auth/logout',
    async({ navigate, role }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get('/logout', { withCredentials: true });
            localStorage.removeItem('accessToken');
            if (role === 'admin') {
                navigate('/admin/login');
            } else {
                navigate('/login');
            }
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const authReducer = createSlice({
    name: 'auth',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        userInfo: '',
        role: returnRole(localStorage.getItem('accessToken')),
        token: localStorage.getItem('accessToken')
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = "";
            state.successMessage = "";
        }
    },
    extraReducers: (builder) => {
        builder
            // Existing cases
            .addCase(admin_login.pending, (state) => {
                state.loader = true;
            })
            .addCase(admin_login.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })
            .addCase(admin_login.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.token = payload.token;
                state.role = returnRole(payload.token);
                state.userInfo = payload.userInfo;
            })
            .addCase(seller_login.pending, (state) => {
                state.loader = true;
            })
            .addCase(seller_login.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })
            .addCase(seller_login.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.token = payload.token;
                state.role = returnRole(payload.token);
                state.userInfo = payload.userInfo;
            })
            .addCase(seller_register.pending, (state) => {
                state.loader = true;
            })
            .addCase(seller_register.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })
            .addCase(seller_register.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.token = payload.token;
                state.role = returnRole(payload.token);
                state.userInfo = payload.userInfo;
            })
            .addCase(get_user_info.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.userInfo = payload.userInfo;
            })
            .addCase(profile_image_upload.pending, (state) => {
                state.loader = true;
            })
            .addCase(profile_image_upload.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.userInfo = payload.userInfo;
                state.successMessage = payload.message;
            })
            .addCase(profile_info_add.pending, (state) => {
                state.loader = true;
            })
            .addCase(profile_info_add.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.userInfo = payload.userInfo;
                state.successMessage = payload.message;
            })
            .addCase(profile_info_add.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })
            // New cases for ID verification
            .addCase(renew_seller_id.pending, (state) => {
                state.loader = true;
            })
            .addCase(renew_seller_id.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.userInfo = payload.userInfo;
            })
            .addCase(renew_seller_id.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })
            .addCase(verify_seller_id.pending, (state) => {
                state.loader = true;
            })
            .addCase(verify_seller_id.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                if (state.userInfo.id === payload.seller._id) {
                    state.userInfo = payload.seller;
                }
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
                if (state.userInfo.id === payload.seller._id) {
                    state.userInfo = payload.seller;
                }
            })
            .addCase(reject_seller_id.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })
            .addCase(logout.fulfilled, (state) => {
                state.token = null;
                state.userInfo = '';
                state.role = '';
            });
    }
});

export const { messageClear } = authReducer.actions;
export default authReducer.reducer;