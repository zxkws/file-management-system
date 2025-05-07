import React, { useEffect } from 'react';
import { useFiles } from '../contexts/FileContext';
import { Upload, FileText, Clock, ArrowUpRight } from 'lucide-react';
import FileUploader from '../components/file/FileUploader';
import FileList from '../components/file/FileList';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard: React.FC = () => {
  const { files, fetchFiles, loading } = useFiles();
  const { theme } = useTheme();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRecentFiles = () => {
    return [...files]
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
      .slice(0, 5);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Stats data
  const totalFiles = files.length;
  const totalSize = formatFileSize(getTotalSize());
  const recentFiles = getRecentFiles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Files</p>
              <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalFiles}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-100'}`}>
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Storage Used</p>
              <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{totalSize}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-100'}`}>
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Last Upload</p>
              <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {files.length > 0 ? formatDate(files[0].uploadDate) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Files</h2>
              <a href="/file-management-system/files" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center">
                <span className="text-sm">View all</span>
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </a>
            </div>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-14 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                ))}
              </div>
            ) : recentFiles.length > 0 ? (
              <ul className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {recentFiles.map((file) => (
                  <li key={file.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <FileText className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                          </p>
                        </div>
                      </div>
                      
                      <a 
                        href={`/file-management-system/files/${file.id}`}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        View
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={`text-center py-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className={`mt-2 text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  No files uploaded yet
                </h3>
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Upload files to see them here
                </p>
              </div>
            )}
          </div>
          
          <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>All Files</h2>
            <FileList />
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Upload Files</h2>
          <FileUploader />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;