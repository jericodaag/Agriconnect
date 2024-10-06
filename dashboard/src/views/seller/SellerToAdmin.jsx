import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_admin_message, get_seller_message, get_sellers, send_message_seller_admin, updateAdminMessage, messageClear } from '../../store/Reducers/chatReducer';
import { socket } from '../../utils/utils';
import { FaPaperPlane, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

const SellerToAdmin = () => {
    const scrollRef = useRef();
    const dispatch = useDispatch();
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const { seller_admin_message, successMessage } = useSelector(state => state.chat);
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(get_seller_message());
    }, [dispatch]);

    const send = (e) => {
        e.preventDefault();
        if (text.trim()) {
            dispatch(send_message_seller_admin({
                senderId: userInfo._id,
                receverId: '',
                message: text,
                senderName: userInfo.name
            }));
            setText('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(e);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setText(prevText => prevText + emojiObject.emoji);
    };

    useEffect(() => {
        socket.on('receved_admin_message', msg => {
            dispatch(updateAdminMessage(msg));
        });
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            socket.emit('send_message_seller_to_admin', seller_admin_message[seller_admin_message.length - 1]);
            dispatch(messageClear());
        }
    }, [successMessage, seller_admin_message, dispatch]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [seller_admin_message]);

    return (
        <div className='px-2 lg:px-7 py-5'>
            <div className='w-full bg-[#f0f2f5] rounded-lg shadow-md h-[calc(100vh-140px)] overflow-hidden'>
                <div className='flex flex-col h-full'>
                    <div className='p-4 border-b border-gray-300 flex items-center'>
                        <img className='w-10 h-10 rounded-full mr-3' src="http://localhost:3001/images/admin.jpg" alt="" />
                        <h2 className='text-xl font-semibold text-gray-800'>Support</h2>
                    </div>
                    <div className='flex-1 overflow-y-auto p-4' ref={scrollRef}>
                        {seller_admin_message.map((m, i) => (
                            <div key={i} className={`flex ${m.senderId === userInfo._id ? 'justify-end' : 'justify-start'} mb-4`}>
                                <div className={`max-w-[70%] p-3 rounded-lg ${m.senderId === userInfo._id ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
                                    {m.message}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='p-4 border-t border-gray-300'>
                        <form onSubmit={send} className='flex items-center'>
                            <div className='relative flex-1'>
                                <input
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500'
                                    type="text"
                                    placeholder='Type a message...'
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmoji(!showEmoji)}
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                                >
                                    <FaSmile />
                                </button>
                                {showEmoji && (
                                    <div className='absolute bottom-full right-0 mb-2'>
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>
                                )}
                            </div>
                            <button type="submit" className='ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2'>
                                <FaPaperPlane />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerToAdmin;