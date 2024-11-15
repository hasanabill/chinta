
const Profile = () => {
    const user = {
        name: "John Doe",
        email: "johndoe@example.com",
        bio: "Enthusiast for national development and technology innovation.",
        profilePicture:
            "https://via.placeholder.com/150",
        posts: [
            {
                id: 1,
                title: "Improving Digital Literacy in Rural Areas",
                date: "2024-11-01",
                upvotes: 120,
            },
            {
                id: 2,
                title: "Green Energy Initiatives for a Sustainable Future",
                date: "2024-10-15",
                upvotes: 95,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Profile Header */}
            <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
                <div className="flex items-center space-x-6">
                    <img
                        src={user.profilePicture}
                        alt={`${user.name}'s profile`}
                        className="w-24 h-24 rounded-full border border-gray-300"
                    />
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">
                            {user.name}
                        </h2>
                        <p className="text-gray-500">{user.email}</p>
                        <p className="mt-2 text-sm text-gray-600">{user.bio}</p>
                    </div>
                </div>
            </div>

            {/* User Posts */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 max-w-4xl mx-auto">
                    Recent Posts
                </h3>
                <div className="bg-white shadow rounded-lg p-6 mt-4 max-w-4xl mx-auto space-y-4">
                    {user.posts.map((post) => (
                        <div
                            key={post.id}
                            className="border-b last:border-none pb-4 last:pb-0"
                        >
                            <h4 className="text-lg font-medium text-blue-600 hover:underline cursor-pointer">
                                {post.title}
                            </h4>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{post.date}</span>
                                <span>{post.upvotes} Upvotes</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;
