import React, { useEffect, useState } from 'react';
import { FaRegImage, FaUpload } from "react-icons/fa";
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { add_banner, get_banner, messageClear, update_banner } from '../../store/Reducers/bannerReducer';
import toast from 'react-hot-toast';

const AddBanner = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const { loader, successMessage, errorMessage, banner } = useSelector(state => state.banner);
    const [imageShow, setImageShow] = useState('');
    const [image, setImage] = useState('');

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

    const imageHandle = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            setImage(files[0]);
            setImageShow(URL.createObjectURL(files[0]));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('productId', productId);
        formData.append('mainban', image);
        if (banner) {
            dispatch(update_banner({ info: formData, bannerId: banner._id }));
        } else {
            dispatch(add_banner(formData));
        }
    };

    useEffect(() => {
        dispatch(get_banner(productId));
    }, [productId, dispatch]);

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    {banner ? 'Update Banner' : 'Add Banner'}
                </h1>
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="p-6 sm:p-10">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label 
                                    className="flex justify-center items-center flex-col h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-300 ease-in-out"
                                    htmlFor="image"
                                >
                                    {imageShow || (banner && banner.banner) ? (
                                        <img 
                                            src={imageShow || banner.banner} 
                                            alt="Banner preview" 
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <>
                                            <FaRegImage className="text-4xl text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Select Banner Image</span>
                                        </>
                                    )}
                                </label>
                                <input required onChange={imageHandle} className="hidden" type="file" id="image" accept="image/*" />
                            </div>

                            <div className="flex justify-center">
                                <button 
                                    disabled={loader} 
                                    className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
                                    type="submit"
                                >
                                    {loader ? (
                                        <PropagateLoader color='#fff' cssOverride={overrideStyle} />
                                    ) : (
                                        <>
                                            <FaUpload className="mr-2" />
                                            {banner ? 'Update Banner' : 'Add Banner'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBanner;