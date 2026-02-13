import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Users, Search, Loader2, ArrowLeft, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const getLevelInfo = (progress) => {
    if (progress <= 25) return { name: 'Principiante', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (progress <= 50) return { name: 'Intermedio', color: 'text-amber-500', bg: 'bg-amber-50' };
    if (progress <= 75) return { name: 'Avanzado', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { name: 'Experto', color: 'text-emerald-500', bg: 'bg-emerald-50' };
  };

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = [];

        // Definimos el inicio del día de hoy para comparar
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          let completedCount = 0;
          
          try {
            const progressSnap = await getDocs(collection(db, 'users', userDoc.id, 'progress'));
            completedCount = progressSnap.docs.filter(d => d.data().completed).length;
          } catch (e) { console.warn("Error en progreso:", e); }

          const totalTopics = 12; 
          const progressPercent = Math.round((completedCount / totalTopics) * 100);

          // Lógica de Sincronización de Actividad
          const lastActiveTimestamp = userData.lastActive;
          const isActiveToday = lastActiveTimestamp ? lastActiveTimestamp.toDate() >= today : false;

          // Identificación de usuario
          const email = userData.email || userDoc.id;
          const name = userData.name || userData.displayName || email.split('@')[0];

          usersData.push({
            id: userDoc.id,
            email: email,
            nameDisplay: name,
            progress: progressPercent,
            activeToday: isActiveToday, // Guardamos el estado de actividad real
            ...getLevelInfo(progressPercent)
          });
        }
        setUsersList(usersData);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchUsersData();
  }, []);

  // El filtro de búsqueda solo afecta a lo que se ve en la tabla, no a las estadísticas
  const filteredUsers = usersList.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.nameDisplay.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Contador real de activos hoy basado en la base de datos
  const totalActiveToday = usersList.filter(u => u.activeToday).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* CABECERA Y CONTADORES */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="mb-4 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft size={14}/> Volver al Panel
            </button>
            <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
                <Users className="text-white" size={28} />
              </div>
              Gestión de Alumnos
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm min-w-[140px]">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Alumnos</p>
              <p className="text-2xl font-black text-slate-800">{usersList.length}</p>
            </div>
            <div className="bg-indigo-600 px-6 py-4 rounded-3xl shadow-lg shadow-indigo-100 min-w-[140px]">
              <p className="text-[10px] font-black uppercase text-indigo-200 tracking-widest mb-1">Activos Hoy</p>
              <p className="text-2xl font-black text-white">{totalActiveToday}</p>
            </div>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nombre o correo electrónico..."
            className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-white border-2 border-transparent focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 outline-none shadow-sm transition-all font-bold text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Nombre del Alumno</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Correo Electrónico</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Progreso</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${user.activeToday ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                          <User size={20} />
                        </div>
                        <span className="font-black text-slate-700">{user.nameDisplay}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Mail size={14} className="text-slate-300" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                            style={{ width: `${user.progress}%` }}
                          ></div>
                        </div>
                        <span className="font-black text-slate-800 text-xs">{user.progress}%</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${user.bg} ${user.color} ${user.color.replace('text-', 'border-')}/20`}>
                        {user.name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="p-24 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Search size={32} />
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No hay coincidencias en tu búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}