import React, { useState, useRef, useEffect } from 'react';
import { BsSend, BsImage } from "react-icons/bs";
import { TbArrowBackUp } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import useConversation from '../../zustand/useConversation';
import ReactMarkdown from 'react-markdown';

const GeminiChatInterface = () => {
    const STORAGE_KEY = 'gemini-chat-history';
    const AI_LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIik30qPXzkIEhMb72SI6KsmUt65VuADuFumJ37L7iEk8qUFSePHlmnm8ubuRUTd7mzbZiqZPAeyzcqw8kMz54EJhavugPViccWVQ_hw&s=10";

    // Load messages from localStorage or use default
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading chat history:', e);
            }
        }
        return [{ role: 'model', text: `Hello! I am ABONIKI AI. How can I help you today?` }];
    });

    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);
    const lastMessageRef = useRef(null);
    const { setSelectedConversation } = useConversation();

    // Save messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        setTimeout(() => {
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, [messages, loading]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() && !selectedImage) return;

        const userMessage = {
            role: 'user',
            text: input,
            image: selectedImage
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        const imageToSend = selectedImage;
        setSelectedImage(null);
        setLoading(true);

        try {
            const res = await fetch("/api/gemini/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage.text,
                    image: imageToSend
                })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            const aiMessage = { role: 'model', text: data.reply };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Error sending message to ABONIKI AI:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col h-full'>
            <div className='bg-slate-500 px-4 py-2 mb-2'>
                <div className='flex justify-between items-center'>
                    <div className=''>
                        <span className='label-text'>To:</span>
                        <span className='text-gray-900 font-bold '> ABONIKI AI</span>
                    </div>
                    <div className='flex items-center gap-2' >
                        <button
                            onClick={() => {
                                if (window.confirm('Clear all chat history?')) {
                                    setMessages([{ role: 'model', text: `Hello! I am ABONIKI AI. How can I help you today?` }]);
                                }
                            }}
                            className='text-sm text-white hover:text-red-300 hidden md:block'
                            title='Clear chat history'
                        >
                            Clear
                        </button>
                        <TbArrowBackUp
                            className='text-2xl hover:cursor-pointer text-white md:hidden'
                            onClick={() => setSelectedConversation(null)}
                        />
                        <div className="w-10 rounded-full">
                            <img alt="Nkrumah" src={AI_LOGO_URL} />
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex-1 overflow-auto p-4 flex flex-col gap-4'>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat ${msg.role === 'user' ? 'chat-end' : 'chat-start'}`}>
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="Avatar"
                                    src={msg.role === 'user' ? "https://avatar.iran.liara.run/public/boy" : AI_LOGO_URL}
                                />
                            </div>
                        </div>
                        <div className={`chat-bubble ${msg.role === 'user' ? 'bg-blue-500' : 'bg-gray-700'} text-white flex flex-col gap-2`}>
                            {msg.image && (
                                <img
                                    src={msg.image}
                                    alt="Uploaded"
                                    className="max-w-xs rounded-lg border border-gray-600"
                                />
                            )}
                            {msg.role === 'user' ? (
                                msg.text && <p>{msg.text}</p>
                            ) : (
                                <ReactMarkdown
                                    components={{
                                        code({ node, inline, className, children, ...props }) {
                                            return inline ? (
                                                <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                                                    {children}
                                                </code>
                                            ) : (
                                                <pre className="bg-gray-800 p-2 rounded my-2 overflow-x-auto">
                                                    <code className="text-sm" {...props}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            );
                                        },
                                        p({ children }) {
                                            return <div className="mb-2 last:mb-0">{children}</div>;
                                        },
                                        ul({ children }) {
                                            return <ul className="list-disc ml-4 mb-2">{children}</ul>;
                                        },
                                        ol({ children }) {
                                            return <ol className="list-decimal ml-4 mb-2">{children}</ol>;
                                        },
                                        strong({ children }) {
                                            return <strong className="font-bold">{children}</strong>;
                                        },
                                        em({ children }) {
                                            return <em className="italic">{children}</em>;
                                        },
                                        h1({ children }) {
                                            return <h1 className="text-xl font-bold mb-2">{children}</h1>;
                                        },
                                        h2({ children }) {
                                            return <h2 className="text-lg font-bold mb-2">{children}</h2>;
                                        },
                                        h3({ children }) {
                                            return <h3 className="text-base font-bold mb-2">{children}</h3>;
                                        }
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="chat chat-start">
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                                <img alt="Nkrumah" src={AI_LOGO_URL} />
                            </div>
                        </div>
                        <div className="chat-bubble bg-gray-700 text-white">
                            <span className="loading loading-dots loading-sm"></span>
                        </div>
                    </div>
                )}
                <div ref={lastMessageRef} />
            </div>

            <form className='px-4 my-3' onSubmit={sendMessage}>
                <div className='w-full relative flex flex-col gap-2'>
                    {selectedImage && (
                        <div className="relative w-fit">
                            <img src={selectedImage} alt="Preview" className="h-20 rounded-lg border border-gray-600" />
                            <button
                                type="button"
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                            >
                                <IoClose size={16} />
                            </button>
                        </div>
                    )}
                    <div className="relative w-full">
                        <input
                            type='text'
                            className='border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white pr-20'
                            placeholder='Ask ABONIKI...'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <div className="absolute inset-y-0 end-0 flex items-center pe-3 gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                            />
                            <button
                                type="button"
                                className="text-white hover:text-gray-300"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                            >
                                <BsImage size={20} />
                            </button>
                            <button type='submit' className='text-white hover:text-blue-300' disabled={loading}>
                                {loading ? <span className='loading loading-spinner'></span> : <BsSend size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default GeminiChatInterface;
