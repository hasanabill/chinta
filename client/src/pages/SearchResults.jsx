import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { server } from '../Routes/Routes';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = useMemo(() => searchParams.get('q')?.trim() || '', [searchParams]);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setUsers([]);
                setPosts([]);
                return;
            }

            setLoading(true);
            try {
                const [userRes, postRes] = await Promise.all([
                    fetch(`${server}/api/user/search?q=${encodeURIComponent(query)}`),
                    fetch(`${server}/api/posts?q=${encodeURIComponent(query)}`),
                ]);

                const [userData, postData] = await Promise.all([
                    userRes.ok ? userRes.json() : [],
                    postRes.ok ? postRes.json() : [],
                ]);

                setUsers(Array.isArray(userData) ? userData : []);
                setPosts(Array.isArray(postData) ? postData : []);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Search</h1>
            <p className="text-gray-500 mb-6">
                Results for <span className="font-semibold text-gray-700">{query || '...'}</span>
            </p>

            {loading ? (
                <p className="text-gray-600">Searching...</p>
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    <section className="bg-white border rounded-2xl shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Users</h2>
                        {users.length > 0 ? (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <Link
                                        key={user._id}
                                        to={`/profile/${user._id}`}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border"
                                    >
                                        <img
                                            src={user.profilePicture || 'https://via.placeholder.com/150'}
                                            alt={user.username}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-600">
                                                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
                                            </p>
                                            <p className="text-xs text-gray-500">@{user.username}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No users found.</p>
                        )}
                    </section>

                    <section className="bg-white border rounded-2xl shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Posts</h2>
                        {posts.length > 0 ? (
                            <div className="space-y-3">
                                {posts.map((post) => (
                                    <Link
                                        key={post._id}
                                        to={`/post/${post._id}`}
                                        className="block p-3 rounded-xl hover:bg-gray-50 border"
                                    >
                                        <p className="font-semibold text-blue-600">{post.title}</p>
                                        <p className="text-xs text-gray-500 mb-1">By {post.author?.username}</p>
                                        <p className="text-sm text-gray-700">
                                            {(post.body || '').replace(/<[^>]+>/g, '').slice(0, 120)}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No posts found.</p>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
