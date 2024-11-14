import { Link } from "react-router-dom";
import { TbBulbFilled } from "react-icons/tb";
import { IoIosMail } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
    return (
        <nav className="bg-green-700 text-white py-4 px-8">
            <div className="container mx-auto flex items-center justify-between">

                <Link to="/" className="flex items-center">
                    <span className="text-2xl font-bold">Chinta</span>
                </Link>

                <form className="w-1/3 flex bg-gray-100 rounded-3xl ">
                    <input
                        type="text"
                        placeholder="Search ideas..."
                        className="w-full px-4 py-2  rounded-s-3xl text-black"
                    />
                    <input className="w-32 text-white font-bold  bg-red-600 cursor-pointer hover:bg-red-700 rounded-e-3xl" type="submit" value="Search" />
                </form>

                <div className="flex space-x-6">
                    <Link to="/" className="flex items-center font-bold gap-2 hover:bg-red-700 py-2 px-4 rounded-3xl hover:text-green-600"> <TbBulbFilled /> Ideas</Link>
                    <Link to="/messages" className="flex items-center font-bold gap-2 hover:bg-red-700 py-2 px-4 rounded-3xl hover:text-green-600"> <IoIosMail /> Messages</Link>
                    <Link to="/profile" className="flex items-center font-bold gap-2 hover:bg-red-700 py-2 px-4 rounded-3xl hover:text-green-600"> <FaUserCircle /> Profile</Link>
                </div>

                <div>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-3xl">
                        Post Idea
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
