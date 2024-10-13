import React, { useEffect, useRef, useState } from 'react';
import { FaList, FaPaperPlane, FaSmile } from 'react-icons/fa';
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { get_customer_message, get_customers, messageClear, send_message, updateMessage } from '../../store/Reducers/chatReducer';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { socket } from '../../utils/utils';
import EmojiPicker from 'emoji-picker-react';

const SellerToCustomer = () => {
    const messageContainerRef = useRef(null);
    const [show, setShow] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const sellerId = 65;
    const { userInfo } = useSelector(state => state.auth);
    const { customers, messages, currentCustomer, successMessage } = useSelector(state => state.chat);
    const [text, setText] = useState('');
    const [receverMessage, setReceverMessage] = useState('');

    const { customerId } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(get_customers(userInfo._id));
    }, []);

    useEffect(() => {
        if (customerId) {
            dispatch(get_customer_message(customerId));
        }
    }, [customerId]);

    const send = (e) => {
        e.preventDefault();
        if (text.trim()) {
            dispatch(send_message({
                senderId: userInfo._id,
                receverId: customerId,
                text,
                name: userInfo?.shopInfo?.shopName
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
        if (successMessage) {
            socket.emit('send_seller_message', messages[messages.length - 1]);
            dispatch(messageClear());
        }
    }, [successMessage]);

    useEffect(() => {
        socket.on('customer_message', msg => {
            setReceverMessage(msg);
        });
    }, []);

    useEffect(() => {
        if (receverMessage) {
            if (customerId === receverMessage.senderId && userInfo._id === receverMessage.receverId) {
                dispatch(updateMessage(receverMessage));
            } else {
                toast.success(receverMessage.senderName + " " + "Sent a message");
                dispatch(messageClear());
            }
        }
    }, [receverMessage]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    return (
        <div className='px-2 lg:px-7 py-5'>
            <div className='w-full bg-[#f0f2f5] rounded-lg shadow-md h-[calc(100vh-140px)] overflow-hidden'>
                <div className='flex w-full h-full'>
                    <div className={`w-[280px] h-full ${show ? 'block' : 'hidden'} md:block bg-white border-r border-gray-300`}>
                        <div className='p-4 border-b border-gray-300'>
                            <h2 className='text-2xl font-semibold text-gray-800'>Chats</h2>
                        </div>
                        <div className='overflow-y-auto h-[calc(100%-60px)]'>
                            {customers.map((c, i) => (
                                <Link key={i} to={`/seller/dashboard/chat-customer/${c.fdId}`} className={`flex items-center p-3 hover:bg-gray-100 ${customerId === c.fdId ? 'bg-gray-100' : ''}`}>
                                    <img className='w-12 h-12 rounded-full mr-3' src="http://localhost:3001/images/demo.jpg" alt="" />
                                    <div>
                                        <h3 className='font-semibold text-gray-800'>{c.name}</h3>
                                        <p className='text-sm text-gray-600'>Last message...</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className='flex-1 flex flex-col'>
                        {customerId ? (
                            <>
                                <div className='p-4 border-b border-gray-300 flex items-center'>
                                    <img className='w-10 h-10 rounded-full mr-3' src="http://localhost:3001/images/demo.jpg" alt="" />
                                    <h2 className='text-xl font-semibold text-gray-800'>{currentCustomer.name}</h2>
                                </div>
                                <div className='flex-1 overflow-y-auto p-4' ref={messageContainerRef}>
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.senderId === customerId ? 'justify-start' : 'justify-end'} mb-4`}>
                                            <div className={`max-w-[70%] p-3 rounded-lg ${m.senderId === customerId ? 'bg-white text-gray-800' : 'bg-blue-500 text-white'}`}>
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
                            </>
                        ) : (
                            <div className='flex-1 flex items-center justify-center'>
                                <p className='text-xl text-gray-500'>Select a customer to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerToCustomer;