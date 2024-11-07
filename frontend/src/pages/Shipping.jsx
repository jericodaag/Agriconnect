import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const shippingFees = {
    'Mabalacat City': {
        default: 40,
        barangays: {
            'Dau': 30,
            'Mabiga': 30,
            'Poblacion': 30,
            'Tabun': 50,
            'Mawaque': 50
        }
    },
    'Angeles City': {
        default: 60,
        barangays: {
            'Balibago': 50,
            'Malabanias': 50,
            'Santo Domingo': 70,
            'Sapangbato': 80
        }
    }
};

const calculateShippingFee = (city, barangay) => {
    if (!shippingFees[city]) {
        return 40; // Default shipping fee if city is not found
    }
    return shippingFees[city].barangays[barangay] || shippingFees[city].default;
};

const Shipping = () => {
    const { state: { products, price, items } } = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector(state => state.auth);

    const [useLastAddress, setUseLastAddress] = useState(false);
    const [lastUsedAddress, setLastUsedAddress] = useState(null);
    const [res, setRes] = useState(false);
    const [state, setState] = useState({
        name: '',
        address: '',
        phone: '',
        post: '',
        province: '',
        city: '',
        barangay: ''
    });
    const [shippingFee, setShippingFee] = useState(40);

    const cities = ['Angeles City', 'Mabalacat City'];
    const barangays = {
        'Angeles City': [
            'Agapito Del Rosario', 'Anunas', 'Balibago', 'Capaya', 'Claro M. Recto',
            'Cutcut', 'Lourdes Sur', 'Lourdes Sur East', 'Malabanias', 'Mining',
            'Ninoy Aquino', 'Pandan', 'Pulung Cacutud', 'Pulung Maragul', 'Salapungan',
            'Santa Teresita', 'Santo Cristo', 'Santo Domingo', 'Santo Rosario', 'Sapangbato'
        ],
        'Mabalacat City': [
            'Atlu Bola', 'Bical', 'Bundagul', 'Camachiles', 'Dau', 'Dolores', 'Dapdap',
            'Mabiga', 'Marcos Village', 'Mawaque', 'Paralayunan', 'Poblacion', 'San Francisco',
            'Santa Ines', 'Sapang Biabas', 'Tabun'
        ]
    };

    useEffect(() => {
        const savedAddress = JSON.parse(localStorage.getItem('lastUsedAddress'));
        if (savedAddress) {
            setLastUsedAddress(savedAddress);
        }
    }, []);

    useEffect(() => {
        if (state.city && state.barangay) {
            const fee = calculateShippingFee(state.city, state.barangay);
            setShippingFee(fee);
        }
    }, [state.city, state.barangay]);

    const inputHandle = (e) => {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value
        }));

        if (name === 'city') {
            setState(prevState => ({
                ...prevState,
                barangay: ''
            }));
        }
    };

    const save = (e) => {
        e.preventDefault();
        if (useLastAddress && lastUsedAddress) {
            setRes(true);
            setState(lastUsedAddress);
            setShippingFee(calculateShippingFee(lastUsedAddress.city, lastUsedAddress.barangay));
        } else {
            const { name, address, phone, post, province, city, barangay } = state;
            if (name && address && phone && post && province && city && barangay) {
                setRes(true);
                localStorage.setItem('lastUsedAddress', JSON.stringify(state));
                setLastUsedAddress(state);
                setShippingFee(calculateShippingFee(city, barangay));
            }
        }
    };

    const placeOrder = () => {
        if (!res) {
            toast.error('Please provide shipping information');
            return;
        }

        if (!products || products.length === 0) {
            toast.error('No products in cart');
            return;
        }

        const formattedProducts = products.map(p => ({
            products: p.products.map(pt => ({
                productInfo: {
                    _id: pt.productInfo._id,
                    name: pt.productInfo.name,
                    images: pt.productInfo.images,
                    price: pt.productInfo.price - Math.floor((pt.productInfo.price * pt.productInfo.discount) / 100),
                    discount: pt.productInfo.discount,
                    brand: pt.productInfo.brand,
                    quantity: pt.quantity
                },
                quantity: pt.quantity,
                _id: pt._id
            })),
            price: p.price,
            sellerId: p.sellerId,
            shopName: p.shopName
        }));

        const orderData = {
            price,
            products: formattedProducts,
            shipping_fee: shippingFee,
            shippingInfo: state,
            userId: userInfo.id,
            items
        };

        console.log('Navigating to payment with data:', orderData);

        navigate('/payment', {
            state: orderData
        });
    };

    return (
        <div>
            <Header />
            <section className='bg-[url("http://localhost:3000/images/banner/shop.png")] h-[220px] mt-6 bg-cover bg-no-repeat relative bg-left'>
                <div className='absolute left-0 top-0 w-full h-full bg-[#2422228a]'>
                    <div className='w-[85%] md:w-[80%] sm:w-[90%] lg:w-[90%] h-full mx-auto'>
                        <div className='flex flex-col justify-center gap-1 items-center h-full w-full text-white'>
                            <h2 className='text-3xl font-bold'>Shipping Page</h2>
                            <div className='flex justify-center items-center gap-2 text-2xl w-full'>
                                <Link to='/'>Home</Link>
                                <span className='pt-1'>
                                    <IoIosArrowForward />
                                </span>
                                <span>Shipping</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='bg-[#eeeeee]'>
                <div className='w-[85%] lg:w-[90%] md:w-[90%] sm:w-[90%] mx-auto py-16'>
                    <div className='w-full flex flex-wrap'>
                        <div className='w-[67%] md-lg:w-full'>
                            <div className='flex flex-col gap-3'>
                                <div className='bg-white p-6 shadow-sm rounded-md'>
                                    <h2 className='text-slate-600 font-bold pb-3'>Shipping Information</h2>
                                    {!res && (
                                        <>
                                            {lastUsedAddress && (
                                                <div className='mb-4'>
                                                    <label className='flex items-center'>
                                                        <input
                                                            type="checkbox"
                                                            checked={useLastAddress}
                                                            onChange={() => {
                                                                setUseLastAddress(!useLastAddress);
                                                                if (!useLastAddress) {
                                                                    setState(lastUsedAddress);
                                                                    setShippingFee(calculateShippingFee(lastUsedAddress.city, lastUsedAddress.barangay));
                                                                } else {
                                                                    setState({
                                                                        name: '',
                                                                        address: '',
                                                                        phone: '',
                                                                        post: '',
                                                                        province: '',
                                                                        city: '',
                                                                        barangay: ''
                                                                    });
                                                                    setShippingFee(40);
                                                                }
                                                            }}
                                                            className='mr-2'
                                                        />
                                                        Use last used address
                                                    </label>
                                                </div>
                                            )}
                                            <form onSubmit={save}>
                                                <div className='flex md:flex-col md:gap-2 w-full gap-5 text-slate-600'>
                                                    <div className='flex flex-col gap-1 mb-2 w-full'>
                                                        <label htmlFor="name">Name</label>
                                                        <input onChange={inputHandle} value={state.name} type="text" className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' name="name" id="name" placeholder='Name' required />
                                                    </div>
                                                    <div className='flex flex-col gap-1 mb-2 w-full'>
                                                        <label htmlFor="address">Address</label>
                                                        <input onChange={inputHandle} value={state.address} type="text" className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' name="address" id="address" placeholder='Address' required />
                                                    </div>
                                                </div>
                                                <div className='flex md:flex-col md:gap-2 w-full gap-5 text-slate-600'>
                                                    <div className='flex flex-col gap-1 mb-2 w-full'>
                                                        <label htmlFor="phone">Phone</label>
                                                        <input onChange={inputHandle} value={state.phone} type="text" className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' name="phone" id="phone" placeholder='Phone' required />
                                                    </div>
                                                    <div className='flex flex-col gap-1 mb-2 w-full'>
                                                        <label htmlFor="post">Post</label>
                                                        <input onChange={inputHandle} value={state.post} type="text" className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' name="post" id="post" placeholder='Post' required />
                                                    </div>
                                                </div>
                                                <div className='flex md:flex-col md:gap-2 w-full gap-5 text-slate-600'>
                                                    <div className='flex flex-col gap-1 mb-2 w-full'>
                                                        <label htmlFor="province">Province</label>
                                                        <input onChange={inputHandle} value={state.province} type="text" className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md' name="province" id="province" placeholder='Province' required />
                                                    </div>
                                                    <div className='flex flex-col gap-1 mb-2 w-full'>
                                                        <label htmlFor="city">City</label>
                                                        <select
                                                            onChange={inputHandle}
                                                            value={state.city}
                                                            className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                            name="city"
                                                            id="city"
                                                            required
                                                        >
                                                            <option value="">Select City</option>
                                                            {cities.map((city, index) => (
                                                                <option key={index} value={city}>{city}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className='flex md:flex-col md:gap-2 w-full gap-5 text-slate-600'>
                                                    <div className='flex flex-col gap-1 mb-2 w-full'>
                                                        <label htmlFor="barangay">Barangay</label>
                                                        <select
                                                            onChange={inputHandle}
                                                            value={state.barangay}
                                                            className='w-full px-3 py-2 border border-slate-200 outline-none focus:border-green-500 rounded-md'
                                                            name="barangay"
                                                            id="barangay"
                                                            disabled={!state.city}
                                                            required
                                                        >
                                                            <option value="">Select Barangay</option>
                                                            {state.city && barangays[state.city].map((barangay, index) => (
                                                                <option key={index} value={barangay}>{barangay}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className='flex flex-col gap-1 mt-7 mb-2 w-full'>
                                                        <button type="submit" className='px-3 py-[6px] rounded-sm hover:shadow-green-500/50 hover:shadow-lg bg-green-500 text-white'>Save</button>
                                                    </div>
                                                </div>
                                            </form>
                                        </>
                                    )}
                                    {res && (
                                        <div className='flex flex-col gap-1'>
                                            <h2 className='text-slate-600 font-semibold pb-2'>Deliver To {state.name}</h2>
                                            <p>
                                                <span className='bg-blue-200 text-blue-800 text-sm font-medium mr-2 px-2 py-1 rounded'>Home</span>
                                                <span>{state.phone} {state.address} {state.province} {state.city} {state.barangay}</span>
                                                <span onClick={() => setRes(false)} className='text-indigo-500 cursor-pointer'> Change</span>
                                            </p>
                                            <p className='text-slate-600 text-sm'>Email To agriconnectshop@gmail.com</p>
                                        </div>
                                    )}
                                </div>
                                {products.map((p, i) => (
                                    <div key={i} className='flex bg-white p-4 flex-col gap-2'>
                                        <div className='flex justify-start items-center'>
                                            <h2 className='text-md text-slate-600 font-bold'>{p.shopName}</h2>
                                        </div>
                                        {p.products.map((pt, i) => (
                                            <div key={i} className='w-full flex flex-wrap'>
                                                <div className='flex sm:w-full gap-2 w-7/12'>
                                                    <div className='flex gap-2 justify-start items-center'>
                                                    <img className='w-[80px] h-[80px]' src={pt.productInfo.images[0]} alt="" />
                                                        <div className='pr-4 text-slate-600'>
                                                            <h2 className='text-md font-semibold'>{pt.productInfo.name}</h2>
                                                            <span className='text-sm'>Brand: {pt.productInfo.brand}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='flex justify-between w-5/12 sm:w-full sm:mt-3'>
                                                    <div className='pl-4 sm:pl-0'>
                                                        <h2 className='text-lg text-orange-500'>₱{pt.productInfo.price - Math.floor((pt.productInfo.price * pt.productInfo.discount) / 100)}</h2>
                                                        <p className='line-through'>₱{pt.productInfo.price}</p>
                                                        <p>-{pt.productInfo.discount}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='w-[33%] md-lg:w-full'>
                            <div className='pl-3 md-lg:pl-0 md-lg:mt-5'>
                                <div className='bg-white p-3 text-slate-600 flex flex-col gap-3'>
                                    <h2 className='text-xl font-bold'>Order Summary</h2>
                                    <div className='flex justify-between items-center'>
                                        <span>Items Total ({items} items)</span>
                                        <span>₱{price.toLocaleString('en-PH')}</span>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span>Delivery Fee</span>
                                        <span>₱{shippingFee.toLocaleString('en-PH')}</span>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span>Total Payment</span>
                                        <span>₱{(price + shippingFee).toLocaleString('en-PH')}</span>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span>Total</span>
                                        <span className='text-lg text-[#059473]'>₱{(price + shippingFee).toLocaleString('en-PH')}</span>
                                    </div>
                                    <button
                                        onClick={placeOrder}
                                        disabled={!res}
                                        className={`px-5 py-[6px] rounded-sm hover:shadow-red-500/50 hover:shadow-lg ${res ? 'bg-red-500' : 'bg-red-300'} text-sm text-white uppercase`}
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Shipping;