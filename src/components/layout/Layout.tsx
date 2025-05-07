import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTheme } from '../../contexts/ThemeContext';

const Layout: React.FC = () => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;