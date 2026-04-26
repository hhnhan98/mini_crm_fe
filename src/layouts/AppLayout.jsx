import { Outlet, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const { projectId } = useParams();

  return (
    <div className="h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER — chỉ hiện khi đang trong project */}
        {projectId && (
          <header className="h-11 border-b bg-white flex items-center px-5 flex-shrink-0">
            <span className="text-xs text-gray-400">
              Projects
              <span className="mx-1.5">›</span>
              <span className="text-gray-600 font-medium">Board</span>
            </span>
          </header>
        )}

        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
