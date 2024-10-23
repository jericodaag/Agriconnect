import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import { generateDemandForecast, generateAlerts } from '../../utils/analytics-helper';

// Original thunks
export const add_product = createAsyncThunk(
    'product/add_product',
    async(product, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.post('/product-add', product, {withCredentials: true})
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
);

export const get_products = createAsyncThunk(
    'product/get_products',
    async({parPage, page, searchValue}, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.get(`/products-get?page=${page}&searchValue=${searchValue}&parPage=${parPage}`, {withCredentials: true})
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
);

export const get_product = createAsyncThunk(
    'product/get_product',
    async(productId, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.get(`/product-get/${productId}`, {withCredentials: true})
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
);

export const update_product = createAsyncThunk(
    'product/update_product',
    async(product, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.post('/product-update', product, {withCredentials: true})
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
);

export const product_image_update = createAsyncThunk(
    'product/product_image_update',
    async({oldImage, newImage, productId}, {rejectWithValue, fulfillWithValue}) => {
        try {
            const formData = new FormData()
            formData.append('oldImage', oldImage)
            formData.append('newImage', newImage)
            formData.append('productId', productId)
            const {data} = await api.post('/product-image-update', formData, {withCredentials: true})
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
);

export const delete_product = createAsyncThunk(
    'product/delete_product',
    async(productId, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.delete(`/product/${productId}`, {withCredentials: true});
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Analytics thunks
export const get_product_analytics = createAsyncThunk(
    'product/get_product_analytics',
    async (_, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.get('/product-analytics', {withCredentials: true});
            
            // Process analytics data
            const alerts = generateAlerts(data.analytics);
            const forecast = generateDemandForecast(data.salesHistory || []);

            return fulfillWithValue({
                ...data,
                alerts,
                forecast,
                inventoryInsights: data.inventoryInsights
            });
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const get_inventory_history = createAsyncThunk(
    'product/get_inventory_history',
    async (productId, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.get(`/inventory-history/${productId}`, {withCredentials: true});
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const update_product_sales = createAsyncThunk(
    'product/update_product_sales',
    async ({ productId, quantity }, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.post('/update-product-sales', { productId, quantity }, {withCredentials: true});
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const handle_alert_action = createAsyncThunk(
    'product/handle_alert_action',
    async ({ alertId, action, productId }, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.post('/handle-alert', {
                alertId,
                action,
                productId
            }, {withCredentials: true});
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const productReducer = createSlice({
    name: 'product',
    initialState: {
        // Existing state
        successMessage: '',
        errorMessage: '',
        loader: false,
        products: [],
        product: '',
        totalProduct: 0,
        
        // Analytics state
        productAnalytics: [],
        alerts: [],
        categoryPerformance: [],
        marketability: [],
        inventoryHistory: [],
        inventoryInsights: {
            totalProducts: 0,
            lowStock: 0,
            expiringIn7Days: 0,
            outOfStock: 0,
            topPerformers: []
        },
        salesForecast: [],
        performanceMetrics: {
            totalSales: 0,
            averageRating: 0,
            totalRevenue: 0,
            productsSold: 0
        },
        
        // Filters and view preferences
        activeTimeframe: 'week',
        selectedCategories: [],
        sortBy: 'salesCount',
        sortOrder: 'desc'
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        setActiveTimeframe: (state, action) => {
            state.activeTimeframe = action.payload;
        },
        toggleCategoryFilter: (state, action) => {
            const category = action.payload;
            const index = state.selectedCategories.indexOf(category);
            if (index === -1) {
                state.selectedCategories.push(category);
            } else {
                state.selectedCategories.splice(index, 1);
            }
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        setSortOrder: (state, action) => {
            state.sortOrder = action.payload;
        },
        dismissAlert: (state, action) => {
            state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            // Original cases
            .addCase(add_product.pending, (state) => {
                state.loader = true;
            })
            .addCase(add_product.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })
            .addCase(add_product.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
            })
            .addCase(get_products.fulfilled, (state, { payload }) => {
                state.totalProduct = payload.totalProduct;
                state.products = payload.products;
            })
            .addCase(get_product.fulfilled, (state, { payload }) => {
                state.product = payload.product;
            })
            .addCase(update_product.pending, (state) => {
                state.loader = true;
            })
            .addCase(update_product.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })
            .addCase(update_product.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.product = payload.product;
                state.successMessage = payload.message;
            })
            .addCase(product_image_update.fulfilled, (state, { payload }) => {
                state.product = payload.product;
                state.successMessage = payload.message;
            })
            .addCase(delete_product.pending, (state) => {
                state.loader = true;
            })
            .addCase(delete_product.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })
            .addCase(delete_product.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.products = state.products.filter(p => p._id !== payload.productId);
            })

            // Analytics cases
            .addCase(get_product_analytics.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_product_analytics.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.productAnalytics = payload.analytics;
                state.categoryPerformance = payload.categoryPerformance;
                state.marketability = payload.marketability;
                state.alerts = payload.alerts;
                state.inventoryInsights = payload.inventoryInsights;
                state.salesForecast = payload.forecast;
                
                const metrics = {
                    totalSales: 0,
                    totalRevenue: 0,
                    productsSold: 0,
                    ratingSum: 0,
                    ratedProducts: 0
                };

                payload.analytics.forEach(product => {
                    metrics.totalSales += product.salesCount || 0;
                    metrics.totalRevenue += (product.price * (product.salesCount || 0));
                    metrics.productsSold += product.salesCount > 0 ? 1 : 0;
                    if (product.rating > 0) {
                        metrics.ratingSum += parseFloat(product.rating);
                        metrics.ratedProducts += 1;
                    }
                });

                state.performanceMetrics = {
                    totalSales: metrics.totalSales,
                    totalRevenue: metrics.totalRevenue,
                    productsSold: metrics.productsSold,
                    averageRating: metrics.ratedProducts > 0 
                        ? (metrics.ratingSum / metrics.ratedProducts).toFixed(1) 
                        : 0
                };
            })
            .addCase(get_product_analytics.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })
            .addCase(get_inventory_history.fulfilled, (state, { payload }) => {
                state.inventoryHistory = payload.inventoryHistory;
            })
            .addCase(update_product_sales.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
                if (payload.product) {
                    state.product = payload.product;
                    state.productAnalytics = state.productAnalytics.map(p => 
                        p._id === payload.product._id ? {
                            ...p,
                            salesCount: payload.product.salesCount,
                            stock: payload.product.stock
                        } : p
                    );
                }
            });
    }
});

export const { 
    messageClear, 
    setActiveTimeframe, 
    toggleCategoryFilter, 
    setSortBy, 
    setSortOrder,
    dismissAlert 
} = productReducer.actions;

export default productReducer.reducer;