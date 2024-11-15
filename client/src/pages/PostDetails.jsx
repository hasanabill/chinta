import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { server } from '../Routes/Routes';
import { BiSolidUpvote, BiSolidDownvote } from "react-icons/bi";
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const PostDetails = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comment, setComment] = useState('');
    const [userVote, setUserVote] = useState(null);
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const fetchPost = async () => {
        try {
            const response = await fetch(`${server}/api/posts/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch post');
            const data = await response.json();
            setPost(data);

            const userVoteStatus = data.upvotes.includes(userId)
                ? 'upvoted'
                : data.downvotes.includes(userId)
                    ? 'downvoted'
                    : null;
            setUserVote(userVoteStatus);
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [id, token]);

    const handleVote = async (type) => {
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
        if (userVote === 'upvoted') {
            setUserVote(null);
            handleVote('remove-upvote');
        } else {
            setUserVote('upvoted');
            handleVote('upvote');
        }
    };

    const handleDownvote = () => {
        if (userVote === 'downvoted') {
            setUserVote(null);
            handleVote('remove-downvote');
        } else {
            setUserVote('downvoted');
            handleVote('downvote');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${server}/api/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ comment })
            });

            if (!response.ok) throw new Error('Failed to add comment');

            const updatedPost = await response.json();
            setPost(updatedPost);
            setComment('');

        } catch (error) {
            toast.error(error.message);
        }
    };

    if (!post) return <LoadingSpinner />;

    return (
        <div className="container mx-auto p-6 max-w-4xl bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-4xl font-extrabold mb-4 text-gray-800">{post.title}</h1>
            <p className="text-lg text-gray-500 mb-6">By {post.author?.username}</p>

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

            <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-8">
                <h2 className="text-2xl font-bold mb-4">Comments</h2>
                <form onSubmit={handleCommentSubmit} className="mb-6">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-4 rounded-lg border focus:ring-2 focus:ring-green-500"
                        rows="4"
                        required
                    ></textarea>
                    <button
                        type="submit"
                        className="mt-4 bg-[#009c51] text-white font-semibold py-2 px-8 rounded-full hover:bg-green-600 transition-all"
                    >
                        Submit
                    </button>
                </form>

                {post.comments.length > 0 ? (
                    post.comments.map((com) => (
                        <div key={com._id} className="border-t pt-4 mt-4">
                            <p className="font-semibold text-lg">{com.user?.username}</p>
                            <p className="text-gray-600">{com.comment}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 mt-4">No comments yet. Be the first to comment!</p>
                )}
            </div>
        </div>
    );
};

export default PostDetails;
