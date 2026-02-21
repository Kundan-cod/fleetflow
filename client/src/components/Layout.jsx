import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ChatBot from './ChatBot';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar toggleSidebar={() => setCollapsed(!collapsed)} isCollapsed={collapsed} />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
      <ChatBot />
    </div>
  );
}
