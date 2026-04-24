import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTasks } from "../hooks/useTasks";
import { useProjectMember } from "../hooks/useProjectMember";
import { useAuth } from "../hooks/useAuth";
import { createTaskApi, updateTaskStatusApi } from "../api/task.api";
import TaskModal from "../components/tasks/TaskModal";

const STATUS_COLUMNS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export default function Board() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { data: myRole } = useProjectMember(projectId, user?.id);
  const queryClient = useQueryClient();

  const canCreateTask = myRole === "OWNER" || myRole === "MANAGER";

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const { data: tasksResponse, isLoading } = useTasks(projectId);
  const tasks = useMemo(() => tasksResponse || [], [tasksResponse]);

  const groupedTasks = useMemo(() => {
    return STATUS_COLUMNS.reduce((acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    }, {});
  }, [tasks]);

  const createTaskMutation = useMutation({
    mutationFn: createTaskApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateTaskStatusApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
    onError: (err) =>
      alert(err.response?.data?.message || "Lỗi chuyển trạng thái"),
  });

  const getNextActions = (current) => {
    const rules = {
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["IN_REVIEW"],
      IN_REVIEW: ["DONE"],
      DONE: [],
    };
    return rules[current] || [];
  };

  if (!projectId)
    return (
      <div className="p-10 text-center opacity-50">Chọn dự án để tiếp tục</div>
    );
  if (isLoading)
    return (
      <div className="p-10 text-center animate-pulse">Đang tải dữ liệu...</div>
    );

  return (
    <div className="p-6 h-screen flex flex-col bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          Project Board
        </h1>

        {/* ✅ Chỉ OWNER/MANAGER mới thấy */}
        {canCreateTask && (
          <button
            onClick={() =>
              createTaskMutation.mutate({ title: "New Task", projectId })
            }
            disabled={createTaskMutation.isPending}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all"
          >
            + Thêm Task
          </button>
        )}
      </div>

      {/* Kanban Columns — giữ nguyên */}
      <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start">
        {STATUS_COLUMNS.map((col) => (
          <div key={col} className="w-80 flex-shrink-0 flex flex-col">
            <div className="flex justify-between px-2 mb-4">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                {col}
              </span>
              <span className="text-[11px] font-bold bg-gray-200 px-2 py-0.5 rounded-md">
                {groupedTasks[col]?.length}
              </span>
            </div>

            <div className="space-y-3">
              {groupedTasks[col].map((task) => {
                const isUpdating =
                  updateStatusMutation.variables?.taskId === task.id &&
                  updateStatusMutation.isPending;

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`p-4 bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer transition-all hover:border-blue-400 hover:shadow-md ${
                      isUpdating ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      {task.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-gray-300">
                        #{task.id.slice(-4)}
                      </span>

                      <div className="flex gap-1">
                        {getNextActions(task.status).map((next) => (
                          <button
                            key={next}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatusMutation.mutate({
                                taskId: task.id,
                                status: next,
                              });
                            }}
                            className="text-[9px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors"
                          >
                            {next} →
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
