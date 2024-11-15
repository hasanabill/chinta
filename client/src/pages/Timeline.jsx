import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { server } from '../Routes/Routes';
import Post from '../components/Post';
import LoadingSpinner from '../components/LoadingSpinner';

const Timeline = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${server}/api/posts`);
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false); // Stop loading after fetching data
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Show spinner while loading
    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto p-4">
            {posts.length > 0 ? (
                posts.map((post) => (
                    <Link to={`/post/${post._id}`} key={post._id}>
                        <Post post={post} />
                    </Link>
                ))
            ) : (
                <p className="text-center text-gray-500">No posts available</p>
            )}
        </div>
    );
};

export default Timeline;
