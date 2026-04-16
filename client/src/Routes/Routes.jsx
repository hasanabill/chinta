import {
    createBrowserRouter,
} from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import PostDetails from "../pages/PostDetails";
import NotFound from "../pages/NotFound";
import Messages from "../pages/Messages";
import Profile from "../pages/Profile";
import ForumCategory from "../pages/ForumCategory";
import ForumTag from "../pages/ForumTag";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import SearchResults from "../pages/SearchResults";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/messages",
                element: <Messages />
            },
            {
                path: "/search",
                element: <SearchResults />
            },
            {
                path: "/login",
                element: <LoginPage />
            },
            {
                path: "/signup",
                element: <SignupPage />
            },
            {
                path: "/conversation/:id",
                element: <Messages />
            },
            {
                path: "/forum/:category",
                element: <ForumCategory />
            },
            {
                path: "/forum/tag/:tag",
                element: <ForumTag />
            },
            {
                path: "profile/:id",
                element: <Profile />
            },
            {
                path: "/post/:id",
                element: <PostDetails />
            },
            {
                path: "*",
                element: <NotFound />
            }
        ]
    },
]);

// export const server = "http://localhost:5000";
export const server = "https://chinta-server.vercel.app";