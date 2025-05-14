import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import FileList from '../components/file/FileList';
import { Files as FilesIcon } from 'lucide-react';

const Files: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>All Files</h1>
      </div>

      <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <FilesIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-4">
            <h2 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Files</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage and organize all your uploaded files
            </p>
          </div>
        </div>

        <FileList />
      </div>
    </div>
  );
};

export default Files;