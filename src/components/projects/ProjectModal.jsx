import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProjectApi } from "../../api/project.api";

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

      // refresh project list
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      // auto select project (IMPORTANT UX)
      if (onSelectProject) {
        onSelectProject(project);
      }

      onClose();
    },

    onError: (err) => {
      alert(err.response?.data?.message || "Tạo project thất bại");
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;

    mutation.mutate({
      name: form.name,
      description: form.description,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Tạo Project</h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Tên project"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Mô tả (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
