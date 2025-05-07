import React, { createContext, useContext } from 'react';


interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const login = () => {
    const current = window.location.href;
    window.location.href = `${import.meta.env.VITE_AUTH_SERVICE_URL || 'https://zxkws.nyc.mn'}/login?redirect=${current}`;
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!localStorage.getItem('auth_token'),
      login,
    }}>
      {children}
    </AuthContext.Provider>
  );
};