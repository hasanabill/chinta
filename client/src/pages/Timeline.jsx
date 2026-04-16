import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { server } from '../Routes/Routes';
import Post from '../components/Post';
import LoadingSpinner from '../components/LoadingSpinner';

const Timeline = ({ initialCategory = '' }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(initialCategory);
    const [tag, setTag] = useState('');
    const [sort, setSort] = useState('recent');

    const fetchPosts = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (category) params.set('category', category);
            if (tag) params.set('tag', tag);
            if (sort) params.set('sort', sort);
            const response = await fetch(`${server}/api/posts?${params.toString()}`);
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    }, [category, tag, sort]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        setCategory(initialCategory);
    }, [initialCategory]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white border rounded p-4 mb-4 flex gap-3 items-end">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Category</label>
                    <select
                        className="border rounded px-3 py-2 text-black"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                    >
                        <option value="">All</option>
                        <option value="general">General</option>
                        <option value="tech">Tech</option>
                        <option value="politics">Politics</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="health">Health</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Tag</label>
                    <input
                        className="border rounded px-3 py-2 text-black"
                        value={tag}
                        onChange={(event) => setTag(event.target.value)}
                        placeholder="e.g. react"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Sort</label>
                    <select
                        className="border rounded px-3 py-2 text-black"
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                    >
                        <option value="recent">Recent</option>
                        <option value="top">Top</option>
                    </select>
                </div>
            </div>
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
