import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verify_reset_token, reset_password, messageClear } from '../../store/Reducers/authReducer';
import toast from 'react-hot-toast';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loader, successMessage, errorMessage, validResetToken } = useSelector(state => state.auth);

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

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

    if (!validResetToken) {
        return (
            <div className='min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex justify-center items-center p-4'>
                <div className='w-full max-w-md bg-white rounded-xl shadow-2xl p-8 text-center'>
                    <h2 className='text-2xl font-bold text-red-600 mb-4'>Invalid or Expired Link</h2>
                    <p className='text-gray-600 mb-4'>This password reset link is no longer valid.</p>
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className='text-blue-500 hover:text-blue-600 font-semibold'
                    >
                        Request New Reset Link
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex justify-center items-center p-4'>
            <div className='w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden'>
                <div className='p-8'>
                    <h2 className='text-3xl font-bold text-gray-800 mb-2'>Reset Password</h2>
                    <p className='text-gray-600 mb-6'>Enter your new password</p>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none'
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none'
                                required
                            />
                        </div>
                        
                        <button
                            disabled={loader}
                            className='w-full bg-blue-500 text-white rounded-lg px-4 py-3 font-bold hover:bg-blue-600 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out'
                        >
                            {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;