import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "../api/auth.api";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return alert("Please fill in all fields");

    try {
      setLoading(true);
      const res = await registerApi({ name, email, password });
      const { accessToken, user } = res.data;

      // Nếu backend trả token luôn → login thẳng
      if (accessToken) {
        login({ token: accessToken, user });
        navigate("/", { replace: true });
      } else {
        // Nếu chỉ trả message → redirect sang login
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Register failed.";
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
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create Account
        </h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            type="text"
            value={name}
            placeholder="John Doe"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-white rounded transition-all ${
            loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
