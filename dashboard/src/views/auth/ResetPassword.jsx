import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verify_reset_token, reset_password, messageClear } from '../../store/Reducers/authReducer';
import toast from 'react-hot-toast';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import { FaLock, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loader, successMessage, errorMessage, validResetToken } = useSelector(state => state.auth);

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    useEffect(() => {
        dispatch(verify_reset_token(token));
    }, [token, dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            navigate('/login');
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        dispatch(reset_password({
            token,
            newPassword: passwords.newPassword
        }));
    };

    // Invalid Token View
    if (!validResetToken) {
        return (
            <div className='min-h-screen flex flex-col md:flex-row'>
                <div className='w-full md:w-2/5 p-6 md:p-8 flex items-center justify-center'>
                    <div className='w-full max-w-md text-center space-y-6'>
                        <div className="flex justify-center">
                            <FaExclamationTriangle className="w-16 h-16 text-red-500" />
                        </div>
                        <div className='space-y-2'>
                            <h2 className='text-2xl font-bold text-gray-800'>Invalid or Expired Link</h2>
                            <p className='text-sm text-gray-600'>
                                This password reset link has expired or is no longer valid.
                                Please request a new one to continue.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className='inline-block px-6 py-2.5 bg-[#059473] text-white text-sm font-medium rounded-lg hover:bg-[#048066] transition-colors'
                        >
                            Request New Reset Link
                        </button>
                    </div>
                </div>

                {/* Image Section */}
                <div className='hidden md:block md:w-3/5 relative'>
                    <div className='absolute inset-0 bg-black/25'></div>
                    <img 
                        src="/images/reset-password.jpg" 
                        alt="Security"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center px-12">
                        <div className="max-w-lg">
                            <h2 className="text-3xl font-bold text-white mb-4">Secure Password Reset</h2>
                            <p className="text-white/90 text-sm leading-relaxed">
                                Your security is our priority. We ensure a safe password reset process
                                to protect your AgriConnect account and business information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Valid Token View
    return (
        <div className='min-h-screen flex flex-col md:flex-row'>
            {/* Form Section */}
            <div className='w-full md:w-2/5 p-6 md:p-8 flex items-center justify-center'>
                <div className='w-full max-w-md space-y-6'>
                    <div className="flex justify-center">
                        <FaShieldAlt className="w-12 h-12 text-[#059473]" />
                    </div>

                    <div className='space-y-2'>
                        <h2 className='text-2xl md:text-3xl font-bold text-gray-800 text-center'>Create New Password</h2>
                        <p className='text-sm text-gray-600 text-center'>
                            Please enter a strong password for your account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className="relative">
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FaLock className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'new' ? 'text-[#059473]' : 'text-gray-400'}`} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                onFocus={() => setFocusedInput('new')}
                                onBlur={() => setFocusedInput(null)}
                                className='w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#059473] focus:border-[#059473] bg-white'
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FaLock className={`h-5 w-5 transition-colors duration-200 ${focusedInput === 'confirm' ? 'text-[#059473]' : 'text-gray-400'}`} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm New Password"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                onFocus={() => setFocusedInput('confirm')}
                                onBlur={() => setFocusedInput(null)}
                                className='w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-[#059473] focus:border-[#059473] bg-white'
                                required
                            />
                        </div>

                        <div className="flex items-center">
                            <label className="flex items-center text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={() => setShowPassword(!showPassword)}
                                    className="mr-2 rounded border-gray-300 text-[#059473] focus:ring-[#059473]"
                                />
                                Show password
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loader}
                            className='w-full py-2.5 bg-[#059473] text-white text-sm font-medium rounded-lg hover:bg-[#048066] transition-colors duration-200 disabled:opacity-50'
                        >
                            {loader ? <PropagateLoader size={8} color="#ffffff" /> : 'Reset Password'}
                        </button>

                        <div className='text-center text-sm'>
                            <Link to="/login" className='text-[#059473] hover:text-[#048066] font-medium'>
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Image Section */}
            <div className='hidden md:block md:w-3/5 relative'>
                <div className='absolute inset-0 bg-black/25'></div>
                <img 
                    src="/images/reset-password.jpg" 
                    alt="Security"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center px-12">
                    <div className="max-w-lg">
                        <h2 className="text-3xl font-bold text-white mb-4">Secure Password Reset</h2>
                        <p className="text-white/90 text-sm leading-relaxed">
                            Create a strong password to protect your AgriConnect account. 
                            We recommend using a combination of letters, numbers, and special characters.
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

export default ResetPassword;