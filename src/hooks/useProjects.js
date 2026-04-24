import { useQuery } from "@tanstack/react-query";
import { getProjectsApi } from "../api/project.api";

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjectsApi,
  });
};
