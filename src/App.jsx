import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Exercise from "./pages/Exercise";
import LearningHub from './pages/LearningHub';
import ProtectedRoute from "./components/ProtectedRoute";
import WikiEditor from './pages/WikiEditor';
import AdminDashboard from './pages/AdminDashboard'; // <--- Importamos la nueva página

// --- COMPONENTE PORTERO PARA ADMIN ---
const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Tu filtro de seguridad por correo
  const isAdmin = currentUser?.email === 'genius.ice@gmail.com';

  if (!currentUser) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-[#f8fafc] font-sans">
        <Routes>
          {/* RUTA PÚBLICA */}
          <Route path="/" element={<Login />} />
          
          {/* RUTAS PROTEGIDAS (ALUMNOS) */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          
          <Route 
            path="/study" 
            element={<ProtectedRoute><LearningHub /></ProtectedRoute>} 
          />
          
          <Route 
            path="/exercise/:id" 
            element={<ProtectedRoute><Exercise /></ProtectedRoute>} 
          />
          
          {/* RUTAS ADMINISTRATIVAS (SÓLO TÚ) */}
          <Route 
            path="/wiki-editor" 
            element={
              <AdminRoute>
                <WikiEditor />
              </AdminRoute>
            } 
          />

          <Route 
            path="/admin-users" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* REDIRECCIONES */}
          <Route path="/topics" element={<Navigate to="/study" replace />} />
          
          {/* Si nada coincide, al Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;