import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useTaskDetail } from "../../hooks/useTaskDetail";
import { updateTaskApi, deleteTaskApi } from "../../api/task.api";
import { getProjectMembersApi } from "../../api/project.api";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

// Label đẹp hơn cho status
const STATUS_LABELS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const STATUS_TRANSITIONS = {
  TODO: ["TODO", "IN_PROGRESS"],
  IN_PROGRESS: ["IN_PROGRESS", "IN_REVIEW"],
  IN_REVIEW: ["IN_REVIEW", "DONE"],
  DONE: ["DONE"],
};

// Màu cho priority select
const PRIORITY_COLORS = {
  LOW: "text-blue-600 bg-blue-50 border-blue-200",
  MEDIUM: "text-yellow-600 bg-yellow-50 border-yellow-200",
  HIGH: "text-red-600 bg-red-50 border-red-200",
};

// Màu badge cho priority (hiển thị ở header)
const PRIORITY_BADGE = {
  LOW: "bg-blue-100 text-blue-600",
  MEDIUM: "bg-yellow-100 text-yellow-600",
  HIGH: "bg-red-100 text-red-600",
};

// Skeleton loading cho modal
function TaskModalSkeleton({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-pulse">
        {/* Header skeleton */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left skeleton */}
          <div className="flex-[2] p-8 space-y-6 border-r border-gray-100">
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-16" />
              <div className="h-48 bg-gray-100 rounded-xl" />
            </div>
          </div>

          {/* Right skeleton */}
          <div className="flex-1 p-8 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN WRAPPER ────────────────────────────────────────────────────────────
export default function TaskModal({ taskId, onClose }) {
  const { data: response, isLoading, isError } = useTaskDetail(taskId);
  const task = response?.data;

  if (!taskId) return null;

  if (isLoading) return <TaskModalSkeleton onClose={onClose} />;

  if (isError || !task) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <p className="text-red-500 font-medium">Không tìm thấy công việc!</p>
          <button
            onClick={onClose}
            className="mt-4 text-blue-500 underline text-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return <TaskContent key={task.id} task={task} onClose={onClose} />;
}

// ─── CONTENT ─────────────────────────────────────────────────────────────────
function TaskContent({ task, onClose }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "MEDIUM",
    assigneeId: task.assigneeId || "",
    status: task.status || "TODO",
  });

  // Fetch members để hiện dropdown assignee
  const { data: membersResponse } = useQuery({
    queryKey: ["project-members", task.projectId],
    queryFn: () => getProjectMembersApi(task.projectId),
    enabled: !!task.projectId,
  });

  const members = membersResponse?.data || [];

  // Tìm role của current user
  const myRole = members.find((m) => m.accountId === user?.id)?.role;
  const canDelete = myRole === "OWNER" || myRole === "MANAGER"; // Chỉ OWNER và MANAGER mới có quyền xóa

  // Mutation xóa task, chỉ OWNER, MANAGER mới thấy nút xóa
  const deleteMutation = useMutation({
    mutationFn: () => deleteTaskApi(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", task.projectId] });
      toast.success("Đã xóa task!");
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xóa thất bại"),
  });

  // Handler xóa task với confirm
  const handleDelete = () => {
    if (!window.confirm("Bạn chắc chắn muốn xóa task này?")) return;
    deleteMutation.mutate();
  };

  // UNIFIED UPDATE với toast
  const updateMutation = useMutation({
    mutationFn: (updates) => updateTaskApi({ taskId: task.id, updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", task.projectId] });
      queryClient.invalidateQueries({ queryKey: ["task", task.id] });
      toast.success("Đã cập nhật!");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Cập nhật thất bại"),
  });

  // Auto-save khi blur, chỉ gọi API nếu thực sự thay đổi
  const handleBlurUpdate = (field, value) => {
    if (task[field] === value) return;
    updateMutation.mutate({ [field]: value });
  };

  const assigneeMember = members.find(
    (m) => m.account.id === formData.assigneeId
  );
  const assigneeName = assigneeMember?.account?.name;

  const isSaving = updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Chi tiết công việc
            </span>

            {/* Priority badge ở header */}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                PRIORITY_BADGE[formData.priority]
              }`}
            >
              {formData.priority}
            </span>

            {/* Saving indicator */}
            {isSaving && (
              <span className="text-[10px] text-gray-400 animate-pulse">
                Đang lưu...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-xs px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 border border-red-200 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Đang xóa..." : "🗑 Xóa"}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* ── LEFT: Title + Description ── */}
          <div className="flex-[2] p-8 space-y-8 border-r border-gray-100">
            {/* Title */}
            <textarea
              rows="1"
              className="w-full text-3xl font-bold text-gray-800 outline-none resize-none border-b border-transparent focus:border-blue-200 pb-2 transition-colors"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              onBlur={(e) => handleBlurUpdate("title", e.target.value)}
              placeholder="Tiêu đề..."
            />

            {/* Assignee hiển thị dạng avatar + tên dưới title */}
            <div className="flex items-center gap-2 -mt-4">
              {assigneeName ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold border border-blue-200">
                    {assigneeName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-500">{assigneeName}</span>
                </>
              ) : (
                <span className="text-xs text-gray-300 italic">
                  Công việc chưa được phân công
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-500">
                📝 Mô tả
              </label>
              <textarea
                className="w-full min-h-[260px] p-4 bg-gray-50 rounded-xl outline-none resize-none focus:bg-gray-100 transition-colors text-sm text-gray-700"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                onBlur={(e) => handleBlurUpdate("description", e.target.value)}
                placeholder="Thêm mô tả công việc..."
              />
            </div>
          </div>

          {/* ── RIGHT: Status, Priority, Assignee ── */}
          <div className="flex-1 bg-gray-50/30 p-8 space-y-6">
            {/* STATUS */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Trạng thái
              </label>
              <select
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-400 transition-colors"
                value={formData.status}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, status: val });
                  updateMutation.mutate({ status: val });
                }}
              >
                {STATUS_TRANSITIONS[task.status]?.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* PRIORITY */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Độ ưu tiên
              </label>
              <select
                className={`w-full p-2.5 rounded-xl border font-semibold text-sm focus:outline-none transition-colors ${
                  PRIORITY_COLORS[formData.priority]
                }`}
                value={formData.priority}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, priority: val });
                  updateMutation.mutate({ priority: val });
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* ASSIGNEE */}
            <div className="space-y-3 border-t border-gray-100 pt-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Người đảm nhận
              </label>

              <select
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:border-blue-400 transition-colors"
                value={formData.assigneeId}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, assigneeId: val });
                  updateMutation.mutate({ assigneeId: val || null });
                }}
              >
                <option value="">— Unassigned —</option>
                {members.map((m) => (
                  <option key={m.account.id} value={m.account.id}>
                    {m.account.name}
                  </option>
                ))}
              </select>

              {/* Avatar + tên assignee hiện tại */}
              {assigneeName ? (
                <div className="flex items-center gap-2 px-1">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold border border-blue-200">
                    {assigneeName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {assigneeName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {assigneeMember?.account?.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic px-1">
                  Chưa phân công cho ai
                </p>
              )}
            </div>

            {/* TASK META */}
            <div className="border-t border-gray-100 pt-6 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Thông tin
              </label>
              <div className="text-xs text-gray-400 space-y-1">
                {/* <p>
                  ID:{" "}
                  <span className="font-mono text-gray-500">
                    #{task.id.slice(-8)}
                  </span>
                </p> */}
                {task.createdBy && (
                  <p>
                    Tạo bởi:{" "}
                    <span className="text-gray-600 font-medium">
                      {task.createdBy.name}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
