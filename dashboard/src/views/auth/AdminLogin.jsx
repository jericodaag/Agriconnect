import React, { useEffect, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { admin_login, messageClear } from '../../store/Reducers/authReducer';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

const AdminLogin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loader, errorMessage, successMessage } = useSelector(state => state.auth);

    const [state, setState] = useState({ 
        email: "",
        password: ""
    });

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const submit = (e) => {
        e.preventDefault();
        dispatch(admin_login(state));
    };

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            navigate('/');
        }
    }, [errorMessage, successMessage, dispatch, navigate]);

    return (
        <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex justify-center items-center p-4'>
            <div className='w-full max-w-md'>
                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                    <div className='h-2 bg-gradient-to-r from-green-400 to-blue-500'></div>
                    <div className='px-8 py-10'>
                        <div className='text-center mb-10'>
                            <FaUser className='mx-auto text-5xl text-[#61BD12] mb-4' />
                            <h2 className='text-3xl font-bold text-gray-800'>Admin Login</h2>
                            <p className='text-gray-600 mt-2'>Welcome back! Please enter your details.</p>
                        </div>
                        <form onSubmit={submit} className='space-y-6'>
                            <div className='relative'>
                                <FaEnvelope className='absolute top-3 left-3 text-gray-400' />
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={state.email}
                                    onChange={inputHandle}
                                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#61BD12] focus:border-transparent transition duration-300'
                                    placeholder='Enter your email'
                                    required 
                                />
                            </div>
                            <div className='relative'>
                                <FaLock className='absolute top-3 left-3 text-gray-400' />
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    value={state.password}
                                    onChange={inputHandle}
                                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#61BD12] focus:border-transparent transition duration-300'
                                    placeholder='Enter your password'
                                    required 
                                />
                            </div>
                            <div>
                                <button 
                                    type="submit" 
                                    disabled={loader}
                                    className='w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#61BD12] hover:bg-[#4e960f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61BD12] transition duration-300 ease-in-out'
                                >
                                    {loader ? (
                                        <PropagateLoader color='#ffffff' size={12} />
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className='text-center mt-6'>
                    <p className='text-gray-600'>
                        Not an admin? <a href="http://localhost:3000" className='font-medium text-[#61BD12] hover:underline'>Return to main site</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;