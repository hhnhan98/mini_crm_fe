import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectsApi } from "../api/project.api";
import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ProjectModal from "../components/projects/ProjectModal";

// Skeleton cho 1 project item
function ProjectSkeleton() {
  return (
    <div className="space-y-1.5 px-2 py-1">
      {["w-3/4", "w-1/2", "w-2/3"].map((w, i) => (
        <div
          key={i}
          className={`h-8 bg-gray-100 animate-pulse rounded-lg ${w}`}
        />
      ))}
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { token, user, logout } = useContext(AuthContext);

  const { data, isLoading } = useQuery({
    queryKey: ["projects", token],
    queryFn: getProjectsApi,
    enabled: !!token,
  });

  const [openCreate, setOpenCreate] = useState(false);

  const projects = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];
    return data.data
      .map((item) => (item.project ? item.project : item))
      .filter((p) => p && p.id);
  }, [data]);

  return (
    <aside className="w-64 border-r flex flex-col bg-white h-screen shadow-sm">
      {/* LOGO */}
      <div className="px-6 py-5 border-b">
        <h1 className="font-bold text-xl text-blue-600 tracking-tight">
          HN CRM
        </h1>
        <p className="text-[10px] text-gray-400 mt-0.5">Task Management</p>
      </div>

      {/* PROJECT LIST */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Projects ({projects.length})
          </span>
          <button
            onClick={() => setOpenCreate(true)}
            className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            + New
          </button>
        </div>

        {/* Loading skeleton */}
        {isLoading && <ProjectSkeleton />}

        {/* Project list */}
        {!isLoading && (
          <nav className="space-y-0.5">
            {projects.length > 0 ? (
              projects.map((project) => {
                const isActive = projectId === project.id;
                return (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 flex items-center gap-2
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    {/* Active indicator dot */}
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${
                        isActive ? "bg-blue-500" : "bg-transparent"
                      }`}
                    />
                    <span className="truncate">{project.name}</span>
                  </button>
                );
              })
            ) : (
              // Empty state với gợi ý hành động
              <div className="px-2 py-10 text-center space-y-3">
                <div className="text-2xl">📂</div>
                <p className="text-xs text-gray-400">Chưa có dự án nào</p>
                <button
                  onClick={() => setOpenCreate(true)}
                  className="text-xs text-blue-500 hover:underline font-medium"
                >
                  + Tạo dự án đầu tiên
                </button>
              </div>
            )}
          </nav>
        )}
      </div>

      {/* FOOTER — user info + logout */}
      <div className="p-4 border-t bg-gray-50/80">
        <div className="flex items-center gap-3 px-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0 border border-blue-200">
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </div>

          {/* Name + email */}
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-xs font-semibold text-gray-700 truncate">
              {user?.name || "Unknown"}
            </span>
            <span className="text-[10px] text-gray-400 truncate">
              {user?.email || ""}
            </span>
          </div>

          {/* Logout — SVG icon thay emoji */}
          <button
            onClick={logout}
            title="Đăng xuất"
            className="text-gray-400 hover:text-red-500 transition flex-shrink-0 p-1 rounded hover:bg-red-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
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
