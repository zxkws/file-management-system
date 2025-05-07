import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Files, Settings, Folder, Upload } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const location = useLocation();
  const { theme } = useTheme();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform md:translate-x-0 md:static md:inset-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-r`}
      >
        <div className="h-full flex flex-col">
          {/* Close button for mobile */}
          <div className="md:hidden flex items-center justify-end p-4">
            <button
              onClick={closeSidebar}
              className="p-2 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Sidebar header */}
          <div className="px-6 py-4 md:hidden">
            <Link to="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="ml-2 text-lg font-semibold">FileVault</span>
            </Link>
          </div>
          
          {/* Navigation links */}
          <nav className="flex-1 px-4 mt-5">
            <h3 className={`px-2 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Main
            </h3>
            
            <div className="mt-2 space-y-1">
              <Link
                to="/"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/') ? 'bg-indigo-600 text-white' : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}`}
                onClick={closeSidebar}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              
              <Link
                to="/upload"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/upload') ? 'bg-indigo-600 text-white' : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}`}
                onClick={closeSidebar}
              >
                <Upload className="mr-3 h-5 w-5" />
                Upload
              </Link>
              
              <Link
                to="/files"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/files') ? 'bg-indigo-600 text-white' : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}`}
                onClick={closeSidebar}
              >
                <Files className="mr-3 h-5 w-5" />
                All Files
              </Link>
              
              <Link
                to="/folders"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/folders') ? 'bg-indigo-600 text-white' : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}`}
                onClick={closeSidebar}
              >
                <Folder className="mr-3 h-5 w-5" />
                Folders
              </Link>
            </div>
            
            <h3 className={`px-2 mt-8 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Settings
            </h3>
            
            <div className="mt-2 space-y-1">
              <Link
                to="/settings"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/settings') ? 'bg-indigo-600 text-white' : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100'}`}`}
                onClick={closeSidebar}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;