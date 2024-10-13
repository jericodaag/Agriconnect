import React, { useEffect, useRef, useState } from 'react';
import { IoSend, IoArrowBack } from 'react-icons/io5';
import { FaSmile, FaList } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { add_friend, messageClear, send_message, updateMessage } from '../../store/reducers/chatReducer';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

const socket = io('http://localhost:5000');

const Chat = () => {
    const scrollRef = useRef();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { sellerId } = useParams();
    const { userInfo } = useSelector(state => state.auth);
    const { fb_messages, currentFd, my_friends, successMessage } = useSelector(state => state.chat);
    const [text, setText] = useState('');
    const [receverMessage, setReceverMessage] = useState('');
    const [activeSeller, setActiveSeller] = useState([]);
    const [showSellerList, setShowSellerList] = useState(!sellerId);
    const [showEmoji, setShowEmoji] = useState(false);

    useEffect(() => {
        if (userInfo && userInfo.id) {
            socket.emit('add_user', userInfo.id, userInfo);
        }
    }, [userInfo]);

    useEffect(() => {
        if (sellerId && userInfo && userInfo.id) {
            dispatch(add_friend({
                sellerId: sellerId || "",
                userId: userInfo.id
            }));
        }
    }, [sellerId, dispatch, userInfo]);

    useEffect(() => {
        socket.on('seller_message', msg => {
            setReceverMessage(msg);
        });
        socket.on('activeSeller', (sellers) => {
            setActiveSeller(sellers);
        });

        return () => {
            socket.off('seller_message');
            socket.off('activeSeller');
        };
    }, []);

    useEffect(() => {
        if (successMessage) {
            socket.emit('send_customer_message', fb_messages[fb_messages.length - 1]);
            dispatch(messageClear());
        }
    }, [successMessage, fb_messages, dispatch]);

    useEffect(() => {
        if (receverMessage) {
            if (sellerId === receverMessage.senderId && userInfo && userInfo.id === receverMessage.receverId) {
                dispatch(updateMessage(receverMessage));
            } else {
                toast.success(receverMessage.senderName + " " + "Send A message");
                dispatch(messageClear());
            }
        }
    }, [receverMessage, sellerId, userInfo, dispatch]);
    
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [fb_messages]);

    const send = (e) => {
        e.preventDefault();
        if (text.trim() && userInfo && userInfo.id) {
            dispatch(send_message({
                userId: userInfo.id,
                text: text.trim(),
                sellerId,
                name: userInfo.name 
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

    if (!userInfo) {
        return <div>Loading...</div>; // Or redirect to login
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {showSellerList ? (
                // Seller List View
                <div className="flex flex-col h-full">
                    <div className="bg-white shadow-md p-4">
                        <h1 className="text-xl font-bold text-gray-800">Messages</h1>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {my_friends && my_friends.map((f, i) => (
                            <Link 
                                to={`/dashboard/chat/${f.fdId}`} 
                                key={i} 
                                className="flex items-center p-3 hover:bg-gray-100 border-b"
                                onClick={() => setShowSellerList(false)}
                            >
                                <div className="relative">
                                    <img src={f.image} alt="" className="w-12 h-12 rounded-full" />
                                    {activeSeller.some(c => c.sellerId === f.fdId) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <span className="font-medium text-gray-800">{f.name}</span>
                                    <div className="text-sm text-gray-500">
                                        {activeSeller.some(c => c.sellerId === f.fdId) ? 'Active Now' : 'Offline'}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                // Chat View
                <div className="flex flex-col h-full">
                    {/* Chat Header */}
                    <div className="bg-white shadow-md p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <button onClick={() => setShowSellerList(true)} className="mr-3 text-gray-600">
                                <IoArrowBack size={24} />
                            </button>
                            {currentFd && (
                                <>
                                    <img src={currentFd.image} alt="" className="w-10 h-10 rounded-full mr-3" />
                                    <div>
                                        <span className="font-medium text-gray-800">{currentFd.name}</span>
                                        <div className="text-sm text-gray-500">
                                            {activeSeller.some(c => c.sellerId === currentFd.fdId) ? 'Active Now' : 'Offline'}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <button onClick={() => setShowSellerList(true)} className="text-gray-600">
                            <FaList size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {fb_messages && fb_messages.map((m, i) => (
                            <div ref={scrollRef} key={i} className={`flex mb-4 ${currentFd?.fdId !== m.receverId ? 'justify-start' : 'justify-end'}`}>
                                {currentFd?.fdId !== m.receverId && (
                                    <img src={currentFd?.image} alt="" className="w-8 h-8 rounded-full mr-2 self-end" />
                                )}
                                <div className={`max-w-[70%] px-4 py-2 rounded-3xl ${currentFd?.fdId !== m.receverId ? 'bg-white text-gray-800' : 'bg-blue-500 text-white'}`}>
                                    <span>{m.message}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={send} className="bg-white p-4 flex items-center">
                        <div className="relative flex-1">
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
                            <IoSend />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chat;