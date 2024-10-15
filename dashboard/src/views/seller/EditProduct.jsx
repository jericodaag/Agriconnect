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
        setImageShow(product.images);
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

    const changeImage = (img, files) => {
        if (files.length > 0) {
            dispatch(product_image_update({
                oldImage: img,
                newImage: files[0],
                productId
            }));
        }
    };

    const update = (e) => {
        e.preventDefault();
        dispatch(update_product({
            name: state.name,
            description: state.description,
            discount: state.discount,
            price: state.price,
            brand: state.brand,
            stock: state.stock,
            productId: productId,
            unit: state.unit
        }));
    };

    return (
        <div className="bg-[#F7F7FC] min-h-screen p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#438206]">Edit Product</h1>
                    <Link to='/seller/dashboard/products' className="bg-[#F98821] hover:bg-[#e67d1e] text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">
                        All Products
                    </Link>
                </div>
                <form onSubmit={update} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[#438206]">Product Name</label>
                            <input
                                className="mt-1 block w-full px-3 py-2 bg-white border border-[#61BD12] rounded-md text-sm shadow-sm placeholder-gray-400
                                           focus:outline-none focus:border-[#438206] focus:ring-1 focus:ring-[#438206]"
                                onChange={inputHandle}
                                value={state.name}
                                type="text"
                                name='name'
                                id='name'
                                placeholder='Product Name'
                            />
                        </div>
                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-[#438206]">Brand</label>
                            <input
                                className="mt-1 block w-full px-3 py-2 bg-white border border-[#61BD12] rounded-md text-sm shadow-sm placeholder-gray-400
                                           focus:outline-none focus:border-[#438206] focus:ring-1 focus:ring-[#438206]"
                                onChange={inputHandle}
                                value={state.brand}
                                type="text"
                                name='brand'
                                id='brand'
                                placeholder='Brand Name'
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label htmlFor="category" className="block text-sm font-medium text-[#438206]">Category</label>
                            <div className="mt-1 relative">
                                <input
                                    readOnly
                                    onClick={() => setCateShow(!cateShow)}
                                    className="block w-full px-3 py-2 bg-white border border-[#61BD12] rounded-md text-sm shadow-sm placeholder-gray-400
                                               focus:outline-none focus:border-[#438206] focus:ring-1 focus:ring-[#438206] cursor-pointer"
                                    value={category}
                                    placeholder='--select category--'
                                />
                                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#438206]" />
                            </div>
                            {cateShow && (
                                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                    <div className="sticky top-0 z-10 bg-white">
                                        <input
                                            value={searchValue}
                                            onChange={categorySearch}
                                            className="block w-full px-3 py-2 bg-white border-b border-[#61BD12] text-sm placeholder-gray-400
                                                       focus:outline-none focus:border-[#438206] focus:ring-1 focus:ring-[#438206]"
                                            placeholder="Search category..."
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
                                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${category === c.name ? 'bg-[#61BD12] text-white' : 'text-gray-900 hover:bg-[#F7F7FC]'}`}
                                        >
                                            {c.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-[#438206]">Stock</label>
                            <input
                                className="mt-1 block w-full px-3 py-2 bg-white border border-[#61BD12] rounded-md text-sm shadow-sm placeholder-gray-400
                                           focus:outline-none focus:border-[#438206] focus:ring-1 focus:ring-[#438206]"
                                onChange={inputHandle}
                                value={state.stock}
                                type="number"
                                name='stock'
                                id='stock'
                                placeholder='Stock'
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-[#438206]">Price</label>
                            <input
                                className="mt-1 block w-full px-3 py-2 bg-white border border-[#61BD12] rounded-md text-sm shadow-sm placeholder-gray-400
                                           focus:outline-none focus:border-[#438206] focus:ring-1 focus:ring-[#438206]"
                                onChange={inputHandle}
                                value={state.price}
                                type="number"
                                name='price'
                                id='price'
                                placeholder='Price'
                            />
                        </div>
                        <div>
                            <label htmlFor="discount" className="block text-sm font-medium text-[#438206]">Discount (%)</label>
                            <input
                                className="mt-1 block w-full px-3 py-2 bg-white border border-[#61BD12] rounded-md text-sm shadow-sm placeholder-gray-400
                                           focus:outline-none focus:border-[#438206] focus:ring-1 focus:ring-[#438206]"
                                onChange={inputHandle}
                                value={state.discount}
                                type="number"
                                name='discount'
                                id='discount'
                                placeholder='Discount percentage'
                            />
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-[#438206]">Unit</label>
                            <select
                                className="mt-1 block w-full px-3 py-2 bg-white border border-[#61BD12] rounded-md text-sm shadow-sm placeholder-gray-400
                                           focus:outline-none focus:border-[#438206] focus:ring-1 focus:ring-[#438206]"
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

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-[#438206]">Description</label>
                        <textarea
                            className="mt-1 block w-full px-3 py-2 bg-white border border-[#61BD12] rounded-md text-sm shadow-sm placeholder-gray-400
                                       focus:outline-none focus:border-[#438206] focus:ring-1 focus:ring-[#438206]"
                            onChange={inputHandle}
                            value={state.description}
                            name='description'
                            id='description'
                            rows="4"
                            placeholder='Product description'
                            ></textarea>
                            </div>
        
                            <div>
                                <label className="block text-sm font-medium text-[#438206] mb-2">Product Images</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {imageShow && imageShow.length > 0 && imageShow.map((img, i) => (
                                        <div key={i} className="relative group">
                                            <img src={img} alt="" className="w-full h-32 object-cover rounded-lg" />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <label htmlFor={`file-${i}`} className="text-white cursor-pointer">
                                                    <IoMdImages className="h-8 w-8" />
                                                </label>
                                            </div>
                                            <input
                                                onChange={(e) => changeImage(img, e.target.files)}
                                                type="file"
                                                id={`file-${i}`}
                                                className="hidden"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
        
                            <div>
                                <button
                                    disabled={loader}
                                    type="submit"
                                    className="w-full bg-[#438206] text-white py-2 px-4 rounded-md hover:bg-[#61BD12] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#61BD12]"
                                >
                                    {loader ? <PropagateLoader color='#fff' cssOverride={overrideStyle} /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        };
        
        export default EditProduct;