import { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import { server } from "../Routes/Routes";

const PostModal = ({ closeModal }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${server}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, body })
            });

            if (!response.ok) throw new Error('Failed to create post');
            toast.success('Post created successfully!');
            closeModal();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg max-w-xl w-full">
                <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded"
                            placeholder="Enter the post title"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Body</label>
                        <ReactQuill
                            value={body}
                            onChange={setBody}
                            className="bg-white border rounded"
                            placeholder="Enter the post content..."
                            theme="snow"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            className="bg-gray-600 text-white px-4 py-2 rounded"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-[#009c51] text-white px-4 py-2 rounded"
                        >
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostModal;
