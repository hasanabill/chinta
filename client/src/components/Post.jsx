import { BiSolidDownvote, BiSolidUpvote } from "react-icons/bi";
import { FaCommentDots } from "react-icons/fa";

const Post = ({ post }) => {
    return (
        <div className="border rounded-lg p-6 mb-6 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">{post.title}</h3>
            <p className="text-gray-500 text-sm mb-4">By <span className="font-medium">{post?.author?.username}</span></p>

            <div className="flex items-center justify-between">
                <div className="text-gray-600 text-sm flex gap-4">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-green-500"><BiSolidUpvote /></span>
                        <span>{post?.upvotes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-red-500"><BiSolidDownvote /></span>
                        <span>{post?.downvotes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-blue-500"><FaCommentDots /></span>
                        <span>{post?.comments?.length || 0} Comments</span>
                    </div>
                </div>

                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500 transition-colors">
                    View Post
                </button>
            </div>
        </div>
    );
};

export default Post;
