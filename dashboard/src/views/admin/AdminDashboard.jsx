import React, { useEffect, useState, useCallback } from 'react';
import { MdCurrencyExchange, MdProductionQuantityLimits } from "react-icons/md";
import { FaUsers, FaStripe, FaChartLine, FaMoneyBillWave, FaHandHoldingUsd } from "react-icons/fa"; 
import { BsCashStack } from "react-icons/bs";
import Chart from 'react-apexcharts';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_admin_dashboard_data } from '../../store/Reducers/dashboardReducer';
import RecentMessages from '../../components/RecentMessages.jsx';
import { LuEye } from "react-icons/lu";
import { FaCartShopping } from 'react-icons/fa6';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { 
        totalSale = 0,
        totalOrder = 0,
        totalProduct = 0,
        totalSeller = 0,
        recentOrder = [],
        recentMessages = [],
        chartData = [],
        productStatusCounts = {},
        salesData = {
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
        }
    } = useSelector(state => state.dashboard) || {};
    
    const { userInfo } = useSelector(state => state.auth);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = useCallback(() => {
        dispatch(get_admin_dashboard_data())
            .then(() => setIsLoading(false))
            .catch(() => setIsLoading(false));
    }, [dispatch]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'warehouse': return 'bg-indigo-100 text-indigo-800';
            case 'placed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'paid': return 'bg-emerald-100 text-emerald-800';
            case 'unpaid': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const series = [
        { 
            name: "Total Revenue", 
            data: chartData?.map(data => data?.totalRevenue || 0) || []
        },
        { 
            name: "Stripe Revenue", 
            data: chartData?.map(data => data?.stripeRevenue || 0) || []
        },
        { 
            name: "COD Revenue", 
            data: chartData?.map(data => data?.codRevenue || 0) || []
        },
        {
            name: "Commission",
            data: chartData?.map(data => data?.commission || (data?.totalRevenue || 0) * 0.03) || []
        }
    ];

    const getChartOptions = () => ({
        chart: {
            type: 'bar',
            toolbar: { show: false },
            zoom: { enabled: false },
            events: {} // Disable all chart events
        },
        colors: ['#4F46E5', '#10B981', '#F59E0B', '#34D399'],
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
                formatter: (value) => "₱" + (value || 0).toLocaleString('en-PH')
            },
            title: { text: 'Amount (PHP)', style: { color: '#64748B' } }
        },
        fill: { opacity: 1 },
        tooltip: { enabled: false }, // Disable tooltips
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'left',
            showForSingleSeries: true,
            onItemClick: { toggleDataSeries: false }, // Disable legend click
            onItemHover: { highlightDataSeries: false } // Disable legend hover
        }
    });

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className='p-4 bg-gray-50'>
            <h1 className='text-2xl font-bold text-gray-800 mb-6'>Admin Dashboard</h1>

            {/* Main Stats */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                {[
                    { 
                        title: 'Platform Revenue', 
                        value: `₱${(totalSale || 0).toLocaleString('en-PH')}`, 
                        icon: <MdCurrencyExchange />, 
                        color: 'bg-blue-500',
                        subtext: 'Total gross sales'
                    },
                    { 
                        title: 'Platform Commission', 
                        value: `₱${(salesData?.totalCommission || 0).toLocaleString('en-PH')}`, 
                        icon: <FaHandHoldingUsd />, 
                        color: 'bg-green-500',
                        subtext: '3% of total sales'
                    },
                    { 
                        title: 'Monthly Commission', 
                        value: `₱${(salesData?.monthlyCommission || 0).toLocaleString('en-PH')}`, 
                        icon: <FaMoneyBillWave />, 
                        color: 'bg-purple-500',
                        subtext: 'This month\'s earnings'
                    },
                    { 
                        title: 'Total Orders', 
                        value: totalOrder || 0, 
                        icon: <FaCartShopping />, 
                        color: 'bg-yellow-500',
                        subtext: 'Across all sellers'
                    }
                ].map((item, index) => (
                    <div key={index} className='bg-white rounded-lg shadow-sm p-4'>
                        <div className='flex items-center gap-4'>
                            <div className={`${item.color} text-white p-3 rounded-full`}>
                                {React.cloneElement(item.icon, { size: 24 })}
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>{item.title}</p>
                                <h3 className='text-xl font-bold text-gray-800'>{item.value}</h3>
                                <p className='text-xs text-gray-500'>{item.subtext}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Methods */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-indigo-500 text-white p-3 rounded-full'>
                                <FaStripe size={24} />
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>Stripe Payments</p>
                                <h3 className='text-xl font-bold text-gray-800'>
                                    ₱{(salesData?.stripe?.amount || 0).toLocaleString('en-PH')}
                                </h3>
                                <div className='text-xs text-gray-500'>
                                    <p>{salesData?.stripe?.count || 0} orders</p>
                                    <p className='text-green-600 font-medium'>
                                        Commission: ₱{(salesData?.stripe?.commission || 0).toLocaleString('en-PH')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='text-right'>
                            <p className='text-sm font-semibold text-indigo-600'>
                                {(salesData?.total || 0) ? 
                                    ((salesData?.stripe?.amount || 0) / salesData.total * 100).toFixed(1) 
                                    : '0'}%
                            </p>
                            <p className='text-xs text-gray-500'>of total sales</p>
                        </div>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-green-500 text-white p-3 rounded-full'>
                                <BsCashStack size={24} />
                            </div>
                            <div>
                                <p className='text-sm text-gray-500'>COD Payments</p>
                                <h3 className='text-xl font-bold text-gray-800'>
                                    ₱{(salesData?.cod?.amount || 0).toLocaleString('en-PH')}
                                </h3>
                                <div className='text-xs text-gray-500'>
                                    <p>{salesData?.cod?.count || 0} orders</p>
                                    <p className='text-green-600 font-medium'>
                                        Commission: ₱{(salesData?.cod?.commission || 0).toLocaleString('en-PH')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='text-right'>
                            <p className='text-sm font-semibold text-green-600'>
                                {(salesData?.total || 0) ? 
                                    ((salesData?.cod?.amount || 0) / salesData.total * 100).toFixed(1) 
                                    : '0'}%
                            </p>
                            <p className='text-xs text-gray-500'>of total sales</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Stats */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <div className='flex items-center gap-4'>
                        <div className='bg-indigo-500 text-white p-3 rounded-full'>
                            <FaUsers className="h-6 w-6" />
                        </div>
                        <div>
                            <p className='text-sm text-gray-500'>Active Sellers</p>
                            <h3 className='text-xl font-bold text-gray-800'>{totalSeller || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <div className='flex items-center gap-4'>
                        <div className='bg-green-500 text-white p-3 rounded-full'>
                            <MdProductionQuantityLimits className="h-6 w-6" />
                        </div>
                        <div>
                            <p className='text-sm text-gray-500'>Total Products</p>
                            <h3 className='text-xl font-bold text-gray-800'>{totalProduct || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <div className='flex items-center gap-4'>
                        <div className='bg-yellow-500 text-white p-3 rounded-full'>
                            <FaChartLine className="h-6 w-6" />
                        </div>
                        <div>
                            <p className='text-sm text-gray-500'>Avg. Commission/Order</p>
                            <h3 className='text-xl font-bold text-gray-800'>
                                ₱{totalOrder > 0 ? 
                                    ((salesData?.totalCommission || 0) / totalOrder).toLocaleString('en-PH', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }) : '0.00'
                                }
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                <div className='lg:col-span-2 bg-white rounded-lg shadow-sm p-4'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Performance Overview</h2>
                    {chartData?.length > 0 && (
                        <Chart options={getChartOptions()} series={series} type='bar' height={350} />
                    )}
                </div>
                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Order Status Distribution</h2>
                    <Chart 
                    options={{
                        chart: {
                            type: 'donut',
                            events: {} // Disable all chart events
                        },
                        colors: ['#FCD34D', '#60A5FA', '#818CF8', '#34D399', '#EF4444'],
                        labels: Object.keys(productStatusCounts || {}),
                        dataLabels: {
                            enabled: true,
                            formatter: (val) => Math.round(val) + '%'
                        },
                        legend: {
                            show: true,
                            position: 'bottom',
                            onItemClick: { toggleDataSeries: false }, // Disable legend click
                            onItemHover: { highlightDataSeries: false } // Disable legend hover
                        },
                        tooltip: { enabled: false }, // Disable tooltips
                        states: {
                            hover: { filter: { type: 'none' } }, // Disable hover states
                            active: { filter: { type: 'none' } } // Disable active states
                        }
                    }}
                    series={Object.values(productStatusCounts || {})}
                    type="donut" 
                    height={350} 
                />
                </div>
            </div>

            {/* Recent Orders and Messages */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                <div className='lg:col-span-2 bg-white rounded-lg shadow-sm p-4'>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-lg font-semibold text-gray-800'>Recent Orders</h2>
                        <Link 
                            to="/admin/dashboard/orders" 
                            className='text-[#438206] hover:text-[#61BD12] transition duration-300 ease-in-out'
                        >
                            View All
                        </Link>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm text-left text-gray-500'>
                            <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                                <tr>
                                    <th className='px-6 py-3'>Order ID</th>
                                    <th className='px-6 py-3'>Price</th>
                                    <th className='px-6 py-3'>Commission</th>
                                    <th className='px-6 py-3'>Payment Status</th>
                                    <th className='px-6 py-3'>Order Status</th>
                                    <th className='px-6 py-3'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrder?.map((order) => (
                                    <tr key={order._id} className='bg-white border-b hover:bg-gray-50 transition duration-150 ease-in-out'>
                                        <td className='px-6 py-4 font-medium text-gray-900'>
                                            #{order._id}
                                        </td>
                                        <td className='px-6 py-4'>
                                            ₱{(order?.price || 0).toLocaleString('en-PH')}
                                        </td>
                                        <td className='px-6 py-4 text-green-600 font-medium'>
                                            ₱{((order?.price || 0) * 0.03).toLocaleString('en-PH')}
                                        </td>
                                        <td className='px-6 py-4'>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                getStatusColor(order?.payment_status)
                                            }`}>
                                                {order?.payment_status}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                getStatusColor(order?.delivery_status)
                                            }`}>
                                                {order?.delivery_status}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <Link 
                                                to={`/admin/dashboard/order/details/${order._id}`}
                                                className='flex items-center gap-1 text-[#438206] hover:text-[#61BD12] transition duration-300 ease-in-out'
                                            >
                                                <LuEye className="h-4 w-4" />
                                                <span>View</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {(!recentOrder || recentOrder.length === 0) && (
                                    <tr>
                                        <td colSpan="6" className='px-6 py-4 text-center text-gray-500'>
                                            No recent orders found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Messages Section */}
                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <RecentMessages messages={recentMessages} userInfo={userInfo} isAdmin={true} />
                </div>
            </div>

            {/* Commission Summary */}
            <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Commission Summary</h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='p-4 bg-gray-50 rounded-lg'>
                        <p className='text-sm text-gray-600'>Commission Rate</p>
                        <h4 className='text-2xl font-bold text-[#438206]'>3%</h4>
                        <p className='text-xs text-gray-500 mt-1'>Fixed platform fee</p>
                    </div>

                    <div className='p-4 bg-gray-50 rounded-lg'>
                        <p className='text-sm text-gray-600'>Average Daily Commission</p>
                        <h4 className='text-2xl font-bold text-[#438206]'>
                            ₱{((salesData?.monthlyCommission || 0) / 30).toLocaleString('en-PH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </h4>
                        <p className='text-xs text-gray-500 mt-1'>Based on monthly average</p>
                    </div>

                    <div className='p-4 bg-gray-50 rounded-lg'>
                        <p className='text-sm text-gray-600'>Commission per Order</p>
                        <h4 className='text-2xl font-bold text-[#438206]'>
                            ₱{totalOrder > 0 ? ((salesData?.totalCommission || 0) / totalOrder).toLocaleString('en-PH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }) : '0.00'}
                        </h4>
                        <p className='text-xs text-gray-500 mt-1'>Average per transaction</p>
                    </div>
                </div>
            </div>

            {/* Payment Method Analysis */}
            <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-4'>Payment Method Analysis</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-4'>
                        <div className='bg-indigo-50 p-4 rounded-lg'>
                            <div className='flex justify-between items-center mb-2'>
                                <h3 className='font-medium text-indigo-900'>Stripe Statistics</h3>
                                <FaStripe className="h-5 w-5 text-indigo-600" />
                            </div>
                            <p className='text-2xl font-bold text-indigo-600'>
                                ₱{(salesData?.stripe?.commission || 0).toLocaleString('en-PH')}
                            </p>
                            <p className='text-sm text-indigo-600'>
                                {((salesData?.stripe?.commission || 0) / (salesData?.totalCommission || 1) * 100).toFixed(1)}% of total commission
                            </p>
                        </div>

                        <div className='bg-green-50 p-4 rounded-lg'>
                            <div className='flex justify-between items-center mb-2'>
                                <h3 className='font-medium text-green-900'>COD Statistics</h3>
                                <BsCashStack className="h-5 w-5 text-green-600" />
                            </div>
                            <p className='text-2xl font-bold text-green-600'>
                                ₱{(salesData?.cod?.commission || 0).toLocaleString('en-PH')}
                            </p>
                            <p className='text-sm text-green-600'>
                                {((salesData?.cod?.commission || 0) / (salesData?.totalCommission || 1) * 100).toFixed(1)}% of total commission
                            </p>
                        </div>
                    </div>

                    <div>
                    <Chart 
                    options={{
                        chart: {
                            type: 'pie',
                            events: {} // Disable all chart events
                        },
                        colors: ['#4F46E5', '#10B981'],
                        labels: ['Stripe', 'COD'],
                        dataLabels: {
                            enabled: true,
                            formatter: (val) => Math.round(val) + '%'
                        },
                        legend: {
                            show: true,
                            position: 'bottom',
                            onItemClick: { toggleDataSeries: false }, // Disable legend click
                            onItemHover: { highlightDataSeries: false } // Disable legend hover
                        },
                        tooltip: { enabled: false }, // Disable tooltips
                        states: {
                            hover: { filter: { type: 'none' } }, // Disable hover states
                            active: { filter: { type: 'none' } } // Disable active states
                        }
                    }}
                    series={[
                        salesData?.stripe?.commission || 0,
                        salesData?.cod?.commission || 0
                    ]}
                    type="pie"
                    height={250}
                />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;