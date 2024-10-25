import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_product_analytics } from '../../store/Reducers/productReducer';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Package, Clock, AlertTriangle } from 'lucide-react';
import moment from 'moment';
import { calculateQualityScore } from '../../utils/analytics-helper';
import ProductPerformanceCharts from '../../views/seller/ProductPerformanceCharts';
import Rating from '../../components/Rating';

const ProductAnalytics = () => {
    const dispatch = useDispatch();
    const { 
        productAnalytics = [], 
        loader, 
        categoryPerformance = [], 
        alerts = [],
        inventoryInsights = {
            totalProducts: 0,
            lowStock: 0,
            expiringIn7Days: 0,
            outOfStock: 0,
            topPerformers: []
        },
        performanceMetrics = {
            totalSales: 0,
            averageRating: 0,
            totalRevenue: 0,
            productsSold: 0
        }
    } = useSelector(state => state.product);

    const [activeTab, setActiveTab] = useState('performance');
    const [selectedTimeframe, setSelectedTimeframe] = useState('week');

    useEffect(() => {
        dispatch(get_product_analytics());
    }, [dispatch]);

    if (loader) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

        // Derived data
        const topSellingProducts = [...productAnalytics]
            .sort((a, b) => b.salesCount - a.salesCount)
            .slice(0, 5);


        const AlertsSection = () => {
            const [showAllAlerts, setShowAllAlerts] = useState(false);
            const alertLimit = 3;
        
            const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, alertLimit);
        
            return (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500"/>
                            Active Alerts
                        </h3>
                        {alerts.length > alertLimit && (
                            <button 
                                onClick={() => setShowAllAlerts(!showAllAlerts)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {showAllAlerts ? 'Show Less' : `View All (${alerts.length})`}
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {displayedAlerts.map((alert, index) => (
                            <div 
                                key={index} 
                                className={`p-4 rounded-lg border ${
                                    alert.type === 'expiry' ? 'bg-red-50 border-red-200' :
                                    alert.type === 'stock' ? 'bg-yellow-50 border-yellow-200' :
                                    'bg-blue-50 border-blue-200'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-gray-800">{alert.title}</h4>
                                        <p className="text-sm text-gray-600">{alert.message}</p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {moment(alert.timestamp).fromNow()}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {alerts.length === 0 && (
                            <p className="text-gray-500 text-center">No active alerts</p>
                        )}
                    </div>
                </div>
            );
        };

    const QuickStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-green-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Sales</p>
                        <p className="text-2xl font-bold">₱{performanceMetrics.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Active Products</p>
                        <p className="text-2xl font-bold">{inventoryInsights.totalProducts}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-yellow-100 rounded-full">
                        <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Expiring Soon</p>
                        <p className="text-2xl font-bold">{inventoryInsights.expiringIn7Days}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-100 rounded-full">
                        <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Low Stock Items</p>
                        <p className="text-2xl font-bold">{inventoryInsights.lowStock}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const PerformanceTab = () => (
        <div className="grid grid-cols-1 gap-6">
            <ProductPerformanceCharts products={productAnalytics} />
            {/* Top Products with Quality Scores */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
                <div className="space-y-4">
                    {topSellingProducts.map(product => (
                        <div key={product._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                                <h4 className="font-medium">{product.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Sales: {product.salesCount}</span>
                                    <span>•</span>
                                    <span>Quality: {calculateQualityScore(product)}%</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                    ₱{product.price.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Stock: {product.stock}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* Category Performance */}
            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                        <Pie
                            data={categoryPerformance}
                            dataKey="totalRevenue"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, value }) => `${name}: ₱${parseFloat(value).toLocaleString()}`}
                        >
                            {categoryPerformance.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₱${parseFloat(value).toLocaleString()}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    const calculateAverageDailySales = (product) => {
        if (!product.salesCount) return '0.00';
    
        // Get the days since creation or first sale
        const createdAt = moment(product.createdAt || product.harvestDate);
        const lastSale = product.lastSaleDate ? moment(product.lastSaleDate) : moment();
        const daysSinceCreation = Math.max(1, moment().diff(createdAt, 'days'));
        
        // Calculate daily average
        let averageSales;
        if (product.lastSaleDate) {
            // If there are sales, calculate based on days between first and last sale
            const daysBetweenSales = Math.max(1, moment(lastSale).diff(createdAt, 'days'));
            averageSales = product.salesCount / daysBetweenSales;
        } else {
            // If no sales, calculate based on total days since creation
            averageSales = product.salesCount / daysSinceCreation;
        }
    
        // Return formatted number with 2 decimal places
        return averageSales.toFixed(2);
    };
    
    const getStockStatus = (stock) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600' };
        if (stock <= 10) return { text: 'Low Stock', color: 'text-yellow-600' };
        return { text: 'In Stock', color: 'text-green-600' };
    };
    
    const getDaysUntilExpiry = (bestBefore) => {
        const days = moment(bestBefore).diff(moment(), 'days');
        if (days < 0) return { text: 'Expired', color: 'text-red-600' };
        if (days <= 7) return { text: `Expires in ${days} days`, color: 'text-yellow-600' };
        return { text: `${days} days until expiry`, color: 'text-green-600' };
    };

    const InventoryTab = () => {
        const [currentPage, setCurrentPage] = useState(1);
        const [itemsPerPage, setItemsPerPage] = useState(5);
    
        // Calculate pagination
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = productAnalytics.slice(indexOfFirstItem, indexOfLastItem);
    
        return (
            <div className="space-y-6">
                {/* Inventory Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        {
                            title: 'Total Products',
                            value: inventoryInsights.totalProducts,
                            icon: <Package className="h-6 w-6 text-blue-600"/>,
                            bgColor: 'bg-blue-100'
                        },
                        {
                            title: 'Low Stock',
                            value: inventoryInsights.lowStock,
                            icon: <AlertTriangle className="h-6 w-6 text-yellow-600"/>,
                            bgColor: 'bg-yellow-100'
                        },
                        {
                            title: 'Expiring Soon',
                            value: inventoryInsights.expiringIn7Days,
                            icon: <Clock className="h-6 w-6 text-red-600"/>,
                            bgColor: 'bg-red-100'
                        },
                        {
                            title: 'Expired Products',
                            value: productAnalytics.filter(product => 
                                moment(product.bestBefore).isBefore(moment())
                            ).length,
                            icon: <AlertTriangle className="h-6 w-6 text-red-600"/>,
                            bgColor: 'bg-red-50'
                        },
                        {
                            title: 'Out of Stock',
                            value: inventoryInsights.outOfStock,
                            icon: <TrendingDown className="h-6 w-6 text-gray-600"/>,
                            bgColor: 'bg-gray-100'
                        }
                    ].map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-full ${stat.bgColor}`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
        
                {/* Inventory Status Table */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Inventory Status</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select 
                                value={itemsPerPage} 
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1); // Reset to first page when changing items per page
                                }}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#438206]"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                            <span className="text-sm text-gray-600">entries</span>
                        </div>
                    </div>
    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map((product, index) => {
                                    const stockStatus = getStockStatus(product.stock);
                                    const expiryStatus = getDaysUntilExpiry(product.bestBefore);
                                    const avgDailySales = calculateAverageDailySales(product);
        
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {product.images && product.images[0] && (
                                                        <img 
                                                            src={product.images[0]} 
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-md object-cover mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-sm text-gray-500">{product.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`font-medium ${stockStatus.color}`}>
                                                    {stockStatus.text}
                                                    <div className="text-sm text-gray-500">
                                                        {product.stock} {product.unit} remaining
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div className="font-medium">Total Sales: {product.salesCount}</div>
                                                    <div>Avg. Daily: {avgDailySales}</div>
                                                    {product.lastSaleDate && (
                                                        <div className="text-gray-500">
                                                            Last Sale: {moment(product.lastSaleDate).fromNow()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div>Harvest: {moment(product.harvestDate).format('MMM D, YYYY')}</div>
                                                    <div className={`mt-1 ${expiryStatus.color}`}>
                                                        {expiryStatus.text}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Rating ratings={product.rating || 0} />
                                                    <span className="text-sm text-gray-600">
                                                        ({product.rating ? product.rating.toFixed(1) : '0'})
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
    
                    {/* Pagination */}
                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, productAnalytics.length)} of {productAnalytics.length} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded ${
                                    currentPage === 1 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                }`}
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {[...Array(Math.ceil(productAnalytics.length / itemsPerPage))].map((_, idx) => (
                                    <button
                                        key={idx + 1}
                                        onClick={() => setCurrentPage(idx + 1)}
                                        className={`px-3 py-1 rounded ${
                                            currentPage === idx + 1
                                                ? 'bg-[#438206] text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => 
                                    Math.min(prev + 1, Math.ceil(productAnalytics.length / itemsPerPage))
                                )}
                                disabled={currentPage >= Math.ceil(productAnalytics.length / itemsPerPage)}
                                className={`px-3 py-1 rounded ${
                                    currentPage >= Math.ceil(productAnalytics.length / itemsPerPage)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const FreshnessTab = () => {
        const [currentPage, setCurrentPage] = useState(1);
        const [itemsPerPage, setItemsPerPage] = useState(5);
    
        // Calculate freshness status based on days until expiry
        const getFreshnessStatus = (daysUntilExpiry) => {
            if (daysUntilExpiry < 0) return { status: 'Expired', class: 'bg-red-100 text-red-800' };
            if (daysUntilExpiry === 0) return { status: 'Expires Today', class: 'bg-red-100 text-red-800' };
            if (daysUntilExpiry <= 3) return { status: 'Critical', class: 'bg-red-100 text-red-800' };
            if (daysUntilExpiry <= 7) return { status: 'Warning', class: 'bg-yellow-100 text-yellow-800' };
            if (daysUntilExpiry <= 14) return { status: 'Good', class: 'bg-blue-100 text-blue-800' };
            return { status: 'Very Fresh', class: 'bg-green-100 text-green-800' };
        };
    
        // Enhanced product data with computed properties
        const productsWithFreshness = productAnalytics.map(product => {
            // Use startOf('day') to ignore time components
            const bestBefore = moment(product.bestBefore).startOf('day');
            const today = moment().startOf('day');
            const harvestDate = moment(product.harvestDate).startOf('day');
            
            const daysUntilExpiry = bestBefore.diff(today, 'days');
            const shelfLife = bestBefore.diff(harvestDate, 'days');
            const remainingShelfLifePercentage = Math.max(0, (daysUntilExpiry / shelfLife) * 100);
            const freshnessStatus = getFreshnessStatus(daysUntilExpiry);
    
            return {
                ...product,
                daysUntilExpiry,
                shelfLife,
                remainingShelfLifePercentage,
                freshnessStatus
            };
        }).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    
        const expiredCount = productsWithFreshness.filter(p => p.daysUntilExpiry < 0).length;
        const criticalCount = productsWithFreshness.filter(p => p.daysUntilExpiry > 0 && p.daysUntilExpiry <= 3).length;
        const warningCount = productsWithFreshness.filter(p => p.daysUntilExpiry > 3 && p.daysUntilExpiry <= 7).length;
    
        // Calculate pagination
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = productsWithFreshness.slice(indexOfFirstItem, indexOfLastItem);
    
        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Expired Products</p>
                                <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Critical (≤ 3 days)</p>
                                <p className="text-2xl font-bold text-yellow-600">{criticalCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Warning (4-7 days)</p>
                                <p className="text-2xl font-bold text-blue-600">{warningCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-full">
                                <Package className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold">{productsWithFreshness.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
    
                {/* Product Table */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Product Freshness Status</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select 
                                value={itemsPerPage} 
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#438206]"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                            <span className="text-sm text-gray-600">entries</span>
                        </div>
                    </div>
    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Harvest Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Best Before</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Remaining Life</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quality Score</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map(product => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                {product.images && product.images[0] && (
                                                    <img 
                                                        src={product.images[0]} 
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-md object-cover mr-3"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-sm text-gray-500">{product.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {moment(product.harvestDate).format('MMM D, YYYY')}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {moment(product.bestBefore).format('MMM D, YYYY')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm">
                                                {product.daysUntilExpiry < 0 ? (
                                                    <span className="text-red-600">Expired</span>
                                                ) : product.daysUntilExpiry === 0 ? (
                                                    <span className="text-red-600">Expires Today</span>
                                                ) : product.daysUntilExpiry === 1 ? (
                                                    '1 day left'
                                                ) : (
                                                    `${product.daysUntilExpiry} days left`
                                                )}
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div 
                                                        className={`h-2 rounded-full ${
                                                            product.remainingShelfLifePercentage > 50 ? 'bg-green-500' :
                                                            product.remainingShelfLifePercentage > 25 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`}
                                                        style={{ width: `${product.remainingShelfLifePercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.freshnessStatus.class}`}>
                                                {product.freshnessStatus.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <span className={`text-sm ${
                                                    product.daysUntilExpiry <= 0 ? 'text-red-600' :
                                                    product.daysUntilExpiry <= 3 ? 'text-yellow-600' :
                                                    'text-green-600'
                                                }`}>
                                                    {calculateQualityScore(product)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
    
                    {/* Pagination */}
                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, productsWithFreshness.length)} of {productsWithFreshness.length} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded ${
                                    currentPage === 1 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                }`}
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {[...Array(Math.ceil(productsWithFreshness.length / itemsPerPage))].map((_, idx) => (
                                    <button
                                        key={idx + 1}
                                        onClick={() => setCurrentPage(idx + 1)}
                                        className={`px-3 py-1 rounded ${
                                            currentPage === idx + 1
                                                ? 'bg-[#438206] text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => 
                                    Math.min(prev + 1, Math.ceil(productsWithFreshness.length / itemsPerPage))
                                )}
                                disabled={currentPage >= Math.ceil(productsWithFreshness.length / itemsPerPage)}
                                className={`px-3 py-1 rounded ${
                                    currentPage >= Math.ceil(productsWithFreshness.length / itemsPerPage)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    );
};

const MarketabilityTab = ({ marketability = [] }) => {
    console.log('Marketability Data:', marketability); // Debug log
    
    const [filterType, setFilterType] = useState('all');
    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    // Process data for market share calculation
    const processedMarketData = useMemo(() => {
        if (!marketability || !marketability.length) return [];

        const totalRevenue = marketability.reduce((sum, product) => 
            sum + ((product.salesCount || 0) * (product.price || 0)), 0);

        return marketability.map(product => ({
            name: product.name,
            marketShare: totalRevenue ? ((product.salesCount * product.price) / totalRevenue) * 100 : 0,
            salesVelocity: product.salesCount / Math.max(moment().diff(moment(product.createdAt), 'days'), 1)
        }));
    }, [marketability]);

    // Performance metrics
    const metrics = useMemo(() => {
        const totalProducts = marketability.length;
        const starProducts = marketability.filter(p => p.salesCount >= 10).length;
        const growingProducts = marketability.filter(p => p.salesCount > 0).length;
        const atRiskProducts = marketability.filter(p => p.stock <= 10).length;

        return { totalProducts, starProducts, growingProducts, atRiskProducts };
    }, [marketability]);

    // Component JSX remains the same as before
    return (
        <div className="space-y-6">
            {/* Performance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-700 mb-3">Star Products</h4>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{metrics.starProducts}</p>
                            <p className="text-sm text-gray-600">Market Leaders</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-700 mb-3">Growing Products</h4>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{metrics.growingProducts}</p>
                            <p className="text-sm text-gray-600">Positive Growth</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium text-gray-700 mb-3">At Risk</h4>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{metrics.atRiskProducts}</p>
                            <p className="text-sm text-gray-600">Need Attention</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Market Share Analysis */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Product Market Share</h3>
                    <div className="flex gap-2">
                        {['all', 'growing', 'declining', 'at risk'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setFilterType(filter)}
                                className={`px-3 py-1 rounded-md ${
                                    filterType === filter
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie 
                                data={processedMarketData} 
                                dataKey="marketShare"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                label={({ name, marketShare }) => 
                                    `${name}: ${marketShare.toFixed(1)}%`
                                }
                            >
                                {processedMarketData.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${parseFloat(value).toFixed(1)}%`} />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Market Performance Details</h4>
                        {processedMarketData.map((product, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="font-medium">{product.name}</span>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        {product.marketShare.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Sales: {product.salesVelocity.toFixed(1)}/day
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Product Analytics Dashboard</h1>
                    <div className="flex gap-2">
                        <button 
                            className={`px-4 py-2 rounded-lg ${selectedTimeframe === 'week' ? 'bg-green-600 text-white' : 'bg-white'}`}
                            onClick={() => setSelectedTimeframe('week')}
                        >
                            Week
                        </button>
                        <button 
                            className={`px-4 py-2 rounded-lg ${selectedTimeframe === 'month' ? 'bg-green-600 text-white' : 'bg-white'}`}
                            onClick={() => setSelectedTimeframe('month')}
                        >
                            Month
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <QuickStats />

                {/* Alerts */}
                <AlertsSection />

                {/* Tabs Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-4">
                        {['performance', 'inventory', 'freshness', 'marketability'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-2 px-4 font-medium ${
                                    activeTab === tab
                                        ? 'border-b-2 border-green-500 text-green-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === 'performance' && <PerformanceTab />}
                    {activeTab === 'inventory' && <InventoryTab />}
                    {activeTab === 'freshness' && <FreshnessTab />}
                    {activeTab === 'marketability' && <MarketabilityTab marketability={productAnalytics} />}
                </div>
            </div>
        </div>
    );
};

export default ProductAnalytics;