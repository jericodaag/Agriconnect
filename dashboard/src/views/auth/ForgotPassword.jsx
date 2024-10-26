import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgot_password, messageClear } from '../../store/Reducers/authReducer';
import toast from 'react-hot-toast';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const { loader, successMessage, errorMessage } = useSelector(state => state.auth);
    const [email, setEmail] = useState('');

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

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(forgot_password(email));
    };

    return (
        <div className='min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex justify-center items-center p-4'>
            <div className='w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden'>
                <div className='p-8'>
                    <h2 className='text-3xl font-bold text-gray-800 mb-2'>Forgot Password</h2>
                    <p className='text-gray-600 mb-6'>Enter your email to receive password reset instructions</p>
                    
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none'
                                required
                            />
                        </div>
                        
                        <button
                            disabled={loader}
                            className='w-full bg-blue-500 text-white rounded-lg px-4 py-3 font-bold hover:bg-blue-600 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out'
                        >
                            {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className='mt-6 text-center'>
                        <p className='text-gray-600'>
                            Remember your password? <Link to="/login" className='text-blue-500 hover:text-blue-600 font-semibold'>Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;