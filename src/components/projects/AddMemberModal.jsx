import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "../../utils/axios";
import { addMemberApi } from "../../api/project.api";

export default function AddMemberModal({ projectId, onClose }) {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // DEBOUNCE SEARCH
  // ===============================
  useEffect(() => {
    const controller = new AbortController();

    // ✅ clearTimeout TRƯỚC khi timer fire
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
        if (err.name === "CanceledError") return; // ✅ axios dùng CanceledError, không phải isCancel
        console.error(err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer); // ✅ clear timer TRƯỚC
      controller.abort(); // ✅ abort request SAU
    };
  }, [keyword]);

  // =================================
  const handleKeywordChange = (value) => {
    setKeyword(value);
    setSelectedUser(null);
  };
  // ===============================
  // ADD MEMBER MUTATION
  // ===============================
  const mutation = useMutation({
    mutationFn: (data) => addMemberApi(projectId, data),

    onSuccess: () => {
      setKeyword("");
      setUsers([]);
      setSelectedUser(null);
      onClose();
    },

    onError: (err) => {
      alert(err.response?.data?.message || "Add member thất bại");
    },
  });

  const handleAdd = () => {
    if (!selectedUser) return;

    mutation.mutate({
      accountId: selectedUser.id,
      role: "MEMBER",
    });
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-xl p-6 space-y-4">
        {/* TITLE */}
        <h2 className="text-lg font-bold">Add Member</h2>

        {/* SEARCH INPUT */}
        <input
          className="w-full border p-2 rounded"
          placeholder="Search by email..."
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
        />

        {/* LOADING */}
        {loading && <div className="text-sm text-gray-500">Searching...</div>}

        {/* RESULTS */}
        {users.length > 0 && (
          <div className="border rounded max-h-40 overflow-auto">
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  selectedUser?.id === u.id ? "bg-gray-200" : ""
                }`}
              >
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && keyword && users.length === 0 && (
          <div className="text-sm text-gray-400">No users found</div>
        )}

        {/* SELECTED USER */}
        {selectedUser && (
          <div className="text-sm text-green-600">
            Selected: {selectedUser.email}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={handleAdd}
            disabled={!selectedUser || mutation.isPending}
            className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            {mutation.isPending ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
