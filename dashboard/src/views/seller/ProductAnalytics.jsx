import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_product_analytics, get_inventory_history } from '../../store/Reducers/productReducer';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Package, Clock, AlertTriangle } from 'lucide-react';

const ProductAnalytics = () => {
    const dispatch = useDispatch();
    const { productAnalytics, loader, inventoryHistory } = useSelector(state => state.product);
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

    const topSellingProducts = productAnalytics.slice(0, 5);
    const lowSellingProducts = [...productAnalytics]
        .sort((a, b) => a.salesCount - b.salesCount)
        .slice(0, 5);

    const expiringProducts = productAnalytics
        .filter(product => product.daysUntilExpiry <= 7)
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-green-100 rounded-full">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Sales</p>
                                <p className="text-2xl font-bold">{productAnalytics.reduce((acc, curr) => acc + curr.salesCount, 0)}</p>
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
                                <p className="text-2xl font-bold">{productAnalytics.length}</p>
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
                                <p className="text-2xl font-bold">{expiringProducts.length}</p>
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
                                <p className="text-2xl font-bold">{lowSellingProducts.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-4">
                        {['performance', 'inventory', 'freshness'].map((tab) => (
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
                    {activeTab === 'performance' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={topSellingProducts}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="salesCount" fill="#22c55e" name="Sales" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-semibold mb-4">Products Needing Attention</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={lowSellingProducts}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="salesCount" fill="#ef4444" name="Sales" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Inventory Levels Over Time</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={inventoryHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="quantity" stroke="#3b82f6" name="Stock Level" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {activeTab === 'freshness' && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Product Freshness Status</h3>
                            {expiringProducts.length > 0 && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                    <div className="flex items-center">
                                        <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                                        <p className="text-sm text-yellow-700">
                                            You have {expiringProducts.length} products expiring within the next 7 days
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Harvest Date</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Expires In</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {productAnalytics.map(product => (
                                            <tr key={product._id}>
                                                <td className="px-4 py-3">{product.name}</td>
                                                <td className="px-4 py-3">{product.daysSinceHarvest} days ago</td>
                                                <td className="px-4 py-3">{product.daysUntilExpiry} days</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                                        product.freshnessStatus === 'Fresh' ? 'bg-green-100 text-green-800' :
                                                        product.freshnessStatus === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {product.freshnessStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductAnalytics;