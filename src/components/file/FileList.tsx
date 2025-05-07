import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { File, Trash2, Edit, Download, MoreVertical, Grid, List as ListIcon, Search } from 'lucide-react';
import { useFiles, File as FileType } from '../../contexts/FileContext';
import { useTheme } from '../../contexts/ThemeContext';
import FileTypeIcon from './FileTypeIcon';

const FileList: React.FC = () => {
  const { files, fetchFiles, deleteFile } = useFiles();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleSort = (criteria: 'name' | 'date' | 'size') => {
    if (sortBy === criteria) {
      toggleSortDirection();
    } else {
      setSortBy(criteria);
      setSortDirection('asc');
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'size') {
      return sortDirection === 'asc'
        ? a.size - b.size
        : b.size - a.size;
    } else {
      // date
      return sortDirection === 'asc'
        ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    }
  });

  const filteredFiles = sortedFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileClick = (fileId: string) => {
    navigate(`/files/${fileId}`);
  };

  const handleFileActionClick = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    setSelectedFile(selectedFile === fileId ? null : fileId);
  };

  const handleDeleteFile = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this file?')) {
      await deleteFile(fileId);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4`}>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            type="text"
            placeholder="Search files..."
            className={`pl-10 pr-4 py-2 w-full rounded-md ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-indigo-500' 
                : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:border-indigo-500'
            } border focus:ring-2 focus:ring-indigo-200 transition duration-150 ease-in-out`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4 self-end md:self-auto">
          <div className={`inline-flex rounded-md shadow-sm`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-l-md ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
              } border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-r-md ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
              } border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <ListIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Empty state */}
      {filteredFiles.length === 0 && (
        <div className={`text-center py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
          <File className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className={`mt-2 text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
            No files found
          </h3>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchQuery ? 'Try adjusting your search' : 'Upload files to get started'}
          </p>
        </div>
      )}
      
      {/* Grid view */}
      {viewMode === 'grid' && filteredFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleFileClick(file.id)}
              className={`relative group rounded-lg overflow-hidden ${
                theme === 'dark' 
                  ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              } border shadow-sm cursor-pointer transition duration-150 ease-in-out`}
            >
              {/* File preview */}
              <div className={`h-40 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <FileTypeIcon fileType={file.type} size={48} />
              </div>
              
              {/* File details */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`} title={file.name}>
                    {file.name}
                  </h3>
                  
                  <div className="relative ml-2">
                    <button
                      onClick={(e) => handleFileActionClick(e, file.id)}
                      className={`p-1 rounded-full ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-300' 
                          : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {selectedFile === file.id && (
                      <div 
                        className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg z-10 ${
                          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="py-1">
                          <button
                            className={`group flex w-full items-center px-4 py-2 text-sm ${
                              theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/files/${file.id}/edit`);
                            }}
                          >
                            <Edit className="mr-3 h-4 w-4" />
                            Edit details
                          </button>
                          <button
                            className={`group flex w-full items-center px-4 py-2 text-sm ${
                              theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Download logic would go here
                            }}
                          >
                            <Download className="mr-3 h-4 w-4" />
                            Download
                          </button>
                          <button
                            className={`group flex w-full items-center px-4 py-2 text-sm text-red-600 ${
                              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                            onClick={(e) => handleDeleteFile(e, file.id)}
                          >
                            <Trash2 className="mr-3 h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatFileSize(file.size)}
                </p>
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatDate(file.uploadDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* List view */}
      {viewMode === 'list' && filteredFiles.length > 0 && (
        <div className={`rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  <button 
                    className={`flex items-center ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleSort('name')}
                  >
                    Name
                    {sortBy === 'name' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  <button 
                    className={`flex items-center ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleSort('size')}
                  >
                    Size
                    {sortBy === 'size' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  <button 
                    className={`flex items-center ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleSort('date')}
                  >
                    Date uploaded
                    {sortBy === 'date' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {filteredFiles.map((file) => (
                <tr 
                  key={file.id} 
                  onClick={() => handleFileClick(file.id)}
                  className={`${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer transition duration-150 ease-in-out`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileTypeIcon fileType={file.type} size={24} />
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {file.name}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {file.type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {formatFileSize(file.size)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {formatDate(file.uploadDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/files/${file.id}/edit`);
                        }}
                        className={`p-1 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Download logic would go here
                        }}
                        className={`p-1 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteFile(e, file.id)}
                        className={`p-1 rounded-full ${theme === 'dark' ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' : 'text-red-500 hover:text-red-700 hover:bg-gray-100'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileList;