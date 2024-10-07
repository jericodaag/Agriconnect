import React, { useState } from 'react';
import { FaCamera, FaUserCircle, FaCheckCircle, FaCreditCard, FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { profile_image_upload } from '../../store/Reducers/authReducer';
import { create_stripe_connect_account } from '../../store/Reducers/sellerReducer';
import { Toaster } from 'react-hot-toast';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);

    const [passwordState, setPasswordState] = useState({
        email: '',
        old_password: '',
        new_password: ''
    });

    const add_image = (e) => {
        if (e.target.files.length > 0) {
            const formData = new FormData();
            formData.append('image', e.target.files[0]);
            dispatch(profile_image_upload(formData));
        }
    };

    const passwordInputHandle = (e) => {
        setPasswordState({
            ...passwordState,
            [e.target.name]: e.target.value
        });
    };

    const changePassword = (e) => {
        e.preventDefault();
        // Here you would dispatch an action to change the password
        console.log("Change password:", passwordState);
        // Implement the password change logic here
    };

    const InfoItem = ({ icon, label, value }) => (
        <div className="flex items-center space-x-3 mb-4">
            <div className="text-indigo-500 w-8">{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="font-medium text-gray-800">{value || 'Not provided'}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-8">
            <Toaster position="top-right" reverseOrder={false} />
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/3 bg-gradient-to-b from-indigo-600 to-purple-700 p-8 text-white">
                        <div className="text-center">
                            <div className="relative inline-block group">
                                {userInfo?.image ? (
                                    <img src={userInfo.image} alt={userInfo.name} className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105" />
                                ) : (
                                    <FaUserCircle className="w-40 h-40 text-gray-300" />
                                )}
                                <label htmlFor="profile-image" className="absolute bottom-2 right-2 bg-white p-2 rounded-full cursor-pointer shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-indigo-100">
                                    <FaCamera className="text-indigo-600 text-xl" />
                                </label>
                                <input id="profile-image" type="file" className="hidden" onChange={add_image} />
                            </div>
                        </div>
                        <h2 className="mt-6 text-3xl font-bold text-center">{userInfo.name}</h2>
                        <p className="text-center text-indigo-200 mb-6">{userInfo.email}</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-indigo-700 bg-opacity-40 p-4 rounded-lg">
                                <span className="font-medium">Role</span>
                                <span className="font-semibold bg-indigo-500 px-3 py-1 rounded-full text-sm">{userInfo.role}</span>
                            </div>
                            <div className="flex justify-between items-center bg-indigo-700 bg-opacity-40 p-4 rounded-lg">
                                <span className="font-medium">Status</span>
                                <span className="font-semibold bg-green-500 px-3 py-1 rounded-full text-sm">{userInfo.status}</span>
                            </div>
                            <div className="flex justify-between items-center bg-indigo-700 bg-opacity-40 p-4 rounded-lg">
                                <span className="font-medium">Payment Account</span>
                                {userInfo.payment === 'active' ? (
                                    <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full flex items-center">
                                        <FaCheckCircle className="mr-1" /> Active
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => dispatch(create_stripe_connect_account())}
                                        className="bg-yellow-500 text-white text-sm px-3 py-1 rounded-full flex items-center hover:bg-yellow-600 transition duration-300"
                                    >
                                        <FaCreditCard className="mr-1" /> Activate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="md:w-2/3 p-8">
                        <div className="flex mb-8 border-b">
                            {['profile', 'shop', 'password'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 px-6 font-semibold transition-colors duration-200 ${
                                        activeTab === tab 
                                            ? 'text-indigo-600 border-b-2 border-indigo-600' 
                                            : 'text-gray-500 hover:text-indigo-600'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab !== 'password' ? 'Info' : 'Change'}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                                    <InfoItem icon={<FaUserCircle size={20} />} label="Name" value={userInfo.name} />
                                    <InfoItem icon={<FaEnvelope size={20} />} label="Email" value={userInfo.email} />
                                    <InfoItem icon={<FaPhone size={20} />} label="Phone" value={userInfo.phone} />
                                    <InfoItem icon={<FaUserCircle size={20} />} label="Role" value={userInfo.role} />
                                    <InfoItem icon={<FaCheckCircle size={20} />} label="Status" value={userInfo.status} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'shop' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Shop Information</h3>
                                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                                    {userInfo?.shopInfo ? (
                                        <>
                                            <InfoItem icon={<FaStore size={20} />} label="Shop Name" value={userInfo.shopInfo.shopName} />
                                            <InfoItem icon={<FaMapMarkerAlt size={20} />} label="Division" value={userInfo.shopInfo.division} />
                                            <InfoItem icon={<FaMapMarkerAlt size={20} />} label="District" value={userInfo.shopInfo.district} />
                                            <InfoItem icon={<FaMapMarkerAlt size={20} />} label="Sub District" value={userInfo.shopInfo.sub_district} />
                                        </>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No shop information available</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Change Password</h3>
                                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                                    <form onSubmit={changePassword}>
                                        <div className="mb-4">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={passwordState.email}
                                                onChange={passwordInputHandle}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                                            <input
                                                type="password"
                                                id="old_password"
                                                name="old_password"
                                                value={passwordState.old_password}
                                                onChange={passwordInputHandle}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                            <input
                                                type="password"
                                                id="new_password"
                                                name="new_password"
                                                value={passwordState.new_password}
                                                onChange={passwordInputHandle}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Change Password
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;