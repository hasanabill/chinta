import { BiSolidDownvote, BiSolidUpvote } from "react-icons/bi";
import { Link } from "react-router-dom";

const Post = ({ post }) => {
    const plainBody = (post?.body || '').replace(/<[^>]*>/g, '').trim();
    const previewBody = plainBody.length > 140 ? `${plainBody.slice(0, 140)}...` : plainBody;
    const formattedDate = post?.createdAt
        ? new Date(post.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : 'Recently';

    return (
        <article className="h-full border border-emerald-100 rounded-2xl p-5 shadow-sm bg-white hover:shadow-xl transition-all duration-200 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs text-gray-500">{formattedDate}</p>
                {post.parentPost && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide font-semibold">
                        Thread Reply
                    </span>
                )}
            </div>

            <Link to={`/post/${post._id}`} className="block">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 hover:underline leading-snug">
                    {post.title}
                </h3>
            </Link>
            <p className="text-gray-600 text-sm mb-3">
                By{" "}
                <Link
                    to={`/profile/${post?.author?._id}`}
                    className="font-semibold text-emerald-700 hover:underline"
                >
                    {post?.author?.username}
                </Link>
            </p>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {previewBody || "Open this discussion to read and join the full conversation."}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-5">
                <Link
                    to={`/forum/${post.category || 'general'}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase font-semibold hover:bg-emerald-200"
                >
                    {post.category || 'general'}
                </Link>
                {post.tags?.slice(0, 3).map((tag) => (
                    <Link
                        key={tag}
                        to={`/forum/tag/${encodeURIComponent(tag)}`}
                        className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                        #{tag}
                    </Link>
                ))}
            </div>

            <div className="flex items-center justify-between mt-auto pt-1">
                <div className="text-gray-600 text-sm flex gap-4">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-green-500"><BiSolidUpvote /></span>
                        <span>{post?.upvotes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-red-500"><BiSolidDownvote /></span>
                        <span>{post?.downvotes?.length || 0}</span>
                    </div>
                </div>

                <Link
                    to={`/post/${post._id}`}
                    className="bg-gradient-to-r from-emerald-600 to-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:brightness-105 transition"
                >
                    View Post
                </Link>
            </div>
        </article>
    );
};

export default Post;
