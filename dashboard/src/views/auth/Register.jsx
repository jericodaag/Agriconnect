import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaUser,
    FaEnvelope,
    FaLock,
    FaStore,
    FaMapMarkerAlt,
    FaIdCard,
    FaTimes
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import { seller_register, messageClear } from '../../store/Reducers/authReducer';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loader, successMessage, errorMessage } = useSelector(state => state.auth);
    
    const [showTerms, setShowTerms] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    
    const [state, setState] = useState({
        name: "",
        email: "",
        password: "",
        shopName: "",
        division: "",
        district: "",
        idType: "",
        idNumber: "",
        idImage: null
    });

    const [previewImage, setPreviewImage] = useState(null);

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setState({
                ...state,
                idImage: file
            });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (!termsAccepted) {
            toast.error('Please accept the Terms and Conditions');
            return;
        }
        const formData = new FormData();
        Object.keys(state).forEach(key => {
            formData.append(key, state[key]);
        });
        dispatch(seller_register(formData));
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            navigate('/');
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, navigate]);

    const idTypes = [
        'SSS',
        'UMID',
        'Drivers License',
        'Philippine Passport',
        'PhilHealth',
        'TIN',
        'Postal ID'
    ];

    return (
        <div className='min-h-screen flex flex-col-reverse md:flex-row'>
            {/* Left Side - Image (hidden on mobile) */}
            <div className='hidden md:block md:w-2/5 relative'>
                <div className='absolute inset-0 bg-black/30'></div>
                <img 
                    src="/images/register.jpg" 
                    alt="Fresh Produce"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center p-8">
                    <div className="max-w-lg">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Join AgriConnect Today</h2>
                        <p className="text-white/90 text-sm leading-relaxed">
                            Transform your agricultural business by joining our growing community
                            of farmers and sellers. Connect directly with customers and expand
                            your market reach.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className='w-full md:w-3/5 p-4 md:p-6 lg:p-8 overflow-y-auto'>
                <div className='max-w-2xl mx-auto'>
                    <div className='text-center mb-6'>
                        <h2 className='text-2xl md:text-3xl font-bold text-gray-800'>Create Seller Account</h2>
                        <p className='text-sm text-gray-600 mt-1'>Join AgriConnect and start selling your products</p>
                    </div>

                    <form onSubmit={submit} className='space-y-6'>
                        {/* Personal Information */}
                        <div className='space-y-4'>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Personal Information</h3>
                            <div className='grid gap-4 md:grid-cols-2'>
                                <div className="relative">
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                                        <FaUser className={`h-4 w-4 ${focusedInput === 'name' ? 'text-[#059473]' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={state.name}
                                        onChange={inputHandle}
                                        onFocus={() => setFocusedInput('name')}
                                        onBlur={() => setFocusedInput(null)}
                                        className='w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#059473] focus:border-[#059473] bg-white'
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                                        <FaEnvelope className={`h-4 w-4 ${focusedInput === 'email' ? 'text-[#059473]' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={state.email}
                                        onChange={inputHandle}
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                        className='w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#059473] focus:border-[#059473] bg-white'
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                                        <FaLock className={`h-4 w-4 ${focusedInput === 'password' ? 'text-[#059473]' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={state.password}
                                        onChange={inputHandle}
                                        onFocus={() => setFocusedInput('password')}
                                        onBlur={() => setFocusedInput(null)}
                                        className='w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#059473] focus:border-[#059473] bg-white'
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shop Information */}
                        <div className='space-y-4'>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Shop Information</h3>
                            <div className='grid gap-4 md:grid-cols-2'>
                                <div className="relative">
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                                        <FaStore className={`h-4 w-4 ${focusedInput === 'shopName' ? 'text-[#059473]' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="shopName"
                                        placeholder="Shop Name"
                                        value={state.shopName}
                                        onChange={inputHandle}
                                        onFocus={() => setFocusedInput('shopName')}
                                        onBlur={() => setFocusedInput(null)}
                                        className='w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#059473] focus:border-[#059473] bg-white'
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                                        <FaMapMarkerAlt className={`h-4 w-4 ${focusedInput === 'district' ? 'text-[#059473]' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="district"
                                        placeholder="District"
                                        value={state.district}
                                        onChange={inputHandle}
                                        onFocus={() => setFocusedInput('district')}
                                        onBlur={() => setFocusedInput(null)}
                                        className='w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#059473] focus:border-[#059473] bg-white'
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                                        <FaMapMarkerAlt className={`h-4 w-4 ${focusedInput === 'division' ? 'text-[#059473]' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="division"
                                        placeholder="Division"
                                        value={state.division}
                                        onChange={inputHandle}
                                        onFocus={() => setFocusedInput('division')}
                                        onBlur={() => setFocusedInput(null)}
                                        className='w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#059473] focus:border-[#059473] bg-white'
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ID Verification */}
                        <div className='space-y-4'>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">ID Verification</h3>
                            <div className='grid gap-4 md:grid-cols-2'>
                                <div className="relative">
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                                        <FaIdCard className={`h-4 w-4 ${focusedInput === 'idType' ? 'text-[#059473]' : 'text-gray-400'}`} />
                                    </div>
                                    <select
                                        name="idType"
                                        value={state.idType}
                                        onChange={inputHandle}
                                        onFocus={() => setFocusedInput('idType')}
                                        onBlur={() => setFocusedInput(null)}
                                        className='w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#059473] focus:border-[#059473] bg-white'
                                        required
                                    >
                                        <option value="">Select ID Type</option>
                                        {idTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative">
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                                        <FaIdCard className={`h-4 w-4 ${focusedInput === 'idNumber' ? 'text-[#059473]' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="idNumber"
                                        placeholder="ID Number"
                                        value={state.idNumber}
                                        onChange={inputHandle}
                                        onFocus={() => setFocusedInput('idNumber')}
                                        onBlur={() => setFocusedInput(null)}
                                        className='w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#059473] focus:border-[#059473] bg-white'
                                        required
                                    />
                                </div>
                            </div>

                            {/* ID Image Upload */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload ID Image</label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#059473] transition-colors">
                                    <input
                                        type="file"
                                        name="idImage"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                        required
                                    />
                                    <div className="text-center">
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="ID Preview"
                                                className="mx-auto h-32 object-contain mb-2"
                                            />
                                        ) : (
                                            <>
                                                <FaIdCard className="mx-auto h-8 w-8 text-gray-400" />
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Click or drag file to upload
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Supports: JPG, PNG (Max 5MB)
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms and Register Button */}
                        <div className='space-y-4'>
                            <label className='flex items-center space-x-2 text-sm'>
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={() => setShowTerms(true)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#059473] focus:ring-[#059473]"
                                    required
                                />
                                <span className='text-gray-600'>
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        onClick={() => setShowTerms(true)}
                                        className='text-[#059473] hover:text-[#048066] font-medium'
                                    >
                                        Terms and Conditions
                                    </button>
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={loader || !termsAccepted}
                                className='w-full py-2.5 bg-[#059473] text-white text-sm font-medium rounded-lg hover:bg-[#048066] transition-colors duration-200 disabled:opacity-50'
                            >
                                {loader ? <PropagateLoader size={8} color="#ffffff" /> : 'Create Seller Account'}
                            </button>

                            <p className='text-center text-sm text-gray-600'>
                                Already have an account?{' '}
                                <Link to="/login" className='text-[#059473] hover:text-[#048066] font-medium'>
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>


        {/* Terms and Conditions Modal */}
        {showTerms && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-4 bg-[#059473] flex justify-between items-center rounded-t-lg">
                        <h3 className="text-lg font-semibold text-white">Terms and Conditions</h3>
                        <button
                            onClick={() => setShowTerms(false)}
                            className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                        >
                            <FaTimes className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="p-4 overflow-y-auto flex-1" style={{ maxHeight: 'calc(70vh - 120px)' }}>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-semibold mb-2">1. Seller Eligibility</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                    <li>Must be at least 18 years of age</li>
                                    <li>Must be a legitimate agricultural product seller or farmer</li>
                                    <li>Must provide valid government-issued identification</li>
                                    <li>Must have the legal right to sell agricultural products</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-2">2. Product Guidelines</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                    <li>Only agricultural and farm-related products may be sold</li>
                                    <li>Products must comply with local agricultural standards</li>
                                    <li>Accurate product descriptions and images required</li>
                                    <li>Sellers must maintain product quality and freshness</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-2">3. Seller Responsibilities</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                    <li>Maintain accurate inventory information</li>
                                    <li>Process orders within 24 hours</li>
                                    <li>Provide fair and transparent pricing</li>
                                    <li>Ensure proper packaging and handling</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-2">4. Platform Fees & Payments</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                    <li>Platform fee structure clearly defined</li>
                                    <li>Payment processing timelines specified</li>
                                    <li>Refund and cancellation policies</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Fixed at bottom */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg mt-auto">
                        <button
                            onClick={() => {
                                setTermsAccepted(true);
                                setShowTerms(false);
                            }}
                            className="w-full bg-[#059473] hover:bg-[#048066] text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
                        >
                            Accept Terms & Conditions
                        </button>
                    </div>
                </div>
            </div>
        )}
        {/* Loading Overlay */}
        {loader && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <PropagateLoader color="#059473" />
            </div>
        )}
    </div>
);
};

export default Register;