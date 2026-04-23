import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/auth.api";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    // Ngăn trang web reload - ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT
    if (e) e.preventDefault();

    if (!email || !password) return alert("Please fill in all fields");

    try {
      setLoading(true);
      const res = await loginApi({ email, password });

      // Lấy dữ liệu từ cấu trúc của Backend trả về
      // Giả sử Backend trả về: { data: { accessToken: "...", user: {...} } }
      const { accessToken, user } = res.data;

      // Cập nhật vào Context (Source of Truth)
      login({
        token: accessToken,
        user: user,
      });

      // Điều hướng về trang chủ
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white shadow-md rounded-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            type="email"
            value={email}
            placeholder="name@company.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            type="password"
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit" // Đổi thành submit để nhận sự kiện Enter
          disabled={loading}
          className={`w-full py-2 text-white rounded transition-all ${
            loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Verifying..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
