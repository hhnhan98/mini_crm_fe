import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjectByIdApi, getProjectMembersApi } from "../api/project.api";
import AddMemberModal from "../components/projects/AddMemberModal.jsx";
import { useAuth } from "../hooks/useAuth";
import Board from "./Board";
import { useTasks } from "../hooks/useTasks";

// Màu badge cho từng role
const ROLE_BADGE = {
  OWNER: "bg-purple-100 text-purple-600",
  MANAGER: "bg-blue-100 text-blue-600",
  MEMBER: "bg-gray-100 text-gray-500",
};

// Màu cho task stats
const STAT_COLORS = {
  TODO: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-500",
    label: "To Do",
  },
  IN_PROGRESS: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    label: "In Progress",
  },
  IN_REVIEW: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-600",
    label: "In Review",
  },
  DONE: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-600",
    label: "Done",
  },
};

// Skeleton cho project header
function ProjectSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded-xl" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-xl p-4 space-y-2">
            <div className="h-6 w-8 bg-gray-200 rounded mx-auto" />
            <div className="h-3 w-16 bg-gray-100 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Members skeleton */}
      <div className="border rounded-xl p-4 space-y-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Project() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [openAddMember, setOpenAddMember] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const { data: projectRes, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectByIdApi(projectId),
    enabled: !!projectId,
  });

  const project = projectRes?.data;

  const { data: membersRes, isLoading: membersLoading } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => getProjectMembersApi(projectId),
    enabled: !!projectId,
  });

  const members = membersRes?.data || [];

  // Lấy tasks để tính stats
  const { data: tasks = [] } = useTasks(projectId);

  // Task stats theo status
  const taskStats = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map(
    (status) => ({
      status,
      count: tasks.filter((t) => t.status === status).length,
      ...STAT_COLORS[status],
    })
  );

  // Role của user hiện tại
  const myRole = members.find((m) => m.accountId === user?.id)?.role;
  const canManageMembers = myRole === "OWNER" || myRole === "MANAGER";

  if (!projectId) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        Chọn dự án từ sidebar để bắt đầu
      </div>
    );
  }

  if (projectLoading) return <ProjectSkeleton />;

  const visibleMembers = showAllMembers ? members : members.slice(0, 5);
  const hiddenCount = members.length - 5;

  return (
    <div className="space-y-0">
      {/* ── PROJECT HEADER ── */}
      <div className="px-6 pt-6 pb-4 border-b bg-white">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">
                {project?.name}
              </h1>
              {/* Role badge của user hiện tại */}
              {myRole && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${ROLE_BADGE[myRole]}`}
                >
                  {myRole}
                </span>
              )}
            </div>
            {project?.description ? (
              <p className="text-sm text-gray-500">{project.description}</p>
            ) : (
              <p className="text-sm text-gray-300 italic">Chưa có mô tả</p>
            )}
          </div>
        </div>

        {/* ── TASK STATS ── */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          {taskStats.map(({ status, count, bg, border, text, label }) => (
            <div
              key={status}
              className={`${bg} border ${border} rounded-xl p-3 text-center`}
            >
              <div className={`text-2xl font-bold ${text}`}>{count}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-wide">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MEMBERS SECTION ── */}
      <div className="px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-600">
            Members ({members.length})
          </h2>
          {canManageMembers && (
            <button
              onClick={() => setOpenAddMember(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all"
            >
              + Add Member
            </button>
          )}
          {members.length > 5 && (
            <button
              onClick={() => setShowAllMembers(!showAllMembers)}
              className="text-xs text-blue-500 hover:underline"
            >
              {showAllMembers ? "Thu gọn" : `Xem tất cả`}
            </button>
          )}
        </div>

        {membersLoading ? (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Chưa có thành viên</p>
        ) : showAllMembers ? (
          // Danh sách đầy đủ khi expand
          <div className="space-y-2">
            {visibleMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold border border-blue-200">
                    {m.account?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {m.account?.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {m.account?.email}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    ROLE_BADGE[m.role]
                  }`}
                >
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        ) : (
          // Avatar stack khi thu gọn
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  title={`${m.account?.name} (${m.role})`}
                  className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 text-xs font-bold cursor-default"
                >
                  {m.account?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              ))}
              {hiddenCount > 0 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-500 text-xs font-bold">
                  +{hiddenCount}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {members.length} thành viên
            </span>
          </div>
        )}
      </div>

      {/* ── BOARD ── */}
      <Board />

      {openAddMember && (
        <AddMemberModal
          projectId={projectId}
          myRole={myRole}
          onClose={() => {
            setOpenAddMember(false);
            queryClient.invalidateQueries({
              queryKey: ["project-members", projectId],
            });
          }}
        />
      )}
    </div>
  );
}
