import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { get_card_products, delete_card_product, messageClear, quantity_inc, quantity_dec } from '../store/reducers/cardReducer';
import toast from 'react-hot-toast';

const Card = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { card_products, successMessage, price, buy_product_item, outofstock_products } = useSelector(state => state.card);

    const navigate = useNavigate();

    const FLAT_SHIPPING_FEE = 40;

    useEffect(() => {
        dispatch(get_card_products(userInfo.id));
    }, [dispatch, userInfo.id]);

    const redirect = () => {
        navigate('/shipping', {
            state: {
                products: card_products,
                price: price,
                shipping_fee: FLAT_SHIPPING_FEE,
                items: buy_product_item
            }
        });
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            dispatch(get_card_products(userInfo.id));
        }
    }, [successMessage, dispatch, userInfo.id]);

    const inc = (quantity, stock, card_id) => {
        const temp = quantity + 1;
        if (temp <= stock) {
            dispatch(quantity_inc(card_id));
        }
    };

    const dec = (quantity, card_id) => {
        const temp = quantity - 1;
        if (temp !== 0) {
            dispatch(quantity_dec(card_id));
        }
    };

    return (
        <div>
            <Header />
            <section className='bg-[url("http://localhost:3000/images/banner/shop.png")] h-[220px] mt-6 bg-cover bg-no-repeat relative bg-left'>
                <div className='absolute left-0 top-0 w-full h-full bg-[#2422228a]'>
                    <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
                        <div className='flex flex-col justify-center gap-1 items-center h-full w-full text-white'>
                            <h2 className='text-3xl font-bold'>Cart Page </h2>
                            <div className='flex justify-center items-center gap-2 text-2xl w-full'>
                                <Link to='/'>Home</Link>
                                <span className='pt-1'>
                                    <IoIosArrowForward />
                                </span>
                                <span>Cart </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='bg-[#eeeeee]'>
                <div className='w-[85%] lg:w-[90%] md:w-[90%] sm:w-[90%] mx-auto py-16'>
                    {card_products.length > 0 || outofstock_products.length > 0 ? (
                        <div className='flex flex-wrap'>
                            <div className='w-[67%] md-lg:w-full'>
                                <div className='pr-3 md-lg:pr-0'>
                                    <div className='flex flex-col gap-3'>
                                        <div className='bg-white p-4'>
                                            <h2 className='text-md text-green-500 font-semibold'>Stock Products {card_products.length}</h2>
                                        </div>

                                        {card_products.map((p, i) => (
                                            <div key={i} className='flex bg-white p-4 flex-col gap-2'>
                                                <div className='flex justify-start items-center'>
                                                    <h2 className='text-md text-slate-600 font-bold'>{p.shopName}</h2>
                                                </div>

                                                {p.products.map((pt, j) => (
                                                    <div key={j} className='w-full flex flex-wrap'>
                                                        <div className='flex sm:w-full gap-2 w-7/12'>
                                                            <div className='flex gap-2 justify-start items-center'>
                                                                <img className='w-[80px] h-[80px]' src={pt.productInfo.images[0]} alt="" />
                                                                <div className='pr-4 text-slate-600'>
                                                                    <h2 className='text-md font-semibold'>{pt.productInfo.name} </h2>
                                                                    <span className='text-sm'>Brand: {pt.productInfo.brand}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className='flex justify-between w-5/12 sm:w-full sm:mt-3'>
                                                            <div className='pl-4 sm:pl-0'>
                                                                <h2 className='text-lg text-orange-500'>₱{(pt.productInfo.price - Math.floor((pt.productInfo.price * pt.productInfo.discount) / 100)).toLocaleString('en-PH')}</h2>
                                                                <p className='line-through'>₱{pt.productInfo.price.toLocaleString('en-PH')}</p>
                                                                <p>-{pt.productInfo.discount}%</p>
                                                            </div>
                                                            <div className='flex gap-2 flex-col'>
                                                                <div className='flex bg-slate-200 h-[30px] justify-center items-center text-xl'>
                                                                    <div onClick={() => dec(pt.quantity, pt._id)} className='px-3 cursor-pointer'>-</div>
                                                                    <div className='px-3'>{pt.quantity}</div>
                                                                    <div onClick={() => inc(pt.quantity, pt.productInfo.stock, pt._id)} className='px-3 cursor-pointer'>+</div>
                                                                </div>
                                                                <button onClick={() => dispatch(delete_card_product(pt._id))} className='px-5 py-[3px] bg-red-500 text-white'>Delete</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}

                                        {outofstock_products.length > 0 && (
                                            <div className='flex flex-col gap-3'>
                                                <div className='bg-white p-4'>
                                                    <h2 className='text-md text-red-500 font-semibold'>Out of Stock {outofstock_products.length}</h2>
                                                </div>

                                                <div className='bg-white p-4'>
                                                    {outofstock_products.map((p, i) => (
                                                        <div key={i} className='w-full flex flex-wrap'>
                                                            <div className='flex sm:w-full gap-2 w-7/12'>
                                                                <div className='flex gap-2 justify-start items-center'>
                                                                    <img className='w-[80px] h-[80px]' src={p.products[0].images[0]} alt="" />
                                                                    <div className='pr-4 text-slate-600'>
                                                                        <h2 className='text-md font-semibold'>{p.products[0].name} </h2>
                                                                        <span className='text-sm'>Brand: {p.products[0].brand}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className='flex justify-between w-5/12 sm:w-full sm:mt-3'>
                                                                <div className='pl-4 sm:pl-0'>
                                                                    <h2 className='text-lg text-orange-500'>₱{(p.products[0].price - Math.floor((p.products[0].price * p.products[0].discount) / 100)).toLocaleString('en-PH')}</h2>
                                                                    <p className='line-through'>₱{p.products[0].price.toLocaleString('en-PH')}</p>
                                                                    <p>-{p.products[0].discount}%</p>
                                                                </div>
                                                                <div className='flex gap-2 flex-col'>
                                                                    <div className='flex bg-slate-200 h-[30px] justify-center items-center text-xl'>
                                                                        <div onClick={() => dec(p.quantity, p._id)} className='px-3 cursor-pointer'>-</div>
                                                                        <div className='px-3'>{p.quantity}</div>
                                                                        <div className='px-3 cursor-pointer'>+</div>
                                                                    </div>
                                                                    <button onClick={() => dispatch(delete_card_product(p._id))} className='px-5 py-[3px] bg-red-500 text-white'>Delete</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className='w-[33%] md-lg:w-full'>
                                <div className='pl-3 md-lg:pl-0 md-lg:mt-5'>
                                    {card_products.length > 0 && (
                                        <div className='bg-white p-3 text-slate-600 flex flex-col gap-3'>
                                            <h2 className='text-xl font-bold'>Order Summary</h2>
                                            <div className='flex justify-between items-center'>
                                                <span>{buy_product_item} Items </span>
                                                <span>₱{price.toLocaleString('en-PH')} </span>
                                            </div>
                                            <div className='flex justify-between items-center'>
                                                <span>Shipping Fee </span>
                                                <span>₱{FLAT_SHIPPING_FEE.toLocaleString('en-PH')} </span>
                                            </div>
                                            <div className='flex gap-2'>
                                                <input className='w-full px-3 py-2 border border-slate-200 outline-0 focus:border-green-500 rounded-sm' type="text" placeholder='Input Voucher Coupon' />
                                                <button className='px-5 py-[1px] bg-[#059473] text-white rounded-sm uppercase text-sm'>Apply</button>
                                            </div>
                                            <div className='flex justify-between items-center'>
                                                <span>Total</span>
                                                <span className='text-lg text-[#059473]'>₱{(price + FLAT_SHIPPING_FEE).toLocaleString('en-PH')} </span>
                                            </div>
                                            <button onClick={redirect} className='px-5 py-[6px] rounded-sm hover:shadow-red-500/50 hover:shadow-lg bg-red-500 text-sm text-white uppercase '>
                                                Proceed to Checkout ({buy_product_item})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center">
                        <Link 
                            to='/shops' 
                            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300 ease-in-out"
                        >
                            Shop Now
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5 ml-2" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path 
                                    fillRule="evenodd" 
                                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                                    clipRule="evenodd" 
                                />
                            </svg>
                        </Link>
                    </div>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Card;