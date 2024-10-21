import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Rating from '../components/Rating';
import { FaHeart, FaFacebookF, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import { BsHourglassSplit } from "react-icons/bs";
import { MdOutlineWatchLater } from "react-icons/md";
import Reviews from '../components/Reviews';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useDispatch, useSelector } from 'react-redux';
import { product_details } from '../store/reducers/homeReducer';
import toast from 'react-hot-toast';
import { add_to_card, messageClear, add_to_wishlist } from '../store/reducers/cardReducer';

const Details = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const dispatch = useDispatch();
    const { product, relatedProducts, moreProducts } = useSelector(state => state.home);
    const { userInfo } = useSelector(state => state.auth);
    const { errorMessage, successMessage } = useSelector(state => state.card);

    const [image, setImage] = useState('');
    const [state, setState] = useState('reviews');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        dispatch(product_details(slug));
        window.scrollTo(0, 0);
    }, [slug, dispatch]);

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

    const responsive = {
        superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 5 },
        desktop: { breakpoint: { max: 3000, min: 1024 }, items: 5 },
        tablet: { breakpoint: { max: 1024, min: 464 }, items: 4 },
        mdtablet: { breakpoint: { max: 991, min: 464 }, items: 4 },
        mobile: { breakpoint: { max: 464, min: 0 }, items: 3 },
        smmobile: { breakpoint: { max: 640, min: 0 }, items: 2 },
        xsmobile: { breakpoint: { max: 440, min: 0 }, items: 1 }
    };

    const inc = () => {
        if (quantity >= product.stock) {
            toast.error('Out of Stock');
        } else {
            setQuantity(quantity + 1);
        }
    };

    const dec = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const add_card = () => {
        if (userInfo) {
            dispatch(add_to_card({
                userId: userInfo.id,
                quantity,
                productId: product._id
            }));
        } else {
            navigate('/login');
        }
    };

    const add_wishlist = () => {
        if (userInfo) {
            dispatch(add_to_wishlist({
                userId: userInfo.id,
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                discount: product.discount,
                rating: product.rating,
                slug: product.slug
            }));
        } else {
            navigate('/login');
        }
    };

    const buynow = () => {
        let price = 0;
        if (product.discount !== 0) {
            price = product.price - Math.floor((product.price * product.discount) / 100);
        } else {
            price = product.price;
        }

        const obj = [
            {
                sellerId: product.sellerId,
                shopName: product.shopName,
                price: quantity * (price - Math.floor((price * 5) / 100)),
                products: [
                    {
                        quantity,
                        productInfo: product
                    }
                ]
            }
        ];
        
        navigate('/shipping', {
            state: {
                products: obj,
                price: price * quantity,
                shipping_fee: 40,
                items: 1
            }
        });
    };

    const calculateDaysSinceHarvest = (harvestDate) => {
        const harvest = new Date(harvestDate);
        const today = new Date();
        const diffTime = Math.abs(today - harvest);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays;
    };

    const getFreshnessStatus = (daysSinceHarvest) => {
        if (daysSinceHarvest <= 3) {
            return { status: 'Very Fresh', color: 'text-green-600' };
        } else if (daysSinceHarvest <= 7) {
            return { status: 'Fresh', color: 'text-blue-600' };
        } else if (daysSinceHarvest <= 14) {
            return { status: 'Still Good', color: 'text-yellow-600' };
        } else {
            return { status: 'May be Perishing', color: 'text-red-600' };
        }
    };

    return (
        <div>
            <Header />
            <section className='bg-[url("http://localhost:3000/images/banner/shop.png")] h-[220px] mt-6 bg-cover bg-no-repeat relative bg-left'>
                <div className='absolute left-0 top-0 w-full h-full bg-[#2422228a]'>
                    <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
                        <div className='flex flex-col justify-center gap-1 items-center h-full w-full text-white'>
                            <h2 className='text-3xl font-bold'>Product Details</h2>
                            <div className='flex justify-center items-center gap-2 text-2xl w-full'>
                                <Link to='/'>Home</Link>
                                <span className='pt-1'><IoIosArrowForward /></span>
                                <span>Product Details</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className='bg-slate-100 py-5 mb-5'>
                    <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
                        <div className='flex justify-start items-center text-md text-slate-600 w-full'>
                            <Link to='/'>Home</Link>
                            <span className='pt-1'><IoIosArrowForward /></span>
                            <Link to='/'>{product.category}</Link>
                            <span className='pt-1'><IoIosArrowForward /></span>
                            <span>{product.name}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-12">
                <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] mx-auto'>
                    <div className='grid grid-cols-2 md-lg:grid-cols-1 gap-8'>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className='relative pb-[100%] mb-4 overflow-hidden rounded-lg'>
                                <img 
                                    className='absolute top-0 left-0 w-full h-full object-contain' 
                                    src={image ? image : product.images?.[0]} 
                                    alt={product.name} 
                                />
                            </div>
                            <div className='py-3'>
                                {product.images && (
                                    <Carousel
                                        autoPlay={true}
                                        infinite={true}
                                        responsive={responsive}
                                        transitionDuration={500}
                                        className="pb-4"
                                    >
                                        {product.images.map((img, i) => (
                                            <div key={i} onClick={() => setImage(img)} className="px-2">
                                                <img className='h-24 w-full object-cover cursor-pointer rounded-md transition-all duration-300 hover:opacity-75' src={img} alt="" />
                                            </div>
                                        ))}
                                    </Carousel>
                                )}
                            </div>
                        </div>

                        <div className='flex flex-col gap-6 bg-white p-6 rounded-lg shadow-md'>
                            <h1 className='text-3xl font-bold text-gray-800'>{product.name}</h1>
                            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
                                <div className='bg-red-100 px-3 py-1 rounded-full'>
                                    <p className='text-sm sm:text-base text-red-600 font-semibold'>Sold by: <span className='font-bold'>{product.shopName}</span></p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Rating ratings={product.rating} />
                                    <span className='text-green-600 font-medium'>(23 reviews)</span>
                                </div>
                            </div>
                            <div className='text-2xl font-bold flex items-center gap-3'>
                                {product.discount !== 0 ? (
                                    <>
                                        <span className='text-red-600'>₱{product.price - Math.floor((product.price * product.discount) / 100)}/{product.unit}</span>
                                        <span className='line-through text-gray-400 text-xl'>₱{product.price}/{product.unit}</span>
                                        <span className='bg-red-100 text-red-800 text-sm font-semibold px-2.5 py-0.5 rounded'>-{product.discount}%</span>
                                    </>
                                ) : (
                                    <span className='text-gray-800'>Price: ₱{product.price}/{product.unit}</span>
                                )}
                            </div>
                            <div className='bg-gray-50 p-4 rounded-md'>
                                <h3 className='text-xl font-semibold text-gray-800 mb-2'>Product Description</h3>
                                <p className='text-gray-600'>{product.description}</p>
                            </div>
                            
                            {/* New highlighted section for harvest and freshness information */}
                            <div className='bg-green-50 p-4 rounded-md border-l-4 border-green-500'>
                                <h4 className='text-lg font-semibold text-green-800 mb-3'>Freshness Information:</h4>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                    {product.harvestDate && (
                                        <div className='flex items-center gap-2'>
                                            <FiCalendar className="text-green-600 text-xl" />
                                            <div>
                                                <p className='text-sm text-gray-600'>Harvest Date:</p>
                                                <p className='font-semibold'>{new Date(product.harvestDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )}
                                    {product.harvestDate && (
                                        <div className='flex items-center gap-2'>
                                            <BsHourglassSplit className="text-green-600 text-xl" />
                                            <div>
                                                <p className='text-sm text-gray-600'>Days Since Harvest:</p>
                                                <p className='font-semibold'>{calculateDaysSinceHarvest(product.harvestDate)} days</p>
                                            </div>
                                        </div>
                                    )}
                                    {product.bestBefore && (
                                        <div className='flex items-center gap-2'>
                                            <MdOutlineWatchLater className="text-green-600 text-xl" />
                                            <div>
                                                <p className='text-sm text-gray-600'>Best Before:</p>
                                                <p className='font-semibold'>{new Date(product.bestBefore).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {product.harvestDate && (
                                    <div className='mt-3'>
                                        <p className='text-sm text-gray-600'>Freshness Status:</p>
                                        <p className={`font-semibold ${getFreshnessStatus(calculateDaysSinceHarvest(product.harvestDate)).color}`}>
                                            {getFreshnessStatus(calculateDaysSinceHarvest(product.harvestDate)).status}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className='bg-gray-50 p-4 rounded-md'>
                                <h4 className='text-lg font-semibold text-gray-800 mb-2'>Product Details:</h4>
                                <ul className='grid grid-cols-2 gap-2 text-gray-600'>
                                    <li>Price: ₱{product.price} per {product.unit}</li>
                                    <li>Unit of Sale: {product.unit}</li>
                                    <li>Brand: {product.brand}</li>
                                    <li>Category: {product.category}</li>
                                    <li>Stock: {product.stock} {product.unit}s available</li>
                                </ul>
                            </div>
                            <div className='flex items-center gap-4'>
                                {product.stock ? (
                                    <>
                                        <div className='flex items-center border border-gray-300 rounded-md'>
                                            <button onClick={dec} className='px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-l-md transition-colors duration-300'>-</button>
                                            <span className='px-4 py-2 font-medium'>{quantity}</span>
                                            <button onClick={inc} className='px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-r-md transition-colors duration-300'>+</button>
                                        </div>
                                        <button onClick={add_card} className='flex-grow py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors duration-300'>Add To Cart</button>
                                    </>
                                ) : (
                                    <p className='text-red-600 font-semibold'>Out of Stock</p>
                                )}
                                <button onClick={add_wishlist} className='p-2 bg-gray-100 hover:bg-gray-200 text-red-500 rounded-md transition-colors duration-300'>
                                    <FaHeart size={24} />
                                </button>
                            </div>
                            <div className='flex justify-between items-center py-4 border-t border-gray-200'>
                                <div>
                                    <span className='font-semibold text-gray-700'>Availability: </span>
                                    <span className={`font-medium ${product.stock ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.stock ? `In Stock (${product.stock})` : 'Out Of Stock'}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='font-semibold text-gray-700'>Share:</span>
                                    <div className='flex gap-2'>
                                        {[FaFacebookF, FaTwitter, FaLinkedin, FaGithub].map((Icon, index) => (
                                            <a key={index} href="#" className='w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition-colors duration-300'>
                                                <Icon />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className='flex gap-3'>
                                {product.stock ? (
                                    <button onClick={buynow} className='flex-grow py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-300'>Buy Now</button>
                                ) : ''}
                                <Link to={`/dashboard/chat/${product.sellerId}`} className='py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-colors duration-300'>
                                    Chat Seller
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto pb-16'>
                    <div className='flex flex-wrap'>
                        <div className='w-[72%] md-lg:w-full'>
                            <div className='pr-4 md-lg:pr-0'>
                                <div className='grid grid-cols-2'>
                                    <button onClick={() => setState('reviews')} className={`py-1 hover:text-white px-5 hover:bg-[#059473] ${state === 'reviews' ? 'bg-[#059473] text-white' : 'bg-slate-200 text-slate-700'} rounded-sm`}>Reviews</button>
                                    <button onClick={() => setState('description')} className={`py-1 hover:text-white px-5 hover:bg-[#059473] ${state === 'description' ? 'bg-[#059473] text-white' : 'bg-slate-200 text-slate-700'} rounded-sm`}>Description</button>
                                </div>
                                <div>
                                    {state === 'reviews' ? <Reviews product={product} /> : <p className='py-5 text-slate-600'>{product.description}</p>}
                                </div>
                            </div>
                        </div>
                        <div className='w-[28%] md-lg:w-full'>
                            <div className='pl-4 md-lg:pl-0'>
                                <div className='px-3 py-2 text-slate-600 bg-slate-200'>
                                    <h2 className='font-bold'>From {product.shopName}</h2>
                                </div>
                                <div className='flex flex-col gap-5 mt-3 border p-3'>
                                    {moreProducts.map((p, i) => (
                                        <Link to={`/product/details/${p.slug}`} key={i} className='block'>
                                            <div className='relative h-[270px]'>
                                                <img className='w-full h-full' src={p.images[0]} alt="" />
                                                {p.discount !== 0 && (
                                                    <div className='flex justify-center items-center absolute text-white w-[38px] h-[38px] rounded-full bg-red-500 font-semibold text-xs left-2 top-2'>{p.discount}%
                                                    </div>
                                                )}
                                            </div>
                                            <h2 className='text-slate-600 py-1 font-bold'>{p.name}</h2>
                                            <div className='flex gap-2'>
                                                <h2 className='text-lg font-bold text-slate-600'>₱{p.price}</h2>
                                                <div className='flex items-center gap-2'>
                                                    <Rating ratings={p.rating} />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
                    <h2 className='text-2xl py-8 text-slate-600'>Related Products</h2>
                    <div>
                        <Swiper
                            slidesPerView='auto'
                            breakpoints={{
                                1280: {
                                    slidesPerView: 3
                                },
                                565: {
                                    slidesPerView: 2
                                }
                            }}
                            spaceBetween={25}
                            loop={true}
                            pagination={{
                                clickable: true,
                                el: '.custom_bullet'
                            }}
                            modules={[Pagination]}
                            className='mySwiper'
                        >
                            {relatedProducts.map((p, i) => (
                                <SwiperSlide key={i}>
                                    <Link to={`/product/details/${p.slug}`} className='block'>
                                        <div className='relative h-[270px]'>
                                            <div className='w-full h-full'>
                                                <img className='w-full h-full' src={p.images[0]} alt="" />
                                                <div className='absolute h-full w-full top-0 left-0 bg-[#000] opacity-25 hover:opacity-50 transition-all duration-500'></div>
                                            </div>
                                            {p.discount !== 0 && (
                                                <div className='flex justify-center items-center absolute text-white w-[38px] h-[38px] rounded-full bg-red-500 font-semibold text-xs left-2 top-2'>{p.discount}%
                                                </div>
                                            )}
                                        </div>
                                        <div className='p-4 flex flex-col gap-1'>
                                            <h2 className='text-slate-600 text-lg font-bold'>{p.name}</h2>
                                            <div className='flex justify-start items-center gap-3'>
                                                <h2 className='text-lg font-bold text-slate-600'>₱{p.price}</h2>
                                                <div className='flex'>
                                                    <Rating ratings={p.rating} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    <div className='w-full flex justify-center items-center py-8'>
                        <div className='custom_bullet justify-center gap-3 !w-auto'></div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Details;