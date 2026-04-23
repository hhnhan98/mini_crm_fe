import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectsApi } from "../api/project.api";
import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { token } = useContext(AuthContext);

  const { data, isLoading } = useQuery({
    queryKey: ["projects", token],
    queryFn: getProjectsApi,
    enabled: !!token,
  });

  // LOGIC XỬ LÝ DỮ LIỆU (Giữ nguyên vì đã chạy tốt)
  const projects = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];
    return data.data
      .map((item) => (item.project ? item.project : item))
      .filter((p) => p && p.id);
  }, [data]);

  // ========================
  // PHẦN RETURN: CLEAN & CLEAR
  // ========================
  return (
    <aside className="w-64 border-r flex flex-col bg-white h-screen shadow-sm">
      {/* 1. LOGO / BRANDING */}
      <div className="p-6 border-b">
        <h1 className="font-bold text-xl text-blue-600 tracking-tight">
          Mini CRM
        </h1>
      </div>

      {/* 2. PROJECT LIST SECTION */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Projects ({projects.length})
          </span>
        </div>

        {/* TRẠNG THÁI LOADING */}
        {isLoading && (
          <div className="space-y-2 px-2">
            <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2"></div>
          </div>
        )}

        {/* DANH SÁCH DỰ ÁN */}
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
            : // CHỈ HIỆN KHI KHÔNG LOADING VÀ MẢNG RỖNG
              !isLoading && (
                <div className="px-2 py-10 text-center">
                  <p className="text-xs text-gray-400 italic">
                    No projects found
                  </p>
                </div>
              )}
        </nav>
      </div>

      {/* 3. FOOTER / USER INFO */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
            SE
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-gray-700 truncate">
              Intern Engineer
            </span>
            <span className="text-[10px] text-gray-400">Workspace</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
