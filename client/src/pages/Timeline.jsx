import { useCallback, useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import { server } from '../Routes/Routes';
import Post from '../components/Post';
import LoadingSpinner from '../components/LoadingSpinner';

const Timeline = ({ initialCategory = '', initialTag = '' }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(initialCategory);
    const [tag, setTag] = useState(initialTag);
    const [sort, setSort] = useState('recent');
    const [followingOnly, setFollowingOnly] = useState(false);
    const [followingIds, setFollowingIds] = useState([]);
    const token = localStorage.getItem('token');
    const currentUserId = (() => {
        if (!token) return null;
        try {
            return jwt_decode(token)?._id || null;
        } catch {
            return null;
        }
    })();

    useEffect(() => {
        const fetchFollowing = async () => {
            if (!token || !currentUserId) {
                setFollowingIds([]);
                return;
            }
            try {
                const response = await fetch(`${server}/api/user/${currentUserId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    setFollowingIds([]);
                    return;
                }
                const data = await response.json();
                const ids = Array.isArray(data?.following)
                    ? data.following.map((id) => (typeof id === 'string' ? id : id?._id)).filter(Boolean)
                    : [];
                setFollowingIds(ids);
            } catch {
                setFollowingIds([]);
            }
        };

        fetchFollowing();
    }, [token, currentUserId]);

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (category) params.set('category', category);
            if (tag) params.set('tag', tag);
            if (sort) params.set('sort', sort);
            if (followingOnly) params.set('feed', 'following');

            const headers = followingOnly && token
                ? { Authorization: `Bearer ${token}` }
                : undefined;

            const response = await fetch(`${server}/api/posts?${params.toString()}`, { headers });
            if (!response.ok) {
                setPosts([]);
                return;
            }
            const data = await response.json();
            let parsedPosts = Array.isArray(data) ? data : [];
            if (followingOnly) {
                const followingSet = new Set(followingIds);
                parsedPosts = parsedPosts.filter((post) => {
                    const authorId = post?.author?._id || post?.author;
                    return followingSet.has(authorId);
                });
            }
            setPosts(parsedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    }, [category, tag, sort, followingOnly, token, followingIds]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        setCategory(initialCategory);
    }, [initialCategory]);

    useEffect(() => {
        setTag(initialTag);
    }, [initialTag]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-10">
            <div className="bg-white/90 backdrop-blur border rounded-2xl p-4 md:p-5 mb-6 shadow-sm">
                <div className="grid md:grid-cols-5 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Category</label>
                        <select
                            className="w-full border rounded-xl px-3 py-2.5 text-black bg-white"
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
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Tag</label>
                        <input
                            className="w-full border rounded-xl px-3 py-2.5 text-black bg-white"
                            value={tag}
                            onChange={(event) => setTag(event.target.value)}
                            placeholder="e.g. react"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Sort</label>
                        <select
                            className="w-full border rounded-xl px-3 py-2.5 text-black bg-white"
                            value={sort}
                            onChange={(event) => setSort(event.target.value)}
                        >
                            <option value="recent">Recent</option>
                            <option value="top">Top</option>
                        </select>
                    </div>
                    <button
                        type="button"
                        disabled={!token}
                        onClick={() => {
                            if (!token) return;
                            setFollowingOnly((previous) => !previous);
                        }}
                        className={`h-11 rounded-xl border font-semibold transition ${followingOnly
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-700'
                            } ${!token ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {followingOnly ? 'Following only' : 'All users'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setCategory('');
                            setTag('');
                            setSort('recent');
                            setFollowingOnly(false);
                        }}
                        className="h-11 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black/80"
                    >
                        Reset Filters
                    </button>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{posts.length}</span> discussions
                    {category ? ` in ${category}` : ''}{tag ? ` tagged #${tag}` : ''}
                    {followingOnly ? ' from people you follow' : ''}
                    {!token ? ' (login to enable following feed)' : ''}
                </div>
            </div>
            {posts.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {posts.map((post) => (
                        <Post post={post} key={post._id} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 bg-white rounded-2xl border p-10">
                    No posts available.
                </div>
            )}
        </div>
    );
};

export default Timeline;
