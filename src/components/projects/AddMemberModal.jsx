import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "../../utils/axios";
import { addMemberApi } from "../../api/project.api";
import toast from "react-hot-toast";

export default function AddMemberModal({ projectId, myRole, onClose }) {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);

  // ── DEBOUNCE SEARCH với AbortController ──
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      const query = keyword.trim();

      if (!query) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`/auth/users/search`, {
          params: { email: query },
          signal: controller.signal,
        });
        setUsers(res.data || []);
      } catch (err) {
        if (err.name === "CanceledError") return;
        console.error(err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [keyword]);

  const handleKeywordChange = (value) => {
    setKeyword(value);
    setSelectedUser(null);
  };

  // ── ADD MEMBER ──
  const mutation = useMutation({
    mutationFn: (data) => addMemberApi(projectId, data),
    onSuccess: () => {
      toast.success(
        `Đã thêm ${selectedUser?.name || selectedUser?.email} vào project!`
      );
      setKeyword("");
      setUsers([]);
      setSelectedUser(null);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Thêm thành viên thất bại");
    },
  });

  const roleOptions = myRole === "OWNER" ? ["MANAGER", "MEMBER"] : ["MEMBER"];

  const handleAdd = () => {
    if (!selectedUser) return;
    mutation.mutate({ accountId: selectedUser.id, role: selectedRole });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
              Thêm thành viên
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4">
          {/* Search input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tìm theo email
            </label>
            <div className="relative">
              <input
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-all placeholder:text-gray-300"
                placeholder="VD: nguyen@email.com"
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && onClose()}
              />

              {/* Loading spinner inline */}
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
          {/* ROLE SELECTOR */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Vai trò
            </label>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-all"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {/* Search results */}
          {users.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-44 overflow-y-auto">
              {users.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-green-50 border-l-2 border-green-500"
                        : "hover:bg-gray-50 border-l-2 border-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isSelected
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {u.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {u.email}
                      </p>
                    </div>
                    {/* Checkmark khi selected */}
                    {isSelected && (
                      <div className="ml-auto text-green-500 flex-shrink-0">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && keyword.trim() && users.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400">
                Không tìm thấy user với email{" "}
                <span className="font-medium text-gray-500">
                  "{keyword.trim()}"
                </span>
              </p>
            </div>
          )}

          {/* Selected user preview */}
          {selectedUser && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold flex-shrink-0">
                {selectedUser.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-gray-700">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-gray-400">{selectedUser.email}</p>
              </div>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">
                {selectedRole}
              </span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium"
          >
            Huỷ
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedUser || mutation.isPending}
            className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-all"
          >
            {mutation.isPending ? "Đang thêm..." : "Thêm vào project"}
          </button>
        </div>
      </div>
    </div>
  );
}
