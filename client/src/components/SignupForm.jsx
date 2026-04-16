import { useState } from 'react';
import { server } from '../Routes/Routes';
import jwt_decode from 'jwt-decode';

const SignupForm = ({ closeModal }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${server}/api/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                const decoded = jwt_decode(data.token);
                localStorage.setItem('userId', decoded._id);
                closeModal();
            } else {
                alert(data.error || 'Signup failed');
            }
        } catch {
            alert('Signup failed');
        }
    };

    return (
        <form onSubmit={handleSignup}>
            <h2 className="text-lg font-bold mb-4">Sign Up</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mb-4 px-4 py-2 border text-black rounded"
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 px-4 py-2 border text-black rounded"
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 px-4 py-2 border text-black rounded"
                required
            />
            <button type="submit" className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded">Sign Up</button>
        </form>
    );
};

export default SignupForm;
