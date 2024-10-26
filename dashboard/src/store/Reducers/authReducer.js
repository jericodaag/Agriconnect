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

export const forgot_password = createAsyncThunk(
    'auth/forgot_password',
    async(email, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/forgot-password', { email });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const verify_reset_token = createAsyncThunk(
    'auth/verify_reset_token',
    async(token, { rejectWithValue, fulfillWithValue }) => {
        try {
            console.log('Attempting to verify token:', token);
            // Add leading slash here
            const { data } = await api.get(`/verify-reset-token/${token}`); // Add forward slash
            console.log('Token verification response:', data);
            return fulfillWithValue(data);
        } catch (error) {
            console.error('Token verification failed:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url // Log the attempted URL
            });
            return rejectWithValue(
                error.response?.data || 
                { error: 'Failed to verify reset token' }
            );
        }
    }
);

export const reset_password = createAsyncThunk(
    'auth/reset_password',
    async({ token, newPassword }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post(`/reset-password/${token}`, { newPassword });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Admin password reset management actions
export const get_password_reset_requests = createAsyncThunk(
    'auth/get_password_reset_requests',
    async(_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get('/admin/password-reset-requests', { 
                withCredentials: true 
            });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const approve_password_reset = createAsyncThunk(
    'auth/approve_password_reset',
    async(sellerId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post(`/admin/approve-reset/${sellerId}`, {}, { 
                withCredentials: true 
            });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const reject_password_reset = createAsyncThunk(
    'auth/reject_password_reset',
    async({ sellerId, reason }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post(`/admin/reject-reset/${sellerId}`, { reason }, { 
                withCredentials: true 
            });
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
        token: localStorage.getItem('accessToken'),
        resetRequests: [],
        validResetToken: false
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
            })
            .addCase(forgot_password.pending, (state) => {
                state.loader = true;
            })
            .addCase(forgot_password.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
            })
            .addCase(forgot_password.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })

            .addCase(verify_reset_token.pending, (state) => {
                state.loader = true;
                state.validResetToken = false;
                console.log('Token verification pending...');
            })
            .addCase(verify_reset_token.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.validResetToken = payload.valid;
                console.log('Token verification successful:', payload);
            })
            .addCase(verify_reset_token.rejected, (state, { payload }) => {
                state.loader = false;
                state.validResetToken = false;
                state.errorMessage = payload?.error || 'Token verification failed';
                console.log('Token verification rejected:', payload);
            })

            .addCase(reset_password.pending, (state) => {
                state.loader = true;
            })
            .addCase(reset_password.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.validResetToken = false;
            })
            .addCase(reset_password.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })

            .addCase(get_password_reset_requests.fulfilled, (state, { payload }) => {
                state.resetRequests = payload.requests;
            })
            .addCase(get_password_reset_requests.rejected, (state) => {
                state.resetRequests = [];
            })

            .addCase(approve_password_reset.pending, (state) => {
                state.loader = true;
            })
            .addCase(approve_password_reset.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.resetRequests = state.resetRequests.filter(
                    req => req._id !== payload.seller._id
                );
            })
            .addCase(approve_password_reset.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })

            .addCase(reject_password_reset.pending, (state) => {
                state.loader = true;
            })
            .addCase(reject_password_reset.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.resetRequests = state.resetRequests.filter(
                    req => req._id !== payload.seller._id
                );
            })
            .addCase(reject_password_reset.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            });
    }
});

export const { messageClear } = authReducer.actions;
export default authReducer.reducer;