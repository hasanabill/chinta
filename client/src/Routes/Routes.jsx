import {
    createBrowserRouter,
} from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import PostDetails from "../pages/PostDetails";
import NotFound from "../pages/NotFound";
import Messages from "../pages/Messages";
import Profile from "../pages/Profile";

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
                path: "profile",
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