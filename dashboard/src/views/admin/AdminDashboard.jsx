import React, { useEffect } from 'react';
import { MdCurrencyExchange, MdProductionQuantityLimits } from "react-icons/md";
import { FaUsers, FaCartShopping } from "react-icons/fa6"; 
import Chart from 'react-apexcharts';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_admin_dashboard_data } from '../../store/Reducers/dashboardReducer';
import moment from 'moment';
import seller from '../../assets/seller.png';
import admin from '../../assets/admin.jpg'; // Assume you have an admin avatar

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { totalSale, totalOrder, totalProduct, totalSeller, recentOrder, recentMessages } = useSelector(state => state.dashboard);
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(get_admin_dashboard_data());
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
        { name: "Orders", data: [23000,34000,45000,56000,76000,34000,23000,76000,87000,78000,34000,45000] },
        { name: "Revenue", data: [67000,39000,45000,56000,90000,56000,23000,56000,87000,78000,67000,78000] },
        { name: "Sellers", data: [34000,39000,56000,56000,80000,67000,23000,56000,98000,78000,45000,56000] },
    ];

    const getUserType = (senderId, senderName) => {
        if (senderId === userInfo._id) return 'You';
        return 'Seller';
    };
    
    const getAvatar = (senderId) => {
        if (senderId === userInfo._id) return admin;
        return seller;
    };

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
                    <Chart options={chartOptions} series={series} type='bar' height={350} />
                </div>
                <div className='bg-white rounded-lg shadow-sm p-4'>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-lg font-semibold text-gray-800'>Recent Seller Messages</h2>
                        <Link to="/admin/chats" className='text-sm text-blue-600 hover:underline'>View All</Link>
                    </div>
                    <div className='space-y-4'>
                        {recentMessages && recentMessages.map((m, i) => (
                            <div key={i} className='flex items-start space-x-3'>
                                <img className='w-10 h-10 rounded-full' src={getAvatar(m.senderId)} alt="" />
                                <div>
                                    <p className='font-medium text-gray-800'>
                                        <span className={`${m.senderId === userInfo._id ? 'text-red-600' : 'text-blue-600'}`}>
                                            {getUserType(m.senderId, m.senderName)}
                                        </span>
                                        {m.senderId !== userInfo._id && (
                                            <>
                                                <span className="text-gray-500"> to </span>
                                                <span className="text-green-600">You</span>
                                            </>
                                        )}
                                    </p>
                                    <p className='text-sm text-gray-600 truncate'>{m.message}</p>
                                    <p className='text-xs text-gray-400'>{moment(m.createdAt).fromNow()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-4 overflow-x-auto'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-lg font-semibold text-gray-800'>Recent Orders</h2>
                    <Link to="/admin/dashboard/orders" className='text-sm text-blue-600 hover:underline'>View All</Link>
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
                        {recentOrder && recentOrder.map((d, i) => (
                            <tr key={i} className='bg-white border-b hover:bg-gray-50'>
                                <td className='px-6 py-4 font-medium text-gray-900'>#{d._id}</td>
                                <td className='px-6 py-4'>₱{d.price.toLocaleString('en-PH')}</td>
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
                                    <Link to={`/admin/dashboard/order/details/${d._id}`} className='text-blue-600 hover:underline'>View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;