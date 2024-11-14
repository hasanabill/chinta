

const Post = ({ post }) => {
    return (
        <div className="border rounded p-4 mb-4">
            <h3 className="text-xl font-bold">{post.title}</h3>
            <p className="text-gray-600">By {post?.author?.username}</p>
            <p>Upvotes: {post?.upvotes?.length} | Downvotes: {post?.downvotes?.length}</p>
        </div>
    );
};

export default Post;
