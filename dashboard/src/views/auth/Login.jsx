import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from "react-icons/fa";
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
        <div className='min-h-screen flex'>
            {/* Left Side - Form */}
            <div className='w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12'>
                <div className='w-full max-w-md'>
                    <div className='text-center mb-8'>
                        <h1 className='text-4xl font-bold text-gray-800 mb-3'>Welcome Back</h1>
                        <p className='text-gray-600'>Login to manage your seller account</p>
                    </div>

                    <form onSubmit={submit} className='space-y-6'>
                        <div className="space-y-4">
                            <div className="relative">
                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                    <FaEnvelope className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'email' ? 'text-[#059473]' : 'text-gray-400'}`} />
                                </div>
                                <input
                                    onChange={inputHandle}
                                    value={state.email}
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput(null)}
                                    className='w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#059473] focus:ring-2 focus:ring-[#05947340] focus:bg-white focus:outline-none transition-all duration-200'
                                    type="email"
                                    name='email'
                                    placeholder='Email Address'
                                    required
                                />
                            </div>

                            <div className="relative">
                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                    <FaLock className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'password' ? 'text-[#059473]' : 'text-gray-400'}`} />
                                </div>
                                <input
                                    onChange={inputHandle}
                                    value={state.password}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                    className='w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#059473] focus:ring-2 focus:ring-[#05947340] focus:bg-white focus:outline-none transition-all duration-200'
                                    type="password"
                                    name='password'
                                    placeholder='Password'
                                    required
                                />
                            </div>
                        </div>

                        <div className='flex items-center justify-between'>
                            <label className='flex items-center space-x-2 cursor-pointer'>
                                <input type='checkbox' className='w-4 h-4 rounded border-gray-300 text-[#059473] focus:ring-[#059473]' />
                                <span className='text-sm text-gray-600'>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-[#059473] hover:text-[#048066] font-medium">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            disabled={loader}
                            className='w-full bg-[#059473] hover:bg-[#048066] text-white rounded-xl py-4 font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50'
                        >
                            {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Sign In'}
                        </button>

                        <p className='text-center text-gray-600'>
                            Don't have an account?{' '}
                            <Link to="/register" className='text-[#059473] hover:text-[#048066] font-semibold'>
                                Sign up
                            </Link>
                        </p>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or login as</span>
                            </div>
                        </div>

                        <a 
                                href="http://localhost:3001/admin/login" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className='flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm text-gray-600 hover:text-[#059473] group'
                            >
                                Admin
                            </a>
                    </form>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className='hidden lg:block lg:w-1/2 bg-cover bg-center relative overflow-hidden'>
                <img 
                    src="/images/login.jpg" 
                    alt="Fresh Produce"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
                    <div className="px-12 max-w-xl">
                        <h2 className="text-4xl font-bold text-white mb-6">Welcome to AgriConnect</h2>
                        <p className="text-xl text-white/90">
                            Your direct link to fresh, quality produce from local farmers. 
                            Discover farm-fresh products, support local agriculture, and 
                            experience the best of Philippine farming.
                        </p>
                    </div>
                </div>
            </div>

            {loader && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                    <PropagateLoader color='#059473' />
                </div>
            )}
        </div>
    );
};

export default Login;