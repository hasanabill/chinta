import { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import { server } from "../Routes/Routes";

const PostModal = ({ closeModal }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('general');
    const [tags, setTags] = useState('');
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
                body: JSON.stringify({
                    title,
                    body,
                    category,
                    tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
                })
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
                            placeholder="Share your thoughts with the community..."
                            theme="snow"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-12">
                        <div>
                            <label className="block text-gray-700 mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border border-gray-300 p-2 rounded text-black"
                            >
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
                            <label className="block text-gray-700 mb-2">Tags</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full border border-gray-300 p-2 rounded text-black"
                                placeholder="comma,separated,tags"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center gap-2 mt-16">
                        <div className="text-sm text-gray-600">
                            Post respectfully and keep discussions beneficial for the Ummah.
                        </div>
                        <div className="flex gap-2">
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
