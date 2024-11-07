import React, { useState, useEffect } from 'react';
import { 
    FaCamera, 
    FaUserCircle, 
    FaCheckCircle, 
    FaCreditCard, 
    FaStore, 
    FaMapMarkerAlt, 
    FaPhone, 
    FaEnvelope, 
    FaLock,
    FaIdCard,
    FaExclamationTriangle,
    FaDownload,
    FaSync,
    FaTimes
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { profile_image_upload, profile_info_add, messageClear, renew_seller_id } from '../../store/Reducers/authReducer';
import { create_stripe_connect_account } from '../../store/Reducers/sellerReducer';
import { Toaster, toast } from 'react-hot-toast';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const dispatch = useDispatch();
    const { userInfo, successMessage, errorMessage } = useSelector(state => state.auth);

    const [shopInfo, setShopInfo] = useState({
        shopName: userInfo?.shopInfo?.shopName || '',
        division: userInfo?.shopInfo?.division || '',
        district: userInfo?.shopInfo?.district || '',
        sub_district: userInfo?.shopInfo?.sub_district || ''
    });

    const [passwordState, setPasswordState] = useState({
        email: '',
        old_password: '',
        new_password: ''
    });

    // ID Renewal State
    const [showRenewalForm, setShowRenewalForm] = useState(false);
    const [renewalData, setRenewalData] = useState({
        idType: '',
        idNumber: '',
        idImage: null,
        reason: ''
    });
    const [renewalPreview, setRenewalPreview] = useState(null);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch]);

    useEffect(() => {
        if (userInfo?.shopInfo) {
            setShopInfo({
                shopName: userInfo.shopInfo.shopName || '',
                division: userInfo.shopInfo.division || '',
                district: userInfo.shopInfo.district || '',
                sub_district: userInfo.shopInfo.sub_district || ''
            });
        }
    }, [userInfo]);

    const add_image = (e) => {
        if (e.target.files.length > 0) {
            const formData = new FormData();
            formData.append('image', e.target.files[0]);
            dispatch(profile_image_upload(formData));
        }
    };

    const shopInfoInputHandle = (e) => {
        setShopInfo({
            ...shopInfo,
            [e.target.name]: e.target.value
        });
    };

    const submitShopInfo = (e) => {
        e.preventDefault();
        dispatch(profile_info_add(shopInfo));
    };

    const passwordInputHandle = (e) => {
        setPasswordState({
            ...passwordState,
            [e.target.name]: e.target.value
        });
    };

    const changePassword = (e) => {
        e.preventDefault();
        console.log("Change password:", passwordState);
    };

    const handleRenewalSubmit = async (e) => {
        e.preventDefault();
        if (!renewalData.idImage) {
            toast.error('Please select an ID image');
            return;
        }

        const formData = new FormData();
        formData.append('idType', renewalData.idType);
        formData.append('idNumber', renewalData.idNumber);
        formData.append('idImage', renewalData.idImage);
        formData.append('reason', renewalData.reason);

        try {
            await dispatch(renew_seller_id(formData)).unwrap();
            setShowRenewalForm(false);
            setRenewalPreview(null);
            setRenewalData({
                idType: '',
                idNumber: '',
                idImage: null,
                reason: ''
            });
            toast.success('ID renewal submitted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to submit ID renewal');
        }
    };

    const handleRenewalImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRenewalData({
                ...renewalData,
                idImage: file
            });
            setRenewalPreview(URL.createObjectURL(file));
        }
    };

    const handleDownloadId = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ID-${userInfo.name}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to download ID image');
        }
    };

    const getVerificationStatusColor = (status) => {
        const colors = {
            verified: 'bg-green-500 text-white',
            rejected: 'bg-red-500 text-white',
            pending: 'bg-yellow-500 text-white',
            pending_renewal: 'bg-blue-500 text-white'
        };
        return colors[status] || 'bg-gray-500 text-white';
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

    const renderIDRenewalForm = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Renew ID Verification</h3>
                    <button 
                        onClick={() => setShowRenewalForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleRenewalSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID Type
                        </label>
                        <select
                            value={renewalData.idType}
                            onChange={(e) => setRenewalData({...renewalData, idType: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="">Select ID Type</option>
                            {['SSS', 'UMID', 'Drivers License', 'Philippine Passport', 'PhilHealth', 'TIN', 'Postal ID'].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID Number
                        </label>
                        <input
                            type="text"
                            value={renewalData.idNumber}
                            onChange={(e) => setRenewalData({...renewalData, idNumber: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Renewal
                        </label>
                        <textarea
                            value={renewalData.reason}
                            onChange={(e) => setRenewalData({...renewalData, reason: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New ID Image
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {renewalPreview ? (
                                    <img
                                        src={renewalPreview}
                                        alt="ID Preview"
                                        className="mx-auto h-32 w-auto object-contain"
                                    />
                                ) : (
                                    <FaIdCard className="mx-auto h-12 w-12 text-gray-400" />
                                )}
                                <div className="flex text-sm text-gray-600">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                        <span>Upload a file</span>
                                        <input
                                            type="file"
                                            className="sr-only"
                                            onChange={handleRenewalImageChange}
                                            accept="image/*"
                                            required
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF up to 10MB
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowRenewalForm(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Submit Renewal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <Toaster position="top-right" reverseOrder={false} />
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="md:flex">
                    {/* Left Sidebar */}
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
                                <input id="profile-image" type="file" className="hidden" onChange={add_image} accept="image/*" />
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
                                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                                    userInfo.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}>
                                    {userInfo.status}
                                </span>
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
                            <div className="flex justify-between items-center bg-indigo-700 bg-opacity-40 p-4 rounded-lg">
                                <span className="font-medium">ID Verification</span>
                                {userInfo.identityVerification ? (
                                    <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                                        getVerificationStatusColor(userInfo.identityVerification.verificationStatus)
                                    }`}>
                                        {userInfo.identityVerification.verificationStatus.charAt(0).toUpperCase() + 
                                         userInfo.identityVerification.verificationStatus.slice(1)}
                                    </span>
                                ) : (
                                    <span className="font-semibold bg-gray-500 px-3 py-1 rounded-full text-sm">
                                        Not Submitted
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
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

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                                        <InfoItem icon={<FaUserCircle size={20} />} label="Name" value={userInfo.name} />
                                        <InfoItem icon={<FaEnvelope size={20} />} label="Email" value={userInfo.email} />
                                        <InfoItem icon={<FaPhone size={20} />} label="Phone" value={userInfo.phone} />
                                        <InfoItem icon={<FaUserCircle size={20} />} label="Role" value={userInfo.role} />
                                        <InfoItem icon={<FaCheckCircle size={20} />} label="Status" value={userInfo.status} />
                                    </div>
                                </div>

                                {/* ID Verification */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-2xl font-semibold text-gray-800">ID Verification</h3>
                                        {userInfo.identityVerification && 
                                         userInfo.identityVerification.verificationStatus !== 'pending' &&
                                         userInfo.identityVerification.verificationStatus !== 'pending_renewal' && (
                                            <button
                                                onClick={() => setShowRenewalForm(true)}
                                                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                            >
                                                <FaSync className="mr-2" />
                                                Renew ID
                                            </button>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                                        {userInfo.identityVerification ? (
                                            <>
                                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                                    <InfoItem 
                                                        icon={<FaIdCard size={20} />} 
                                                        label="ID Type" 
                                                        value={userInfo.identityVerification.idType} 
                                                    />
                                                    <InfoItem 
                                                        icon={<FaIdCard size={20} />} 
                                                        label="ID Number" 
                                                        value={userInfo.identityVerification.idNumber} 
                                                    />
                                                </div>
                                                
                                                <div className="mb-6">
                                                    <InfoItem 
                                                        icon={<FaCheckCircle size={20} />} 
                                                        label="Verification Status" 
                                                        value={
                                                            <span className={`px-2 py-1 rounded-full text-sm ${
                                                                getVerificationStatusColor(userInfo.identityVerification.verificationStatus)
                                                            }`}>
                                                                {userInfo.identityVerification.verificationStatus.charAt(0).toUpperCase() + 
                                                                 userInfo.identityVerification.verificationStatus.slice(1)}
                                                            </span>
                                                        }
                                                    />
                                                </div>
                                                
                                                {userInfo.identityVerification.verificationStatus === 'rejected' && (
                                                    <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                                                        <div className="flex items-center">
                                                            <FaExclamationTriangle className="text-red-500 mr-2" />
                                                            <p className="text-sm font-medium text-red-800">
                                                                Rejection Reason: {userInfo.identityVerification.rejectionReason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {userInfo.identityVerification.idImage && (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700 mb-2">ID Document</p>
                                                        <div className="relative group">
                                                            <img 
                                                                src={userInfo.identityVerification.idImage} 
                                                                alt="ID Document" 
                                                                className="w-full max-w-md h-auto rounded-lg border border-gray-200 shadow-sm"
                                                            />
                                                            <button
                                                                onClick={() => handleDownloadId(userInfo.identityVerification.idImage)}
                                                                className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
                                                            >
                                                                <FaDownload className="text-gray-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-8">
                                                <FaIdCard size={40} className="mx-auto text-gray-400 mb-3" />
                                                <p className="text-gray-500">No ID verification information submitted.</p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    Please contact support if you need to update your ID verification.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shop Tab */}
                        {activeTab === 'shop' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Shop Information</h3>
                                {userInfo.shopInfo && Object.keys(userInfo.shopInfo).some(key => userInfo.shopInfo[key]) && (
                                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
                                        <InfoItem icon={<FaStore size={20} />} label="Shop Name" value={userInfo.shopInfo.shopName} />
                                        <InfoItem icon={<FaMapMarkerAlt size={20} />} label="Division" value={userInfo.shopInfo.division} />
                                        <InfoItem icon={<FaMapMarkerAlt size={20} />} label="District" value={userInfo.shopInfo.district} />
                                        <InfoItem icon={<FaMapMarkerAlt size={20} />} label="Sub District" value={userInfo.shopInfo.sub_district} />
                                    </div>
                                )}
                                <form onSubmit={submitShopInfo} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                                    <div className="mb-4">
                                        <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                                        <input
                                            type="text"
                                            id="shopName"
                                            name="shopName"
                                            value={shopInfo.shopName}
                                            onChange={shopInfoInputHandle}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                                        <input
                                            type="text"
                                            id="division"
                                            name="division"
                                            value={shopInfo.division}
                                            onChange={shopInfoInputHandle}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                        <input
                                            type="text"
                                            id="district"
                                            name="district"
                                            value={shopInfo.district}
                                            onChange={shopInfoInputHandle}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="sub_district" className="block text-sm font-medium text-gray-700 mb-1">Sub District</label>
                                        <input
                                            type="text"
                                            id="sub_district"
                                            name="sub_district"
                                            value={shopInfo.sub_district}
                                            onChange={shopInfoInputHandle}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Update Shop Information
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Password Tab */}
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

            {/* ID Renewal Modal */}
            {showRenewalForm && renderIDRenewalForm()}
        </div>
    );
};

export default Profile;