import {
    createBrowserRouter,
} from "react-router-dom";
import App from "../App";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/test",
                element: <h1>Hello</h1>
            },
        ]
    },
]);