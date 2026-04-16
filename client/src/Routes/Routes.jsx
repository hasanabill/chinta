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
                path: "/conversation/:id",
                element: <Messages />
            },
            {
                path: "/forum/:category",
                element: <ForumCategory />
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

export const server = "http://localhost:5000";
// export const server = "https://chinta-server.vercel.app";