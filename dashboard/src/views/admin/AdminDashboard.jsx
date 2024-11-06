import React, { useEffect, useState, useCallback } from 'react';
import { MdCurrencyExchange, MdProductionQuantityLimits } from "react-icons/md";
import { FaUsers, FaCartShopping } from "react-icons/fa6"; 
import Chart from 'react-apexcharts';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_admin_dashboard_data } from '../../store/Reducers/dashboardReducer';
import RecentMessages from '../../components/RecentMessages.jsx';
import { LuEye } from "react-icons/lu";

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { totalSale, totalOrder, totalProduct, totalSeller, recentOrder, recentMessages, chartData, productStatusCounts } = useSelector(state => state.dashboard);
    const { userInfo } = useSelector(state => state.auth);
    
    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'warehouse':
                return 'bg-indigo-100 text-indigo-800';
            case 'placed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'paid':
                return 'bg-emerald-100 text-emerald-800';
            case 'unpaid':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const fetchDashboardData = useCallback(() => {
        dispatch(get_admin_dashboard_data({
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }));
    }, [dispatch]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

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
                    return " " + value.toLocaleString('en-PH');
                }
            },
            title: { text: 'Amount (PHP)', style: { color: '#64748B' } }
        },
        fill: { opacity: 1 },
        tooltip: { 
            y: { 
                formatter: function (val) { 
                    return " " + val.toLocaleString('en-PH');
                } 
            } 
        },
        legend: { position: 'top' },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: { height: 300 },
                legend: { position: 'bottom' }
            }
        }]
    };

    const series = [
        { name: "Orders", data: chartData.map(data => data.totalOrders) },
        { name: "Revenue", data: chartData.map(data => data.totalRevenue) },
        { name: "Sellers", data: chartData.map(data => data.totalSellers) },
    ];

    const roundToHundred = (arr) => {
        const rounded = arr.map(num => Math.round(num));
        const sum = rounded.reduce((a, b) => a + b, 0);
        const diff = 100 - sum;
        
        if (diff !== 0) {
            // Find the index of the largest value
            const maxIndex = rounded.indexOf(Math.max(...rounded));
            // Adjust the largest value
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
        productStatusCounts.pending,
        productStatusCounts.processing,
        productStatusCounts.warehouse,
        productStatusCounts.placed,
        productStatusCounts.cancelled
    ];

    const radialSeries = roundToHundred(originalSeries);

    return (
        <div className='p-4 bg-gray-50'>
            <h1 className='text-2xl font-bold text-gray-800 mb-6'>Admin Dashboard</h1>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                {[
                    { title: 'Total Sales', value: `₱${totalSale.toLocaleString('en-PH')}`, icon: <MdCurrencyExchange />, color: 'bg-blue-500' },
                    { title: 'Products', value: totalProduct, icon: <MdProductionQuantityLimits />, color: 'bg-green-500' },
                    { title: 'Sellers', value: totalSeller, icon: <FaUsers />, color: 'bg-yellow-500' },
                    { title: 'Orders', value: totalOrder, icon: <FaCartShopping />, color: 'bg-purple-500' },
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

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                <div className='lg:col-span-2 bg-white rounded-lg shadow-sm p-4'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Performance Overview</h2>
                    {chartData.length > 0 && (
                        <Chart options={chartOptions} series={series} type='bar' height={350} />
                    )}
                </div>
                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Order Status</h2>
                    <Chart options={radialChartOptions} series={radialSeries} type="radialBar" height={350} />
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
            <div className='lg:col-span-2 bg-white rounded-lg shadow-sm p-4 overflow-x-auto'>
            <div className='flex justify-between items-center mb-4'>
        <div>
            <h2 className='text-lg font-semibold text-gray-800'>Recent Orders</h2>
            <p className='text-sm text-gray-500'>Latest transactions</p>
        </div>
        <Link 
            to="/admin/dashboard/orders" 
            className='inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#438206] hover:text-[#61BD12] transition duration-300 ease-in-out'
        >
            <span>View All</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
        </Link>
    </div>
    <table className='w-full text-sm text-left text-gray-500'>
        <thead className='text-xs text-gray-700 uppercase bg-gray-50 border-b'>
            <tr>
                <th className='px-6 py-3'>Order ID</th>
                <th className='px-6 py-3'>Date</th>
                <th className='px-6 py-3'>Price</th>
                <th className='px-6 py-3'>Payment Status</th>
                <th className='px-6 py-3'>Order Status</th>
                <th className='px-6 py-3'>Action</th>
            </tr>
        </thead>
        <tbody>
            {recentOrder && recentOrder.map((d, i) => {
                const paymentStatusColor = getStatusColor(d.payment_status);
                const deliveryStatusColor = getStatusColor(d.delivery_status);
                
                return (
                    <tr key={i} className='bg-white border-b hover:bg-gray-50/50 transition duration-150 ease-in-out'>
                        <td className='px-6 py-4'>
                            <span className='font-medium text-gray-900'>#{d._id}</span>
                        </td>
                        <td className='px-6 py-4'>
                            <div>
                                <div className='text-gray-900'>
                                    {new Intl.DateTimeFormat('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }).format(new Date(d.createdAt))}
                                </div>
                                <div className='text-xs text-gray-500'>
                                    {new Intl.DateTimeFormat('en-US', {
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: true
                                    }).format(new Date(d.createdAt))}
                                </div>
                            </div>
                        </td>
                        <td className='px-6 py-4 font-medium text-gray-900'>
                            ₱{d.price.toLocaleString('en-PH')}
                        </td>
                        <td className='px-6 py-4'>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusColor}`}>
                                {d.payment_status}
                            </span>
                        </td>
                        <td className='px-6 py-4'>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${deliveryStatusColor}`}>
                                {d.delivery_status}
                            </span>
                        </td>
                        <td className='px-6 py-4'>
                            <Link 
                                to={`/admin/dashboard/order/details/${d._id}`}
                                className='inline-flex items-center gap-1.5 text-[#438206] hover:text-[#61BD12] transition duration-300 ease-in-out'
                            >
                                <LuEye size={16} />
                                <span>View</span>
                            </Link>
                        </td>
                    </tr>
                );
            })}
            {(!recentOrder || recentOrder.length === 0) && (
                <tr>
                    <td colSpan="6" className='px-6 py-8 text-center text-gray-500'>
                        No recent orders found
                    </td>
                </tr>
            )}
        </tbody>
    </table>
</div>
                <RecentMessages messages={recentMessages} userInfo={userInfo} isAdmin={true} />
            </div>
        </div>
    );
};

export default AdminDashboard;