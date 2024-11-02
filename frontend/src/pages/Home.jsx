import React, { useEffect } from 'react';
import Header from '../components/Header';
import Banner from '../components/Banner';
import Categorys from '../components/Categorys';
import FeatureProducts from '../components/products/FeatureProducts';
import Products from '../components/products/Products';
import Footer from '../components/Footer';
import { useDispatch, useSelector } from 'react-redux';
import { get_products } from '../store/reducers/homeReducer';
import { FaLeaf, FaTruck, FaStore, FaSeedling, FaArrowRight, FaShoppingBasket } from 'react-icons/fa';
import { IoMdThumbsUp } from 'react-icons/io';
import { Link } from 'react-router-dom';

const Home = () => {
    const dispatch = useDispatch();
    const { products, latest_product, topRated_product, discount_product } = useSelector(state => state.home);

    useEffect(() => {
        dispatch(get_products());
    }, []);

    return (
        <div className='w-full'>
            <Header />
            <Banner />

            {/* Trust Features Section */}
            <div className="w-[85%] mx-auto py-8">
                <div className="grid grid-cols-4 gap-6 md:grid-cols-2 sm:grid-cols-1">
                    {[
                        { icon: FaLeaf, title: "100% Fresh", desc: "Direct from farms" },
                        { icon: FaTruck, title: "Fast Delivery", desc: "Same-day available" },
                        { icon: FaStore, title: "Verified Vendors", desc: "Quality assured" },
                        { icon: IoMdThumbsUp, title: "Best Prices", desc: "Fair trade guaranteed" }
                    ].map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-full border border-[#059473] flex items-center justify-center">
                                <feature.icon className="text-[#059473] text-xl" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Categories Section */}
            <div className="w-[85%] mx-auto py-6">
                <Categorys />
            </div>

            {/* Featured Products */}
            <div className='py-8'>
                <div className="w-[85%] mx-auto mb-12">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
                        {/* Season's Fresh Picks Card */}
                        <div className="border rounded-lg p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <FaSeedling className="text-[#059473] text-3xl" />
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">Season's Fresh Picks</h3>
                                    <p className="text-gray-600">Discover the freshest harvest of the season</p>
                                </div>
                            </div>
                            <Link to="/shops" className="inline-block">
                                <button className="bg-[#059473] text-white px-6 py-3 rounded-lg hover:bg-[#048064] transition-all duration-300 flex items-center gap-2">
                                    View Seasonal Products
                                    <FaArrowRight size={16} />
                                </button>
                            </Link>
                        </div>

                        {/* Special Deals Card */}
                        <div className="border rounded-lg p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <FaShoppingBasket className="text-[#F98821] text-3xl" />
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">Special Deals</h3>
                                    <p className="text-gray-600">Get the best prices on fresh produce</p>
                                </div>
                            </div>
                            <Link to="/shops" className="inline-block">
                                <button className="bg-[#F98821] text-white px-6 py-3 rounded-lg hover:bg-[#ea580c] transition-all duration-300 flex items-center gap-2">
                                    View Special Offers
                                    <FaArrowRight size={16} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="w-[85%] mx-auto">
                    <FeatureProducts products={products} />
                </div>
            </div>

            {/* Product Sections */}
            <div className="py-12">
                <div className='w-[85%] mx-auto'>
                    <div className='grid w-full grid-cols-3 md-lg:grid-cols-2 md:grid-cols-1 gap-7'>
                        <div className='border rounded-lg p-6 hover:shadow-md transition-all duration-300'>
                            <Products title='Latest Products' products={latest_product} />
                        </div>
                        <div className='border rounded-lg p-6 hover:shadow-md transition-all duration-300'>
                            <Products title='Top Rated Products' products={topRated_product} />
                        </div>
                        <div className='border rounded-lg p-6 hover:shadow-md transition-all duration-300'>
                            <Products title='Special Offers' products={discount_product} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Community Section */}
            <div className="py-16 border-t">
                <div className="w-[85%] mx-auto">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Growing Together</h2>
                    <p className="text-gray-600 text-center mb-12">
                        Join our mission to support local agriculture and sustainable farming practices
                    </p>
                    <div className="grid grid-cols-3 gap-8 md:grid-cols-1">
                        {[
                            { number: "1,000+", label: "Active Farmers" },
                            { number: "50,000+", label: "Happy Customers" },
                            { number: "10,000+", label: "Products Delivered" }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center border rounded-lg p-8">
                                <div className="text-3xl font-bold text-[#059473] mb-2">{stat.number}</div>
                                <div className="text-gray-700">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Home;