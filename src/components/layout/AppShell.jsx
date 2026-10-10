import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar  from "./Navbar";

const AppShell = () => {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;