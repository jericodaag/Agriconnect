import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api"; 

export const add_friend = createAsyncThunk(
    'chat/add_friend',
    async(info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/chat/customer/add-customer-friend', info);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const send_message = createAsyncThunk(
    'chat/send_message',
    async(info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/chat/customer/send-message-to-seller', info);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const chatReducer = createSlice({
    name: 'chat',
    initialState: {
        my_friends: [],
        fb_messages: [],
        currentFd: null,
        errorMessage: '',
        successMessage: '',
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        updateMessage: (state, { payload }) => {
            state.fb_messages = [...state.fb_messages, payload];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(add_friend.pending, (state) => {
                state.errorMessage = "";
                state.successMessage = "";
            })
            .addCase(add_friend.fulfilled, (state, { payload }) => {
                state.fb_messages = payload.messages || [];
                state.currentFd = payload.currentFd || null;
                state.my_friends = payload.MyFriends || [];
            })
            .addCase(add_friend.rejected, (state, { payload }) => {
                state.errorMessage = payload?.message || "An error occurred";
            })
            .addCase(send_message.pending, (state) => {
                state.errorMessage = "";
                state.successMessage = "";
            })
            .addCase(send_message.fulfilled, (state, { payload }) => {
                if (payload.message) {
                    let tempFriends = [...state.my_friends];
                    let index = tempFriends.findIndex(f => f.fdId === payload.message.receverId);
                    if (index !== -1) {
                        while (index > 0) {
                            let temp = tempFriends[index];
                            tempFriends[index] = tempFriends[index - 1];
                            tempFriends[index - 1] = temp;
                            index--;
                        }
                        state.my_friends = tempFriends;
                    }
                    state.fb_messages = [...state.fb_messages, payload.message];
                    state.successMessage = 'Message Send Success';
                }
            })
            .addCase(send_message.rejected, (state, { payload }) => {
                state.errorMessage = payload?.message || "Failed to send message";
            });
    }
});

export const { messageClear, updateMessage } = chatReducer.actions;
export default chatReducer.reducer;