import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = React.useState(false);

  return (
    <nav className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar} 
              className="mr-2 md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <Menu className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`} />
            </button>
            
            <Link to="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="ml-2 text-lg font-semibold">FileVault</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-500" />
              )}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)} 
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <span className="ml-2 hidden md:block">{user?.name || 'User'}</span>
              </button>
              
              {profileOpen && (
                <div 
                  className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5`}
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div 
                    className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    role="menuitem"
                  >
                    {user?.email}
                  </div>
                  <button 
                    onClick={logout} 
                    className={`flex w-full items-center px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    role="menuitem"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;