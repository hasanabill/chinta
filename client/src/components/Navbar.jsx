import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoIosMail } from "react-icons/io";
import { FaUserCircle, FaHashtag } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import jwt_decode from "jwt-decode";
import logo from "../assets/logo.svg";
import { server } from "../Routes/Routes";
import PostModal from "./PostModal";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState({ users: [], posts: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [showNewPost, setShowNewPost] = useState(false);
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
    const searchWrapperRef = useRef(null);
    const navItemClass = (isActive) =>
        `flex items-center justify-center font-semibold gap-2 py-2 px-3 rounded-xl transition whitespace-nowrap ${isActive
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
        }`;

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setUser(null);
                return;
            }
            try {
                const decoded = jwt_decode(token);
                const response = await fetch(`${server}/api/user/${decoded._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    setUser(null);
                    return;
                }
                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error("Invalid token", error);
                setUser(null);
            }
        };

        loadUser();
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setUser(null);
        navigate("/");
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;
        setShowSuggestions(false);
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    useEffect(() => {
        if (isAuthPage) return;

        const query = searchQuery.trim();
        if (!query) {
            setSearchSuggestions({ users: [], posts: [] });
            setShowSuggestions(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                const [userRes, postRes] = await Promise.all([
                    fetch(`${server}/api/user/search?q=${encodeURIComponent(query)}`),
                    fetch(`${server}/api/posts?q=${encodeURIComponent(query)}`),
                ]);

                const [users, posts] = await Promise.all([
                    userRes.ok ? userRes.json() : [],
                    postRes.ok ? postRes.json() : [],
                ]);

                setSearchSuggestions({
                    users: Array.isArray(users) ? users.slice(0, 4) : [],
                    posts: Array.isArray(posts) ? posts.slice(0, 4) : [],
                });
                setShowSuggestions(true);
            } catch {
                setSearchSuggestions({ users: [], posts: [] });
                setShowSuggestions(false);
            }
        }, 250);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isAuthPage]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!searchWrapperRef.current?.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    return (
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link to="/" className="flex items-center shrink-0">
                        <img src={logo} alt="Chinta Logo" className="h-11 sm:h-12" />
                    </Link>

                    {!isAuthPage && (
                        <div className="flex items-center gap-2 shrink-0">
                            <Link to="/" className={navItemClass(location.pathname === '/')}>
                                <FaHashtag />
                                <span className="hidden sm:inline">Discussions</span>
                            </Link>
                            <Link to="/messages" className={navItemClass(location.pathname.startsWith('/messages'))}>
                                <IoIosMail />
                                <span className="hidden sm:inline">Messages</span>
                            </Link>
                        </div>
                    )}

                    {!isAuthPage && (
                        <div className="flex-1 min-w-[180px] sm:min-w-[240px] relative" ref={searchWrapperRef}>
                            <form className="flex items-center bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden" onSubmit={handleSearchSubmit}>
                                <input
                                    type="text"
                                    placeholder="Search users and discussions..."
                                    value={searchQuery}
                                    onFocus={() => {
                                        if (searchQuery.trim()) setShowSuggestions(true);
                                    }}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="w-full px-4 py-2.5 bg-transparent text-black focus:outline-none"
                                />
                                <input
                                    className="px-3 sm:px-4 h-full min-h-[40px] text-white font-semibold bg-gradient-to-r from-emerald-600 to-green-500 cursor-pointer hover:brightness-105 transition text-sm"
                                    type="submit"
                                    value="Search"
                                />
                            </form>

                            {showSuggestions && (searchSuggestions.users.length > 0 || searchSuggestions.posts.length > 0) && (
                                <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 p-2 max-h-96 overflow-y-auto">
                                    {searchSuggestions.users.length > 0 && (
                                        <div className="mb-2">
                                            <p className="text-xs font-semibold text-gray-500 px-2 py-1">Users</p>
                                            {searchSuggestions.users.map((suggestedUser) => (
                                                <button
                                                    key={suggestedUser._id}
                                                    type="button"
                                                    onClick={() => {
                                                        setShowSuggestions(false);
                                                        setSearchQuery("");
                                                        navigate(`/profile/${suggestedUser._id}`);
                                                    }}
                                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                                                >
                                                    {`${suggestedUser.firstName || ''} ${suggestedUser.lastName || ''}`.trim() || suggestedUser.username}
                                                    <span className="text-xs text-gray-400 ml-2">@{suggestedUser.username}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {searchSuggestions.posts.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 px-2 py-1">Posts</p>
                                            {searchSuggestions.posts.map((suggestedPost) => (
                                                <button
                                                    key={suggestedPost._id}
                                                    type="button"
                                                    onClick={() => {
                                                        setShowSuggestions(false);
                                                        setSearchQuery("");
                                                        navigate(`/post/${suggestedPost._id}`);
                                                    }}
                                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                                                >
                                                    <p className="font-medium truncate">{suggestedPost.title}</p>
                                                    <p className="text-xs text-gray-400 truncate">By {suggestedPost.author?.username || 'Unknown'}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                <div className="flex items-center gap-2 shrink-0">
                    {user ? (
                        <>
                            <button
                                className="bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-105 text-white font-semibold py-2 px-3 rounded-xl transition whitespace-nowrap text-sm"
                                onClick={() => setShowNewPost(true)}
                            >
                                New Post
                            </button>
                            <Link
                                to={`/profile/${user._id}`}
                                className="flex items-center font-semibold gap-2 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 py-2 px-3 rounded-xl transition whitespace-nowrap text-sm"
                            >
                                <FaUserCircle />
                                <span className="hidden md:inline">{user.username}</span>
                            </Link>
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-xl transition whitespace-nowrap text-sm"
                                onClick={handleLogout}
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-xl transition whitespace-nowrap text-sm"
                                to="/login"
                            >
                                Login
                            </Link>
                            <Link
                                className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-3 rounded-xl transition whitespace-nowrap text-sm"
                                to="/signup"
                            >
                                Signup
                            </Link>
                        </>
                    )}
                </div>
            </div>
            </div>
            {showNewPost && (
                <PostModal closeModal={() => setShowNewPost(false)} />
            )}
        </nav>
    );
};

export default Navbar;
