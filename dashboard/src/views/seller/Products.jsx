import React, { useEffect, useState } from 'react';
import Search from '../components/Search';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination'; 
import { FaEdit, FaEye, FaTrash, FaChartLine } from 'react-icons/fa'; 
import { LuImageMinus } from "react-icons/lu";
import { useDispatch, useSelector } from 'react-redux';
import { get_products, delete_product } from '../../store/Reducers/productReducer';

const Products = () => {
    const dispatch = useDispatch()
    const { products, totalProduct } = useSelector(state => state.product)
   
    const [currentPage, setCurrentPage] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const [parPage, setParPage] = useState(5)

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

    return (
        <div className='bg-white min-h-screen p-6'>
            <div className='max-w-7xl mx-auto'>
                <h1 className='text-[#438206] font-bold text-3xl mb-6'>All Products</h1>

                <div className='bg-[#F7F7FC] rounded-lg shadow-md p-6'> 
                    <div className='mb-6'>
                        <Search setParPage={setParPage} setSearchValue={setSearchValue} searchValue={searchValue} />
                    </div>

                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm text-left text-gray-500'>
                            <thead className='text-xs text-[#438206] uppercase bg-[#F7F7FC] border-b border-[#61BD12]'>
                                <tr>
                                    <th scope='col' className='py-3 px-4'>No</th>
                                    <th scope='col' className='py-3 px-4'>Image</th>
                                    <th scope='col' className='py-3 px-4'>Name</th>
                                    <th scope='col' className='py-3 px-4'>Category</th>
                                    <th scope='col' className='py-3 px-4'>Brand</th>
                                    <th scope='col' className='py-3 px-4'>Price</th>
                                    <th scope='col' className='py-3 px-4'>Discount</th>
                                    <th scope='col' className='py-3 px-4'>Stock</th>
                                    <th scope='col' className='py-3 px-4'>Unit</th>
                                    <th scope='col' className='py-3 px-4'>Action</th> 
                                </tr>
                            </thead>

                            <tbody>
                                {products.map((d, i) => (
                                    <tr key={i} className='bg-white border-b hover:bg-gray-50 transition-colors duration-200'>
                                        <td className='py-2 px-4 font-medium whitespace-nowrap'>{i + 1}</td>
                                        <td className='py-2 px-4 font-medium whitespace-nowrap'>
                                            <img className='w-12 h-12 rounded-full object-cover' src={d.images[0]} alt={d.name} />
                                        </td>
                                        <td className='py-2 px-4 font-medium whitespace-nowrap'>{d?.name?.slice(0,15)}</td>
                                        <td className='py-2 px-4 font-medium whitespace-nowrap'>{d.category}</td>
                                        <td className='py-2 px-4 font-medium whitespace-nowrap'>{d.brand}</td>
                                        <td className='py-2 px-4 font-medium whitespace-nowrap'>₱{d.price}</td>
                                        <td className='py-2 px-4 font-medium whitespace-nowrap'>
                                            {d.discount === 0 ? (
                                                <span className='text-gray-500'>No Discount</span>
                                            ) : (
                                                <span className='text-[#F98821] font-semibold'>%{d.discount}</span>
                                            )}
                                        </td>
                                        <td className='py-2 px-4 font-medium whitespace-nowrap'>{d.stock}</td>
                                        <td className='py-2 px-4 font-medium whitespace-nowrap'>{d.unit}</td>
                                        <td className='py-2 px-4 font-medium whitespace-nowrap'>
                                            <div className='flex justify-start items-center gap-2'>
                                                <Link to={`/seller/dashboard/edit-product/${d._id}`} className='p-1 bg-[#61BD12] text-white rounded hover:bg-[#438206] transition-colors duration-200'>
                                                    <FaEdit size={16} />
                                                </Link>
                                                <Link to={`/seller/dashboard/add-banner/${d._id}`} className='p-1 bg-[#F98821] text-white rounded hover:bg-[#e67d1e] transition-colors duration-200'>
                                                    <LuImageMinus size={16} />
                                                </Link>
                                                <Link to={`/seller/dashboard/inventory-history/${d._id}`} className='p-1 bg-[#438206] text-white rounded hover:bg-[#61BD12] transition-colors duration-200'>
                                                    <FaChartLine size={16} />
                                                </Link>
                                                <button onClick={() => handleDelete(d._id)} className='p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200'>
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody> 
                        </table> 
                    </div>  

                    {totalProduct > parPage && (
                        <div className='mt-6 flex justify-end'>
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
    );
};

export default Products;