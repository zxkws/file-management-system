import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Files from './pages/Files';
import Folders from './pages/Folders';
import Settings from './pages/Settings';
import FileDetails from './pages/FileDetails';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FileProvider } from './contexts/FileContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    login();
    return;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FileProvider>
          <Router basename='file-management-system'>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="upload" element={<Upload />} />
                <Route path="files" element={<Files />} />
                <Route path="folders" element={<Folders />} />
                <Route path="settings" element={<Settings />} />
                <Route path="files/:fileId" element={<FileDetails />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </FileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;