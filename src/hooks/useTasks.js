import { useQuery } from "@tanstack/react-query";
import { getTasksByProjectApi } from "../api/task.api";

export const useTasks = (projectId) => {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => getTasksByProjectApi(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    select: (data) => data?.data || [],
  });
};
