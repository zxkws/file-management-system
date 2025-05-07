import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Edit, Save, X } from 'lucide-react';
import { useFiles, File } from '../contexts/FileContext';
import FilePreview from '../components/file/FilePreview';
import { useTheme } from '../contexts/ThemeContext';
import FileTypeIcon from '../components/file/FileTypeIcon';

const FileDetails: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const { getFileById, deleteFile, updateFile } = useFiles();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableName, setEditableName] = useState<string>('');

  useEffect(() => {
    const fetchFile = async () => {
      if (!fileId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const fileData = await getFileById(fileId);
        if (!fileData) {
          setError('File not found');
          return;
        }
        
        setFile(fileData);
        setEditableName(fileData.name);
      } catch (err) {
        setError('Failed to fetch file details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFile();
  }, [fileId, getFileById]);

  const handleDeleteFile = async () => {
    if (!file) return;
    
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(file.id);
        navigate('/');
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }
  };

  const handleDownload = () => {
    if (!file) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveChanges = async () => {
    if (!file || !editableName.trim()) return;
    
    try {
      await updateFile(file.id, { name: editableName });
      setFile(prev => prev ? { ...prev, name: editableName } : null);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update file:', err);
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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="text-center py-16">
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {error || 'File not found'}
        </h2>
        <button
          onClick={() => navigate('/')}
          className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <button
          onClick={() => navigate('/')}
          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
            theme === 'dark' 
              ? 'text-white bg-gray-800 hover:bg-gray-700' 
              : 'text-gray-700 bg-white hover:bg-gray-50'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4 md:mb-0`}
        >
          <ArrowLeft className="-ml-0.5 mr-2 h-4 w-4" />
          Back
        </button>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="-ml-1 mr-2 h-5 w-5" />
            Download
          </button>
          
          {isEditing ? (
            <>
              <button
                onClick={handleSaveChanges}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Save className="-ml-1 mr-2 h-5 w-5" />
                Save
              </button>
              
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditableName(file.name);
                }}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                  theme === 'dark' 
                    ? 'text-white bg-gray-600 hover:bg-gray-700' 
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
              >
                <X className="-ml-1 mr-2 h-5 w-5" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                  theme === 'dark' 
                    ? 'text-white bg-gray-600 hover:bg-gray-700' 
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
              >
                <Edit className="-ml-1 mr-2 h-5 w-5" />
                Edit
              </button>
              
              <button
                onClick={handleDeleteFile}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="-ml-1 mr-2 h-5 w-5" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* File details card */}
      <div className={`overflow-hidden rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm mb-6`}>
        <div className={`px-4 py-5 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} sm:px-6`}>
          {isEditing ? (
            <input
              type="text"
              value={editableName}
              onChange={(e) => setEditableName(e.target.value)}
              className={`w-full text-lg font-medium rounded-md ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-indigo-500' 
                  : 'bg-white text-gray-900 border-gray-300 focus:border-indigo-500'
              } border focus:ring-2 focus:ring-indigo-200 px-3 py-2`}
              autoFocus
            />
          ) : (
            <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center">
                <FileTypeIcon fileType={file.type} size={24} />
                <span className="ml-2">{file.name}</span>
              </div>
            </h3>
          )}
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>File Type</dt>
              <dd className={`mt-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{file.type}</dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Size</dt>
              <dd className={`mt-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatFileSize(file.size)}</dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Uploaded</dt>
              <dd className={`mt-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatDate(file.uploadDate)}</dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Last Modified</dt>
              <dd className={`mt-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatDate(file.lastModified)}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* File preview */}
      <FilePreview file={file} />
    </div>
  );
};

export default FileDetails;