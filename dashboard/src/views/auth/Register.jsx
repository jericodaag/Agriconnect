import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaIdCard, FaStore, FaMapMarkerAlt, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import { seller_register, messageClear } from '../../store/Reducers/authReducer';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loader, successMessage, errorMessage } = useSelector(state => state.auth);
    
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
                                            required
                                        />
                                        <label htmlFor="terms" className='ml-2 text-sm text-gray-600'>
                                            I agree to the <Link to="/terms" className='text-blue-500 hover:text-blue-700 transition-colors duration-200 hover:underline'>Terms and Conditions</Link>
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
        </div>
    );
};

export default Register;