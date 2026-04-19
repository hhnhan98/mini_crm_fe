import { Outlet } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const { activeProject } = useProject();

  return (
    <div className="h-screen flex">
      {/* SIDEBAR REAL */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-12 border-b flex items-center px-4">
          {activeProject ? (
            <div className="font-medium">{activeProject.name}</div>
          ) : (
            <div className="text-gray-400 text-sm">Select a project</div>
          )}
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
