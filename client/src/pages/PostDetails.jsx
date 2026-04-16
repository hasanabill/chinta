import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { server } from '../Routes/Routes';
import { BiSolidUpvote, BiSolidDownvote } from "react-icons/bi";
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import jwt_decode from 'jwt-decode';

const PostDetails = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [replyBody, setReplyBody] = useState('');
    const [userVote, setUserVote] = useState(null);
    const token = localStorage.getItem('token');
    let userId = null;

    if (token) {
        try {
            userId = jwt_decode(token)._id;
        } catch {
            userId = null;
        }
    }

    const fetchPost = useCallback(async () => {
        try {
            const response = await fetch(`${server}/api/posts/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch post');
            const data = await response.json();
            setPost(data);

            const upvotes = data?.upvotes || [];
            const downvotes = data?.downvotes || [];
            const userVoteStatus = upvotes.some((voteId) => voteId?.toString() === userId)
                ? 'upvoted'
                : downvotes.some((voteId) => voteId?.toString() === userId)
                    ? 'downvoted'
                    : null;
            setUserVote(userVoteStatus);
        } catch (error) {
            toast.error(error.message);
        }
    }, [id, token, userId]);

    const fetchReplies = useCallback(async () => {
        try {
            const response = await fetch(`${server}/api/posts/${id}/replies`);
            if (!response.ok) throw new Error('Failed to fetch replies');
            const data = await response.json();
            setReplies(data);
        } catch (error) {
            toast.error(error.message);
        }
    }, [id]);

    useEffect(() => {
        fetchPost();
        fetchReplies();
    }, [fetchPost, fetchReplies]);

    useEffect(() => {
        const fetchRelatedPosts = async () => {
            if (!post) return;
            const primaryTag = post.tags?.[0];
            const params = new URLSearchParams();
            if (primaryTag) {
                params.set('tag', primaryTag);
            } else if (post.category) {
                params.set('category', post.category);
            } else {
                setRelatedPosts([]);
                return;
            }

            try {
                const response = await fetch(`${server}/api/posts?${params.toString()}`);
                if (!response.ok) return;
                const data = await response.json();
                const filtered = data.filter((candidate) => candidate._id !== post._id).slice(0, 5);
                setRelatedPosts(filtered);
            } catch (error) {
                console.error('Failed to fetch related posts', error);
            }
        };

        fetchRelatedPosts();
    }, [post]);

    const handleVote = async (type) => {
        if (!token) {
            toast.error('Please login to vote');
            return;
        }

        try {
            const response = await fetch(`${server}/api/posts/${id}/${type}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${type} post`);
            }

            fetchPost();
        } catch (error) {
            console.error("Voting Error:", error);
            toast.error(error.message);
        }
    };

    const handleUpvote = () => {
        handleVote('upvote');
    };

    const handleDownvote = () => {
        handleVote('downvote');
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error('Please login to reply');
            return;
        }

        try {
            const response = await fetch(`${server}/api/posts/${id}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    body: replyBody,
                }),
            });
            if (!response.ok) throw new Error('Failed to create reply');

            setReplyBody('');
            fetchReplies();
            toast.success('Reply posted');
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (!post) return <LoadingSpinner />;

    return (
        <div className="container mx-auto p-6 max-w-4xl bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-4xl font-extrabold mb-4 text-gray-800">{post.title}</h1>
            <p className="text-lg text-gray-500 mb-6">
                By{" "}
                <Link to={`/profile/${post.author?._id}`} className="text-blue-600 hover:underline">
                    {post.author?.username}
                </Link>
            </p>

            {/* Display formatted body */}
            <div className="prose prose-lg mt-4 mb-8" dangerouslySetInnerHTML={{ __html: post.body }} />

            <div className="flex gap-4 mb-6">
                <button
                    onClick={handleUpvote}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition-all 
                    ${userVote === 'upvoted' ? 'bg-green-600 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
                >
                    <BiSolidUpvote /> {post?.upvotes?.length || 0}
                </button>
                <button
                    onClick={handleDownvote}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 shadow-md transition-all 
                    ${userVote === 'downvoted' ? 'bg-red-600 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}
                >
                    <BiSolidDownvote /> {post?.downvotes?.length || 0}
                </button>
            </div>
            <div className="bg-white border p-6 rounded-lg shadow-md mt-8">
                <h2 className="text-2xl font-bold mb-4">Thread replies ({replies.length})</h2>
                {!token && (
                    <p className="mb-4 text-sm text-gray-600">
                        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                            Login to reply
                        </Link>{" "}
                        and join the discussion.
                    </p>
                )}
                <form onSubmit={handleReplySubmit} className="space-y-3 mb-6">
                    <textarea
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        className="w-full border rounded p-3 text-black"
                        placeholder={token ? "Write your reply" : "Login to write a reply"}
                        rows="4"
                        disabled={!token}
                        required
                    />
                    <button
                        className="bg-[#009c51] text-white py-2 px-6 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!token}
                    >
                        Post Reply
                    </button>
                </form>

                {replies.length > 0 ? (
                    <div className="space-y-3">
                        {replies.map((reply) => (
                            <div key={reply._id} className="border rounded p-4">
                                <p className="text-sm text-gray-500 mb-1">
                                    By{" "}
                                    <Link to={`/profile/${reply.author?._id}`} className="text-blue-600 hover:underline">
                                        {reply.author?.username}
                                    </Link>
                                </p>
                                <p className="text-sm text-gray-700">{reply.body}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No threaded replies yet.</p>
                )}
            </div>
            <div className="bg-white border p-6 rounded-lg shadow-md mt-8">
                <h2 className="text-2xl font-bold mb-4">
                    Related discussions {post.tags?.[0] ? `(tag: #${post.tags[0]})` : `(category: ${post.category || 'general'})`}
                </h2>
                {relatedPosts.length > 0 ? (
                    <div className="space-y-3">
                        {relatedPosts.map((related) => (
                            <div key={related._id} className="border rounded p-4">
                                <Link to={`/post/${related._id}`} className="font-semibold text-blue-600 hover:underline">
                                    {related.title}
                                </Link>
                                <p className="text-sm text-gray-500">
                                    By{" "}
                                    <Link to={`/profile/${related.author?._id}`} className="text-blue-600 hover:underline">
                                        {related.author?.username}
                                    </Link>
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                    {(related.body || '').replace(/<[^>]+>/g, '').slice(0, 140)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No related discussions found yet.</p>
                )}
            </div>
        </div>
    );
};

export default PostDetails;
