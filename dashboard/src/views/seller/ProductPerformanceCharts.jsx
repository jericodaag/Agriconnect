import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { calculateQualityScore } from '../../utils/analytics-helper';
import { TrendingUp, AlertTriangle, Award, PhilippinePeso, Package, Clock } from 'lucide-react';

const ProductPerformanceCharts = ({ products }) => {
    const categorizeProducts = () => {
        return products.map(product => ({
            name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
            salesCount: product.salesCount || 0,
            qualityScore: calculateQualityScore(product),
            price: product.price,
            isExpired: moment(product.bestBefore).isBefore(moment()),
            performance: product.salesCount >= 20 ? 'top' : 
                        product.salesCount >= 10 ? 'good' :
                        product.salesCount < 10 || moment(product.bestBefore).isBefore(moment()) ? 'low' : 'moderate'
        }));
    };

    const categorizedProducts = categorizeProducts();
    const topProducts = categorizedProducts.filter(p => p.performance === 'top');
    const lowProducts = categorizedProducts.filter(p => p.performance === 'low');

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur p-4 border rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{label}</p>
                    <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-blue-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">{payload[0].value} sales</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600">
                            <Award className="w-4 h-4" />
                            <span className="text-sm">{payload[1].value}% quality</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-600">
                            <PhilippinePeso className="w-4 h-4" />
                            <span className="text-sm">₱{payload[2].value.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Top Performing Products */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                            <h3 className="text-xl font-bold text-gray-900">Top Performing Products</h3>
                        </div>
                        <p className="text-gray-600 mt-1">Products with excellent sales and quality metrics</p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-medium">
                        {topProducts.length} Products
                    </div>
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={topProducts}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                                dataKey="name" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fill: '#4B5563' }}
                            />
                            <YAxis yAxisId="left" tick={{ fill: '#4B5563' }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#4B5563' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar 
                                yAxisId="left"
                                dataKey="salesCount" 
                                fill="#4F46E5" 
                                name="Sales Count"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                                yAxisId="right"
                                dataKey="qualityScore" 
                                fill="#10B981" 
                                name="Quality Score"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                                yAxisId="left"
                                dataKey="price" 
                                fill="#F59E0B" 
                                name="Price"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topProducts.map((product, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                                </div>
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm">{product.salesCount} sales</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <Award className="w-4 h-4" />
                                        <span className="text-sm">{product.qualityScore}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <PhilippinePeso className="w-4 h-4" />
                                        <span className="text-sm">₱{product.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Needing Attention */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                            <h3 className="text-xl font-bold text-gray-900">Products Needing Attention</h3>
                        </div>
                        <p className="text-gray-600 mt-1">Products with low performance or requiring immediate action</p>
                    </div>
                    <div className="bg-red-50 text-red-700 px-4 py-1.5 rounded-full font-medium">
                        {lowProducts.length} Products
                    </div>
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={lowProducts}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                                dataKey="name" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fill: '#4B5563' }}
                            />
                            <YAxis yAxisId="left" tick={{ fill: '#4B5563' }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#4B5563' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar 
                                yAxisId="left"
                                dataKey="salesCount" 
                                fill="#EF4444" 
                                name="Sales Count"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                                yAxisId="right"
                                dataKey="qualityScore" 
                                fill="#F59E0B" 
                                name="Quality Score"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                                yAxisId="left"
                                dataKey="price" 
                                fill="#8B5CF6" 
                                name="Price"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {lowProducts.map((product, index) => (
                            <div key={index} className="p-4 bg-red-50 rounded-lg hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-red-500" />
                                    <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                                </div>
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center gap-2 text-red-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm">{product.salesCount} sales</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <Award className="w-4 h-4" />
                                        <span className="text-sm">{product.qualityScore}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-purple-600">
                                        <PhilippinePeso className="w-4 h-4" />
                                        <span className="text-sm">₱{product.price.toLocaleString()}</span>
                                    </div>
                                    {product.isExpired && (
                                        <div className="flex items-center gap-2 text-red-600">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm font-medium">Product Expired</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPerformanceCharts;