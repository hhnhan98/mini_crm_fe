import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectsApi } from "../api/project.api";
import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ProjectModal from "../components/projects/ProjectModal";

export default function Sidebar() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { token, user, logout } = useContext(AuthContext);

  // FETCH PROJECTS
  const { data, isLoading } = useQuery({
    queryKey: ["projects", token],
    queryFn: getProjectsApi,
    enabled: !!token,
  });

  // MODAL STATE (ADDED)
  const [openCreate, setOpenCreate] = useState(false);

  // SAFE PROJECT NORMALIZATION (KEEP ORIGINAL)
  const projects = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];
    return data.data
      .map((item) => (item.project ? item.project : item))
      .filter((p) => p && p.id);
  }, [data]);

  return (
    <aside className="w-64 border-r flex flex-col bg-white h-screen shadow-sm">
      {/* LOGO */}
      <div className="p-6 border-b">
        <h1 className="font-bold text-xl text-blue-600 tracking-tight">
          HN CRM
        </h1>
      </div>

      {/* PROJECT LIST */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Projects ({projects.length})
          </span>
          <button
            onClick={() => setOpenCreate(true)}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            + New
          </button>
        </div>

        {isLoading && (
          <div className="space-y-2 px-2">
            <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2"></div>
          </div>
        )}

        <nav className="space-y-1">
          {projects.length > 0
            ? projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${
                    projectId === project.id
                      ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600 rounded-l-none"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="truncate">{project.name}</div>
                </button>
              ))
            : !isLoading && (
                <div className="px-2 py-10 text-center">
                  <p className="text-xs text-gray-400 italic">
                    No projects found
                  </p>
                </div>
              )}
        </nav>
      </div>

      {/* FOOTER — user info + logout */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-3 px-2">
          {/* ✅ Avatar lấy chữ cái đầu của tên user */}
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </div>

          {/* ✅ Hiển thị đúng tên và email từ AuthContext */}
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-xs font-semibold text-gray-700 truncate">
              {user?.name || "Unknown"}
            </span>
            <span className="text-[10px] text-gray-400 truncate">
              {user?.email || ""}
            </span>
          </div>

          {/* ✅ Logout button */}
          <button
            onClick={logout}
            title="Logout"
            className="text-gray-400 hover:text-red-500 transition text-xs flex-shrink-0"
          >
            ⏏
          </button>
        </div>
      </div>

      {openCreate && (
        <ProjectModal
          onClose={() => setOpenCreate(false)}
          onSelectProject={(project) => {
            setOpenCreate(false);
            navigate(`/projects/${project.id}`);
          }}
        />
      )}
    </aside>
  );
}
