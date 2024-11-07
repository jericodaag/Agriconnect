import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { customer_login, messageClear } from '../store/reducers/authReducer';
import toast from 'react-hot-toast';
import { FadeLoader } from 'react-spinners';
import { FaEnvelope, FaLock, FaUserCircle } from 'react-icons/fa';

const Login = () => {
    const navigate = useNavigate();
    const { loader, errorMessage, successMessage, userInfo } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const [state, setState] = useState({
        email: '',
        password: ''
    });

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const login = (e) => {
        e.preventDefault();
        dispatch(customer_login(state));
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (userInfo) {
            navigate('/');
        }
    }, [successMessage, errorMessage, userInfo]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {loader && (
                <div className='w-screen h-screen flex justify-center items-center fixed left-0 top-0 bg-[#38303033] z-[999]'>
                    <FadeLoader color="#059473" />
                </div>
            )}
            <Header />
            <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl w-full bg-white p-10 rounded-xl shadow-lg">
                    <div className="flex justify-center mb-8">
                        <FaUserCircle className="text-[#059473] text-6xl" />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">Welcome Back!</h2>
                    <form className="space-y-6" onSubmit={login}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#059473] focus:border-[#059473] sm:text-sm"
                                    placeholder="Enter your email"
                                    value={state.email}
                                    onChange={inputHandle}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#059473] focus:border-[#059473] sm:text-sm"
                                    placeholder="Enter your password"
                                    value={state.password}
                                    onChange={inputHandle}
                                />
                            </div>
                            <div className="text-right mt-2">
                                <Link to="/forgot-password" className="text-sm font-medium text-[#059473] hover:text-[#048066]">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#059473] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#059473]">
                                Sign in
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-[#059473]">
                                Register here
                            </Link>
                        </p>
                    </div>
                    <div className="mt-8 grid grid-cols-3 items-center">
                        <hr className="border-gray-300" />
                        <p className="text-center text-sm text-gray-500">Or</p>
                        <hr className="border-gray-300" />
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <a href="http://localhost:3001/login" target="_blank" rel="noopener noreferrer" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500">
                            Login as a Seller
                        </a>
                        <a href="http://localhost:3001/register" target="_blank" rel="noopener noreferrer" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500">
                            Register as a Seller
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;