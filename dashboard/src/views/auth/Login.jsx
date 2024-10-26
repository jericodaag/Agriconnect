import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaEnvelope, FaLock, FaLeaf } from "react-icons/fa";
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { overrideStyle } from '../../utils/utils';
import { seller_login, messageClear } from '../../store/Reducers/authReducer';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loader, errorMessage, successMessage } = useSelector(state => state.auth);
    const [state, setState] = useState({ email: "", password: "" });
    const [focusedInput, setFocusedInput] = useState(null);

    const inputHandle = (e) => {
        setState({ ...state, [e.target.name]: e.target.value });
    };

    const submit = (e) => {
        e.preventDefault();
        dispatch(seller_login(state));
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

    return (
        <div className='min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex justify-center items-center px-6 py-12 sm:px-8'>
            {/* Main Container */}
            <div className='w-full max-w-xl'> {/* Increased max-width */}
                
                {/* Login Form Card */}
                <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
                    <div className='p-8 sm:p-10'>
                        <div className='text-center mb-10'>
                            <h2 className='text-4xl font-bold text-gray-800 mb-3'>Welcome Back</h2>
                            <p className='text-gray-600 text-lg'>Sign in to AgriConnect</p>
                        </div>

                        <form onSubmit={submit} className='space-y-6'>
                            {/* Email Input */}
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

                            {/* Password Input */}
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

                            {/* Remember Me & Forgot Password */}
                            <div className='flex items-center justify-between'>
                                <label className='flex items-center space-x-2 cursor-pointer'>
                                    <input type='checkbox' className='w-4 h-4 border-2 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-0' />
                                    <span className='text-sm text-gray-600'>Remember me</span>
                                </label>
                                <Link 
                                    to="/forgot-password" 
                                    className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-all duration-200 hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Sign In Button */}
                            <button 
                                disabled={loader} 
                                className='w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-4 font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            >
                                {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Sign In'}
                            </button>
                        </form>

                        {/* Social Login Section */}
                        <div className='mt-10'>
                            <div className='relative'>
                                <div className='absolute inset-0 flex items-center'>
                                    <div className='w-full border-t border-gray-200'></div>
                                </div>
                                <div className='relative flex justify-center text-sm'>
                                    <span className='px-4 bg-white text-gray-500 text-base'>Or continue with</span>
                                </div>
                            </div>

                            <div className='mt-6 grid grid-cols-2 gap-4'>
                                <button className='flex items-center justify-center px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 group'>
                                    <FaGoogle className='text-xl text-red-500 mr-3' />
                                    <span className='text-base font-medium text-gray-700'>Google</span>
                                </button>
                                <button className='flex items-center justify-center px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 group'>
                                    <FaFacebook className='text-xl text-blue-600 mr-3' />
                                    <span className='text-base font-medium text-gray-700'>Facebook</span>
                                </button>
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <div className='mt-10 text-center'>
                            <p className='text-gray-600 text-base'>
                                Don't have an account?{' '}
                                <Link 
                                    to="/register" 
                                    className='text-blue-500 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline'
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;