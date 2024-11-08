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
      grossSales: 0,
      commission: 0,
      netSales: 0,
      monthlyCommission: 0,
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
          totalCommission: 0,
          monthlyCommission: 0,
          stripe: {
              amount: 0,
              count: 0,
              commission: 0
          },
          cod: {
              amount: 0,
              count: 0,
              commission: 0
          }
      },
      sellerFinancials: {
          grossSales: 0,
          commission: 0,
          netSales: 0,
          monthlyCommission: 0,
          commissionHistory: [],
          commissionByMethod: {
              stripe: 0,
              cod: 0
          }
      },
      adminCommission: {
          totalCommission: 0,
          monthlyCommission: 0,
          commissionByPaymentMethod: {
              stripe: 0,
              cod: 0
          },
          commissionBySeller: [],
          recentCommissions: [],
          commissionTrends: [],
          totalPlatformEarnings: 0
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
        state.loading = false;
        state.totalSale = payload.totalSale || 0;
        state.totalOrder = payload.totalOrder || 0;
        state.totalProduct = payload.totalProduct || 0;
        state.totalSeller = payload.totalSeller || 0;
        state.totalPendingOrder = payload.totalPendingOrder || 0;
        state.recentOrder = payload.recentOrders || [];
        state.recentMessages = payload.recentMessages || [];
        state.chartData = payload.chartData || [];
        state.productStatusCounts = payload.productStatusCounts || {
            pending: 0,
            processing: 0,
            warehouse: 0,
            placed: 0,
            cancelled: 0
        };
        state.salesData = {
            total: payload.salesData?.total || 0,
            totalCommission: payload.salesData?.totalCommission || 0,
            monthlyCommission: payload.salesData?.monthlyCommission || 0,
            stripe: {
                amount: payload.salesData?.stripe?.amount || 0,
                count: payload.salesData?.stripe?.count || 0,
                commission: payload.salesData?.stripe?.commission || 0
            },
            cod: {
                amount: payload.salesData?.cod?.amount || 0,
                count: payload.salesData?.cod?.count || 0,
                commission: payload.salesData?.cod?.commission || 0
            }
        }
        state.adminCommission = {
            totalCommission: payload.totalCommission || 0,
            monthlyCommission: payload.monthlyCommission || 0,
            commissionByPaymentMethod: {
                stripe: payload.salesData?.stripe?.commission || 0,
                cod: payload.salesData?.cod?.commission || 0
            },
            commissionBySeller: payload.commissionBySeller || [],
            recentCommissions: payload.recentCommissions || [],
            commissionTrends: payload.chartData?.map(data => ({
                month: data.month,
                commission: data.commission || 0,
                stripeCommission: data.stripeCommission || 0,
                codCommission: data.codCommission || 0
            })) || [],
            totalPlatformEarnings: payload.totalPlatformEarnings || 0
        }
      })
      .addCase(get_admin_dashboard_data.rejected, (state, { payload }) => {
        state.loading = false
        state.errorMessage = payload.message
      })
      .addCase(get_seller_dashboard_data.pending, (state) => {
        state.loading = true
      })
      .addCase(get_seller_dashboard_data.fulfilled, (state, { payload }) => {
        state.loading = false
        state.totalSale = payload.totalSale || 0
        state.grossSales = payload.grossSales || payload.totalSale || 0
        state.commission = payload.commission || 0
        state.netSales = payload.netSale || 0
        state.monthlyCommission = payload.monthlyCommission || 0
        state.totalOrder = payload.totalOrder || 0
        state.totalProduct = payload.totalProduct || 0
        state.totalPendingOrder = payload.totalPendingOrder || 0
        state.totalCustomers = payload.totalCustomers || 0
        state.recentOrder = payload.recentOrders || []
        state.recentMessages = payload.recentMessages || []
        state.chartData = payload.chartData || []
        state.productStatusCounts = payload.productStatusCounts || {
            pending: 0,
            processing: 0,
            warehouse: 0,
            placed: 0,
            cancelled: 0
        }
        state.salesData = {
            total: payload.salesData?.total || 0,
            totalCommission: payload.commission || 0,
            monthlyCommission: payload.monthlyCommission || 0,
            stripe: {
                amount: payload.salesData?.stripe?.amount || 0,
                count: payload.salesData?.stripe?.count || 0,
                commission: payload.salesData?.stripe?.commission || 0
            },
            cod: {
                amount: payload.salesData?.cod?.amount || 0,
                count: payload.salesData?.cod?.count || 0,
                commission: payload.salesData?.cod?.commission || 0
            }
        }
        state.sellerFinancials = {
            grossSales: payload.totalSale || 0,
            commission: payload.commission || 0,
            netSales: payload.netSale || 0,
            monthlyCommission: payload.monthlyCommission || 0,
            commissionHistory: payload.commissionHistory || [],
            commissionByMethod: {
                stripe: payload.salesData?.stripe?.commission || 0,
                cod: payload.salesData?.cod?.commission || 0
            }
        }
      })
      .addCase(get_seller_dashboard_data.rejected, (state, { payload }) => {
        state.loading = false
        state.errorMessage = payload.message
      })
  }
})

export const { clearMessage } = dashboardReducer.actions
export default dashboardReducer.reducer