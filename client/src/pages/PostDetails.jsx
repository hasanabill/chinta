import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { server } from '../Routes/Routes';

const PostDetails = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comment, setComment] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchPost = async () => {
            const response = await fetch(`${server}/api/posts/${id}`);
            const data = await response.json();
            setPost(data);
        };
        fetchPost();
    }, [id]);

    const handleVote = async (type) => {
        const response = await fetch(`${server}/api/posts/${id}/${type}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const updatedPost = await response.json();
        setPost(updatedPost);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(`${server}/api/posts/${id}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ comment })
        });
        const updatedPost = await response.json();
        setPost(updatedPost);
        setComment('');
    };

    if (!post) return <p>Loading...</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="text-gray-600">By {post.author.username}</p>
            <p className="mt-4">{post.body}</p>

            <div className="mt-4 flex gap-4">
                <button onClick={() => handleVote('upvote')} className="bg-green-600 text-white px-4 py-2 rounded">Upvote</button>
                <button onClick={() => handleVote('downvote')} className="bg-red-600 text-white px-4 py-2 rounded">Downvote</button>
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
