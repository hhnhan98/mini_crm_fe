import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Projects from "./pages/Project.jsx";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={token ? <Projects /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}
