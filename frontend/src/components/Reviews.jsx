import React, { useEffect, useState } from 'react';
import Rating from './Rating';
import RatingTemp from './RatingTemp';
import Pagination from './Pagination';
import { Link } from 'react-router-dom';
import RatingReact from 'react-rating';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import { CiStar } from 'react-icons/ci';
import { useDispatch, useSelector } from 'react-redux';
import { customer_review, get_reviews, messageClear, product_details } from '../store/reducers/homeReducer';
import toast from 'react-hot-toast';

const Reviews = ({ product }) => {
    const dispatch = useDispatch();
    const [parPage, setParPage] = useState(10);
    const [pageNumber, setPageNumber] = useState(1);
    
    const { userInfo } = useSelector(state => state.auth);
    const { successMessage, reviews, rating_review, totalReview } = useSelector(state => state.home);

    const [rat, setRat] = useState('');
    const [re, setRe] = useState('');

    const review_submit = (e) => {
        e.preventDefault();
        
        if (!userInfo || !userInfo.id) {
            toast.error('Please log in first');
            return;
        }
        
        if (!rat) {
            toast.error('Please select a rating');
            return;
        }
        if (!re.trim()) {
            toast.error('Please write a review');
            return;
        }

        const obj = {
            name: userInfo.name,
            review: re,
            rating: rat,
            productId: product._id,
            userId: userInfo.id
        };
        
        dispatch(customer_review(obj));
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(get_reviews({
                productId: product._id,
                pageNumber
            }));
            dispatch(product_details(product.slug));
            setRat('');
            setRe('');
            dispatch(messageClear());
        }
    }, [successMessage]);

    useEffect(() => {
        if (product._id) {
            dispatch(get_reviews({
                productId: product._id,
                pageNumber
            }));
        }
    }, [pageNumber, product]);

    return (
        <div className="mt-8">
            {/* Summary Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Overall Rating */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg">
                        <div className="flex items-baseline">
                            <span className="text-6xl font-bold text-gray-800">{product.rating || 0}</span>
                            <span className="text-xl text-gray-600 ml-1">/5</span>
                        </div>
                        <div className="flex text-3xl my-2">
                            <Rating ratings={product.rating} />
                        </div>
                        <p className="text-sm text-gray-600">Based on {totalReview} reviews</p>
                    </div>

                    {/* Rating Bars */}
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating, index) => (
                            <div key={rating} className="flex items-center gap-3">
                                <div className="w-24">
                                    <div className="flex text-[#EDBB0E]">
                                        <RatingTemp rating={rating} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#EDBB0E] transition-all duration-300"
                                            style={{ 
                                                width: `${Math.floor((100 * (rating_review[index]?.sum || 0)) / (totalReview || 1))}%` 
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500 w-12 text-right">
                                    {rating_review[index]?.sum || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Write Review Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review</h3>
                {userInfo ? (
                    <form onSubmit={review_submit} className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-700">Your Rating</label>
                            <div className="flex gap-1">
                                <RatingReact 
                                    onChange={(e) => setRat(e)}
                                    initialRating={rat}
                                    emptySymbol={<span className="text-gray-300 text-2xl"><CiStar/></span>}
                                    fullSymbol={<span className="text-[#EDBB0E] text-2xl"><FaStar/></span>}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-700">Your Review</label>
                            <textarea 
                                value={re} 
                                onChange={(e) => setRe(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent"
                                placeholder="What did you like or dislike about this product?"
                                rows="4"
                                required
                            />
                        </div>
                        <button 
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
                    >
                        Submit Review
                    </button>
                    </form>
                    ) : (
                    <div className="flex justify-center">
                        <Link 
                            to="/login" 
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
                        >
                            Login to Write a Review
                        </Link>
                    </div>
                    )}
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Customer Reviews</h3>
                <div className="space-y-6">
                    {reviews.map((review, index) => (
                        <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <FaUserCircle className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-medium text-gray-800">{review.name}</h4>
                                        <span className="text-sm text-gray-500">{review.date}</span>
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <RatingTemp rating={review.rating} />
                                    </div>
                                    <p className="text-gray-600">{review.review}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {reviews.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    </div>
                )}

                {totalReview > parPage && (
                    <div className="mt-6">
                        <Pagination 
                            pageNumber={pageNumber} 
                            setPageNumber={setPageNumber} 
                            totalItem={totalReview} 
                            parPage={parPage} 
                            showItem={5} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;