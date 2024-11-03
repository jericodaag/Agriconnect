import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const get_admin_dashboard_data = createAsyncThunk(
  'dashboard/get_admin_dashboard_data',
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get('/admin/get-dashboard-data', { withCredentials: true })
      const { recentMessages } = await api.get('/chat/get-recent-messages', { withCredentials: true }).then(res => res.data)
      return fulfillWithValue({ ...data, recentMessages })
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const get_seller_dashboard_data = createAsyncThunk(
  'dashboard/get_seller_dashboard_data',
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get('/seller/get-dashboard-data', { withCredentials: true })
      const { recentMessages } = await api.get('/chat/get-recent-messages', { withCredentials: true }).then(res => res.data)
      return fulfillWithValue({ ...data, recentMessages })
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const dashboardReducer = createSlice({
  name: 'dashboard',
  initialState: {
      totalSale: 0,
      totalOrder: 0,
      totalProduct: 0,
      totalPendingOrder: 0,
      totalSeller: 0,
      recentOrder: [],
      recentMessages: [],
      chartData: [],
      productStatusCounts: {
          pending: 0,
          processing: 0,
          warehouse: 0,
          placed: 0,
          cancelled: 0
      },
      salesData: {
          total: 0,
          stripe: {
              amount: 0,
              count: 0
          },
          cod: {
              amount: 0,
              count: 0
          }
      },
      errorMessage: "",
      loading: false
  },
  reducers: {
      clearMessage: (state) => {
          state.errorMessage = ""
      }
  },
  extraReducers: (builder) => {
    builder
      .addCase(get_admin_dashboard_data.pending, (state) => {
        state.loading = true
      })
      .addCase(get_admin_dashboard_data.fulfilled, (state, { payload }) => {
        state.loading = false
        state.totalSale = payload.totalSale
        state.totalOrder = payload.totalOrder
        state.totalProduct = payload.totalProduct
        state.totalSeller = payload.totalSeller
        state.recentOrder = payload.recentOrders
        state.recentMessages = payload.recentMessages
        state.chartData = payload.chartData
        state.productStatusCounts = payload.productStatusCounts
      })
      .addCase(get_admin_dashboard_data.rejected, (state, { payload }) => {
        state.loading = false
        state.errorMessage = payload.message
      })
      .addCase(get_seller_dashboard_data.pending, (state) => {
        state.loading = true
      })
      .addCase(get_seller_dashboard_data.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.totalSale = payload.totalSale;
        state.totalOrder = payload.totalOrder;
        state.totalProduct = payload.totalProduct;
        state.totalPendingOrder = payload.totalPendingOrder;
        state.recentOrder = payload.recentOrders;
        state.recentMessages = payload.recentMessages;
        state.chartData = payload.chartData;
        state.productStatusCounts = payload.productStatusCounts;
        state.salesData = payload.salesData;
    })
      .addCase(get_seller_dashboard_data.rejected, (state, { payload }) => {
        state.loading = false
        state.errorMessage = payload.message
      })
  }
})

export const { clearMessage } = dashboardReducer.actions
export default dashboardReducer.reducer