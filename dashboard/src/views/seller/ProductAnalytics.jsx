import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_product_analytics } from '../../store/Reducers/productReducer';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Package, Clock, AlertTriangle, Menu, X } from 'lucide-react';
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        dispatch(get_product_analytics());
    }, [dispatch]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && !event.target.closest('#mobile-menu') && 
                !event.target.closest('#menu-button')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

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

    // Mobile Navigation Menu
    const MobileNav = () => (
        <div className="md:hidden relative">
            <button 
                id="menu-button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-white shadow-sm"
                aria-label="Toggle menu"
            >
                <Menu className="h-6 w-6" />
            </button>

            {isMobileMenuOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    <div 
                        id="mobile-menu"
                        className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
                    >
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-semibold">Menu</h2>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex flex-col p-4 gap-2">
                            {['performance', 'inventory', 'freshness', 'marketability'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`p-3 text-left rounded-lg transition-colors ${
                                        activeTab === tab
                                            ? 'bg-green-50 text-green-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const AlertsSection = () => {
        const [showAllAlerts, setShowAllAlerts] = useState(false);
        const alertLimit = 3;
    
        const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, alertLimit);
    
        return (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
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
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-green-100 rounded-full">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Sales</p>
                        <p className="text-lg sm:text-2xl font-bold">₱{performanceMetrics.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-blue-100 rounded-full">
                        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Active Products</p>
                        <p className="text-lg sm:text-2xl font-bold">{inventoryInsights.totalProducts}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-yellow-100 rounded-full">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Expiring Soon</p>
                        <p className="text-lg sm:text-2xl font-bold">{inventoryInsights.expiringIn7Days}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-red-100 rounded-full">
                        <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Low Stock Items</p>
                        <p className="text-lg sm:text-2xl font-bold">{inventoryInsights.lowStock}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const PerformanceTab = () => (
        <div className="grid grid-cols-1 gap-6">
            <div className="overflow-hidden">
                <ProductPerformanceCharts products={productAnalytics} />
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
                <div className="space-y-4">
                    {topSellingProducts.map(product => (
                        <div key={product._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded gap-2">
                            <div>
                                <h4 className="font-medium">{product.name}</h4>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                    <span>Sales: {product.salesCount}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>Quality: {calculateQualityScore(product)}%</span>
                                </div>
                            </div>
                            <div className="text-left sm:text-right">
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

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
                <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryPerformance}
                                dataKey="totalRevenue"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                outerRadius={({ width }) => Math.min(width * 0.25, 100)}
                                label={({ name, value }) => `${name}: ₱${parseFloat(value).toLocaleString()}`}
                            >
                                {categoryPerformance.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value) => `₱${parseFloat(value).toLocaleString()}`}
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    // Helper functions
    const calculateAverageDailySales = (product) => {
        if (!product.salesCount) return '0.00';
    
        const createdAt = moment(product.createdAt || product.harvestDate);
        const lastSale = product.lastSaleDate ? moment(product.lastSaleDate) : moment();
        const daysSinceCreation = Math.max(1, moment().diff(createdAt, 'days'));
        
        let averageSales;
        if (product.lastSaleDate) {
            const daysBetweenSales = Math.max(1, moment(lastSale).diff(createdAt, 'days'));
            averageSales = product.salesCount / daysBetweenSales;
        } else {
            averageSales = product.salesCount / daysSinceCreation;
        }
    
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
    const TableWrapper = ({ children }) => (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    {children}
                </div>
            </div>
        </div>
    );

    const InventoryTab = () => {
        const [currentPage, setCurrentPage] = useState(1);
        const [itemsPerPage, setItemsPerPage] = useState(5);
    
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = productAnalytics.slice(indexOfFirstItem, indexOfLastItem);
    
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                        <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
        
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <h3 className="text-lg font-semibold">Inventory Status</h3>
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
    
                    <TableWrapper>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Info</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map((product, index) => {
                                    const stockStatus = getStockStatus(product.stock);
                                    const expiryStatus = getDaysUntilExpiry(product.bestBefore);
                                    const avgDailySales = calculateAverageDailySales(product);
        
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    {product.images && product.images[0] && (
                                                        <img 
                                                            src={product.images[0]} 
                                                            alt={product.name}
                                                            className="w-10 h-10 rounded-md object-cover mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-sm">{product.name}</div>
                                                        <div className="text-xs text-gray-500">{product.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className={`font-medium ${stockStatus.color}`}>
                                                    {stockStatus.text}
                                                    <div className="text-xs text-gray-500">
                                                        {product.stock} {product.unit} remaining
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium">Total: {product.salesCount}</div>
                                                    <div>Avg: {avgDailySales}/day</div>
                                                    {product.lastSaleDate && (
                                                        <div className="text-xs text-gray-500">
                                                            Last: {moment(product.lastSaleDate).fromNow()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm">
                                                    <div>
                                                        {moment(product.harvestDate).format('MMM D, YYYY')}
                                                    </div>
                                                    <div className={`text-xs ${expiryStatus.color}`}>
                                                        {expiryStatus.text}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Rating ratings={product.rating || 0} />
                                                    <span className="text-xs text-gray-600">
                                                        ({product.rating ? product.rating.toFixed(1) : '0'})
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </TableWrapper>
    
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500 order-2 sm:order-1">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, productAnalytics.length)} of {productAnalytics.length} entries
                        </div>
                        <div className="flex gap-2 order-1 sm:order-2">
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
                            <div className="flex gap-1 overflow-x-auto">
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
    
        const getFreshnessStatus = (daysUntilExpiry) => {
            if (daysUntilExpiry < 0) return { status: 'Expired', class: 'bg-red-100 text-red-800' };
            if (daysUntilExpiry === 0) return { status: 'Expires Today', class: 'bg-red-100 text-red-800' };
            if (daysUntilExpiry <= 3) return { status: 'Critical', class: 'bg-red-100 text-red-800' };
            if (daysUntilExpiry <= 7) return { status: 'Warning', class: 'bg-yellow-100 text-yellow-800' };
            if (daysUntilExpiry <= 14) return { status: 'Good', class: 'bg-blue-100 text-blue-800' };
            return { status: 'Very Fresh', class: 'bg-green-100 text-green-800' };
        };
    
        const productsWithFreshness = productAnalytics.map(product => {
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
    
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = productsWithFreshness.slice(indexOfFirstItem, indexOfLastItem);
    
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            title: 'Expired Products',
                            value: expiredCount,
                            icon: <AlertTriangle className="h-6 w-6 text-red-600"/>,
                            bgColor: 'bg-red-100',
                            textColor: 'text-red-600'
                        },
                        {
                            title: 'Critical (≤3 days)',
                            value: criticalCount,
                            icon: <Clock className="h-6 w-6 text-yellow-600"/>,
                            bgColor: 'bg-yellow-100',
                            textColor: 'text-yellow-600'
                        },
                        {
                            title: 'Warning (4-7 days)',
                            value: warningCount,
                            icon: <Clock className="h-6 w-6 text-blue-600"/>,
                            bgColor: 'bg-blue-100',
                            textColor: 'text-blue-600'
                        },
                        {
                            title: 'Total Products',
                            value: productsWithFreshness.length,
                            icon: <Package className="h-6 w-6 text-green-600"/>,
                            bgColor: 'bg-green-100',
                            textColor: 'text-green-600'
                        }
                    ].map((stat, index) => (
                        <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    <p className={`text-lg sm:text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
    
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
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
    
                    <TableWrapper>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harvest Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Best Before</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining Life</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality Score</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map(product => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                {product.images && product.images[0] && (
                                                    <img 
                                                        src={product.images[0]} 
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-md object-cover mr-3"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium text-sm">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            {moment(product.harvestDate).format('MMM D, YYYY')}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            {moment(product.bestBefore).format('MMM D, YYYY')}
                                        </td>
                                        <td className="px-4 py-4">
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
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.freshnessStatus.class}`}>
                                                {product.freshnessStatus.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
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
                    </TableWrapper>
    
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500 order-2 sm:order-1">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, productsWithFreshness.length)} of {productsWithFreshness.length} entries
                        </div>
                        <div className="flex gap-2 order-1 sm:order-2">
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
                            <div className="flex gap-1 overflow-x-auto">
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

    const MarketabilityTab = () => {
        const [filterType, setFilterType] = useState('all');
        const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

        const processedMarketData = useMemo(() => {
            if (!productAnalytics || !productAnalytics.length) return [];

            const totalRevenue = productAnalytics.reduce((sum, product) => 
                sum + ((product.salesCount || 0) * (product.price || 0)), 0);

            const maxSales = Math.max(...productAnalytics.map(p => p.salesCount || 0));

            return productAnalytics.map(product => {
                const revenue = (product.salesCount || 0) * (product.price || 0);
                const marketShare = totalRevenue ? (revenue / totalRevenue) * 100 : 0;
                const salesScore = maxSales ? ((product.salesCount || 0) / maxSales * 70) : 0;
                const ratingScore = ((product.rating || 0) / 5 * 30);
                const currentPeriodSales = product.recentSales || product.salesCount || 0;
                const previousPeriodSales = product.previousSales || Math.max(product.salesCount - 5, 0);
                const growthRate = previousPeriodSales ? 
                    ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100 : 0;
                const score = Math.round(salesScore + ratingScore);

                return {
                    ...product,
                    revenue,
                    marketShare,
                    rating: product.rating || 0,
                    growthRate,
                    salesCount: product.salesCount || 0,
                    price: product.price || 0,
                    category: product.category || 'Uncategorized',
                    score
                };
            });
        }, [productAnalytics]);

        const filteredData = useMemo(() => {
            const data = [...processedMarketData];
            
            switch (filterType) {
                case 'growing':
                    return data.filter(product => 
                        (product.score >= 60 && product.rating >= 3.5) ||
                        (product.growthRate > 10 && product.salesCount >= 5) ||
                        (product.salesCount >= 10 && product.rating >= 4.0)
                    ).sort((a, b) => b.salesCount - a.salesCount);
                case 'declining':
                    return data.filter(product => 
                        (product.score < 60 && product.score >= 30) ||
                        (product.growthRate < 0 && product.salesCount > 0)
                    ).sort((a, b) => b.salesCount - a.salesCount);
                case 'at risk':
                    return data.filter(product => 
                        product.score < 30 ||
                        (product.salesCount < 5 && product.rating < 3.5) ||
                        product.growthRate < -20
                    ).sort((a, b) => a.score - b.score);
                default:
                    return data.sort((a, b) => b.score - a.score);
            }
        }, [processedMarketData, filterType]);

        const metrics = useMemo(() => ({
            totalProducts: processedMarketData.length,
            highPerformance: processedMarketData.filter(p => p.score >= 60 && p.rating >= 3.5).length,
            growingProducts: processedMarketData.filter(p => 
                (p.growthRate > 10 && p.salesCount >= 5) ||
                (p.salesCount >= 10 && p.rating >= 4.0)
            ).length,
            atRiskProducts: processedMarketData.filter(p => 
                p.score < 30 || 
                (p.salesCount < 5 && p.rating < 3.5) ||
                p.growthRate < -20
            ).length
        }), [processedMarketData]);

        const getStatusInfo = (product) => {
            if (product.score >= 70) return { text: 'Top Performance', color: 'text-green-600' };
            if (product.score >= 60) return { text: 'High Performance', color: 'text-green-600' };
            if (product.growthRate > 10) return { text: 'Fast Growing', color: 'text-blue-600' };
            if (product.score < 30) return { text: 'Needs Improvement', color: 'text-red-600' };
            if (product.growthRate < 0) return { text: 'Declining', color: 'text-yellow-600' };
            return { text: 'Average', color: 'text-gray-600' };
        };

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-medium text-gray-700 mb-3">High Performance</h4>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-full">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{metrics.highPerformance}</p>
                                <p className="text-sm text-gray-600">High Sales & Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-medium text-gray-700 mb-3">Positive Trend</h4>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{metrics.growingProducts}</p>
                                <p className="text-sm text-gray-600">Strong Growth</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-medium text-gray-700 mb-3">Need Attention</h4>
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

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h3 className="text-lg font-semibold">Product Market Share</h3>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'growing', 'declining', 'at risk'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setFilterType(filter)}
                                    className={`px-3 py-1 rounded-md text-sm ${
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
                        <div className="h-[300px] sm:h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={filteredData}
                                        dataKey="marketShare"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={({ width }) => Math.min(width * 0.25, 100)}
                                        label={({ name, marketShare }) => 
                                            `${name}: ${marketShare.toFixed(1)}%`
                                        }
                                    >
                                        {filteredData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${parseFloat(value).toFixed(1)}%`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Market Performance Details</h4>
                            {filteredData.map((product, index) => {
                                const status = getStatusInfo(product);
                                return (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                            <div>
                                                <h4 className="font-medium">{product.name}</h4>
                                                <div className="text-sm text-gray-600">
                                                    Rating: {product.rating.toFixed(1)}★ · Revenue: ₱{product.revenue.toLocaleString()}
                                                </div>
                                                <div className={`text-xs ${status.color}`}>
                                                    {status.text}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-medium">
                                                    Score: {product.score}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Sales: {product.salesCount}
                                                </div>
                                                <div className={`text-xs ${
                                                    product.growthRate > 0 ? 'text-green-600' : 
                                                    product.growthRate < 0 ? 'text-red-600' : 
                                                    'text-gray-600'
                                                }`}>
                                                    {product.growthRate > 0 ? '↑' : product.growthRate < 0 ? '↓' : '→'} 
                                                    {Math.abs(product.growthRate).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile-friendly header - Fixed at top */}
            <div className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200 px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <MobileNav />
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Product Analytics</h1>
                        </div>
                        {/* Timeframe selector for mobile */}
                        <div className="flex gap-2 sm:hidden">
                            {['week', 'month'].map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTimeframe(time)}
                                    className={`px-3 py-1 rounded-lg whitespace-nowrap ${
                                        selectedTimeframe === time
                                            ? 'bg-green-600 text-white'
                                            : 'bg-white text-gray-600'
                                    } text-sm`}
                                >
                                    {time.charAt(0).toUpperCase() + time.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Timeframe selector for desktop */}
                    <div className="hidden sm:flex gap-2 ml-auto">
                        {['week', 'month'].map((time) => (
                            <button
                                key={time}
                                onClick={() => setSelectedTimeframe(time)}
                                className={`px-4 py-2 rounded-lg ${
                                    selectedTimeframe === time
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                } transition-colors`}
                            >
                                {time.charAt(0).toUpperCase() + time.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 sm:p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Quick Stats */}
                    <QuickStats />

                    {/* Alerts */}
                    <AlertsSection />

                    {/* Desktop Tabs - Hidden on Mobile */}
                    <div className="hidden md:block border-b border-gray-200">
                        <nav className="flex space-x-4">
                            {['performance', 'inventory', 'freshness', 'marketability'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-2 px-4 font-medium transition-colors ${
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

                    {/* Active Tab Content */}
                    <div className="mt-6">
                        {activeTab === 'performance' && <PerformanceTab />}
                        {activeTab === 'inventory' && <InventoryTab />}
                        {activeTab === 'freshness' && <FreshnessTab />}
                        {activeTab === 'marketability' && <MarketabilityTab />}
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button - Only visible on mobile when scrolled down */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-4 right-4 p-3 bg-green-600 text-white rounded-full shadow-lg md:hidden transform transition-transform duration-200 ${
                    typeof window !== 'undefined' && window.scrollY > 200 
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-16 opacity-0'
                }`}
                aria-label="Scroll to top"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>
        </div>
    );
};

export default ProductAnalytics;