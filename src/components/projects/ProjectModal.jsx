import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProjectApi } from "../../api/project.api";
import toast from "react-hot-toast";

export default function ProjectModal({ onClose, onSelectProject }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const mutation = useMutation({
    mutationFn: createProjectApi,
    onSuccess: (res) => {
      const project = res.data;
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(`Đã tạo project "${project.name}"!`);
      if (onSelectProject) onSelectProject(project);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Tạo project thất bại");
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Tên project không được để trống");
      return;
    }
    mutation.mutate({ name: form.name.trim(), description: form.description });
  };

  // Submit bằng Enter (chỉ ở input name, không phải textarea)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onClose();
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
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
              Tạo Project mới
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
          {/* Project name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tên project <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-gray-300"
              placeholder="VD: HN CRM, Marketing Q2..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Mô tả{" "}
              <span className="text-gray-300 font-normal normal-case">
                (tuỳ chọn)
              </span>
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none placeholder:text-gray-300"
              placeholder="Mô tả ngắn về mục tiêu dự án..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
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
            onClick={handleSubmit}
            disabled={mutation.isPending || !form.name.trim()}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
          >
            {mutation.isPending ? "Đang tạo..." : "Tạo project"}
          </button>
        </div>
      </div>
    </div>
  );
}
