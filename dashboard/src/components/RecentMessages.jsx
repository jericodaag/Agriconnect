import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import customer from '../assets/demo.jpg';
import admin from '../assets/admin.jpg';
import seller from '../assets/seller.png';

const RecentMessages = ({ messages, userInfo, isAdmin }) => {
    const getUserType = (senderId, senderName) => {
        if (isAdmin) {
            if (senderId === userInfo._id) return 'You';
            return 'Seller';
        } else {
            if (senderId === '') return 'Admin';
            if (senderId === userInfo._id) return 'You';
            return 'Customer';
        }
    };
    
    const getAvatar = (senderId) => {
        if (isAdmin) {
            return senderId === userInfo._id ? admin : seller;
        } else {
            if (senderId === '') return admin;
            if (senderId === userInfo._id) return userInfo.image || seller;
            return customer;
        }
    };

    return (
        <div className='bg-white rounded-lg shadow-sm p-4'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-lg font-semibold text-gray-800'>Recent Messages</h2>
                <Link to={isAdmin ? "/admin/dashboard/chat-sellers" : "/dashboard/chat-cusomter"} className='text-sm text-blue-600 hover:underline'>View All</Link>
            </div>
            <div className='space-y-4'>
                {messages.map((m, i) => (
                    <div key={i} className='flex items-start space-x-3'>
                        <img className='w-10 h-10 rounded-full object-cover' src={getAvatar(m.senderId)} alt="" />
                        <div>
                            <p className='font-medium text-gray-800'>
                                <span className={`${
                                    isAdmin
                                        ? m.senderId === userInfo._id ? 'text-red-600' : 'text-blue-600'
                                        : m.senderId === '' ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                    {getUserType(m.senderId, m.senderName)}
                                </span>
                                {m.senderId !== userInfo._id && (
                                    <>
                                        <span className="text-gray-500"> to </span>
                                        <span className="text-green-600">You</span>
                                    </>
                                )}
                            </p>
                            <p className='text-sm text-gray-600 truncate'>{m.message}</p>
                            <p className='text-xs text-gray-400'>{moment(m.createdAt).fromNow()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentMessages;