import { useQuery } from "@tanstack/react-query";
import { useProject } from "../context/ProjectContext";
import { getTasksByProjectApi } from "../api/task.api";

const STATUS_COLUMNS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export default function Board() {
  const { activeProject } = useProject();

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", activeProject?.id],
    queryFn: () => getTasksByProjectApi(activeProject.id),
    enabled: !!activeProject,
  });

  const tasks = data?.data || [];

  if (!activeProject) {
    return <div className="p-6 text-gray-500">Please select a project</div>;
  }

  if (isLoading) {
    return <div className="p-6">Loading tasks...</div>;
  }

  // group tasks by status
  const grouped = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  return (
    <div className="p-4 flex gap-4 overflow-x-auto">
      {STATUS_COLUMNS.map((status) => (
        <div key={status} className="w-64 flex-shrink-0 bg-gray-50 rounded p-3">
          <h2 className="font-medium mb-3 text-sm">
            {status.replace("_", " ")}
          </h2>

          <div className="space-y-2">
            {grouped[status]?.map((task) => (
              <div
                key={task.id}
                className="p-2 bg-white rounded shadow-sm border text-sm"
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
