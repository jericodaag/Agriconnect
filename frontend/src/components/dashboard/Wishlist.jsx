import React, { useEffect } from 'react';
import { FaEye, FaRegHeart } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import Rating from '../Rating';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_wishlist_products, remove_wishlist, messageClear } from '../../store/reducers/cardReducer';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const dispatch = useDispatch()
    const { userInfo } = useSelector(state => state.auth)
    const { wishlist, successMessage } = useSelector(state => state.card)

    useEffect(() => {
        dispatch(get_wishlist_products(userInfo.id))
    }, [])

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
        }
    }, [successMessage])

    return (
        <div className='w-full grid grid-cols-5 md-lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4'>
            {
                wishlist.map((p, i) => (
                    <Link to={`/product/details/${p.slug}`} key={i} className='block'>
                        <div className='border border-gray-100 rounded-lg group transition-all duration-500 hover:shadow-lg hover:-mt-2 bg-white h-full'>
                            <div className='relative overflow-hidden aspect-square rounded-t-lg'>
                                {p.discount !== 0 && (
                                    <div className='flex justify-center items-center absolute text-white w-[35px] h-[35px] rounded-full bg-red-500 font-semibold text-xs left-2 top-2 shadow-sm'>
                                        {p.discount}%
                                    </div>
                                )}

                                <img 
                                    className='w-full h-full object-cover' 
                                    src={p.image} 
                                    alt={p.name} 
                                />

                                <ul className='flex transition-all duration-700 -bottom-10 justify-center items-center gap-2 absolute w-full group-hover:bottom-3'>
                                    <li 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            dispatch(remove_wishlist(p._id));
                                        }} 
                                        className='w-[32px] h-[32px] cursor-pointer bg-white/90 flex justify-center items-center rounded-full hover:bg-[#059473] hover:text-white hover:rotate-[720deg] transition-all shadow-sm'
                                    >
                                        <FaRegHeart />
                                    </li>
                                    <Link 
                                        to={`/product/details/${p.slug}`}
                                        onClick={(e) => e.stopPropagation()} 
                                        className='w-[32px] h-[32px] cursor-pointer bg-white/90 flex justify-center items-center rounded-full hover:bg-[#059473] hover:text-white hover:rotate-[720deg] transition-all shadow-sm'
                                    >
                                        <FaEye />
                                    </Link>
                                    <li 
                                        onClick={(e) => e.preventDefault()} 
                                        className='w-[32px] h-[32px] cursor-pointer bg-white/90 flex justify-center items-center rounded-full hover:bg-[#059473] hover:text-white hover:rotate-[720deg] transition-all shadow-sm'
                                    >
                                        <RiShoppingCartLine />
                                    </li>
                                </ul>
                            </div>

                            <div className='p-3 text-slate-600'>
                                <h2 className='font-medium text-sm truncate'>{p.name}</h2>
                                <div className='flex justify-between items-center gap-2 mt-1'>
                                    <span className='text-sm font-semibold'>₱{p.price}/{p.unit}</span>
                                    <div className='flex scale-90'>
                                        <Rating ratings={p.rating} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))
            }
        </div>
    );
};

export default Wishlist;