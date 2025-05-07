import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, Check } from 'lucide-react';
import { useFiles } from '../../contexts/FileContext';
import { useTheme } from '../../contexts/ThemeContext';

const FileUploader: React.FC = () => {
  const { uploadFile } = useFiles();
  const { theme } = useTheme();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({});
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, { id: Math.random().toString(36).substring(2, 9) })
    );
    
    setFilesToUpload(prev => [...prev, ...newFiles]);
    
    // Initialize progress and status for each file
    newFiles.forEach(file => {
      const fileId = (file as any).id;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      setUploadStatus(prev => ({ ...prev, [fileId]: 'idle' }));
    });
  }, []);

  const { 
    getRootProps, 
    getInputProps, 
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({ 
    onDrop,
    multiple: true
  });

  const handleUpload = async (file: File) => {
    const fileId = (file as any).id;
    
    try {
      setUploadStatus(prev => ({ ...prev, [fileId]: 'uploading' }));
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileId] || 0;
          if (current >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [fileId]: current + 5 };
        });
      }, 200);
      
      await uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      setUploadStatus(prev => ({ ...prev, [fileId]: 'success' }));
      
      // Remove file from list after a short delay
      setTimeout(() => {
        setFilesToUpload(prev => prev.filter(f => (f as any).id !== fileId));
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
        setUploadStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[fileId];
          return newStatus;
        });
      }, 3000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus(prev => ({ ...prev, [fileId]: 'error' }));
    }
  };

  const removeFile = (fileId: string) => {
    setFilesToUpload(prev => prev.filter(f => (f as any).id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileId];
      return newStatus;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ease-in-out ${
          isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 
          theme === 'dark' ? 'border-gray-600 hover:border-indigo-500 bg-gray-800 hover:bg-gray-700' : 
          'border-gray-300 hover:border-indigo-500 bg-gray-50 hover:bg-gray-100'
        } ${isDragReject ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          <Upload 
            className={`h-12 w-12 mb-4 ${
              isDragAccept ? 'text-green-500' : 
              isDragReject ? 'text-red-500' : 
              'text-indigo-500'
            }`} 
          />
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {isDragActive ? 
              isDragReject ? 
                'Some files are not allowed' : 
                'Drop files here...' : 
              'Drag files here or click to browse'
            }
          </p>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Support for all file types
          </p>
        </div>
      </div>

      {filesToUpload.length > 0 && (
        <div className={`mt-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium">Uploads</h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filesToUpload.map(file => {
              const fileId = (file as any).id;
              const progress = uploadProgress[fileId] || 0;
              const status = uploadStatus[fileId] || 'idle';
              
              return (
                <li key={fileId} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {status === 'success' ? (
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                        ) : status === 'error' ? (
                          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-medium">.{file.name.split('.').pop()}</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {file.name}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {status === 'idle' && (
                        <button
                          onClick={() => handleUpload(file)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm font-medium"
                        >
                          Upload
                        </button>
                      )}
                      
                      {status === 'uploading' && (
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {status === 'success' && (
                        <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                          Complete
                        </span>
                      )}
                      
                      {status === 'error' && (
                        <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                          Failed
                        </span>
                      )}
                      
                      <button
                        onClick={() => removeFile(fileId)}
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-in-out" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="mt-1 text-xs text-right text-gray-500 dark:text-gray-400">
                        {progress}%
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;