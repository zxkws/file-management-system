import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import FileUploader from '../components/file/FileUploader';
import { Upload as UploadIcon } from 'lucide-react';

const Upload: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Upload Files</h1>
      </div>

      <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
            <UploadIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Upload Your Files</h2>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Drag and drop your files here or click to browse
          </p>
        </div>
        
        <FileUploader />
      </div>
    </div>
  );
};

export default Upload;