import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, BookOpen, Star, LogOut, ChevronRight, Flame, Layout, 
  Sparkles, ShieldCheck, Settings, Users 
} from 'lucide-react';
import { exerciseData } from '../data/questions';
import Footer from '../components/Footer';

// --- IMPORTACIONES DE FIREBASE ---
import { auth, db } from '../firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: '', maxStreak: 0 });
  const [completedTopics, setCompletedTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- DETECCIÓN DE ADMIN ---
  const user = auth.currentUser;
  const isAdmin = user?.email === 'genius.ice@gmail.com';

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadDashboardData = async () => {
      try {
        const [userSnap, progressSnap] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(collection(db, 'users', user.uid, 'progress'))
        ]);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData({
            name: data.name || data.displayName || user.email.split('@')[0],
            maxStreak: data.maxStreak || 0
          });

          // Registro de actividad para el contador del administrador
          await updateDoc(doc(db, 'users', user.uid), {
            lastActive: serverTimestamp()
          });
        } else {
          setUserData({ 
            name: user.displayName || user.email.split('@')[0], 
            maxStreak: 0 
          });
        }

        const completed = progressSnap.docs
          .filter(doc => doc.data().completed === true)
          .map(doc => doc.id);
        
        setCompletedTopics(completed);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate, user]);

  const allTopicIds = Object.keys(exerciseData);
  const totalTopics = allTopicIds.length; 
  const completedCount = completedTopics.length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const levels = [
    { id: 1, label: "Principiante", color: "bg-blue-500", bannerBg: "from-blue-700 to-blue-500", range: [0, 25] },
    { id: 2, label: "Intermedio", color: "bg-amber-500", bannerBg: "from-amber-600 to-amber-500", range: [26, 50] },
    { id: 3, label: "Avanzado", color: "bg-orange-500", bannerBg: "from-orange-600 to-orange-500", range: [51, 75] },
    { id: 4, label: "Experto", color: "bg-emerald-500", bannerBg: "from-emerald-600 to-emerald-500", range: [76, 100] }
  ];

  const currentLevel = levels.find(l => progressPercent >= l.range[0] && progressPercent <= l.range[1]) || levels[0];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear(); 
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans w-full animate-in fade-in duration-700">
      <nav className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50 px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
              <Star className="text-white w-4 h-4 fill-current" />
            </div>
            <h1 className="text-lg font-black text-slate-800 uppercase tracking-tighter">English Pro</h1>
          </div>
          <button 
            onClick={handleLogout} 
            className="group flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-bold text-xs"
          >
            <span>Salir</span>
            <div className="p-2 group-hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className={`relative overflow-hidden bg-gradient-to-r ${currentLevel.bannerBg} rounded-[2.5rem] p-10 md:p-14 text-white mb-10 shadow-2xl shadow-indigo-200`}>
          <div className="relative z-10">
            <header className="mb-4">
              <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 flex items-center w-fit gap-2">
                <Sparkles className="w-3 h-3 text-amber-300 fill-current" /> Status: {currentLevel.label}
              </span>
            </header>
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
              Bienvenido,<br/> <span className="opacity-80">{userData.name}</span>
            </h2>
            <button 
              onClick={() => navigate('/study')} 
              className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-md flex items-center hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg group"
            >
              Comenzar a aprender <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-10 p-8 border-2 border-dashed border-indigo-200 rounded-[2.5rem] bg-indigo-50/50 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                  <ShieldCheck size={32} />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Acceso Root</p>
                  <h3 className="text-xl font-black text-slate-800">Panel Administrativo</h3>
                  <p className="text-slate-500 text-sm font-medium">Control de usuarios y gestión de contenido.</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => navigate('/admin-users')}
                  className="px-6 py-4 bg-white text-indigo-600 border-2 border-indigo-100 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <Users size={18} className="group-hover:scale-110 transition-transform" />
                  VER USUARIOS
                </button>

                <button 
                  onClick={() => navigate('/wiki-editor')}
                  className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                  GESTIONAR WIKI
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${currentLevel.color.replace('bg-', 'text-')} ${currentLevel.color.replace('bg-', 'bg-')}/10`}>
                <Award className="w-7 h-7" />
              </div>
              <div className={`flex items-center px-4 py-2 rounded-xl border ${userData.maxStreak > 0 ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                <Flame className={`w-4 h-4 mr-2 ${userData.maxStreak > 0 ? 'text-orange-500 fill-current' : 'text-slate-300'}`} />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black text-orange-400">Racha Máxima</span>
                  <span className="text-slate-700 font-black text-sm">{userData.maxStreak} aciertos</span>
                </div>
              </div>
            </div>
            <h3 className="font-black text-xl text-slate-800 mb-4">Estatus de Dominio</h3>
            <div className="flex gap-1.5 h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200/50">
              {levels.map((l) => (
                <div key={l.id} className={`h-full flex-1 rounded-full transition-all duration-700 ${progressPercent >= l.range[0] ? l.color : 'bg-slate-200 opacity-30'}`} />
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                <Layout className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl text-slate-800 mb-2">Learning Hub</h3>
              <p className="text-slate-400 text-sm font-medium mb-6">Tu biblioteca central de gramática y práctica interactiva.</p>
            </div>
            <button onClick={() => navigate('/study')} className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center group transition-all">
              Explorar Wiki <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1" />
            </button>
            <BookOpen className="absolute -bottom-6 -right-6 w-32 h-32 text-slate-50 pointer-events-none" />
          </div>
        </div>
        
        <Footer />
      </main>
    </div>
  );
}