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
        <div className="fixed inset-0 bg-gray-700 bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg w-2/4">
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
                            className="bg-white rounded-3xl h-[250px]"
                            placeholder="Describe your idea..."
                            theme="snow"
                        />
                    </div>
                    <div className="flex justify-between items-center gap-2 mt-16">
                        <div>
                            <h2>You will be charged <span className="text-red-600 font-bold">1000 Taka</span> to share this</h2>
                        </div>
                        <div className="flex  gap-2">
                            <button
                                type="button"
                                className="bg-emerald-400 text-black w-24 px-4 py-2 rounded-3xl"
                            >
                                Verify
                            </button>
                            <button
                                type="button"
                                className="bg-gray-600 text-white w-24 px-4 py-2 rounded-3xl"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-[#009c51] text-white w-24 px-4 py-2 rounded-3xl"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostModal;
