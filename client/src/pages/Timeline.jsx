import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { server } from '../Routes/Routes';
import Post from '../components/Post';



const Timeline = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await fetch(`${server}/api/posts`);
            const data = await response.json();
            console.log(data)
            setPosts(data);
        };
        fetchPosts();
    }, []);

    return (
        <div className="container mx-auto p-4">
            {posts.map((post) => (
                <Link to={`/post/${post._id}`} key={post._id}>
                    <Post post={post} />
                </Link>
            ))}
        </div>
    );
};

export default Timeline;
