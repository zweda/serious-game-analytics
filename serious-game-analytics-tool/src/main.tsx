import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import { modules } from "./constants";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <></>,
    children: Object.keys(modules).map((k) => {
      const Component = (modules as any)[k].Component;

      return {
        path: k,
        element: Component ? <Component /> : <></>,
        errorElement: <></>,
      };
    }),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
