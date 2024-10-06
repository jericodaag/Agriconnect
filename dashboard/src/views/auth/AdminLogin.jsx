import React, { useEffect, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { admin_login, messageClear } from '../../store/Reducers/authReducer';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
        <div className='min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex justify-center items-center p-4'>
            <div className='w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden'>
                <div className='p-6 sm:p-8'>
                    <div className='flex justify-center mb-8'>
                        <img className='w-40' src="http://localhost:3001/images/logo.png" alt="logo" />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-800 text-center mb-6'>Admin Login</h2>
                    <form onSubmit={submit} className='space-y-6'>
                        <div>
                            <label htmlFor="email" className='text-sm font-medium text-gray-700 block mb-2'>Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={state.email}
                                onChange={inputHandle}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                required 
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className='text-sm font-medium text-gray-700 block mb-2'>Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                value={state.password}
                                onChange={inputHandle}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                required 
                            />
                        </div>
                        <div>
                        <button 
                        type="submit" 
                        disabled={loader}
                        className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#61BD12] hover:bg-[#4e960f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61BD12] transition duration-150 ease-in-out'
                    >
                                {loader ? (
                                    <PropagateLoader color='#ffffff' size={12} />
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;