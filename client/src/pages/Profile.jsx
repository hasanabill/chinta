import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { server } from "../Routes/Routes";

const Profile = ({ userId }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const id = useParams().id;
    console.log(id)

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`${server}/api/user/profile/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUser(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>User not found.</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Profile Header */}
            <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
                <div className="flex items-center space-x-6">
                    <img
                        src={user.profilePicture}
                        alt={`${user.username}'s profile`}
                        className="w-24 h-24 rounded-full border border-gray-300"
                    />
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">
                            {user.username}
                        </h2>
                        <p className="text-gray-500">{user.email}</p>
                        <p className="mt-2 text-sm text-gray-600">{user.bio}</p>
                    </div>
                </div>
            </div>

            {/* User Activity */}
            <div className="mt-8 max-w-4xl mx-auto space-y-8">
                {/* Authored Posts */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Authored Posts</h3>
                    <div className="bg-white shadow rounded-lg p-6 mt-4 space-y-4">
                        {user.posts.map((post) => (
                            <div key={post._id} className="border-b last:border-none pb-4 last:pb-0">
                                <h4 className="text-lg font-medium text-blue-600 hover:underline cursor-pointer">
                                    {post.title}
                                </h4>
                                <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{post.upvotes.length} Upvotes</span>
                                    <span>{post.downvotes.length} Downvotes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upvoted Posts */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Upvoted Posts</h3>
                    <div className="bg-white shadow rounded-lg p-6 mt-4 space-y-4">
                        {user.upvotedPosts.map((post) => (
                            <div key={post._id} className="border-b last:border-none pb-4 last:pb-0">
                                <h4 className="text-lg font-medium text-blue-600 hover:underline cursor-pointer">
                                    {post.title}
                                </h4>
                                <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Downvoted Posts */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Downvoted Posts</h3>
                    <div className="bg-white shadow rounded-lg p-6 mt-4 space-y-4">
                        {user.downvotedPosts.map((post) => (
                            <div key={post._id} className="border-b last:border-none pb-4 last:pb-0">
                                <h4 className="text-lg font-medium text-blue-600 hover:underline cursor-pointer">
                                    {post.title}
                                </h4>
                                <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
