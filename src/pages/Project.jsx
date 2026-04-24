import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProjectByIdApi, getProjectMembersApi } from "../api/project.api";
import AddMemberModal from "../components/projects/AddMemberModal.jsx";
import { useAuth } from "../hooks/useAuth"; // ✅ thêm import
import Board from "./Board";

export default function Project() {
  const { projectId } = useParams();
  const { user } = useAuth(); // ✅ lấy current user
  const queryClient = useQueryClient();

  const [openAddMember, setOpenAddMember] = useState(false);

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

  // ✅ Tìm role của current user trong project
  const myRole = members.find((m) => m.accountId === user?.id)?.role;
  const canManageMembers = myRole === "OWNER" || myRole === "MANAGER";

  if (!projectId) {
    return (
      <div className="p-6 text-gray-500">Select a project from sidebar</div>
    );
  }

  if (projectLoading) {
    return <div className="p-6 text-gray-500">Loading project...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{project?.name}</h1>
          <p className="text-sm text-gray-500">Project workspace</p>
        </div>

        {/* ✅ Chỉ OWNER/MANAGER mới thấy */}
        {canManageMembers && (
          <button
            onClick={() => setOpenAddMember(true)}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            + Add Member
          </button>
        )}
      </div>

      {/* MEMBERS — giữ nguyên */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Members ({members.length})</h2>
        {membersLoading ? (
          <p className="text-sm text-gray-400">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-gray-400">No members yet</p>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <p className="text-sm">{m.account?.name || m.account?.email}</p>
                <span className="text-xs text-gray-400">{m.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Board />

      {openAddMember && (
        <AddMemberModal
          projectId={projectId}
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
