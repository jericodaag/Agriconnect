import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineMessage, AiOutlinePlus } from 'react-icons/ai';
import { GrEmoji } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { FaList, FaTimes, FaChevronLeft } from 'react-icons/fa';
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
    const [showSidebar, setShowSidebar] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        socket.emit('add_user', userInfo.id, userInfo);
    }, [userInfo]);

    useEffect(() => {
        dispatch(add_friend({
            sellerId: sellerId || "",
            userId: userInfo.id
        }));
    }, [sellerId, dispatch, userInfo.id]);

    const send = () => {
        if (text) {
            dispatch(send_message({
                userId: userInfo.id,
                text,
                sellerId,
                name: userInfo.name
            }));
            setText('');
            setShowEmoji(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setText(prevText => prevText + emojiObject.emoji);
    };

    useEffect(() => {
        socket.on('seller_message', msg => {
            setReceverMessage(msg);
        });
        socket.on('activeSeller', (sellers) => {
            setActiveSeller(sellers);
        });
    }, []);

    useEffect(() => {
        if (successMessage) {
            socket.emit('send_customer_message', fb_messages[fb_messages.length - 1]);
            dispatch(messageClear());
        }
    }, [successMessage, fb_messages, dispatch]);

    useEffect(() => {
        if (receverMessage) {
            if (sellerId === receverMessage.senderId && userInfo.id === receverMessage.receverId) {
                dispatch(updateMessage(receverMessage));
            } else {
                toast.success(receverMessage.senderName + " " + "Send A message");
                dispatch(messageClear());
            }
        }
    }, [receverMessage, sellerId, userInfo.id, dispatch]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [fb_messages]);

    const handleBackToList = () => {
        if (isMobile) {
            navigate('/dashboard/chat');
            setShowSidebar(true);
        }
    };

    return (
        <div className="bg-gray-100 h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-md p-4 flex justify-between items-center">
                {isMobile && currentFd && (
                    <button onClick={handleBackToList} className="text-gray-600 focus:outline-none">
                        <FaChevronLeft size={24} />
                    </button>
                )}
                <h1 className="text-xl font-semibold">Chat</h1>
                {(!isMobile || !currentFd) && (
                    <button onClick={() => setShowSidebar(true)} className="text-gray-600 focus:outline-none">
                        <FaList size={24} />
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Seller Sidebar */}
                <div className={`bg-white w-64 flex-shrink-0 border-r border-gray-200 overflow-y-auto
                    ${isMobile ? (showSidebar ? 'fixed inset-0 w-full z-50' : 'hidden') : 
                    showSidebar ? 'fixed inset-y-0 left-0 z-50 shadow-lg' : 'hidden'} md:block`}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="font-semibold">Sellers</h2>
                        <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-600 focus:outline-none">
                            <FaTimes size={20} />
                        </button>
                    </div>
                    <div className="p-2">
                        {my_friends.map((f, i) => (
                            <Link 
                                to={`/dashboard/chat/${f.fdId}`} 
                                key={i}
                                className="flex items-center p-2 hover:bg-gray-100 rounded-lg"
                                onClick={() => setShowSidebar(false)}
                            >
                                <div className="relative">
                                    <img src={f.image} alt="" className="w-10 h-10 rounded-full" />
                                    {activeSeller.some(c => c.sellerId === f.fdId) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <span className="ml-2 font-medium">{f.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {currentFd ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white p-4 shadow-sm flex items-center">
                                <img src={currentFd.image} alt="" className="w-10 h-10 rounded-full mr-3" />
                                <span className="font-semibold">{currentFd.name}</span>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
                                {fb_messages.map((m, i) => (
                                    <div key={i} className={`flex ${currentFd.fdId !== m.receverId ? 'justify-start' : 'justify-end'} mb-4`}>
                                        <div className={`max-w-[85%] p-3 rounded-lg ${currentFd.fdId !== m.receverId ? 'bg-white' : 'bg-blue-500 text-white'}`}>
                                            <p>{m.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="bg-white border-t p-4">
                                <div className="flex items-center">
                                    <button className="text-gray-500 mr-2">
                                        <AiOutlinePlus size={24} />
                                    </button>
                                    <div className="flex-1 bg-gray-100 rounded-full flex items-center overflow-hidden">
                                        <input
                                            type="text"
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type a message"
                                            className="flex-1 px-4 py-2 bg-transparent focus:outline-none"
                                        />
                                        <button 
                                            className="text-gray-500 mx-2"
                                            onClick={() => setShowEmoji(!showEmoji)}
                                        >
                                            <GrEmoji size={20} />
                                        </button>
                                    </div>
                                    <button onClick={send} className="ml-2 text-blue-500 focus:outline-none">
                                        <IoSend size={24} />
                                    </button>
                                </div>
                                {showEmoji && (
                                    <div className="absolute bottom-16 right-4 z-50">
                                        <div className="max-w-[90vw]">
                                            <EmojiPicker 
                                                onEmojiClick={handleEmojiClick}
                                                width={isMobile ? "100%" : "350px"}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <p>Select a seller to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;