import axios from "../utils/axios";

// Lấy danh sách task theo project
export const getTasksByProjectApi = (projectId) =>
  axios.get("/tasks", { params: { projectId } });

// Tạo task mới
export const createTaskApi = (payload) => axios.post("/tasks", payload);

// Cập nhật toàn bộ/một phần task (Tiêu đề, mô tả, priority...)
export const updateTaskApi = ({ taskId, updates }) =>
  axios.put(`/tasks/${taskId}`, updates);

// Cập nhật CHỈ trạng thái (Dùng cho Board/Kéo thả)
export const updateTaskStatusApi = ({ taskId, status }) =>
  axios.patch(`/tasks/${taskId}/status`, { status });

// Xóa task (Soft delete)
export const deleteTaskApi = (taskId) => axios.delete(`/tasks/${taskId}`);

// Lấy chi tiết 1 task
export const getTaskDetailApi = (taskId) => axios.get(`/tasks/${taskId}`);
