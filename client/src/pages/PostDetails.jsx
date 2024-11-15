import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { server } from '../Routes/Routes';
import { BiSolidUpvote, BiSolidDownvote } from "react-icons/bi";
import { toast } from 'react-toastify';

const PostDetails = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comment, setComment] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`${server}/api/posts/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch post');
                const data = await response.json();
                setPost(data);
            } catch (error) {
                toast.error(error.message);
            }
        };
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

            const updatedPost = await response.json();
            setPost(updatedPost);
        } catch (error) {
            console.error("Voting Error:", error);
            toast.error(error.message);
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

    if (!post) return <p>Loading...</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="text-gray-600">By {post.author.username}</p>

            {/* Display formatted body */}
            <div className="mt-4" dangerouslySetInnerHTML={{ __html: post.body }} />

            <div className="mt-4 flex">
                <button onClick={() => handleVote('upvote')} className="text-green-600 border px-4 py-2 rounded-s-3xl flex items-center gap-2">
                    <BiSolidUpvote /> {post?.upvotes?.length}
                </button>
                <button onClick={() => handleVote('downvote')} className="text-red-600 border px-4 py-2 rounded-e-3xl flex items-center gap-2">
                    <BiSolidDownvote /> {post?.downvotes?.length}
                </button>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl">Comments</h2>
                <form onSubmit={handleCommentSubmit} className="mt-4">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full border rounded p-2"
                        required
                    ></textarea>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 mt-2 rounded">Submit</button>
                </form>

                {post.comments.map((com) => (
                    <div key={com._id} className="mt-4 border-t pt-4">
                        <p className="font-semibold">{com.user.username}</p>
                        <p>{com.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostDetails;
