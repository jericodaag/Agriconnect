import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgot_password, messageClear } from '../../store/Reducers/authReducer';
import toast from 'react-hot-toast';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const { loader, successMessage, errorMessage } = useSelector(state => state.auth);
    const [email, setEmail] = useState('');
    const [focusedInput, setFocusedInput] = useState(false);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            setEmail('');
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
        <div className='min-h-screen flex flex-col md:flex-row'>
            {/* Form Section */}
            <div className='w-full md:w-2/5 p-6 md:p-8 flex items-center justify-center'>
                <div className='w-full max-w-md space-y-6'>
                    {/* Back to Login Link */}
                    <Link 
                        to="/login" 
                        className='inline-flex items-center text-sm text-[#059473] hover:text-[#048066] transition-colors'
                    >
                        <FaArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>

                    {/* Header */}
                    <div className='space-y-2'>
                        <h2 className='text-2xl md:text-3xl font-bold text-gray-800'>Forgot Password?</h2>
                        <p className='text-sm text-gray-600'>
                            Don't worry! It happens. Please enter the email address associated with your account.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className="relative">
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FaEnvelope className={`h-5 w-5 transition-colors duration-200 ${focusedInput ? 'text-[#059473]' : 'text-gray-400'}`} />
                            </div>
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedInput(true)}
                                onBlur={() => setFocusedInput(false)}
                                className='w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#059473] focus:border-[#059473] bg-white'
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loader}
                            className='w-full py-2.5 bg-[#059473] text-white text-sm font-medium rounded-lg hover:bg-[#048066] transition-colors duration-200 disabled:opacity-50'
                        >
                            {loader ? <PropagateLoader size={8} color="#ffffff" /> : 'Send Reset Instructions'}
                        </button>
                    </form>

                    {/* Additional Help */}
                    <div className='text-center space-y-4'>
                        <div className='relative'>
                            <div className='absolute inset-0 flex items-center'>
                                <div className='w-full border-t border-gray-200'></div>
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-2 bg-white text-gray-500'>Or</span>
                            </div>
                        </div>

                        <div className='text-sm'>
                            <Link 
                                to="/register" 
                                className='text-[#059473] hover:text-[#048066] font-medium'
                            >
                                Create new account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Section */}
            <div className='hidden md:block md:w-3/5 relative'>
                <div className='absolute inset-0 bg-black/25'></div>
                <img 
                    src="/images/forgot-password.jpg" 
                    alt="Fresh Produce"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center px-12">
                    <div className="max-w-lg">
                        <h2 className="text-3xl font-bold text-white mb-4">Password Recovery</h2>
                        <p className="text-white/90 text-sm leading-relaxed">
                            We understand the importance of securing your account. Follow the simple steps
                            to reset your password and regain access to your AgriConnect account. Your
                            agricultural business journey continues here.
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {loader && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <PropagateLoader color="#059473" />
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;