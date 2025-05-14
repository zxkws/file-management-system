import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Folder as FolderIcon, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  filesCount: number;
  createdAt: string;
}

const Folders: React.FC = () => {
  const { theme } = useTheme();
  const [folders, setFolders] = useState<Folder[]>([
    { id: '1', name: 'Documents', filesCount: 15, createdAt: '2024-03-15' },
    { id: '2', name: 'Images', filesCount: 32, createdAt: '2024-03-14' },
    { id: '3', name: 'Videos', filesCount: 8, createdAt: '2024-03-13' },
  ]);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: newFolderName,
        filesCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setShowNewFolderDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Folders</h1>
        <button
          onClick={() => setShowNewFolderDialog(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Folder
        </button>
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h2 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create New Folder</h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              className={`w-full px-3 py-2 border rounded-md ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewFolderDialog(false)}
                className={`px-4 py-2 rounded-md ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <FolderIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {folder.name}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {folder.filesCount} files
                  </p>
                </div>
              </div>
              <div className="relative">
                <button className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Created {folder.createdAt}
                </span>
                <div className="flex space-x-2">
                  <button className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Folders;