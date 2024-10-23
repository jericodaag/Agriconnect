import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { calculateQualityScore } from '../../utils/analytics-helper';


const ProductPerformanceCharts = ({ products }) => {
    // Process products for performance categorization
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

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded shadow">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm">Sales: {payload[0].value}</p>
                    <p className="text-sm">Quality Score: {payload[1].value}%</p>
                    <p className="text-sm">Price: ₱{payload[2].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Top Performing Products */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={topProducts}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="name" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar 
                                yAxisId="left"
                                dataKey="salesCount" 
                                fill="#4F46E5" 
                                name="Sales Count"
                            />
                            <Bar 
                                yAxisId="right"
                                dataKey="qualityScore" 
                                fill="#10B981" 
                                name="Quality Score"
                            />
                            <Bar 
                                yAxisId="left"
                                dataKey="price" 
                                fill="#F59E0B" 
                                name="Price"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topProducts.map((product, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded">
                                <h4 className="font-medium truncate">{product.name}</h4>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600">
                                        Sales: {product.salesCount}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Quality Score: {product.qualityScore}%
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Price: ₱{product.price.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Needing Attention */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Products Needing Attention</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={lowProducts}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="name" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar 
                                yAxisId="left"
                                dataKey="salesCount" 
                                fill="#EF4444" 
                                name="Sales Count"
                            />
                            <Bar 
                                yAxisId="right"
                                dataKey="qualityScore" 
                                fill="#F59E0B" 
                                name="Quality Score"
                            />
                            <Bar 
                                yAxisId="left"
                                dataKey="price" 
                                fill="#8B5CF6" 
                                name="Price"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {lowProducts.map((product, index) => (
                            <div key={index} className="p-4 bg-red-50 rounded">
                                <h4 className="font-medium truncate">{product.name}</h4>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600">
                                        Sales: {product.salesCount}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Quality Score: {product.qualityScore}%
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Price: ₱{product.price.toLocaleString()}
                                    </p>
                                    {product.isExpired && (
                                        <p className="text-sm text-red-600 font-medium">
                                            Product Expired
                                        </p>
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