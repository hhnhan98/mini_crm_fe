import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Board from "./pages/Board.jsx";
import Project from "./pages/Project.jsx";
import AppLayout from "./layouts/AppLayout.jsx";

import { AuthContext } from "./context/AuthContext";

export default function App() {
  const { token } = useContext(AuthContext);
  const isAuth = !!token;

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route
        path="/login"
        element={isAuth ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={isAuth ? <Navigate to="/" replace /> : <Register />}
      />

      {/* PRIVATE ROUTES (APP SHELL) */}
      <Route
        element={isAuth ? <AppLayout /> : <Navigate to="/login" replace />}
      >
        {/* HOME */}
        <Route
          path="/"
          element={
            <div className="p-6 text-gray-500">
              Please select a project from sidebar
            </div>
          }
        />

        {/* PROJECT LAYOUT ROUTE */}
        <Route path="/projects/:projectId" element={<Project />}>
          <Route index element={<Board />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
