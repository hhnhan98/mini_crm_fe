import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useTaskDetail } from "../../hooks/useTaskDetail";
import { updateTaskApi } from "../../api/task.api";
import { getProjectMembersApi } from "../../api/project.api";

// MAIN WRAPPER (FETCH ONLY)
export default function TaskModal({ taskId, onClose }) {
  const { data: response, isLoading, isError } = useTaskDetail(taskId);
  const task = response?.data;

  if (!taskId) return null;

  // Nếu đang load: Hiện overlay loading
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl font-medium">
          Đang tải...
        </div>
      </div>
    );
  }

  // Nếu lỗi hoặc không có task: Hiện thông báo lỗi
  if (isError || !task) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <p className="text-red-500">Không tìm thấy công việc!</p>
          <button onClick={onClose} className="mt-4 text-blue-500 underline">
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // KHI ĐÃ CÓ TASK: Render nội dung thật
  // Dùng key={task.id} để React tự động reset State bên trong khi đổi Task khác
  return <TaskContent key={task.id} task={task} onClose={onClose} />;
}

// CONTENT (EDIT LOGIC)
// Component này chỉ được mount khi 'task' chắc chắn tồn tại (không bao giờ null)
function TaskContent({ task, onClose }) {
  const queryClient = useQueryClient();

  // Khởi tạo State trực tiếp từ dữ liệu thật của Task
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "MEDIUM",
    assigneeId: task.assigneeId || "",
    status: task.status || "TODO",
  });

  // Lấy danh sách thành viên của dự án để hiển thị trong dropdown Assignee
  const { data: membersResponse } = useQuery({
    queryKey: ["project-members", task.projectId],
    queryFn: () => getProjectMembersApi(task.projectId),
    enabled: !!task.projectId,
  });

  const members = membersResponse?.data || [];

  // UNIFIED UPDATE
  const updateMutation = useMutation({
    mutationFn: (updates) => updateTaskApi({ taskId: task.id, updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", task.projectId] });
      queryClient.invalidateQueries({ queryKey: ["task", task.id] });
    },
    onError: (err) => alert(err.response?.data?.message || "Cập nhật thất bại"),
  });

  // BLUR UPDATE (SAFE CHECK)
  const handleBlurUpdate = (field, value) => {
    if (task[field] === value) return; // Nếu không đổi thì không gọi API
    updateMutation.mutate({ [field]: value });
  };

  const STATUS_TRANSITIONS = {
    TODO: ["TODO", "IN_PROGRESS"],
    IN_PROGRESS: ["IN_PROGRESS", "IN_REVIEW"],
    IN_REVIEW: ["IN_REVIEW", "DONE"],
    DONE: ["DONE"],
  };

  const PRIORITY_COLORS = {
    LOW: "text-blue-600 bg-blue-50",
    MEDIUM: "text-yellow-600 bg-yellow-50",
    HIGH: "text-red-600 bg-red-50",
  };

  const assigneeName = members.find((m) => m.account.id === formData.assigneeId)
    ?.account?.name;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Chi tiết công việc
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* LEFT */}
          <div className="flex-[2] p-8 space-y-8 border-r border-gray-100">
            <textarea
              rows="1"
              className="w-full text-3xl font-bold text-gray-800 outline-none resize-none border-b pb-2"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              onBlur={(e) => handleBlurUpdate("title", e.target.value)}
              placeholder="Tiêu đề..."
            />

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-500">
                📝 Mô tả
              </label>

              <textarea
                className="w-full min-h-[300px] p-4 bg-gray-50 rounded-xl outline-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                onBlur={(e) => handleBlurUpdate("description", e.target.value)}
                placeholder="Thêm mô tả..."
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 bg-gray-50/30 p-8 space-y-8">
            {/* STATUS (FIX #3 added UI-ready, not breaking BE) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Trạng thái
              </label>

              <select
                className="w-full p-2 rounded-xl border"
                value={formData.status}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, status: val });
                  updateMutation.mutate({ status: val });
                }}
              >
                {STATUS_TRANSITIONS[task.status]?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* PRIORITY */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Độ ưu tiên
              </label>

              <select
                className={`w-full p-2.5 rounded-xl border ${
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
            <div className="space-y-3 border-t pt-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Người đảm nhận
              </label>

              <select
                className="w-full p-2 border rounded-xl"
                value={formData.assigneeId}
                onChange={(e) => {
                  const val = e.target.value;

                  setFormData({
                    ...formData,
                    assigneeId: val,
                  });

                  updateMutation.mutate({
                    assigneeId: val || null,
                  });
                }}
              >
                <option value="">Unassigned</option>

                {members.map((m) => (
                  <option key={m.account.id} value={m.account.id}>
                    {m.account.name}
                  </option>
                ))}
              </select>

              <div className="text-sm text-gray-600">
                {assigneeName || "Chưa phân công"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
