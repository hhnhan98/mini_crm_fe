import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Board from "./pages/Board.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import { AuthContext } from "./context/AuthContext";

export default function App() {
  const { token } = useContext(AuthContext);
  const isAuth = !!token;

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={isAuth ? <Navigate to="/" /> : <Login />} />

      {/* PRIVATE */}
      <Route element={isAuth ? <AppLayout /> : <Navigate to="/login" />}>
        <Route
          path="/"
          element={
            <div className="p-6 text-gray-500">
              Please select a project from sidebar
            </div>
          }
        />

        <Route path="/projects/:projectId" element={<Board />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
