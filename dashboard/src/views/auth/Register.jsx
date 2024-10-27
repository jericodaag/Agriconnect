import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaTimes, 
    FaFileContract, 
    FaUserShield, 
    FaListAlt, 
    FaHandshake, 
    FaMoneyBillWave,
    FaCheckCircle, 
    FaExclamationTriangle, 
    FaBalanceScale,
    FaUser,
    FaEnvelope,
    FaLock,
    FaStore,
    FaMapMarkerAlt,
    FaIdCard
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
    const [focusedInput, setFocusedInput] = useState(null);

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

    const TermsAndConditions = () => (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 ${showTerms ? '' : 'hidden'}`}>
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Enhanced Header */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FaFileContract className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Terms and Conditions</h2>
                    </div>
                    <button 
                        onClick={() => setShowTerms(false)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                    >
                        <FaTimes className="w-6 h-6 text-white" />
                    </button>
                </div>
    
                {/* Terms Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <section className="p-6 rounded-xl transition-all duration-300 hover:bg-blue-50">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <FaUserShield className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800">1. Introduction</h3>
                                    <p className="text-gray-600">Welcome to AgriConnect, an agricultural e-commerce platform. By registering as a seller, you agree to be bound by these terms and conditions.</p>
                                </div>
                            </div>
                        </section>
    
                        {/* Seller Eligibility */}
                        <section className="p-6 rounded-xl transition-all duration-300 hover:bg-blue-50">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <FaCheckCircle className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800">2. Seller Eligibility</h3>
                                    <ul className="space-y-2">
                                        {['Must be at least 18 years old',
                                          'Must be a legitimate agricultural product seller or farmer',
                                          'Must provide valid government-issued identification',
                                          'Must have the legal right to sell agricultural products'
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-center space-x-2 text-gray-600">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
    
                        {/* Product Guidelines */}
                        <section className="p-6 rounded-xl hover:bg-purple-50 transition-all duration-300">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <FaListAlt className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800">3. Product Guidelines</h3>
                                    <ul className="space-y-2">
                                        {['Only agricultural and farm-related products may be sold',
                                          'All products must comply with Philippine agricultural standards',
                                          'Products must be accurately described and photographed',
                                          'Sellers must maintain product quality and freshness',
                                          'Prohibited items include illegal substances and harmful chemicals'
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-center space-x-2 text-gray-600">
                                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
    
                        {/* Seller Responsibilities */}
                        <section className="p-6 rounded-xl hover:bg-orange-50 transition-all duration-300">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <FaHandshake className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800">4. Seller Responsibilities</h3>
                                    <ul className="space-y-2">
                                        {['Maintain accurate inventory information',
                                          'Process orders within 24 hours',
                                          'Provide fair and transparent pricing',
                                          'Ensure proper packaging and handling of products',
                                          'Respond to customer inquiries promptly'
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-center space-x-2 text-gray-600">
                                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
    
                        {/* Commission and Payments */}
                        <section className="p-6 rounded-xl hover:bg-indigo-50 transition-all duration-300">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <FaMoneyBillWave className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800">5. Commission and Payments</h3>
                                    <ul className="space-y-2">
                                        {['AgriConnect charges a 5% commission on each sale',
                                          'Payments are processed within 3-5 business days',
                                          'Sellers must maintain valid payment information',
                                          'All transactions must be processed through the platform'
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-center space-x-2 text-gray-600">
                                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
    
                        {/* Account Suspension */}
                        <section className="p-6 rounded-xl hover:bg-red-50 transition-all duration-300">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <FaExclamationTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800">6. Account Suspension</h3>
                                    <p className="text-gray-600 mb-2">AgriConnect reserves the right to suspend or terminate accounts for:</p>
                                    <ul className="space-y-2">
                                        {['Violation of terms and conditions',
                                          'Selling prohibited items',
                                          'Poor customer service',
                                          'Fraudulent activities'
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-center space-x-2 text-gray-600">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
    
                        {/* Dispute Resolution */}
                        <section className="p-6 rounded-xl hover:bg-teal-50 transition-all duration-300">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                    <FaBalanceScale className="w-6 h-6 text-teal-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800">7. Dispute Resolution</h3>
                                    <ul className="space-y-2">
                                        {['Commitment to resolve customer complaints',
                                          'Participation in platform\'s dispute resolution process',
                                          'Adherence to refund policies',
                                          'Cooperation with investigation procedures'
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-center space-x-2 text-gray-600">
                                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
    
                {/* Enhanced Accept Button */}
                <div className="sticky bottom-0 p-6 bg-white border-t border-gray-200">
                    <button
                        onClick={() => {
                            setTermsAccepted(true);
                            setShowTerms(false);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl px-6 py-4 font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        I Accept the Terms and Conditions
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className='min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex justify-center items-center px-6 py-12 sm:px-8'>
            <div className='w-full max-w-4xl'>
                <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
                    <div className='p-8 sm:p-10'>
                        <div className='text-center mb-10'>
                            <h2 className='text-4xl font-bold text-gray-800 mb-3'>Create Account</h2>
                            <p className='text-gray-600 text-lg'>Join AgriConnect and start your journey</p>
                        </div>

                        <form onSubmit={submit} className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                            {/* Left Column - Personal & Shop Info */}
                            <div className='space-y-6'>
                                {/* Personal Information */}
                                <div className='space-y-6'>
                                    <div className="relative">
                                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                            <FaUser className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'name' ? 'text-blue-500' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            onChange={inputHandle}
                                            value={state.name}
                                            onFocus={() => setFocusedInput('name')}
                                            onBlur={() => setFocusedInput(null)}
                                            className='w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white focus:outline-none transition-all duration-200 text-base'
                                            type="text"
                                            name='name'
                                            placeholder='Full Name'
                                            required
                                        />
                                    </div>

                                    <div className="relative">
                                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                            <FaEnvelope className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'email' ? 'text-blue-500' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            onChange={inputHandle}
                                            value={state.email}
                                            onFocus={() => setFocusedInput('email')}
                                            onBlur={() => setFocusedInput(null)}
                                            className='w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white focus:outline-none transition-all duration-200 text-base'
                                            type="email"
                                            name='email'
                                            placeholder='Email Address'
                                            required
                                        />
                                    </div>

                                    <div className="relative">
                                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                            <FaLock className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'password' ? 'text-blue-500' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            onChange={inputHandle}
                                            value={state.password}
                                            onFocus={() => setFocusedInput('password')}
                                            onBlur={() => setFocusedInput(null)}
                                            className='w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white focus:outline-none transition-all duration-200 text-base'
                                            type="password"
                                            name='password'
                                            placeholder='Password'
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Shop Information */}
                                <div className='space-y-6'>
                                    <div className="relative">
                                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                            <FaStore className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'shopName' ? 'text-blue-500' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            onChange={inputHandle}
                                            value={state.shopName}
                                            onFocus={() => setFocusedInput('shopName')}
                                            onBlur={() => setFocusedInput(null)}
                                            className='w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white focus:outline-none transition-all duration-200 text-base'
                                            type="text"
                                            name='shopName'
                                            placeholder='Shop Name'
                                            required
                                        />
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className="relative">
                                            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                                <FaMapMarkerAlt className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'division' ? 'text-blue-500' : 'text-gray-400'}`} />
                                            </div>
                                            <input
                                                onChange={inputHandle}
                                                value={state.division}
                                                onFocus={() => setFocusedInput('division')}
                                                onBlur={() => setFocusedInput(null)}
                                                className='w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white focus:outline-none transition-all duration-200 text-base'
                                                type="text"
                                                name='division'
                                                placeholder='Division'
                                                required
                                            />
                                        </div>

                                        <div className="relative">
                                            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                                <FaMapMarkerAlt className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'district' ? 'text-blue-500' : 'text-gray-400'}`} />
                                            </div>
                                            <input
                                                onChange={inputHandle}
                                                value={state.district}
                                                onFocus={() => setFocusedInput('district')}
                                                onBlur={() => setFocusedInput(null)}
                                                className='w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white focus:outline-none transition-all duration-200 text-base'
                                                type="text"
                                                name='district'
                                                placeholder='District'
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - ID Verification */}
                            <div className='space-y-6'>
                                <div className='space-y-6'>
                                    <div className="relative">
                                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                            <FaIdCard className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'idType' ? 'text-blue-500' : 'text-gray-400'}`} />
                                        </div>
                                        <select
                                            onChange={inputHandle}
                                            value={state.idType}
                                            name="idType"
                                            onFocus={() => setFocusedInput('idType')}
                                            onBlur={() => setFocusedInput(null)}
                                            className='w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white focus:outline-none transition-all duration-200 text-base'
                                            required
                                        >
                                            <option value="">Select ID Type</option>
                                            {idTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="relative">
                                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                            <FaIdCard className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'idNumber' ? 'text-blue-500' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            onChange={inputHandle}
                                            value={state.idNumber}
                                            onFocus={() => setFocusedInput('idNumber')}
                                            onBlur={() => setFocusedInput(null)}
                                            className='w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white focus:outline-none transition-all duration-200 text-base'
                                            type="text"
                                            name='idNumber'
                                            placeholder='ID Number'
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Upload ID Image
                                    </label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300">
                                            <div className="flex flex-col items-center justify-center pt-7">
                                                {previewImage ? (
                                                    <img
                                                        src={previewImage}
                                                        alt="ID Preview"
                                                        className="w-auto h-32 object-contain mb-2"
                                                    />
                                                ) : (
                                                    <>
                                                        <svg className="w-12 h-12 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        <p className="text-sm text-gray-600">Drag and drop or click to select</p>
                                                        <p className="text-xs text-gray-500 mt-1">Support: JPG, PNG, GIF (Max 5MB)</p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                className="opacity-0"
                                                name="idImage"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                required
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className='space-y-6'>
                                    <div className='flex items-center'>
                                        <input
                                            className='w-4 h-4 border-2 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-0'
                                            type="checkbox"
                                            name="terms"
                                            id="terms"
                                            checked={termsAccepted}
                                            onChange={() => setShowTerms(true)}
                                            required
                                        />
                                        <label htmlFor="terms" className='ml-2 text-sm text-gray-600'>
                                            I agree to the{' '}
                                            <button 
                                                type="button"
                                                onClick={() => setShowTerms(true)}
                                                className='text-blue-500 hover:text-blue-700 transition-colors duration-200 hover:underline'
                                            >
                                                Terms and Conditions
                                            </button>
                                        </label>
                                    </div>

                                    <button
                                        disabled={loader}
                                        className='w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-4 font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    >
                                        {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Create Account'}
                                    </button>

                                    {/* Sign In Link */}
                                    <div className='text-center'>
                                        <p className='text-gray-600 text-base'>
                                            Already have an account?{' '}
                                            <Link
                                                to="/login"
                                                className='text-blue-500 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline'
                                            >
                                                Sign In
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions Modal */}
            <TermsAndConditions />
        </div>
    );
};

export default Register;