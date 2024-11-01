import React, { useEffect } from 'react';
import { FaEye, FaRegHeart } from "react-icons/fa";
import { RiShoppingCartLine } from "react-icons/ri";
import Rating from '../Rating';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { add_to_card, add_to_wishlist, messageClear } from '../../store/reducers/cardReducer';
import toast from 'react-hot-toast';

const FeatureProducts = ({ products }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { errorMessage, successMessage } = useSelector(state => state.card);

    const add_card = (id) => {
        if (userInfo) {
            dispatch(add_to_card({
                userId: userInfo.id,
                quantity: 1,
                productId: id
            }));
        } else {
            navigate('/login');
        }
    };

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

    const add_wishlist = (pro) => {
        dispatch(add_to_wishlist({
            userId: userInfo.id,
            productId: pro._id,
            name: pro.name,
            price: pro.price,
            image: pro.images[0],
            discount: pro.discount,
            rating: pro.rating,
            slug: pro.slug
        }));
    };

    return (
        <div className='w-[90%] mx-auto'>
            <div className='w-full'>
                <div className='text-center flex justify-center items-center flex-col text-2xl text-slate-600 font-bold relative pb-4'>
                    <h2>Fresh Products</h2>
                    <div className='w-[80px] h-[2px] bg-[#059473] mt-2'></div>
                </div>
            </div>

            <div className='w-full grid grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-2 gap-2'>
                {products.map((p, i) => (
                    <div key={i} className='border group transition-all duration-500 hover:shadow-md hover:-mt-1'>
                        <div className='relative overflow-hidden aspect-square'>
                            {p.discount ? (
                                <div className='flex justify-center items-center absolute text-white w-[25px] h-[25px] rounded-full bg-red-500 font-semibold text-xs left-1 top-1 z-10'>
                                    {p.discount}%
                                </div>
                            ) : ''}

                            <img 
                                className='w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110' 
                                src={p.images[0]} 
                                alt={p.name}
                            />

                            <ul className='flex transition-all duration-700 -bottom-10 justify-center items-center gap-1 absolute w-full group-hover:bottom-1'>
                                <li onClick={() => add_wishlist(p)} className='w-[25px] h-[25px] cursor-pointer bg-white flex justify-center items-center rounded-full hover:bg-[#059473] hover:text-white hover:rotate-[720deg] transition-all'>
                                    <FaRegHeart size={12} />
                                </li>
                                <Link to={`/product/details/${p.slug}`} className='w-[25px] h-[25px] cursor-pointer bg-white flex justify-center items-center rounded-full hover:bg-[#059473] hover:text-white hover:rotate-[720deg] transition-all'>
                                    <FaEye size={12} />
                                </Link>
                                <li onClick={() => add_card(p._id)} className='w-[25px] h-[25px] cursor-pointer bg-white flex justify-center items-center rounded-full hover:bg-[#059473] hover:text-white hover:rotate-[720deg] transition-all'>
                                    <RiShoppingCartLine size={12} />
                                </li>
                            </ul>
                        </div>

                        <div className='p-1 text-slate-600'>
                            <h2 className='font-semibold text-xs mb-1 truncate'>{p.name}</h2>
                            <div className='flex flex-col'>
                                <span className='text-xs font-semibold'>₱{p.price}/{p.unit}</span>
                                <div className='flex scale-90 origin-left'>
                                    <Rating ratings={p.rating} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeatureProducts;