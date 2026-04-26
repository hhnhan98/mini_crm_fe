import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTasks } from "../hooks/useTasks";
import { useProjectMember } from "../hooks/useProjectMember";
import { useAuth } from "../hooks/useAuth";
import { createTaskApi, updateTaskStatusApi } from "../api/task.api";
import TaskModal from "../components/tasks/TaskModal";
import toast from "react-hot-toast";

const STATUS_COLUMNS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

const STATUS_LABELS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const STATUS_COLORS = {
  TODO: "text-gray-500 border-gray-300",
  IN_PROGRESS: "text-blue-500 border-blue-400",
  IN_REVIEW: "text-yellow-500 border-yellow-400",
  DONE: "text-green-500 border-green-400",
};

const PRIORITY_BADGE = {
  HIGH: "bg-red-100 text-red-600",
  MEDIUM: "bg-yellow-100 text-yellow-600",
  LOW: "bg-blue-100 text-blue-600",
};

function TaskCardSkeleton() {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-3 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <div className="h-4 w-12 bg-gray-100 rounded-full" />
        <div className="h-4 w-6 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start">
      {STATUS_COLUMNS.map((col) => (
        <div key={col} className="w-80 flex-shrink-0 flex flex-col">
          <div className="flex justify-between px-2 mb-4">
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-6 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Board() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { data: myRole } = useProjectMember(projectId, user?.id);
  const queryClient = useQueryClient();

  const canCreateTask = myRole === "OWNER" || myRole === "MANAGER";

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [filterMode, setFilterMode] = useState("all");
  const { data: tasksResponse, isLoading } = useTasks(projectId);
  const tasks = useMemo(() => tasksResponse || [], [tasksResponse]);

  const filteredTasks = useMemo(() => {
    if (filterMode === "mine") {
      return tasks.filter((t) => t.assignee?.id === user?.id);
    }
    return tasks;
  }, [tasks, filterMode, user?.id]);

  const groupedTasks = useMemo(() => {
    return STATUS_COLUMNS.reduce((acc, status) => {
      acc[status] = filteredTasks.filter((t) => t.status === status);
      return acc;
    }, {});
  }, [filteredTasks]);

  const createTaskMutation = useMutation({
    mutationFn: createTaskApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Đã tạo task mới!");
    },
    onError: () => toast.error("Tạo task thất bại"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateTaskStatusApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
    onError: (err) =>
      toast.error(err.response?.data?.message || "Lỗi chuyển trạng thái"),
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

  return (
    <div className="p-6 h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          Project Board
        </h1>

        {/* Filter bar  */}
        <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              filterMode === "all"
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterMode("mine")}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              filterMode === "mine"
                ? "bg-blue-600 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Của tôi
          </button>
        </div>
        {canCreateTask && (
          <button
            onClick={() =>
              createTaskMutation.mutate({ title: "New Task", projectId })
            }
            disabled={createTaskMutation.isPending}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all"
          >
            {createTaskMutation.isPending ? "Đang tạo..." : "+ Thêm Task"}
          </button>
        )}
      </div>

      {/* BOARD */}
      {isLoading ? (
        <BoardSkeleton />
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start">
          {STATUS_COLUMNS.map((col) => (
            <div key={col} className="w-80 flex-shrink-0 flex flex-col">
              {/* Column Header */}
              <div
                className={`flex justify-between items-center px-2 mb-4 pb-2 border-b-2 ${STATUS_COLORS[col]}`}
              >
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {STATUS_LABELS[col]}
                </span>
                <span className="text-[11px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">
                  {groupedTasks[col]?.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3">
                {groupedTasks[col].length === 0 ? (
                  // Empty state
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-xs text-gray-300 italic">Chưa có task</p>
                  </div>
                ) : (
                  groupedTasks[col].map((task) => {
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
                        {/* Title */}
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 leading-snug">
                          {task.title}
                        </h3>

                        {/* Priority Badge */}
                        {task.priority && (
                          <div className="mb-3">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                PRIORITY_BADGE[task.priority]
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        )}

                        {/* Footer: ID + Assignee Avatar + Action buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Task ID */}
                            {/* <span className="text-[9px] font-mono text-gray-300">
                              #{task.id.slice(-4)}
                            </span> */}
                            {/* Assignee Avatar */}
                            {task.assignee && (
                              <div className="flex items-center gap-1">
                                <div
                                  title={task.assignee.name}
                                  className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[9px] font-bold border border-blue-200 flex-shrink-0"
                                >
                                  {task.assignee.name?.charAt(0).toUpperCase()}
                                </div>
                                {/* ✅ Thêm tên */}
                                <span className="text-[10px] text-gray-400 truncate max-w-[60px]">
                                  {task.assignee.name}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Next Status Buttons */}
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
                                {STATUS_LABELS[next]} →
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
