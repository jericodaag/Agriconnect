import React from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import 'react-multi-carousel/lib/styles.css';
import { useSelector } from 'react-redux';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Categorys = () => {
    const { categorys } = useSelector(state => state.home);
    
    const responsive = {
        superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 6 },
        desktop: { breakpoint: { max: 3000, min: 1024 }, items: 6 },
        tablet: { breakpoint: { max: 1024, min: 464 }, items: 4 },
        mdtablet: { breakpoint: { max: 991, min: 464 }, items: 4 },
        mobile: { breakpoint: { max: 464, min: 0 }, items: 3 },
        smmobile: { breakpoint: { max: 640, min: 0 }, items: 2 },
        xsmobile: { breakpoint: { max: 440, min: 0 }, items: 1 },
    };

    const CustomLeftArrow = ({ onClick }) => (
        <button
            onClick={() => onClick()}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center 
                     bg-white rounded-full border border-gray-200 z-10 group hover:bg-[#059473] 
                     hover:border-[#059473] transition-all duration-300"
        >
            <FaChevronLeft className="text-gray-500 group-hover:text-white transition-colors" size={14} />
        </button>
    );

    const CustomRightArrow = ({ onClick }) => (
        <button
            onClick={() => onClick()}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center 
                     bg-white rounded-full border border-gray-200 z-10 group hover:bg-[#059473] 
                     hover:border-[#059473] transition-all duration-300"
        >
            <FaChevronRight className="text-gray-500 group-hover:text-white transition-colors" size={14} />
        </button>
    );

    return (
        <div className='w-[87%] mx-auto relative'>
            <div className='w-full mb-10'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-gray-800 mb-2'>Top Categories</h2>
                    <p className='text-gray-600 text-sm mb-4'>Explore our fresh selections</p>
                    <div className='w-20 h-1 bg-[#059473] mx-auto rounded-full'></div>
                </div>
            </div>

            <div className='px-4'>
                <Carousel
                    autoPlay={true}
                    infinite={true}
                    arrows={true}
                    responsive={responsive}
                    transitionDuration={500}
                    customLeftArrow={<CustomLeftArrow />}
                    customRightArrow={<CustomRightArrow />}
                    itemClass="px-2"
                >
                    {categorys.map((c, i) => (
                        <Link 
                            key={i} 
                            to={`/products?category=${c.name}`}
                            className="block"
                        >
                            <div className='relative overflow-hidden rounded-xl border group cursor-pointer'>
                                <div className='aspect-square'>
                                    <img 
                                        src={c.image} 
                                        alt={c.name}
                                        className='w-full h-full object-cover transform group-hover:scale-110 
                                                 transition-transform duration-500'
                                    />
                                </div>
                                <div className='absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm 
                                              transform translate-y-full group-hover:translate-y-0 
                                              transition-transform duration-300'>
                                    <div className='p-3 text-center'>
                                        <span className='text-gray-800 font-medium block'>{c.name}</span>
                                        <span className='text-[#059473] text-sm'>View Products</span>
                                    </div>
                                </div>
                                <div className='absolute inset-0 border-2 border-transparent group-hover:border-[#059473] 
                                              rounded-xl transition-colors duration-300'></div>
                            </div>
                        </Link>
                    ))}
                </Carousel>
            </div>
        </div>
    );
};

export default Categorys;