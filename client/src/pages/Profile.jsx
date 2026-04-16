import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { server } from "../Routes/Routes";
import jwt_decode from "jwt-decode";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [followSearch, setFollowSearch] = useState("");
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [editForm, setEditForm] = useState({
        username: "",
        firstName: "",
        lastName: "",
        bio: "",
        dateOfBirth: "",
        location: "",
        occupation: "",
        website: "",
        profilePicture: "",
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const id = useParams().id;
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    let currentUserId = null;
    if (token) {
        try {
            currentUserId = jwt_decode(token)._id;
        } catch {
            currentUserId = null;
        }
    }

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const [profileResponse, followersResponse, followingResponse] = await Promise.all([
                    axios.get(`${server}/api/user/profile/${id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }),
                    axios.get(`${server}/api/follow/${id}/followers`),
                    axios.get(`${server}/api/follow/${id}/following`),
                ]);

                setUser(profileResponse.data);
                setFollowers(followersResponse.data.followers || []);
                setFollowing(followingResponse.data.following || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [id, token]);

    const refreshFollowData = async () => {
        const [profileResponse, followersResponse, followingResponse] = await Promise.all([
            axios.get(`${server}/api/user/profile/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }),
            axios.get(`${server}/api/follow/${id}/followers`),
            axios.get(`${server}/api/follow/${id}/following`),
        ]);
        setUser(profileResponse.data);
        setFollowers(followersResponse.data.followers || []);
        setFollowing(followingResponse.data.following || []);
    };

    const isFollowing = followers?.some((follower) => follower._id === currentUserId);
    const isOwnProfile = currentUserId === id;
    const search = followSearch.trim().toLowerCase();
    const filteredFollowers = followers.filter((follower) =>
        follower.username?.toLowerCase().includes(search)
    );
    const filteredFollowing = following.filter((followed) =>
        followed.username?.toLowerCase().includes(search)
    );

    const handleFollowToggle = async () => {
        if (!token || !currentUserId || currentUserId === id) return;
        setActionLoading(true);
        try {
            const method = isFollowing ? "DELETE" : "POST";
            const response = await fetch(`${server}/api/follow/${id}`, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update follow");
            }
            await refreshFollowData();
        } catch (error) {
            console.error("Failed to update follow status", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!token || !currentUserId || currentUserId === id) return;
        setActionLoading(true);
        try {
            const response = await fetch(`${server}/api/messages/conversations/${id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) navigate("/messages");
            else console.error(data.error);
        } catch (error) {
            console.error("Failed to open conversation", error);
        } finally {
            setActionLoading(false);
        }
    };

    const openEditProfile = () => {
        if (!user) return;
        setEditForm({
            username: user.username || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            bio: user.bio || "",
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
            location: user.location || "",
            occupation: user.occupation || "",
            website: user.website || "",
            profilePicture: user.profilePicture || "",
        });
        setProfileError("");
        setShowEditProfile(true);
    };

    const handleEditInput = (event) => {
        const { name, value } = event.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = async (event) => {
        event.preventDefault();
        setSavingProfile(true);
        setProfileError("");
        try {
            const payload = {
                username: editForm.username,
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                bio: editForm.bio,
                dateOfBirth: editForm.dateOfBirth || null,
                location: editForm.location,
                occupation: editForm.occupation,
                website: editForm.website,
                profilePicture: editForm.profilePicture,
            };
            const response = await fetch(`${server}/api/user/profile/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const raw = await response.text();
            let data = {};
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch {
                data = { error: raw || "Profile update failed. Server returned a non-JSON response." };
            }

            if (!response.ok) {
                throw new Error(data.error || "Failed to update profile");
            }
            await refreshFollowData();
            setShowEditProfile(false);
        } catch (error) {
            setProfileError(error.message);
        } finally {
            setSavingProfile(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>User not found.</div>;

    const authoredPosts = user.posts || [];
    const upvotedPosts = user.upvotedPosts || [];
    const downvotedPosts = user.downvotedPosts || [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="rounded-3xl overflow-hidden shadow-xl bg-white border">
                    <div className="h-36 bg-gradient-to-r from-[#009c51] via-emerald-500 to-lime-500" />
                    <div className="px-8 pb-8">
                        <div className="-mt-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div className="flex items-end gap-4">
                                <img
                                    src={user.profilePicture}
                                    alt={`${user.username}'s profile`}
                                    className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                                />
                                <div className="pb-2">
                                    <h1 className="text-3xl font-bold text-gray-800">
                                        {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
                                    </h1>
                                    <p className="text-sm text-gray-500">@{user.username}</p>
                                    <p className="text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            {isOwnProfile && (
                                <div className="flex gap-2">
                                    <button
                                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-semibold"
                                        onClick={openEditProfile}
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            )}
                            {currentUserId && currentUserId !== id && (
                                <div className="flex gap-2">
                                    <button
                                        className="bg-[#009c51] text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-70"
                                        onClick={handleFollowToggle}
                                        disabled={actionLoading}
                                    >
                                        {isFollowing ? "Unfollow" : "Follow"}
                                    </button>
                                    <button
                                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-70"
                                        onClick={handleMessage}
                                        disabled={actionLoading}
                                    >
                                        Message
                                    </button>
                                </div>
                            )}
                        </div>

                        <p className="mt-4 text-gray-600">{user.bio}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {user.location && <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">Location: {user.location}</span>}
                            {user.occupation && <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">Occupation: {user.occupation}</span>}
                            {user.dateOfBirth && (
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                                    DOB: {new Date(user.dateOfBirth).toLocaleDateString()}
                                </span>
                            )}
                            {user.website && (
                                <a
                                    href={user.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1 rounded-full bg-green-100 text-green-700 hover:underline"
                                >
                                    Website
                                </a>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-green-700">{authoredPosts.length}</p>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Posts</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-blue-700">{followers.length}</p>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Followers</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-amber-700">{following.length}</p>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Following</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mt-8">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white rounded-2xl shadow border p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Authored Posts</h3>
                            <div className="space-y-4">
                                {authoredPosts.length > 0 ? authoredPosts.map((post) => (
                                    <Link key={post._id} to={`/post/${post._id}`} className="block border rounded-xl p-4 hover:bg-gray-50">
                                        <h4 className="font-semibold text-blue-600">{post.title}</h4>
                                        <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                        <div className="flex gap-4 text-xs text-gray-500 mt-2">
                                            <span>{post.upvotes.length} Upvotes</span>
                                            <span>{post.downvotes.length} Downvotes</span>
                                        </div>
                                    </Link>
                                )) : <p className="text-sm text-gray-500">No posts yet.</p>}
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow border p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Upvoted Posts</h3>
                            <div className="space-y-3">
                                {upvotedPosts.length > 0 ? upvotedPosts.map((post) => (
                                    <Link key={post._id} to={`/post/${post._id}`} className="block border rounded-xl p-4 hover:bg-gray-50">
                                        <h4 className="font-medium text-blue-600">{post.title}</h4>
                                        <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                    </Link>
                                )) : <p className="text-sm text-gray-500">No upvoted posts yet.</p>}
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow border p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Downvoted Posts</h3>
                            <div className="space-y-3">
                                {downvotedPosts.length > 0 ? downvotedPosts.map((post) => (
                                    <Link key={post._id} to={`/post/${post._id}`} className="block border rounded-xl p-4 hover:bg-gray-50">
                                        <h4 className="font-medium text-blue-600">{post.title}</h4>
                                        <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                    </Link>
                                )) : <p className="text-sm text-gray-500">No downvoted posts yet.</p>}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="bg-white rounded-2xl shadow border p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">People Search</h3>
                            <input
                                type="text"
                                value={followSearch}
                                onChange={(event) => setFollowSearch(event.target.value)}
                                placeholder="Search followers/following..."
                                className="w-full border rounded-xl px-3 py-2 text-black"
                            />
                        </section>

                        <section className="bg-white rounded-2xl shadow border p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Followers</h3>
                            <div className="space-y-2">
                                {filteredFollowers.length > 0 ? filteredFollowers.map((follower) => (
                                    <Link
                                        key={follower._id}
                                        to={`/profile/${follower._id}`}
                                        className="flex items-center gap-3 text-sm text-blue-600 p-2 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100"
                                    >
                                        <img
                                            src={follower.profilePicture || "https://via.placeholder.com/150"}
                                            alt={follower.username}
                                            className="w-9 h-9 rounded-full object-cover border border-blue-100"
                                        />
                                        <span className="font-medium">{follower.username}</span>
                                    </Link>
                                )) : <p className="text-sm text-gray-500">No followers found.</p>}
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow border p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Following</h3>
                            <div className="space-y-2">
                                {filteredFollowing.length > 0 ? filteredFollowing.map((followed) => (
                                    <Link
                                        key={followed._id}
                                        to={`/profile/${followed._id}`}
                                        className="flex items-center gap-3 text-sm text-blue-600 p-2 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100"
                                    >
                                        <img
                                            src={followed.profilePicture || "https://via.placeholder.com/150"}
                                            alt={followed.username}
                                            className="w-9 h-9 rounded-full object-cover border border-blue-100"
                                        />
                                        <span className="font-medium">{followed.username}</span>
                                    </Link>
                                )) : <p className="text-sm text-gray-500">No following users found.</p>}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {showEditProfile && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Profile</h2>
                        <form onSubmit={handleProfileSave} className="grid md:grid-cols-2 gap-4">
                            <input name="firstName" value={editForm.firstName} onChange={handleEditInput} placeholder="First name" className="border rounded-xl px-3 py-2 text-black" />
                            <input name="lastName" value={editForm.lastName} onChange={handleEditInput} placeholder="Last name" className="border rounded-xl px-3 py-2 text-black" />
                            <input name="username" value={editForm.username} onChange={handleEditInput} placeholder="Username" className="border rounded-xl px-3 py-2 text-black" required />
                            <input name="dateOfBirth" type="date" value={editForm.dateOfBirth} onChange={handleEditInput} className="border rounded-xl px-3 py-2 text-black" />
                            <input name="location" value={editForm.location} onChange={handleEditInput} placeholder="Location" className="border rounded-xl px-3 py-2 text-black" />
                            <input name="occupation" value={editForm.occupation} onChange={handleEditInput} placeholder="Occupation" className="border rounded-xl px-3 py-2 text-black" />
                            <input name="website" value={editForm.website} onChange={handleEditInput} placeholder="Website URL" className="border rounded-xl px-3 py-2 text-black md:col-span-2" />
                            <input name="profilePicture" value={editForm.profilePicture} onChange={handleEditInput} placeholder="Profile picture URL" className="border rounded-xl px-3 py-2 text-black md:col-span-2" />
                            <textarea name="bio" value={editForm.bio} onChange={handleEditInput} placeholder="Bio" rows="4" className="border rounded-xl px-3 py-2 text-black md:col-span-2" />

                            {profileError && <p className="text-red-600 text-sm md:col-span-2">{profileError}</p>}

                            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditProfile(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="px-4 py-2 rounded-xl bg-[#009c51] text-white disabled:opacity-70"
                                >
                                    {savingProfile ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
