import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoMdImages, IoMdCloseCircle } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { get_category } from '../../store/Reducers/categoryReducer';
import { add_product, messageClear } from '../../store/Reducers/productReducer';
import { PropagateLoader } from 'react-spinners';
import { overrideStyle } from '../../utils/utils';
import toast from 'react-hot-toast';

const AddProduct = () => {
    const dispatch = useDispatch()
    const { categorys } = useSelector(state => state.category)
    const { loader, successMessage, errorMessage } = useSelector(state => state.product)

    const [state, setState] = useState({
        name: "",
        description: '',
        discount: '',
        price: "",
        brand: "",
        stock: "",
        unit: "kg",
        harvestDate: "",
        bestBefore: ""
    })

    const [cateShow, setCateShow] = useState(false)
    const [category, setCategory] = useState('')
    const [allCategory, setAllCategory] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [images, setImages] = useState([])
    const [imageShow, setImageShow] = useState([])

    // ... [keeping all your existing handlers and effects]
    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    useEffect(() => {
        dispatch(get_category({
            searchValue: '',
            parPage: '',
            page: ""
        }))
    }, [dispatch])

    const categorySearch = (e) => {
        const value = e.target.value
        setSearchValue(value)
        if (value) {
            let srcValue = allCategory.filter(c => c.name.toLowerCase().indexOf(value.toLowerCase()) > -1)
            setAllCategory(srcValue)
        } else {
            setAllCategory(categorys)
        }
    }

    const imageHandle = (e) => {
        const files = e.target.files
        const length = files.length;

        if (length > 0) {
            setImages([...images, ...files])
            let imageUrl = []
            for (let i = 0; i < length; i++) {
                imageUrl.push({ url: URL.createObjectURL(files[i]) })
            }
            setImageShow([...imageShow, ...imageUrl])
        }
    }

    const changeImage = (img, index) => {
        if (img) {
            let tempUrl = [...imageShow]
            let tempImages = [...images]

            tempImages[index] = img
            tempUrl[index] = { url: URL.createObjectURL(img) }
            setImageShow(tempUrl)
            setImages(tempImages)
        }
    }

    const removeImage = (i) => {
        const filterImage = images.filter((img, index) => index !== i)
        const filterImageUrl = imageShow.filter((img, index) => index !== i)

        setImages(filterImage)
        setImageShow(filterImageUrl)
    }

    const add = (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('name', state.name)
        formData.append('description', state.description)
        formData.append('price', state.price)
        formData.append('stock', state.stock)
        formData.append('discount', state.discount)
        formData.append('brand', state.brand)
        formData.append('shopName', 'EasyShop')
        formData.append('category', category)
        formData.append('unit', state.unit)
        formData.append('harvestDate', state.harvestDate)
        formData.append('bestBefore', state.bestBefore)

        for (let i = 0; i < images.length; i++) {
            formData.append('images', images[i])
        }
        dispatch(add_product(formData))
    }

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
            setState({
                name: "",
                description: '',
                discount: '',
                price: "",
                brand: "",
                stock: "",
                unit: "kg",
                harvestDate: "",
                bestBefore: ""
            })
            setImageShow([])
            setImages([])
            setCategory('')
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [successMessage, errorMessage, dispatch])

    useEffect(() => {
        setAllCategory(categorys)
    }, [categorys])

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800">Add Product</h1>
                            <p className="text-sm text-gray-500 mt-1">Fill in the details to add a new product</p>
                        </div>
                        <Link to='/seller/dashboard/products' className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-medium rounded-lg transition-colors duration-300">
                            View All Products
                        </Link>
                    </div>
                </div>

                <form onSubmit={add} className="p-6 space-y-8">
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
                                    <div className="py-2">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300"
                                onChange={inputHandle}
                                value={state.price}
                                type="number"
                                name='price'
                                id='price'
                                placeholder='Enter price'
                            />
                        </div>
                        <div>
                            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300"
                                onChange={inputHandle}
                                value={state.discount}
                                type="number"
                                name='discount'
                                id='discount'
                                placeholder='Enter discount percentage'
                            />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300"
                                onChange={inputHandle}
                                value={state.harvestDate}
                                type="date"
                                name='harvestDate'
                                id='harvestDate'
                            />
                        </div>
                        <div>
                            <label htmlFor="bestBefore" className="block text-sm font-medium text-gray-700 mb-1">Best Before Date</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-300"
                                onChange={inputHandle}
                                value={state.bestBefore}
                                type="date"
                                name='bestBefore'
                                id='bestBefore'
                            />
                        </div>
                    </div>

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

                    <div>
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
                                            htmlFor={`image-${i}`} 
                                            className="p-2 bg-white bg-opacity-25 rounded-full cursor-pointer hover:bg-opacity-40 transition-all duration-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
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
                                        onChange={(e) => changeImage(e.target.files[0], i)} 
                                        type="file" 
                                        id={`image-${i}`} 
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
                                        <span className="text-sm font-medium text-gray-600">Add Images</span>
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
                        <p className="text-xs text-gray-500">Upload clear, high-quality images of your products</p>
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
                                    <span>Adding Product...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Add Product</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                    </svg>
                                </>
                            )}
                    </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;