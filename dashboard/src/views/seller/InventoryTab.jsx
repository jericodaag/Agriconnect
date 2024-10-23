import React from 'react';
import { Package, AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import moment from 'moment';
import Rating from '../../components/Rating';

const InventoryTab = ({ inventoryInsights, products }) => {
    const calculateAverageDailySales = (product) => {
        if (!product.salesCount || !product.createdAt) return 0;
        const daysActive = Math.max(1, moment().diff(moment(product.createdAt), 'days'));
        return (product.salesCount / daysActive).toFixed(2);
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

    return (
        <div className="space-y-6">
            {/* Inventory Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Inventory Status */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Inventory Status</h3>
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
                            {products.map((product, index) => {
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
            </div>
        </div>
    );
};

export default InventoryTab;