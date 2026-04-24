// src/hooks/useProjectMember.js
import { useQuery } from "@tanstack/react-query";
import { getProjectMembersApi } from "../api/project.api";

export const useProjectMember = (projectId, userId) => {
  return useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getProjectMembersApi(projectId),
    enabled: !!projectId && !!userId,
    select: (data) => {
      const members = data?.data || [];
      const me = members.find((m) => m.accountId === userId);
      return me?.role || null;
    },
  });
};
