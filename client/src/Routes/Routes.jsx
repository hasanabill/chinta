import {
    createBrowserRouter,
} from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import PostDetails from "../pages/PostDetails";

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
                path: "/post/:id",
                element: <PostDetails />
            }
        ]
    },
]);

export const server = "http://localhost:5000";