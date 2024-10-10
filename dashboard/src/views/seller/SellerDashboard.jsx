import React, { useEffect } from 'react';
import { MdCurrencyExchange, MdProductionQuantityLimits, MdPendingActions } from "react-icons/md";
import { FaCartShopping } from "react-icons/fa6"; 
import Chart from 'react-apexcharts';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_seller_dashboard_data } from '../../store/Reducers/dashboardReducer';
import moment from 'moment';
import RecentMessages from '../../components/RecentMessages.jsx';

const SellerDashboard = () => {
    const dispatch = useDispatch();
    const { totalSale, totalOrder, totalProduct, totalPendingOrder, recentOrder, recentMessages } = useSelector(state => state.dashboard);
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(get_seller_dashboard_data());
    }, [dispatch]);

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
            labels: { style: { colors: '#64748B' } },
            title: { text: 'Amount', style: { color: '#64748B' } }
        },
        fill: { opacity: 1 },
        tooltip: { y: { formatter: function (val) { return "₱ " + val } } },
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
        { name: "Orders", data: [23,34,45,56,76,34,23,76,87,78,34,45] },
        { name: "Revenue", data: [67,39,45,56,90,56,23,56,87,78,67,78] },
        { name: "Sales", data: [34,39,56,56,80,67,23,56,98,78,45,56] },
    ];

    return (
        <div className='p-4 bg-gray-50'>
            <h1 className='text-2xl font-bold text-gray-800 mb-6'>Seller Dashboard</h1>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                {[
                    { title: 'Total Sales', value: `₱${totalSale.toLocaleString('en-PH')}`, icon: <MdCurrencyExchange />, color: 'bg-blue-500' },
                    { title: 'Products', value: totalProduct, icon: <MdProductionQuantityLimits />, color: 'bg-green-500' },
                    { title: 'Orders', value: totalOrder, icon: <FaCartShopping />, color: 'bg-yellow-500' },
                    { title: 'Pending Orders', value: totalPendingOrder, icon: <MdPendingActions />, color: 'bg-red-500' },
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
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Sales Overview</h2>
                    <Chart options={chartOptions} series={series} type='bar' height={350} />
                </div>
                <RecentMessages messages={recentMessages} userInfo={userInfo} isAdmin={false} />
            </div>

            <div className='bg-white rounded-lg shadow-sm p-4 overflow-x-auto'>
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
                            <th className='px-6 py-3'>Order Status</th>
                            <th className='px-6 py-3'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrder.map((d, i) => (
                            <tr key={i} className='bg-white border-b hover:bg-gray-50'>
                                <td className='px-6 py-4 font-medium text-gray-900'>#{d._id}</td>
                                <td className='px-6 py-4'>₱{d.price}</td>
                                <td className='px-6 py-4'>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        d.payment_status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {d.payment_status}
                                    </span>
                                </td>
                                <td className='px-6 py-4'>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        d.delivery_status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        d.delivery_status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
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
        </div>
    );
};

export default SellerDashboard;