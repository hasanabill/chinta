import { useState } from 'react';

const MessagesPage = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');

    // Sample contact list
    const users = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'Michael' },
    ];

    // Sample chat history for each user
    const chatHistory = {
        John: [
            { id: 1, user: 'John', text: 'Hey, how’s it going?' },
            { id: 2, user: 'You', text: 'Not bad! What about you?' },
            { id: 3, user: 'John', text: 'I’m good. Working on my new project.' }
        ],
        Jane: [
            { id: 1, user: 'Jane', text: 'Are you coming to the meeting?' },
            { id: 2, user: 'You', text: 'Yes, I’ll be there in 10 minutes.' }
        ],
        Michael: [
            { id: 1, user: 'Michael', text: 'Do you have the files?' },
            { id: 2, user: 'You', text: 'Yes, I’ve sent them to your email.' }
        ],
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && selectedUser) {
            chatHistory[selectedUser].push({ id: chatHistory[selectedUser].length + 1, user: 'You', text: message });
            setMessage('');
        }
    };

    return (
        <div className="flex h-svh">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-200 p-4">
                <h2 className="text-xl font-bold mb-4">Active Messages</h2>
                <ul>
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className={`p-4 rounded-lg cursor-pointer mb-2 ${selectedUser === user.name ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
                            onClick={() => setSelectedUser(user.name)}
                        >
                            {user.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Chatbox */}
            <div className="flex-1 flex flex-col">
                <header className="bg-green-700 text-white py-4 px-6 text-xl font-bold">
                    {selectedUser ? `Chat with ${selectedUser}` : 'Select a conversation'}
                </header>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    {selectedUser ? (
                        <div className="flex flex-col space-y-4">
                            {chatHistory[selectedUser].map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`px-4 py-2 rounded-lg max-w-xs ${msg.user === 'You'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-300 text-gray-900'
                                            }`}
                                    >
                                        <p className="text-sm font-bold">{msg.user}</p>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">Please select a contact to start chatting.</p>
                    )}
                </div>

                {/* Input form */}
                {selectedUser && (
                    <form onSubmit={handleSendMessage} className="bg-gray-200 p-4 flex fixed bottom-0 w-3/4">
                        <input
                            type="text"
                            className="flex-1 px-4 py-2 rounded-l-lg text-black"
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-r-lg"
                        >
                            Send
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
