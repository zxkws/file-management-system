import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

export interface Folder {
  id: string;
  name: string;
  filesCount: number;
  createdAt: string;
  userId: string;
}

interface FolderContextType {
  folders: Folder[];
  loading: boolean;
  error: string | null;
  fetchFolders: () => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  updateFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
}

const FolderContext = createContext<FolderContextType>({
  folders: [],
  loading: false,
  error: null,
  fetchFolders: async () => {},
  createFolder: async () => {},
  updateFolder: async () => {},
  deleteFolder: async () => {},
});

export const useFolders = () => useContext(FolderContext);

export const FolderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/folders');
      setFolders(data);
    } catch (err) {
      setError('Failed to fetch folders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFolder = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post('/folders', { name });
      setFolders(prev => [...prev, data]);
    } catch (err) {
      setError('Failed to create folder');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFolder = useCallback(async (id: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.put(`/folders/${id}`, { name });
      setFolders(prev => prev.map(folder => 
        folder.id === id ? { ...folder, name } : folder
      ));
    } catch (err) {
      setError('Failed to update folder');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/folders/${id}`);
      setFolders(prev => prev.filter(folder => folder.id !== id));
    } catch (err) {
      setError('Failed to delete folder');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <FolderContext.Provider value={{
      folders,
      loading,
      error,
      fetchFolders,
      createFolder,
      updateFolder,
      deleteFolder,
    }}>
      {children}
    </FolderContext.Provider>
  );
};