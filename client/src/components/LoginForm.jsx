import { useState } from 'react';
import { server } from '../Routes/Routes';
import jwt_decode from 'jwt-decode';

const LoginForm = ({ closeModal }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${server}/api/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                const decoded = jwt_decode(data.token);
                localStorage.setItem('userId', decoded._id);
                closeModal();
            } else {
                alert(data.error || 'Login failed');
            }
        } catch {
            alert('Login failed');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2 className="text-lg font-bold mb-4">Log In</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 px-4 py-2 border rounded text-black"
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 px-4 py-2 border rounded text-black"
                required
            />
            <button type="submit" className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded">Log In</button>
        </form>
    );
};

export default LoginForm;
