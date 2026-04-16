import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import jwt_decode from 'jwt-decode';
import { server } from '../Routes/Routes';
import { useParams } from 'react-router-dom';

const MessagesPage = () => {
    const { id: routeConversationId } = useParams();
    const token = localStorage.getItem('token');
    const currentUserId = useMemo(() => {
        if (!token) return null;
        try {
            return jwt_decode(token)._id;
        } catch {
            return null;
        }
    }, [token]);

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [recipientIdInput, setRecipientIdInput] = useState('');
    const [error, setError] = useState('');
    const [typingUserId, setTypingUserId] = useState(null);
    const [readNotice, setReadNotice] = useState('');
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const selectedPeer = selectedConversation?.participants?.find((user) => user._id !== currentUserId);

    const fetchConversations = useCallback(async () => {
        if (!token) return;
        const response = await fetch(`${server}/api/messages/conversations`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setConversations(data);
    }, [token]);

    const fetchMessages = useCallback(async (conversationId) => {
        if (!token || !conversationId) return;
        const response = await fetch(`${server}/api/messages/conversations/${conversationId}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setMessages(data);
        await fetch(`${server}/api/messages/conversations/${conversationId}/read`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
    }, [token]);

    const openConversation = useCallback(async (conversation) => {
        setSelectedConversation(conversation);
        await fetchMessages(conversation._id);
    }, [fetchMessages]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (!routeConversationId || conversations.length === 0) return;
        const target = conversations.find((conversation) => conversation._id === routeConversationId);
        if (target) {
            openConversation(target);
        }
    }, [routeConversationId, conversations, openConversation]);

    useEffect(() => {
        if (!token) return undefined;
        const socket = io(server, { auth: { token } });
        socketRef.current = socket;

        socket.on('message:receive', async (incomingMessage) => {
            setConversations((previous) => {
                const existing = previous.find((conversation) => conversation._id === incomingMessage.conversationId);
                if (!existing) return previous;
                const rest = previous.filter((conversation) => conversation._id !== incomingMessage.conversationId);
                return [{ ...existing, lastMessagePreview: incomingMessage.body, lastMessageAt: incomingMessage.createdAt }, ...rest];
            });

            if (selectedConversation?._id === incomingMessage.conversationId) {
                setMessages((previous) => {
                    if (previous.some((message) => message._id === incomingMessage._id)) return previous;
                    return [...previous, incomingMessage];
                });
                await fetch(`${server}/api/messages/conversations/${incomingMessage.conversationId}/read`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        });

        socket.on('typing:start', ({ conversationId, userId }) => {
            if (selectedConversation?._id !== conversationId || userId === currentUserId) return;
            setTypingUserId(userId);
        });

        socket.on('typing:stop', ({ conversationId, userId }) => {
            if (selectedConversation?._id !== conversationId || userId === currentUserId) return;
            setTypingUserId(null);
        });

        socket.on('conversation:read', ({ conversationId, userId }) => {
            if (selectedConversation?._id !== conversationId || userId === currentUserId) return;
            setReadNotice('Seen');
            setTimeout(() => setReadNotice(''), 2000);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token, selectedConversation?._id, currentUserId]);

    useEffect(() => {
        if (!socketRef.current || !selectedConversation?._id) return;
        socketRef.current.emit('conversation:join', { conversationId: selectedConversation._id });
        return () => {
            socketRef.current?.emit('conversation:leave', { conversationId: selectedConversation._id });
        };
    }, [selectedConversation?._id]);

    const startConversation = async (event) => {
        event.preventDefault();
        setError('');
        if (!recipientIdInput.trim()) return;

        const response = await fetch(`${server}/api/messages/conversations/${recipientIdInput.trim()}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
            setError(data.error || 'Failed to start conversation');
            return;
        }

        setRecipientIdInput('');
        await fetchConversations();
        setSelectedConversation(data);
        await fetchMessages(data._id);
    };

    const sendMessage = async (event) => {
        event.preventDefault();
        if (!selectedConversation || !messageInput.trim()) return;

        const response = await fetch(`${server}/api/messages/conversations/${selectedConversation._id}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ body: messageInput.trim() }),
        });

        const data = await response.json();
        if (!response.ok) {
            setError(data.error || 'Failed to send message');
            return;
        }

        setMessages((previous) => {
            if (previous.some((message) => message._id === data._id)) return previous;
            return [...previous, data];
        });
        setMessageInput('');
        setError('');
        socketRef.current?.emit('typing:stop', { conversationId: selectedConversation._id });
        socketRef.current?.emit('conversation:read', { conversationId: selectedConversation._id });
        fetchConversations();
    };

    if (!token || !currentUserId) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <p className="text-center text-gray-600 bg-white border border-emerald-100 rounded-2xl px-6 py-8 shadow-sm">
                    Please login to use messaging.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-74px)] bg-gradient-to-b from-emerald-50 via-white to-gray-100 px-3 sm:px-4 py-4 sm:py-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
                <aside className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 max-h-[calc(100vh-130px)] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                            {conversations.length}
                        </span>
                    </div>

                    <form onSubmit={startConversation} className="mb-4">
                        <input
                            value={recipientIdInput}
                            onChange={(event) => setRecipientIdInput(event.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            placeholder="Start chat with user ID"
                        />
                        <button className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-105 transition text-white font-semibold py-2.5 rounded-xl">
                            Start chat
                        </button>
                    </form>

                    <ul className="space-y-2">
                        {conversations.map((conversation) => {
                            const peer = conversation.participants.find((user) => user._id !== currentUserId);
                            const isActive = selectedConversation?._id === conversation._id;
                            return (
                                <li
                                    key={conversation._id}
                                    className={`p-3 rounded-xl cursor-pointer border transition ${isActive
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40'
                                        }`}
                                    onClick={() => openConversation(conversation)}
                                >
                                    <p className="font-semibold">{peer?.username || 'Unknown user'}</p>
                                    <p className={`text-sm truncate ${isActive ? 'text-emerald-100' : 'text-gray-500'}`}>
                                        {conversation.lastMessagePreview || 'No messages yet'}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                </aside>

                <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm flex flex-col min-h-[70vh] max-h-[calc(100vh-130px)]">
                    <header className="border-b border-gray-100 px-4 sm:px-5 py-4 font-semibold flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Direct message</p>
                            <p className="text-gray-900">
                                {selectedConversation
                                    ? `Chat with ${selectedPeer?.username || 'user'}`
                                    : 'Select a conversation'}
                            </p>
                        </div>
                        {selectedPeer && (
                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                                @{selectedPeer?.username}
                            </span>
                        )}
                    </header>

                    <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 bg-gradient-to-b from-white to-emerald-50/40">
                        {selectedConversation ? (
                            <div className="space-y-3">
                                {messages.map((message) => {
                                    const isMine = message.sender?._id === currentUserId;
                                    return (
                                        <div
                                            key={message._id}
                                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${isMine
                                                ? 'bg-emerald-600 text-white rounded-br-md'
                                                : 'bg-gray-100 text-black rounded-bl-md border border-gray-200'
                                                }`}
                                            >
                                                <p className={`text-xs mb-1 ${isMine ? 'text-emerald-100' : 'text-gray-500'}`}>
                                                    {message.sender?.username || 'Unknown'}
                                                </p>
                                                <p className="leading-relaxed break-words">{message.body}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {typingUserId && (
                                    <p className="text-xs text-gray-500 italic">The other user is typing...</p>
                                )}
                                {readNotice && (
                                    <p className="text-xs text-gray-500">{readNotice}</p>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500 text-center">
                                    Pick a conversation from the left to start messaging.
                                </p>
                            </div>
                        )}
                    </div>

                    {error && <p className="px-4 sm:px-5 py-2 text-red-600 text-sm border-t border-red-100 bg-red-50">{error}</p>}

                    {selectedConversation && (
                        <form onSubmit={sendMessage} className="border-t border-gray-100 p-3 sm:p-4 flex gap-2 bg-white rounded-b-2xl">
                            <input
                                value={messageInput}
                                onChange={(event) => {
                                    setMessageInput(event.target.value);
                                    if (!selectedConversation?._id) return;
                                    socketRef.current?.emit('typing:start', { conversationId: selectedConversation._id });
                                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                    typingTimeoutRef.current = setTimeout(() => {
                                        socketRef.current?.emit('typing:stop', { conversationId: selectedConversation._id });
                                    }, 1200);
                                }}
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-black focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                placeholder="Type your message..."
                            />
                            <button type="submit" className="bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-105 transition text-white font-semibold px-5 sm:px-6 rounded-xl">
                                Send
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MessagesPage;
