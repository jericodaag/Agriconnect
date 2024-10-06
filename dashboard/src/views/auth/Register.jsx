import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import { seller_register, messageClear } from '../../store/Reducers/authReducer';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { loader, successMessage, errorMessage } = useSelector(state => state.auth)
    const [state, setState] = useState({ name: "", email: "", password: "" })

    const inputHandle = (e) => {
        setState({ ...state, [e.target.name]: e.target.value })
    }

    const submit = (e) => {
        e.preventDefault()
        dispatch(seller_register(state))
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
        <div className='min-h-screen bg-gradient-to-r from-green-400 to-blue-500 flex justify-center items-center p-4'>
            <div className='w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden'>
                <div className='p-8'>
                    <h2 className='text-3xl font-bold text-gray-800 mb-2'>Join Agriconnect</h2>
                    <p className='text-gray-600 mb-6'>Create your account and start connecting</p>
                    <form onSubmit={submit} className='space-y-4'>
                        <div>
                            <input onChange={inputHandle} value={state.name} className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-green-500 focus:bg-white focus:outline-none' type="text" name='name' placeholder='Full Name' required />
                        </div>
                        <div>
                            <input onChange={inputHandle} value={state.email} className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-green-500 focus:bg-white focus:outline-none' type="email" name='email' placeholder='Email' required />
                        </div>
                        <div>
                            <input onChange={inputHandle} value={state.password} className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-green-500 focus:bg-white focus:outline-none' type="password" name='password' placeholder='Password' required />
                        </div>
                        <div className='flex items-center'>
                            <input className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500' type="checkbox" name="terms" id="terms" required />
                            <label htmlFor="terms" className='ml-2 text-gray-700'>I agree to the <a href="#" className='text-green-600 hover:underline'>Terms and Conditions</a></label>
                        </div>
                        <button disabled={loader} className='w-full bg-green-500 text-white rounded-lg px-4 py-3 font-bold hover:bg-green-600 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out'>
                            {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Sign Up'}
                        </button>
                    </form>
                    <div className='mt-6 text-center'>
                        <p className='text-gray-600'>Already have an account? <Link className='text-green-500 hover:text-green-600 font-semibold' to="/login">Sign In</Link></p>
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

export default Register;