import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, GraduationCap, ChevronRight, Zap, CheckCircle2, X } from 'lucide-react';
import { exerciseData } from '../data/questions';
import BackButton from '../components/BackButton';
import Footer from '../components/Footer';

// --- INTEGRACIÓN FIREBASE ---
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function StudyCenter() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [completedTopics, setCompletedTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [globalProgress, setGlobalProgress] = useState(0);

  const levels = [
    { name: 'Principiante', min: 0, max: 25, color: 'text-blue-500', bg: 'bg-blue-500', lightBg: 'bg-blue-50', bannerBg: 'from-blue-600 to-blue-400' },
    { name: 'Intermedio', min: 26, max: 50, color: 'text-amber-500', bg: 'bg-amber-500', lightBg: 'bg-amber-50', bannerBg: 'from-amber-600 to-amber-400' },
    { name: 'Avanzado', min: 51, max: 75, color: 'text-orange-500', bg: 'bg-orange-500', lightBg: 'bg-orange-50', bannerBg: 'from-orange-600 to-orange-400' },
    { name: 'Experto', min: 76, max: 100, color: 'text-emerald-500', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', bannerBg: 'from-emerald-600 to-emerald-400' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snapshot = await getDocs(collection(db, 'users', user.uid, 'progress'));
        const completed = snapshot.docs
          .filter(doc => doc.data().completed)
          .map(doc => doc.id);
        
        setCompletedTopics(completed);
        const totalTopics = Object.keys(exerciseData).length;
        setGlobalProgress(Math.round((completed.length / totalTopics) * 100));
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const currentLevel = levels.find(l => globalProgress >= l.min && globalProgress <= l.max) || levels[0];

  const filteredTopics = Object.entries(exerciseData).filter(([id, topic]) =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fbfcfd] p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <BackButton to="/dashboard" text="Regresar" />
            <h1 className="text-4xl font-black text-slate-900 mt-4 tracking-tight">
              Wiki <span className={currentLevel.color}>Pro</span>
            </h1>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar tema..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-xl shadow-slate-200/40 border-none outline-none font-bold text-slate-600 transition-all focus:ring-2 focus:ring-indigo-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map(([id, topic]) => {
            const isDone = completedTopics.includes(id);
            return (
              <div 
                key={id}
                className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-300 relative overflow-hidden flex flex-col
                  ${isDone ? 'border-emerald-100 shadow-emerald-50' : 'border-transparent shadow-sm hover:shadow-md'}`}
              >
                {isDone && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1.5 rounded-bl-2xl flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-tight">Dominado</span>
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${isDone ? 'bg-emerald-50 text-emerald-500' : currentLevel.lightBg + ' ' + currentLevel.color}`}>
                  <BookOpen className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-4 leading-tight">
                  {topic.title}
                </h3>

                <div className="bg-slate-50/80 rounded-2xl p-5 mb-8 border border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400 fill-current" /> Estructura
                  </p>
                  <p className="text-slate-600 font-mono text-xs font-bold break-words">{topic.questions[0]?.formula}</p>
                </div>

                <div className="mt-auto pt-4 flex justify-end">
                  <button 
                    onClick={() => setSelectedTopic({ id, ...topic })}
                    className="flex items-center gap-1 text-indigo-600 font-black text-xs uppercase tracking-wider hover:gap-2 transition-all"
                  >
                    Ver Detalle <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- MODAL DE DETALLE REDISEÑADO --- */}
{selectedTopic && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
    <div className="bg-white w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="p-10">
        <div className="flex justify-between items-start mb-8">
          <div className={`p-4 rounded-3xl ${completedTopics.includes(selectedTopic.id) ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-600'}`}>
            <GraduationCap className="w-8 h-8" />
          </div>
          <button onClick={() => setSelectedTopic(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-2 leading-tight">{selectedTopic.title}</h2>
        <div className="mb-8">
          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${completedTopics.includes(selectedTopic.id) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            {completedTopics.includes(selectedTopic.id) ? 'Status: Dominado' : 'Status: Pendiente'}
          </span>
        </div>

        <div className="space-y-8">
          {/* NUEVO DISEÑO DE ESTRUCTURA GRAMATICAL */}
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Estructura Gramatical</h4>
            <div className="bg-indigo-50/30 border-2 border-dashed border-indigo-100 p-6 rounded-3xl flex items-center gap-4 group">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-indigo-500 fill-current" />
              </div>
              <p className="text-indigo-900 font-bold text-lg tracking-tight">
                {selectedTopic.questions[0]?.formula}
              </p>
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Ejemplo Ilustrativo</h4>
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
              <p className="text-slate-700 font-medium text-xl italic leading-relaxed">
                "{selectedTopic.questions[0]?.question.replace('___', selectedTopic.questions[0]?.acceptedAnswers[0])}"
              </p>
            </div>
          </section>
        </div>

        <button 
          onClick={() => navigate(`/exercise/${selectedTopic.id}`)}
          className={`w-full mt-10 py-6 rounded-[2rem] font-black text-white shadow-xl shadow-indigo-200 transition-all active:scale-95 bg-gradient-to-r ${currentLevel.bannerBg}`}
        >
          PRACTICAR TEMA
        </button>
      </div>
    </div>
  </div>
)}

        <Footer />
      </div>
    </div>
  );
}