import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Existing thunks
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
)

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
)

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
)

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
)

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
)

export const get_product_performance = createAsyncThunk(
    'product/get_product_performance',
    async(_, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.get('/product-performance', {withCredentials: true});
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const get_perishing_products = createAsyncThunk(
    'product/get_perishing_products',
    async(_, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.get('/perishing-products', {withCredentials: true});
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

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
)

// New thunks for inventory management and sales analysis
export const get_product_analytics = createAsyncThunk(
    'product/get_product_analytics',
    async (_, {rejectWithValue, fulfillWithValue}) => {
        try {
            const {data} = await api.get('/product-analytics', {withCredentials: true});
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

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
)

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
)

export const productReducer = createSlice({
    name: 'product',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        products: [],
        product: '',
        totalProduct: 0,
        productPerformance: [],
        perishingProducts: [],
        productAnalytics: [],
        inventoryHistory: []
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: (builder) => {
        builder
            // Add product
            .addCase(add_product.pending, (state) => {
                state.loader = true
            })
            .addCase(add_product.rejected, (state, { payload }) => {
                state.loader = false
                state.errorMessage = payload.error
            })
            .addCase(add_product.fulfilled, (state, { payload }) => {
                state.loader = false
                state.successMessage = payload.message
            })
            // Get products
            .addCase(get_products.fulfilled, (state, { payload }) => {
                state.totalProduct = payload.totalProduct
                state.products = payload.products
            })
            // Get single product
            .addCase(get_product.fulfilled, (state, { payload }) => {
                state.product = payload.product
            })
            // Update product
            .addCase(update_product.pending, (state) => {
                state.loader = true
            })
            .addCase(update_product.rejected, (state, { payload }) => {
                state.loader = false
                state.errorMessage = payload.error
            })
            .addCase(update_product.fulfilled, (state, { payload }) => {
                state.loader = false
                state.product = payload.product
                state.successMessage = payload.message
            })
            // Update product image
            .addCase(product_image_update.fulfilled, (state, { payload }) => {
                state.product = payload.product
                state.successMessage = payload.message
            })
            // Get product performance
            .addCase(get_product_performance.fulfilled, (state, { payload }) => {
                state.productPerformance = payload.productPerformance;
            })
            // Get perishing products
            .addCase(get_perishing_products.fulfilled, (state, { payload }) => {
                state.perishingProducts = payload.perishingProducts;
            })
            // Delete product
            .addCase(delete_product.pending, (state) => {
                state.loader = true
            })
            .addCase(delete_product.rejected, (state, { payload }) => {
                state.loader = false
                state.errorMessage = payload.error
            })
            .addCase(delete_product.fulfilled, (state, { payload }) => {
                state.loader = false
                state.successMessage = payload.message
                state.products = state.products.filter(p => p._id !== payload.productId)
            })
            // Get product analytics
            .addCase(get_product_analytics.fulfilled, (state, { payload }) => {
                state.productAnalytics = payload.analytics;
            })
            // Get inventory history
            .addCase(get_inventory_history.fulfilled, (state, { payload }) => {
                state.inventoryHistory = payload.inventoryHistory;
            })
            // Update product sales
            .addCase(update_product_sales.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
                if (payload.product) {
                    state.product = payload.product;
                }
            })
    }
})

export const { messageClear } = productReducer.actions
export default productReducer.reducer