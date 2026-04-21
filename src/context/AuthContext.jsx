import { createContext, useContext, useState, useEffect } from 'react';
import { loginWithNicknamePin } from '../firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('clockkit_user');
      if (saved) setCurrentUser(JSON.parse(saved));
    } catch (e) {
      console.warn('Could not restore session');
    }
    setLoading(false);
  }, []);

  async function login(nickname, pin) {
    const user = await loginWithNicknamePin(nickname, pin);
    setCurrentUser(user);
    localStorage.setItem('clockkit_user', JSON.stringify(user));
    return user;
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem('clockkit_user');
  }

  function isOwner(roommateId) {
    return currentUser?.roommateId === roommateId;
  }

  function isAdmin() {
    return currentUser?.role === 'admin';
  }

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isOwner, isAdmin, isAuthenticated, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
