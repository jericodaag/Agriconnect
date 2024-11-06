import React, { useEffect, useState } from 'react';
import { MdCurrencyExchange, MdProductionQuantityLimits, MdPendingActions, MdWarning } from "react-icons/md";
import { FaCartShopping, FaUsers } from "react-icons/fa6";
import { FaStripe } from "react-icons/fa";
import { BsCashStack } from "react-icons/bs";
import Chart from 'react-apexcharts';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_seller_dashboard_data } from '../../store/Reducers/dashboardReducer';
import RecentMessages from '../../components/RecentMessages.jsx';

const SellerDashboard = () => {
    const dispatch = useDispatch();
    const { 
        totalSale = 0, 
        totalOrder = 0, 
        totalProduct = 0, 
        totalPendingOrder = 0,
        totalCustomers = 0,  
        recentOrder = [], 
        recentMessages = [], 
        chartData = [], 
        productStatusCounts = {}, 
        expiringProducts = [],
        salesData = {
            stripe: { amount: 0, count: 0 },
            cod: { amount: 0, count: 0 },
            total: 0
        }
    } = useSelector(state => state.dashboard);
    const { userInfo } = useSelector(state => state.auth);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        dispatch(get_seller_dashboard_data())
            .then(() => setIsLoading(false))
            .catch(() => setIsLoading(false));
    }, [dispatch]);

    const [sortedOrders, setSortedOrders] = useState([]);

    useEffect(() => {
        if (recentOrder && recentOrder.length > 0) {
            const sorted = [...recentOrder].sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setSortedOrders(sorted);
        }
    }, [recentOrder]);

    const chartOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        colors: ['#4F46E5', '#10B981', '#F59E0B'],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded'
            },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            labels: { style: { colors: '#64748B' } }
        },
        yaxis: { 
            labels: { 
                style: { colors: '#64748B' },
                formatter: function (value) {
                    return "₱" + value.toLocaleString('en-PH');
                }
            },
            title: { text: 'Amount (PHP)', style: { color: '#64748B' } }
        },
        fill: { opacity: 1 },
        tooltip: { 
            y: { 
                formatter: function (val) { 
                    return "₱" + val.toLocaleString('en-PH');
                } 
            } 
        },
        legend: { position: 'top' }
    };

    // Updated series to include payment method split
    const series = [
        { 
            name: "Stripe Revenue", 
            data: chartData.map(data => data.stripeRevenue || 0)
        },
        { 
            name: "COD Revenue", 
            data: chartData.map(data => data.codRevenue || 0)
        },
        {
            name: "Orders",
            data: chartData.map(data => data.totalOrders || 0)
        }
    ];

    const roundToHundred = (arr) => {
        if (!arr || arr.length === 0) return [0, 0, 0, 0, 0];
        const rounded = arr.map(num => Math.round(num || 0));
        const sum = rounded.reduce((a, b) => a + b, 0);
        const diff = 100 - sum;
        
        if (diff !== 0) {
            const maxIndex = rounded.indexOf(Math.max(...rounded));
            rounded[maxIndex] += diff;
        }
        
        return rounded;
    };

    const radialChartOptions = {
        chart: {
            height: 350,
            type: 'radialBar',
        },
        plotOptions: {
            radialBar: {
                dataLabels: {
                    name: {
                        fontSize: '22px',
                    },
                    value: {
                        fontSize: '16px',
                        formatter: function (val) {
                            return Math.round(val) + '%';
                        }
                    },
                    total: {
                        show: true,
                        label: 'Total',
                        formatter: function () {
                            return '100%';
                        }
                    }
                }
            }
        },
        labels: ['Pending', 'Processing', 'Warehouse', 'Placed', 'Cancelled'],
        colors: ['#FFA500', '#4F46E5', '#10B981', '#34D399', '#EF4444'],
    };

    const originalSeries = [
        productStatusCounts.pending || 0,
        productStatusCounts.processing || 0,
        productStatusCounts.warehouse || 0,
        productStatusCounts.placed || 0,
        productStatusCounts.cancelled || 0
    ];

    const radialSeries = roundToHundred(originalSeries);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className='p-4 bg-gray-50'>
            <h1 className='text-2xl font-bold text-gray-800 mb-6'>Seller Dashboard</h1>

            {/* Main Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6'>
                {[
                    { 
                        title: 'Total Sales', 
                        value: `₱${totalSale.toLocaleString('en-PH')}`, 
                        icon: <MdCurrencyExchange />, 
                        color: 'bg-blue-500' 
                    },
                    { 
                        title: 'Products', 
                        value: totalProduct, 
                        icon: <MdProductionQuantityLimits />, 
                        color: 'bg-green-500' 
                    },
                    { 
                        title: 'Orders', 
                        value: totalOrder, 
                        icon: <FaCartShopping />, 
                        color: 'bg-yellow-500' 
                    },
                    { 
                        title: 'Pending Orders', 
                        value: totalPendingOrder, 
                        icon: <MdPendingActions />, 
                        color: 'bg-red-500' 
                    },
                    { 
                        title: 'Total Customers', 
                        value: totalCustomers, 
                        icon: <FaUsers />, 
                        color: 'bg-purple-500' 
                    },
                ].map((item, index) => (
                    <div key={index} className='bg-white rounded-lg shadow-sm p-4 flex items-center'>
                        <div className={`${item.color} text-white p-3 rounded-full mr-4`}>
                            {React.cloneElement(item.icon, { size: 24 })}
                        </div>
                        <div>
                            <p className='text-sm text-gray-500'>{item.title}</p>
                            <h3 className='text-xl font-bold text-gray-800'>{item.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Methods Stats */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
                <div className='bg-white rounded-lg shadow-sm p-4 flex items-center justify-between'>
                    <div className='flex items-center'>
                        <div className='bg-indigo-500 text-white p-3 rounded-full mr-4'>
                            <FaStripe size={24} />
                        </div>
                        <div>
                            <p className='text-sm text-gray-500'>Stripe Payments</p>
                            <h3 className='text-xl font-bold text-gray-800'>
                                ₱{salesData.stripe.amount.toLocaleString('en-PH')}
                            </h3>
                            <p className='text-xs text-gray-500'>{salesData.stripe.count} orders</p>
                        </div>
                    </div>
                    <div className='text-right'>
                        <p className='text-sm font-semibold text-indigo-600'>
                            {salesData.total ? 
                                ((salesData.stripe.amount / salesData.total) * 100).toFixed(1) 
                                : 0}%
                        </p>
                        <p className='text-xs text-gray-500'>of total sales</p>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-4 flex items-center justify-between'>
                    <div className='flex items-center'>
                        <div className='bg-green-500 text-white p-3 rounded-full mr-4'>
                            <BsCashStack size={24} />
                        </div>
                        <div>
                            <p className='text-sm text-gray-500'>COD Payments</p>
                            <h3 className='text-xl font-bold text-gray-800'>
                                ₱{salesData.cod.amount.toLocaleString('en-PH')}
                            </h3>
                            <p className='text-xs text-gray-500'>{salesData.cod.count} orders</p>
                        </div>
                    </div>
                    <div className='text-right'>
                        <p className='text-sm font-semibold text-green-600'>
                            {salesData.total ? 
                                ((salesData.cod.amount / salesData.total) * 100).toFixed(1) 
                                : 0}%
                        </p>
                        <p className='text-xs text-gray-500'>of total sales</p>
                    </div>
                </div>
            </div>

            {/* Expiring Products Alert */}
            {expiringProducts.length > 0 && (
                <div className='mb-6 bg-yellow-100 border-l-4 border-yellow-500 p-4'>
                    <div className='flex items-center'>
                        <MdWarning className='text-yellow-500 mr-2' size={24} />
                        <p className='font-semibold text-yellow-700'>Products Expiring Soon</p>
                    </div>
                    <ul className='mt-2'>
                        {expiringProducts.map((product, index) => (
                            <li key={index} className='text-yellow-700'>
                                {product.name} - Expires in {product.daysUntilExpiry} days
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Charts Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                <div className='lg:col-span-2 bg-white rounded-lg shadow-sm p-4'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Sales Overview</h2>
                    {chartData.length > 0 && (
                        <Chart options={chartOptions} series={series} type='bar' height={350} />
                    )}
                </div>
                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Order Status</h2>
                    <Chart options={radialChartOptions} series={radialSeries} type="radialBar" height={350} />
                </div>
            </div>

            {/* Orders and Messages Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                <div className='lg:col-span-2 bg-white rounded-lg shadow-sm p-4 overflow-x-auto'>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-lg font-semibold text-gray-800'>Recent Orders</h2>
                        <Link to="/seller/dashboard/orders" className='text-sm text-blue-600 hover:underline'>View All</Link>
                    </div>
                    <table className='w-full text-sm text-left text-gray-500'>
                        <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                            <tr>
                                <th className='px-6 py-3'>Order Id</th>
                                <th className='px-6 py-3'>Price</th>
                                <th className='px-6 py-3'>Payment Status</th>
                                <th className='px-6 py-3'>Payment Method</th>
                                <th className='px-6 py-3'>Order Status</th>
                                <th className='px-6 py-3'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {sortedOrders.map((d, i) => (
                            <tr key={i} className='bg-white border-b hover:bg-gray-50'>
                                <td className='px-6 py-4 font-medium text-gray-900'>#{d._id}</td>
                                <td className='px-6 py-4'>₱{d.price.toLocaleString('en-PH')}</td>
                                <td className='px-6 py-4'>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        d.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {d.payment_status}
                                    </span>
                                </td>
                                <td className='px-6 py-4'>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        d.payment_method === 'stripe' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {d.payment_method}
                                    </span>
                                </td>
                                <td className='px-6 py-4'>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        d.delivery_status === 'delivered' ? 'bg-green-100 text-green-800' :
                                        d.delivery_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        d.delivery_status === 'delivered' ? 'bg-green-100 text-green-800' :
                                        d.delivery_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {d.delivery_status}
                                    </span>
                                </td>
                                <td className='px-6 py-4'>
                                    <Link to={`/seller/dashboard/order/details/${d._id}`} className='text-blue-600 hover:underline'>View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                <RecentMessages messages={recentMessages} userInfo={userInfo} isAdmin={false} />
            </div>

            {/* Payment Method Trends */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Payment Method Trends</h2>
                    <div className='space-y-4'>
                        {chartData.map((data, index) => {
                            const month = new Date(2024, index).toLocaleString('default', { month: 'long' });
                            const total = (data.stripeRevenue || 0) + (data.codRevenue || 0);
                            if (total === 0) return null;

                            const stripePercentage = total > 0 ? ((data.stripeRevenue || 0) / total) * 100 : 0;

                            return (
                                <div key={month} className='space-y-2'>
                                    <div className='flex justify-between text-sm'>
                                        <span className='font-medium'>{month}</span>
                                        <span>₱{total.toLocaleString('en-PH')}</span>
                                    </div>
                                    <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                                        <div
                                            className='h-full bg-indigo-500'
                                            style={{ width: `${stripePercentage}%` }}
                                        />
                                    </div>
                                    <div className='flex justify-between text-xs text-gray-500'>
                                        <span>Stripe: ₱{(data.stripeRevenue || 0).toLocaleString('en-PH')} ({stripePercentage.toFixed(1)}%)</span>
                                        <span>COD: ₱{(data.codRevenue || 0).toLocaleString('en-PH')} ({(100 - stripePercentage).toFixed(1)}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Payment Statistics</h2>
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='p-4 bg-gray-50 rounded-lg'>
                            <p className='text-sm text-gray-500'>Average Order Value</p>
                            <h4 className='text-xl font-bold text-gray-800'>
                                ₱{totalOrder > 0 ? 
                                    (totalSale / totalOrder).toLocaleString('en-PH', { 
                                        maximumFractionDigits: 2 
                                    }) : 
                                    '0'}
                            </h4>
                        </div>
                        <div className='p-4 bg-gray-50 rounded-lg'>
                            <p className='text-sm text-gray-500'>Payment Success Rate</p>
                            <h4 className='text-xl font-bold text-gray-800'>
                                {totalOrder > 0 ? 
                                    ((recentOrder.filter(order => order.payment_status === 'paid').length / totalOrder) * 100).toFixed(1) : 
                                    0}%
                            </h4>
                        </div>
                        <div className='p-4 bg-gray-50 rounded-lg'>
                            <p className='text-sm text-gray-500'>Stripe Usage</p>
                            <h4 className='text-xl font-bold text-indigo-600'>
                                {salesData.total > 0 ? 
                                    ((salesData.stripe.amount / salesData.total) * 100).toFixed(1) : 
                                    0}%
                            </h4>
                        </div>
                        <div className='p-4 bg-gray-50 rounded-lg'>
                            <p className='text-sm text-gray-500'>COD Usage</p>
                            <h4 className='text-xl font-bold text-green-600'>
                                {salesData.total > 0 ? 
                                    ((salesData.cod.amount / salesData.total) * 100).toFixed(1) : 
                                    0}%
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;