import React, { useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';
import 'react-multi-carousel/lib/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { get_banners } from '../store/reducers/homeReducer';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Banner = () => {
    const dispatch = useDispatch();
    const { banners } = useSelector(state => state.home);

    const responsive = {
        superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 1 },
        desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
        tablet: { breakpoint: { max: 1024, min: 464 }, items: 1 },
        mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
    };

    useEffect(() => {
        dispatch(get_banners());
    }, [dispatch]);

    const CustomDot = ({ onClick, ...rest }) => {
        const { active } = rest;
        return (
            <button
                className={`${active ? 'bg-[#059473]' : 'bg-white'} w-3 h-3 mx-1 rounded-full focus:outline-none`}
                onClick={() => onClick()}
            />
        );
    };

    const CustomLeftArrow = ({ onClick }) => (
        <button onClick={() => onClick()} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-300">
            <FaChevronLeft className="text-[#059473]" />
        </button>
    );

    const CustomRightArrow = ({ onClick }) => (
        <button onClick={() => onClick()} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-300">
            <FaChevronRight className="text-[#059473]" />
        </button>
    );

    return (
        <div className='w-full md-lg:mt-6'>
            <div className='w-[85%] lg:w-[90%] mx-auto'>
                <div className='w-full flex flex-wrap md-lg:gap-8'>
                    <div className='w-full'>
                        <div className='my-8 rounded-lg overflow-hidden shadow-lg'>
                            <Carousel
                                autoPlay={true}
                                infinite={true}
                                responsive={responsive}
                                showDots={true}
                                customDot={<CustomDot />}
                                customLeftArrow={<CustomLeftArrow />}
                                customRightArrow={<CustomRightArrow />}
                                dotListClass="custom-dot-list-style"
                                itemClass="carousel-item-padding-40-px"
                            >
                                {banners.length > 0 && banners.map((b, i) => (
                                    <Link key={i} to={`product/details/${b.link}`}>
                                        <img src={b.banner} alt="" className="w-full h-auto object-cover" />
                                    </Link>
                                ))}
                            </Carousel>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;