import { useState } from "react";
import { createPortal } from "react-dom";
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

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] bg-gray-900/50 p-3 sm:p-5 overflow-y-auto"
            onClick={closeModal}
        >
            <div
                className="w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] bg-white rounded-2xl shadow-2xl mx-auto my-auto flex flex-col"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl sm:text-2xl font-bold">Create New Post</h2>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="text-sm font-semibold px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                    >
                        Close
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="min-h-0 flex flex-col">
                    <div className="min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border border-gray-300 p-2 rounded text-black"
                                placeholder="Enter the post title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">Body</label>
                            <ReactQuill
                                value={body}
                                onChange={setBody}
                                className="bg-white rounded-xl [&_.ql-editor]:min-h-[140px] [&_.ql-editor]:max-h-[240px] [&_.ql-editor]:overflow-y-auto"
                                placeholder="Share your thoughts with the community..."
                                theme="snow"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600 sm:pr-4">
                            Post respectfully and keep discussions beneficial for the Ummah.
                        </div>
                        <div className="flex gap-2 self-end sm:self-auto">
                            <button
                                type="button"
                                className="bg-gray-600 hover:bg-gray-700 text-white w-24 px-4 py-2 rounded-xl transition"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-[#009c51] hover:bg-green-700 text-white w-24 px-4 py-2 rounded-xl transition"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default PostModal;
