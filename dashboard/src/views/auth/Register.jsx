import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaIdCard } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import { seller_register, messageClear } from '../../store/Reducers/authReducer';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loader, successMessage, errorMessage } = useSelector(state => state.auth);
    
    const [state, setState] = useState({
        name: "",
        email: "",
        password: "",
        shopName: "",
        division: "",
        district: "",
        idType: "",
        idNumber: "",
        idImage: null
    });

    const [previewImage, setPreviewImage] = useState(null);

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setState({
                ...state,
                idImage: file
            });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        // Append all form fields to FormData
        Object.keys(state).forEach(key => {
            formData.append(key, state[key]);
        });

        dispatch(seller_register(formData));
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

    const idTypes = [
        'SSS',
        'UMID',
        'Drivers License',
        'Philippine Passport',
        'PhilHealth',
        'TIN',
        'Postal ID'
    ];

    return (
        <div className='min-h-screen bg-gradient-to-r from-green-400 to-blue-500 flex justify-center items-center p-4'>
            <div className='w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden'>
                <div className='p-8'>
                    <h2 className='text-3xl font-bold text-gray-800 mb-2'>Join Agriconnect</h2>
                    <p className='text-gray-600 mb-6'>Create your account and start connecting</p>
                    <form onSubmit={submit} className='space-y-4'>
                        <div>
                            <input
                                onChange={inputHandle}
                                value={state.name}
                                className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-green-500 focus:bg-white focus:outline-none'
                                type="text"
                                name='name'
                                placeholder='Full Name'
                                required
                            />
                        </div>
                        <div>
                            <input
                                onChange={inputHandle}
                                value={state.email}
                                className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-green-500 focus:bg-white focus:outline-none'
                                type="email"
                                name='email'
                                placeholder='Email'
                                required
                            />
                        </div>
                        <div>
                            <input
                                onChange={inputHandle}
                                value={state.password}
                                className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-green-500 focus:bg-white focus:outline-none'
                                type="password"
                                name='password'
                                placeholder='Password'
                                required
                            />
                        </div>
                        <div>
                            <input
                                onChange={inputHandle}
                                value={state.shopName}
                                className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-green-500 focus:bg-white focus:outline-none'
                                type="text"
                                name='shopName'
                                placeholder='Shop Name'
                                required
                            />
                        </div>
                        <div>
                            <input
                                onChange={inputHandle}
                                value={state.division}
                                className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-green-500 focus:bg-white focus:outline-none'
                                type="text"
                                name='division'
                                placeholder='Division'
                                required
                            />
                        </div>
                        <div>
                            <input
                                onChange={inputHandle}
                                value={state.district}
                                className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-green-500 focus:bg-white focus:outline-none'
                                type="text"
                                name='district'
                                placeholder='District'
                                required
                            />
                        </div>

                        {/* ID verification section */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                <FaIdCard className="mr-2" />
                                ID Verification
                            </h3>
                            <select
                                onChange={inputHandle}
                                value={state.idType}
                                name="idType"
                                className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-green-500 focus:bg-white focus:outline-none'
                                required
                            >
                                <option value="">Select ID Type</option>
                                {idTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <input
                                onChange={inputHandle}
                                value={state.idNumber}
                                className='w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-green-500 focus:bg-white focus:outline-none'
                                type="text"
                                name='idNumber'
                                placeholder='ID Number'
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Upload ID Image
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                    <div className="flex flex-col items-center justify-center pt-7">
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="ID Preview"
                                                className="w-auto h-20 object-contain"
                                            />
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="pt-1 text-sm text-gray-400">Upload ID image</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        className="opacity-0"
                                        name="idImage"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        required
                                    />
                                </label>
                            </div>
                        </div>

                        <div className='flex items-center'>
                            <input
                                className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500'
                                type="checkbox"
                                name="terms"
                                id="terms"
                                required
                            />
                            <label htmlFor="terms" className='ml-2 text-gray-700'>
                                I agree to the <a href="#" className='text-green-600 hover:underline'>Terms and Conditions</a>
                            </label>
                        </div>
                        
                        <button
                            disabled={loader}
                            className='w-full bg-green-500 text-white rounded-lg px-4 py-3 font-bold hover:bg-green-600 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out'
                        >
                            {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Sign Up'}
                        </button>
                    </form>

                    <div className='mt-6 text-center'>
                        <p className='text-gray-600'>
                            Already have an account? <Link className='text-green-500 hover:text-green-600 font-semibold' to="/login">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;