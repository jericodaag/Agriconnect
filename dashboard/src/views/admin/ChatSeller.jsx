import React, { useEffect, useRef, useState } from 'react';
import { FaList, FaPaperPlane, FaSmile } from 'react-icons/fa';
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { get_admin_message, get_sellers, send_message_seller_admin, messageClear, updateSellerMessage } from '../../store/Reducers/chatReducer';
import { Link, useParams } from 'react-router-dom';
import { FaRegFaceGrinHearts } from "react-icons/fa6";
import toast from 'react-hot-toast';
import { socket } from '../../utils/utils';
import EmojiPicker from 'emoji-picker-react';

const ChatSeller = () => {
    const scrollRef = useRef();
    const [show, setShow] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const { sellerId } = useParams();
    const [text, setText] = useState('');
    const [receverMessage, setReceverMessage] = useState('');

    const { sellers, activeSeller, seller_admin_message, currentSeller, successMessage } = useSelector(state => state.chat);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(get_sellers());
    }, [dispatch]);

    useEffect(() => {
        if (sellerId) {
            dispatch(get_admin_message(sellerId));
        }
    }, [sellerId, dispatch]);

    const send = (e) => {
        e.preventDefault();
        if (text.trim()) {
            dispatch(send_message_seller_admin({
                senderId: '',
                receverId: sellerId,
                message: text,
                senderName: 'Admin Support'
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
            socket.emit('send_message_admin_to_seller', seller_admin_message[seller_admin_message.length - 1]);
            dispatch(messageClear());
        }
    }, [successMessage, seller_admin_message, dispatch]);

    useEffect(() => {
        socket.on('receved_seller_message', msg => {
            setReceverMessage(msg);
        });
    }, []);

    useEffect(() => {
        if (receverMessage) {
            if (receverMessage.senderId === sellerId && receverMessage.receverId === '') {
                dispatch(updateSellerMessage(receverMessage));
            } else {
                toast.success(receverMessage.senderName + " " + "Send A message");
                dispatch(messageClear());
            }
        }
    }, [receverMessage, sellerId, dispatch]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [seller_admin_message]);

    return (
        <div className='px-2 lg:px-7 py-5'>
            <div className='w-full bg-[#f0f2f5] rounded-lg shadow-md h-[calc(100vh-140px)] overflow-hidden'>
                <div className='flex w-full h-full'>
                    <div className={`w-[280px] h-full ${show ? 'block' : 'hidden'} md:block bg-white border-r border-gray-300`}>
                        <div className='p-4 border-b border-gray-300'>
                            <h2 className='text-2xl font-semibold text-gray-800'>Sellers</h2>
                        </div>
                        <div className='overflow-y-auto h-[calc(100%-60px)]'>
                            {sellers.map((s, i) => (
                                <Link 
                                    key={i} 
                                    to={`/admin/dashboard/chat-sellers/${s._id}`} 
                                    className={`flex items-center p-3 hover:bg-gray-100 ${sellerId === s._id ? 'bg-gray-100' : ''}`}
                                >
                                    <div className='relative'>
                                        <img className='w-12 h-12 rounded-full mr-3' src={s.image} alt={s.name} />
                                        {activeSeller.some(a => a.sellerId === s._id) && (
                                            <div className='w-3 h-3 bg-green-500 rounded-full absolute right-0 bottom-0 border-2 border-white'></div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className='font-semibold text-gray-800'>{s.name}</h3>
                                        <p className='text-sm text-gray-500'>
                                            {activeSeller.some(a => a.sellerId === s._id) ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className='flex-1 flex flex-col'>
                        {sellerId ? (
                            <>
                                <div className='p-4 border-b border-gray-300 flex justify-between items-center'>
                                    <div className='flex items-center'>
                                        <img className='w-10 h-10 rounded-full mr-3' src={currentSeller?.image} alt="" />
                                        <h2 className='text-xl font-semibold text-gray-800'>{currentSeller?.name}</h2>
                                    </div>
                                    <button onClick={() => setShow(!show)} className='md:hidden bg-blue-500 text-white p-2 rounded-full'>
                                        <FaList />
                                    </button>
                                </div>
                                <div className='flex-1 overflow-y-auto p-4' ref={scrollRef}>
                                    {seller_admin_message.map((m, i) => (
                                        <div key={i} className={`flex ${m.senderId === sellerId ? 'justify-start' : 'justify-end'} mb-4`}>
                                            <div className={`max-w-[70%] p-3 rounded-lg ${m.senderId === sellerId ? 'bg-white text-gray-800' : 'bg-blue-500 text-white'}`}>
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
                            <div className='flex-1 flex items-center justify-center flex-col text-gray-500'>
                                <FaRegFaceGrinHearts size={48} />
                                <p className='mt-2 text-xl'>Select a seller to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatSeller;