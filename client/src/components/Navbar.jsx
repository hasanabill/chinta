import { Link, useNavigate } from "react-router-dom";
import { TbBulbFilled } from "react-icons/tb";
import { IoIosMail } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import logo from "../assets/logo.png";
import { server } from "../Routes/Routes";
import PostModal from "./PostModal";

const Navbar = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [showNewPost, setShowNewPost] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwt_decode(token);
                fetch(`${server}/api/user/${decoded._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(response => response.json())
                    .then(data => setUser(data));

            } catch (error) {
                console.error("Invalid token", error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate("/");
    };

    return (
        <nav className="bg-green-100 text-[#009c51] px-8">
            <div className="container mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center">
                    <img src={logo} alt="Logo" className="h-20" />
                </Link>

                <form className="w-1/3 flex bg-gray-100 rounded-3xl">
                    <input
                        type="text"
                        placeholder="Search ideas..."
                        className="w-full px-4 py-2  rounded-s-3xl text-black"
                    />
                    <input className="w-32 text-white font-bold  bg-[#ff3131] cursor-pointer hover:bg-red-600 rounded-e-3xl" type="submit" value="Search" />
                </form>

                <div className="flex space-x-6">
                    <Link to="/" className="flex items-center font-bold gap-2 hover:bg-[#ff3131] py-2 px-4 rounded-3xl hover:text-white">
                        <TbBulbFilled /> Ideas
                    </Link>
                    <Link to="/messages" className="flex items-center font-bold gap-2 hover:bg-[#ff3131] py-2 px-4 rounded-3xl hover:text-white">
                        <IoIosMail /> Messages
                    </Link>
                </div>

                {user ? (
                    <div className="flex space-x-4 items-center">
                        <button
                            className="bg-[#009c51] hover:bg-green-700 text-white font-bold py-2 px-4 rounded-3xl"
                            onClick={() => setShowNewPost(true)}
                        >
                            New Post
                        </button>
                        <Link to={`/profile/${user._id}`} className="flex items-center font-bold gap-2 hover:bg-red-700 py-2 px-4 rounded-3xl hover:text-green-600">
                            <FaUserCircle /> {user.username}
                        </Link>
                        <button
                            className="bg-[#ff3131] hover:bg-red-6600 text-white font-bold py-2 px-4 rounded-3xl"
                            onClick={handleLogout}
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-4">
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-3xl"
                            onClick={() => setShowLogin(true)}
                        >
                            Login
                        </button>
                        <button
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-3xl"
                            onClick={() => setShowSignup(true)}
                        >
                            Signup
                        </button>
                    </div>
                )}
            </div>
            {showNewPost && (
                <PostModal closeModal={() => setShowNewPost(false)} />
            )}
            {showLogin && (
                <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-md">
                        {/* Login form goes here */}
                        <LoginForm closeModal={() => setShowLogin(false)} />
                    </div>
                </div>
            )}

            {showSignup && (
                <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-md">
                        {/* Signup form goes here */}
                        <SignupForm closeModal={() => setShowSignup(false)} />
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
