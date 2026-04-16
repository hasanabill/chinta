import { useCallback, useEffect, useMemo, useState } from 'react';
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

        socket.on('message:receive', (incomingMessage) => {
            setConversations((previous) => {
                const existing = previous.find((conversation) => conversation._id === incomingMessage.conversationId);
                if (!existing) return previous;
                const rest = previous.filter((conversation) => conversation._id !== incomingMessage.conversationId);
                return [{ ...existing, lastMessagePreview: incomingMessage.body, lastMessageAt: incomingMessage.createdAt }, ...rest];
            });

            if (selectedConversation?._id === incomingMessage.conversationId) {
                setMessages((previous) => [...previous, incomingMessage]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [token, selectedConversation?._id]);

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

        setMessages((previous) => [...previous, data]);
        setMessageInput('');
        setError('');
        fetchConversations();
    };

    if (!token || !currentUserId) {
        return <p className="p-6 text-center text-gray-600">Please login to use messaging.</p>;
    }

    return (
        <div className="flex h-[calc(100vh-90px)]">
            <aside className="w-80 bg-gray-100 p-4 border-r overflow-y-auto">
                <h2 className="text-lg font-bold mb-3">Conversations</h2>
                <form onSubmit={startConversation} className="mb-4">
                    <input
                        value={recipientIdInput}
                        onChange={(event) => setRecipientIdInput(event.target.value)}
                        className="w-full px-3 py-2 border rounded text-black"
                        placeholder="Start chat with user ID"
                    />
                    <button className="w-full mt-2 bg-[#009c51] text-white py-2 rounded">Start chat</button>
                </form>
                <ul className="space-y-2">
                    {conversations.map((conversation) => {
                        const peer = conversation.participants.find((user) => user._id !== currentUserId);
                        return (
                            <li
                                key={conversation._id}
                                className={`p-3 rounded cursor-pointer ${selectedConversation?._id === conversation._id ? 'bg-green-600 text-white' : 'bg-white'}`}
                                onClick={() => openConversation(conversation)}
                            >
                                <p className="font-semibold">{peer?.username || 'Unknown user'}</p>
                                <p className={`text-sm truncate ${selectedConversation?._id === conversation._id ? 'text-green-100' : 'text-gray-500'}`}>
                                    {conversation.lastMessagePreview || 'No messages yet'}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            </aside>

            <section className="flex-1 flex flex-col bg-white">
                <header className="border-b p-4 font-semibold">
                    {selectedConversation
                        ? `Chat with ${selectedConversation.participants.find((user) => user._id !== currentUserId)?.username || 'user'}`
                        : 'Select a conversation'}
                </header>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {selectedConversation ? (
                        <div className="space-y-3">
                            {messages.map((message) => (
                                <div
                                    key={message._id}
                                    className={`flex ${message.sender?._id === currentUserId ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-lg rounded px-4 py-2 ${message.sender?._id === currentUserId ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`}>
                                        <p className="text-xs opacity-80 mb-1">{message.sender?.username || 'Unknown'}</p>
                                        <p>{message.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Pick a conversation to start messaging.</p>
                    )}
                </div>

                {error && <p className="px-4 py-2 text-red-600 text-sm border-t">{error}</p>}

                {selectedConversation && (
                    <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
                        <input
                            value={messageInput}
                            onChange={(event) => setMessageInput(event.target.value)}
                            className="flex-1 border rounded px-4 py-2 text-black"
                            placeholder="Type your message..."
                        />
                        <button type="submit" className="bg-[#009c51] text-white px-6 rounded">
                            Send
                        </button>
                    </form>
                )}
            </section>
        </div>
    );
};

export default MessagesPage;
