import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100 text-center">
            <h1 className="text-6xl font-bold text-red-600">404</h1>
            <p className="text-2xl text-gray-800 mt-4">Oops! Page not found</p>
            <p className="text-gray-500 mt-2">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link to="/" className="mt-6 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800">
                Go back to Home
            </Link>
        </div>
    );
};

export default NotFound;
