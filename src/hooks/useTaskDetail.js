// src/hooks/useTaskDetail.js
import { useQuery } from "@tanstack/react-query";
import { getTaskDetailApi } from "../api/task.api";

export const useTaskDetail = (taskId) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskDetailApi(taskId),
    enabled: !!taskId, // Chỉ chạy khi có taskId
  });
};
