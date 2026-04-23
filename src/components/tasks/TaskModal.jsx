import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTaskDetail } from "../../hooks/useTaskDetail";
import { updateTaskApi } from "../../api/task.api";

// --- COMPONENT CHÍNH (LO FETCHING) ---
export default function TaskModal({ taskId, onClose }) {
  const { data: response, isLoading, isError } = useTaskDetail(taskId);
  const task = response?.data;

  if (!taskId) return null;

  // 1. Nếu đang load: Hiện overlay loading
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl font-medium">
          Đang tải...
        </div>
      </div>
    );
  }

  // 2. Nếu lỗi hoặc không có task: Hiện thông báo lỗi
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

  // 3. KHI ĐÃ CÓ TASK: Render nội dung thật
  // Dùng key={task.id} để React tự động reset State bên trong khi đổi Task khác
  return <TaskContent key={task.id} task={task} onClose={onClose} />;
}

// --- COMPONENT PHỤ (LO HIỂN THỊ & STATE) ---
// Component này chỉ được mount khi 'task' chắc chắn tồn tại (không bao giờ null)
function TaskContent({ task, onClose }) {
  const queryClient = useQueryClient();

  // Khởi tạo State trực tiếp từ dữ liệu thật của Task
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "MEDIUM",
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => updateTaskApi({ taskId: task.id, updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", task.id] });
    },
    onError: (err) => alert(err.response?.data?.message || "Cập nhật thất bại"),
  });

  const handleBlurUpdate = (field, value) => {
    if (task[field] === value) return; // Nếu không đổi thì không gọi API
    updateMutation.mutate({ [field]: value });
  };

  const PRIORITY_COLORS = {
    LOW: "text-blue-600 bg-blue-50",
    MEDIUM: "text-yellow-600 bg-yellow-50",
    HIGH: "text-red-600 bg-red-50",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header bar */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Chi tiết công việc
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* CỘT TRÁI: Nội dung chính */}
          <div className="flex-[2] p-8 space-y-8 border-r border-gray-100">
            <textarea
              rows="1"
              className="w-full text-3xl font-bold text-gray-800 outline-none resize-none border-b border-transparent focus:border-blue-100 pb-2 leading-tight"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              onBlur={(e) => handleBlurUpdate("title", e.target.value)}
              placeholder="Tiêu đề..."
            />

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                📝 Mô tả
              </label>
              <textarea
                className="w-full min-h-[300px] p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-gray-700 leading-relaxed transition-all resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                onBlur={(e) => handleBlurUpdate("description", e.target.value)}
                placeholder="Thêm mô tả chi tiết..."
              />
            </div>
          </div>

          {/* CỘT PHẢI: Metadata */}
          <div className="flex-1 bg-gray-50/30 p-8 space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Trạng thái
              </label>
              <div className="inline-block px-3 py-1 rounded-full bg-white border shadow-sm text-xs font-bold text-blue-600">
                {task.status?.replace("_", " ")}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Độ ưu tiên
              </label>
              <select
                className={`w-full p-2.5 rounded-xl border shadow-sm text-sm font-semibold outline-none transition-all ${
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

            <div className="space-y-3 border-t pt-6 border-gray-100">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Người đảm nhận
              </label>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {task.assignee?.name?.charAt(0) || "?"}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {task.assignee?.name || "Chưa phân công"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
