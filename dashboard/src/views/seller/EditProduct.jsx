import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IoMdImages, IoMdCloseCircle } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { get_category } from '../../store/Reducers/categoryReducer';
import { get_product, update_product, messageClear, product_image_update } from '../../store/Reducers/productReducer';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import toast from 'react-hot-toast';

const EditProduct = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const { categorys } = useSelector(state => state.category);
    const { product, loader, successMessage, errorMessage } = useSelector(state => state.product);

    const [state, setState] = useState({
        name: "",
        description: '',
        discount: '',
        price: "",
        brand: "",
        stock: "",
        unit: ""
    });

    const [cateShow, setCateShow] = useState(false);
    const [category, setCategory] = useState('');
    const [allCategory, setAllCategory] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [imageShow, setImageShow] = useState([]);
    const [images, setImages] = useState([]);

    useEffect(() => {
        dispatch(get_category({ searchValue: '', parPage: '', page: "" }));
        dispatch(get_product(productId));
    }, [dispatch, productId]);

    useEffect(() => {
        setState({
            name: product.name,
            description: product.description,
            discount: product.discount,
            price: product.price,
            brand: product.brand,
            stock: product.stock,
            unit: product.unit
        });
        setCategory(product.category);
        setImageShow(product.images ? product.images.map(img => ({ url: img })) : []);
    }, [product]);

    useEffect(() => {
        if (categorys.length > 0) {
            setAllCategory(categorys);
        }
    }, [categorys]);

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

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const categorySearch = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        if (value) {
            let srcValue = allCategory.filter(c => c.name.toLowerCase().includes(value.toLowerCase()));
            setAllCategory(srcValue);
        } else {
            setAllCategory(categorys);
        }
    };

    const imageHandle = (e) => {
        const files = e.target.files;
        const length = files.length;

        if (length > 0) {
            setImages([...images, ...files]);
            const newImageUrls = Array.from(files).map(file => ({
                url: URL.createObjectURL(file)
            }));
            setImageShow([...imageShow, ...newImageUrls]);
        }
    };

    const changeImage = (img, files, index) => {
        if (files.length > 0) {
            if (img.url.startsWith('http')) {
                // If it's an existing image from server
                dispatch(product_image_update({
                    oldImage: img.url,
                    newImage: files[0],
                    productId
                }));
            } else {
                // If it's a newly added image
                const tempImages = [...images];
                const tempImageShow = [...imageShow];
                tempImages[index] = files[0];
                tempImageShow[index] = { url: URL.createObjectURL(files[0]) };
                setImages(tempImages);
                setImageShow(tempImageShow);
            }
        }
    };

    const removeImage = (index) => {
        const filteredImageShow = imageShow.filter((_, i) => i !== index);
        const filteredImages = images.filter((_, i) => i !== index);
        setImageShow(filteredImageShow);
        setImages(filteredImages);
    };

    const update = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', state.name);
        formData.append('description', state.description);
        formData.append('discount', state.discount);
        formData.append('price', state.price);
        formData.append('brand', state.brand);
        formData.append('stock', state.stock);
        formData.append('productId', productId);
        formData.append('unit', state.unit);

        for (let i = 0; i < images.length; i++) {
            formData.append('newImages', images[i]);
        }

        dispatch(update_product(formData));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">
                {/* Header Section */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800">Edit Product</h1>
                            <p className="text-sm text-gray-500 mt-1">Update your product details</p>
                        </div>
                        <Link 
                            to='/seller/dashboard/products' 
                            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-medium rounded-lg transition-colors duration-300"
                        >
                            View All Products
                        </Link>
                    </div>
                </div>

                <form onSubmit={update} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300"
                                onChange={inputHandle}
                                value={state.name}
                                type="text"
                                name='name'
                                id='name'
                                placeholder='Enter product name'
                            />
                        </div>
                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300"
                                onChange={inputHandle}
                                value={state.brand}
                                type="text"
                                name='brand'
                                id='brand'
                                placeholder='Enter brand name'
                            />
                        </div>
                    </div>

                    {/* Category and Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <div className="relative">
                                <input
                                    readOnly
                                    onClick={() => setCateShow(!cateShow)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300 cursor-pointer"
                                    value={category}
                                    placeholder='Select category'
                                />
                                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            {cateShow && (
                                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto border border-gray-100">
                                    <div className="sticky top-0 bg-white px-2 py-2">
                                        <input
                                            value={searchValue}
                                            onChange={categorySearch}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Search categories..."
                                        />
                                    </div>
                                    {allCategory.map((c, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setCateShow(false);
                                                setCategory(c.name);
                                                setSearchValue('');
                                                setAllCategory(categorys);
                                            }}
                                            className={`px-4 py-2 cursor-pointer ${category === c.name ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            {c.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300"
                                onChange={inputHandle}
                                value={state.stock}
                                type="number"
                                name='stock'
                                id='stock'
                                placeholder='Enter stock quantity'
                            />
                        </div>
                    </div>

                    {/* Price, Discount, Unit */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                                <input
                                    className="w-full px-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300"
                                    onChange={inputHandle}
                                    value={state.price}
                                    type="number"
                                    name='price'
                                    id='price'
                                    placeholder='0.00'
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300"
                                    onChange={inputHandle}
                                    value={state.discount}
                                    type="number"
                                    name='discount'
                                    id='discount'
                                    placeholder='Enter discount percentage'
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300"
                                onChange={inputHandle}
                                value={state.unit}
                                name='unit'
                                id='unit'
                            >
                                <option value="kg">Kilogram (kg)</option>
                                <option value="g">Gram (g)</option>
                                <option value="pc">Piece (pc)</option>
                                <option value="pack">Pack</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300"
                            onChange={inputHandle}
                            value={state.description}
                            name='description'
                            id='description'
                            rows="4"
                            placeholder='Enter product description'
                        ></textarea>
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Product Images</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {imageShow.map((img, i) => (
                                <div key={i} className="relative group bg-gray-50 rounded-lg p-2 border border-gray-200">
                                    <img 
                                        src={img.url} 
                                        alt="" 
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg flex items-center justify-center gap-2">
                                        <label 
                                            htmlFor={`file-${i}`} 
                                            className="p-2 bg-white bg-opacity-25 rounded-full cursor-pointer hover:bg-opacity-40 transition-all duration-200"
                                        >
                                            <IoMdImages className="h-5 w-5 text-white" />
                                        </label>
                                        <button 
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="p-2 bg-white bg-opacity-25 rounded-full hover:bg-opacity-40 transition-all duration-200"
                                        >
                                            <IoMdCloseCircle className="h-5 w-5 text-white" />
                                        </button>
                                    </div>
                                    <input 
                                        onChange={(e) => changeImage(img, e.target.files, i)}
                                        type="file"
                                        id={`file-${i}`}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                            ))}
                            
                            {/* Image Upload Button */}
                            <div className="relative">
                                <label className="block h-40 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors duration-300 cursor-pointer bg-gray-50">
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
                                            <IoMdImages className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">Add Image</span>
                                        <span className="text-xs text-gray-400 mt-1">Drop files or click</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        onChange={imageHandle} 
                                        className="hidden" 
                                        multiple 
                                        accept="image/*"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="border-t border-gray-100 pt-6">
                        <button
                            disabled={loader}
                            type="submit"
                            className="w-full inline-flex justify-center items-center px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                        >
                            {loader ? (
                                <div className="flex items-center space-x-2">
                                    <PropagateLoader color='#fff' cssOverride={overrideStyle} />
                                    <span>Saving Changes...</span>
                                </div>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;