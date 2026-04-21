import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Roommates from './pages/Roommates';
import Profile from './pages/Profile';
import Memories from './pages/Memories';
import Login from './pages/Login';
import Games from './pages/Games';
import Admin from './pages/Admin';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/roommates" element={<Roommates />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="/login" element={<Login />} />
              <Route path="/games" element={<Games />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Landing />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
