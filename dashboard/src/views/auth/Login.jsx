import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { overrideStyle } from '../../utils/utils';
import { seller_login, messageClear } from '../../store/Reducers/authReducer';

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loader, errorMessage, successMessage } = useSelector(state => state.auth)
    const [state, setState] = useState({ email: "", password: "" })

    const inputHandle = (e) => {
        setState({ ...state, [e.target.name]: e.target.value })
    }

    const submit = (e) => {
        e.preventDefault()
        dispatch(seller_login(state))
    }

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
            navigate('/')
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [successMessage, errorMessage, dispatch, navigate])

    return (
        <div className='min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex justify-center items-center p-4'>
            <div className='w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden'>
                <div className='p-8'>
                    <h2 className='text-3xl font-bold text-gray-800 mb-2'>Welcome to AgriConnect</h2>
                    <p className='text-gray-600 mb-6'>Sign in to your Agriconnect account</p>
                    <form onSubmit={submit} className='space-y-6'>
                        <div>
                            <input onChange={inputHandle} value={state.email} className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none' type="email" name='email' placeholder='Email' required />
                        </div>
                        <div>
                            <input onChange={inputHandle} value={state.password} className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none' type="password" name='password' placeholder='Password' required />
                        </div>
                        <button disabled={loader} className='w-full bg-blue-500 text-white rounded-lg px-4 py-3 font-bold hover:bg-blue-600 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out'>
                            {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Sign In'}
                        </button>
                    </form>
                    <div className='mt-6 text-center'>
                        <p className='text-gray-600'>Don't have an account? <Link className='text-blue-500 hover:text-blue-600 font-semibold' to="/register">Sign Up</Link></p>
                    </div>
                    <div className='mt-6 flex items-center justify-center'>
                        <div className='w-full border-t border-gray-300'></div>
                        <div className='px-4 text-gray-500'>Or</div>
                        <div className='w-full border-t border-gray-300'></div>
                    </div>
                    <div className='mt-6 flex justify-center gap-4'>
                        <button className='flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-300'>
                            <FaGoogle className='text-xl' />
                        </button>
                        <button className='flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition duration-300'>
                            <FaFacebook className='text-xl' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;