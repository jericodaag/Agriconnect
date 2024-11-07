import React, { useEffect, useState, } from 'react';
import Search from '../components/Search';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { LuImageMinus } from "react-icons/lu";
import { useDispatch, useSelector } from 'react-redux';
import { get_products, delete_product } from '../../store/Reducers/productReducer';

const Products = () => {
    const dispatch = useDispatch()
    const { products, totalProduct } = useSelector(state => state.product)
   
    const [currentPage, setCurrentPage] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const [parPage, setParPage] = useState(5)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth)
        }
        
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Adjust items per page based on screen size
    useEffect(() => {
        if (windowWidth < 768) { // mobile view
            setParPage(3) // Show fewer items per page on mobile
        } else {
            setParPage(5) // Default for desktop
        }
    }, [windowWidth])

    useEffect(() => {
        const obj = {
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        }
        dispatch(get_products(obj))
    }, [searchValue, currentPage, parPage, dispatch])

    const handleDelete = (productId) => {
        if(window.confirm('Are you sure you want to delete this product?')) {
            dispatch(delete_product(productId));
        }
    }

    // Simplified pagination for mobile
    const SimplePagination = () => {
        const totalPages = Math.ceil(totalProduct / parPage)
        
        return (
            <div className="flex items-center justify-center gap-2 mt-4">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                        currentPage === 1 
                            ? 'bg-gray-100 text-gray-400' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Prev
                </button>
                <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                        currentPage === totalPages 
                            ? 'bg-gray-100 text-gray-400' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Next
                </button>
            </div>
        )
    }

    // Mobile card view component
    const ProductCard = ({ product, index }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            {/* Previous ProductCard content remains the same */}
            <div className="flex items-center gap-3 mb-3">
                <img 
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200" 
                    src={product.images[0]} 
                    alt={product.name}
                />
                <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-gray-500 text-sm">{product.brand}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category}
                    </span>
                </div>
                <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="ml-1 font-medium">₱{product.price}</span>
                    {product.discount > 0 && (
                        <span className="ml-1 text-[#F98821] text-xs">(-{product.discount}%)</span>
                    )}
                </div>
                <div>
                    <span className="text-gray-500">Stock:</span>
                    <span className="ml-1">{product.stock} {product.unit}</span>
                </div>
                <div>
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.stock > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
            </div>
            
            <div className="flex justify-end gap-2 border-t pt-3">
                <Link 
                    to={`/seller/dashboard/edit-product/${product._id}`}
                    className="p-2 text-gray-600 hover:text-[#438206] transition-colors duration-200 rounded-lg hover:bg-gray-100"
                >
                    <FaEdit size={18} />
                </Link>
                <Link 
                    to={`/seller/dashboard/add-banner/${product._id}`}
                    className="p-2 text-gray-600 hover:text-[#F98821] transition-colors duration-200 rounded-lg hover:bg-gray-100"
                >
                    <LuImageMinus size={18} />
                </Link>
                <button 
                    onClick={() => handleDelete(product._id)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                >
                    <FaTrash size={18} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-500 mt-1">Manage your product inventory</p>
                    </div>
                    <Link 
                        to="/seller/dashboard/add-product" 
                        className="inline-flex items-center justify-center px-4 py-2 bg-[#438206] text-white rounded-lg hover:bg-[#376c05] transition-colors duration-200 w-full sm:w-auto"
                    >
                        + Add Product
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 sm:p-6">
                        <div className="mb-6">
                            <Search 
                                setParPage={setParPage} 
                                setSearchValue={setSearchValue} 
                                searchValue={searchValue}
                            />
                        </div>

                        {/* Desktop view - Table */}
                        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-medium text-gray-900">No</th>
                                        <th scope="col" className="px-6 py-4 font-medium text-gray-900">Product</th>
                                        <th scope="col" className="px-6 py-4 font-medium text-gray-900">Category</th>
                                        <th scope="col" className="px-6 py-4 font-medium text-gray-900">Price</th>
                                        <th scope="col" className="px-6 py-4 font-medium text-gray-900">Stock</th>
                                        <th scope="col" className="px-6 py-4 font-medium text-gray-900">Status</th>
                                        <th scope="col" className="px-6 py-4 font-medium text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map((product, i) => (
                                        <tr key={i} className="bg-white hover:bg-gray-50">
                                            <td className="px-6 py-4">{i + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        className="w-12 h-12 rounded-lg object-cover border border-gray-200" 
                                                        src={product.images[0]} 
                                                        alt={product.name}
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-gray-500 text-sm">{product.brand}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">₱{product.price}</div>
                                                {product.discount > 0 && (
                                                    <div className="text-[#F98821] text-xs">
                                                        {product.discount}% off
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{product.stock}</div>
                                                <div className="text-gray-500 text-xs">{product.unit}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span 
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        product.stock > 0 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link 
                                                        to={`/seller/dashboard/edit-product/${product._id}`}
                                                        className="p-2 text-gray-600 hover:text-[#438206] transition-colors duration-200 rounded-lg hover:bg-gray-100"
                                                    >
                                                        <FaEdit size={18} />
                                                    </Link>
                                                    <Link 
                                                        to={`/seller/dashboard/add-banner/${product._id}`}
                                                        className="p-2 text-gray-600 hover:text-[#F98821] transition-colors duration-200 rounded-lg hover:bg-gray-100"
                                                    >
                                                        <LuImageMinus size={18} />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(product._id)}
                                                        className="p-2 text-gray-600 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                                                    >
                                                        <FaTrash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile view - Cards */}
                        <div className="md:hidden">
                            {products.map((product, i) => (
                                <ProductCard key={i} product={product} index={i} />
                            ))}
                            {totalProduct > parPage && windowWidth < 768 && <SimplePagination />}
                        </div>

                        {/* Desktop view pagination */}
                        {totalProduct > parPage && windowWidth >= 768 && (
                            <div className="mt-6 flex justify-end">
                                <Pagination 
                                    pageNumber={currentPage}
                                    setPageNumber={setCurrentPage}
                                    totalItem={totalProduct}
                                    parPage={parPage}
                                    showItem={3}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;