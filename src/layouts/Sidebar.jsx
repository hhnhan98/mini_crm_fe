import { useQuery } from "@tanstack/react-query";
import { getProjectsApi } from "../api/project.api";
import { useProject } from "../context/ProjectContext";

export default function Sidebar() {
  const { activeProject, setActiveProject } = useProject();

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjectsApi,
  });

  const projects = data?.data || [];

  return (
    <aside className="w-64 border-r p-4 bg-white">
      <div className="font-bold text-lg mb-4">CRM</div>

      <div className="text-xs text-gray-500 mb-2">Projects</div>

      {isLoading && <div className="text-sm text-gray-400">Loading...</div>}

      <div className="space-y-1">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => setActiveProject(project)}
            className={`p-2 rounded cursor-pointer text-sm transition
              ${
                activeProject?.id === project.id
                  ? "bg-blue-100 font-medium"
                  : "hover:bg-gray-100"
              }`}
          >
            {project.name}
          </div>
        ))}
      </div>
    </aside>
  );
}
