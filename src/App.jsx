import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import Login from "./pages/Login.jsx";
import Board from "./pages/Board.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import { AuthContext } from "./context/AuthContext";

export default function App() {
  const { token } = useContext(AuthContext);

  // 🔥 tránh undefined edge case
  const isAuth = !!token;

  return (
    <Routes>
      {/* PUBLIC ROUTE */}
      <Route path="/login" element={isAuth ? <Navigate to="/" /> : <Login />} />

      {/* PRIVATE ROUTE WRAPPER */}
      <Route element={isAuth ? <AppLayout /> : <Navigate to="/login" />}>
        <Route path="/" element={<Board />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
