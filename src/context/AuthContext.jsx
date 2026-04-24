import { createContext, useState, useCallback, useMemo } from "react"; // ✅ thêm useContext

// 1. Khởi tạo Context
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

/**
 * Helper để parse an toàn dữ liệu từ localStorage
 * Tránh lỗi crash app khi data bị corrupt hoặc không đúng định dạng JSON
 */
const getSafeStorage = (key) => {
  const data = localStorage.getItem(key);
  if (!data || data === "undefined" || data === "null") return null;
  try {
    return key === "user" ? JSON.parse(data) : data;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // State quản lý Token và Thông tin User
  const [token, setToken] = useState(() => getSafeStorage("token"));
  const [user, setUser] = useState(() => getSafeStorage("user"));

  /**
   * Hàm Login: Cập nhật đồng thời State và Storage
   * Sử dụng useCallback để tránh trigger re-render vô tận ở các component dùng hàm này
   */
  const login = useCallback((authData) => {
    const { token: newToken, user: newUser } = authData;

    // Cập nhật State
    setToken(newToken);
    setUser(newUser);

    // Lưu vào Storage
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  }, []);

  /**
   * Hàm Logout: Xóa sạch dấu vết
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Option: Điều hướng về login hoặc reload để clear toàn bộ memory
    window.location.href = "/login";
  }, []);

  /**
   * useMemo giúp tối ưu performance.
   * Context Value chỉ thay đổi khi token hoặc user thay đổi.
   */
  const contextValue = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [token, user, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
