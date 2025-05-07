import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: string;
  lastModified: string;
  userId: string;
}

interface FileContextType {
  files: File[];
  loading: boolean;
  error: string | null;
  fetchFiles: () => Promise<void>;
  uploadFile: (file: globalThis.File) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  updateFile: (id: string, data: Partial<File>) => Promise<void>;
  getFileById: (id: string) => Promise<File | null>;
}

const FileContext = createContext<FileContextType>({
  files: [],
  loading: false,
  error: null,
  fetchFiles: async () => {},
  uploadFile: async () => {},
  deleteFile: async () => {},
  updateFile: async () => {},
  getFileById: async () => null,
});

export const useFiles = () => useContext(FileContext);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/files');
      setFiles(data);
    } catch (err) {
      setError('Failed to fetch files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: globalThis.File) => {
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const data = await api.post('/files/upload', formData);
      
      // Add the new file to the files array
      setFiles(prevFiles => [...prevFiles, data]);
    } catch (err) {
      setError('Failed to upload file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/files/${id}`);
      setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    } catch (err) {
      setError('Failed to delete file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFile = useCallback(async (id: string, data: Partial<File>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedFile = await api.put(`/files/${id}`, data);
      setFiles(prevFiles => 
        prevFiles.map(file => file.id === id ? { ...file, ...updatedFile } : file)
      );
    } catch (err) {
      setError('Failed to update file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFileById = useCallback(async (id: string): Promise<File | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/files/${id}`);
      return data;
    } catch (err) {
      setError('Failed to fetch file');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <FileContext.Provider value={{
      files,
      loading,
      error,
      fetchFiles,
      uploadFile,
      deleteFile,
      updateFile,
      getFileById,
    }}>
      {children}
    </FileContext.Provider>
  );
};