import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { server } from '../Routes/Routes';

const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${server}/api/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (!response.ok || !data.token) {
                throw new Error(data.error || 'Signup failed');
            }

            localStorage.setItem('token', data.token);
            const decoded = jwt_decode(data.token);
            localStorage.setItem('userId', decoded._id);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-88px)] bg-gradient-to-br from-lime-50 via-white to-emerald-50 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="hidden md:flex flex-col justify-center bg-gray-900 text-white p-10">
                    <h1 className="text-4xl font-extrabold mb-4">Join the forum</h1>
                    <p className="text-white/80 leading-relaxed">
                        Create your profile, follow people you care about, and contribute to meaningful discussions.
                    </p>
                </div>

                <div className="p-8 md:p-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Create account</h2>
                    <p className="text-gray-500 mb-8">Start your journey in seconds.</p>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            required
                        />

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#009c51] text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-70"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#009c51] font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
