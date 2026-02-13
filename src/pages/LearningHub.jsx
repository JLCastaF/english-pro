import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, GraduationCap, Zap, CheckCircle2, X, PlayCircle, Info, Loader2 } from 'lucide-react';
import { exerciseData } from '../data/questions';
import BackButton from '../components/BackButton';
import Footer from '../components/Footer';

// --- INTEGRACIÓN FIREBASE ---
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function LearningHub() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [completedTopics, setCompletedTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // NUEVO: Estado para almacenar los temas que vienen de la Wiki (Firestore)
  const [remoteTopics, setRemoteTopics] = useState({});

  const levels = [
    { name: 'Principiante', min: 0, max: 25, color: 'text-blue-500', bg: 'bg-blue-500', lightBg: 'bg-blue-50', bannerBg: 'from-blue-600 to-blue-400' },
    { name: 'Intermedio', min: 26, max: 50, color: 'text-amber-500', bg: 'bg-amber-500', lightBg: 'bg-amber-50', bannerBg: 'from-amber-600 to-amber-400' },
    { name: 'Avanzado', min: 51, max: 75, color: 'text-orange-500', bg: 'bg-orange-500', lightBg: 'bg-orange-50', bannerBg: 'from-orange-600 to-orange-400' },
    { name: 'Experto', min: 76, max: 100, color: 'text-emerald-500', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', bannerBg: 'from-emerald-600 to-emerald-400' },
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      const user = auth.currentUser;
      
// Dentro del useEffect de LearningHub.jsx
const wikiSnapshot = await getDocs(collection(db, 'exercises'));
const wikiData = {};
wikiSnapshot.forEach((doc) => {
  wikiData[doc.id] = doc.data();
});

console.log("📡 DATOS RECIBIDOS DE WIKI:", wikiData); // <--- AÑADE ESTO

      try {
        // 1. CARGAR PROGRESO DEL USUARIO
        let completed = [];
        if (user) {
          const progressSnapshot = await getDocs(collection(db, 'users', user.uid, 'progress'));
          completed = progressSnapshot.docs
            .filter(doc => doc.data().completed === true)
            .map(doc => doc.id);
        }

        // 2. CARGAR TEMAS DE LA WIKI (FIRESTORE)
        const wikiSnapshot = await getDocs(collection(db, 'exercises'));
        const wikiData = {};
        wikiSnapshot.forEach((doc) => {
          wikiData[doc.id] = doc.data();
        });

        if (isMounted) {
          setCompletedTopics(completed);
          setRemoteTopics(wikiData);

          // 3. CÁLCULO DE PROGRESO GLOBAL (Usando la data combinada)
          const combinedData = { ...exerciseData, ...wikiData };
          const totalTopics = Object.keys(combinedData).length;
          const progress = totalTopics > 0 ? Math.round((completed.length / totalTopics) * 100) : 0;
          
          setGlobalProgress(progress);
          setIsLoading(false);
        }
      } catch (e) { 
        console.error("Error en sincronización LearningHub:", e);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAllData();
    return () => { isMounted = false; };
  }, []);

  const currentLevel = levels.find(l => globalProgress >= l.min && globalProgress <= l.max) || levels[0];

  // FUSIÓN: Priorizamos la data remota sobre la local
  const finalDisplayData = { ...exerciseData, ...remoteTopics };

  const filteredTopics = Object.entries(finalDisplayData).filter(([id, topic]) =>
    topic.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fbfcfd] p-6 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* Header con Progreso Global */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <BackButton to="/dashboard" text="Panel Principal" />
            <h1 className="text-4xl font-black text-slate-900 mt-4 tracking-tight leading-none">
              Learning <span className={currentLevel.color}>Hub</span>
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
              {isLoading ? 'Sincronizando con la nube...' : 'Gestiona tu aprendizaje y teoría'}
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
            <input
              data-test="search-input"
              type="text"
              placeholder="¿Qué quieres practicar?"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-xl shadow-slate-200/40 border-none outline-none font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div data-test="hub-loader" className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
              <p className="font-black text-[10px] uppercase tracking-[0.3em]">Conectando a English Pro Wiki...</p>
            </div>
          ) : (
            filteredTopics.map(([id, topic]) => {
              const isDone = completedTopics.includes(id);
              return (
                <div 
                  key={id}
                  data-test="topic-card"
                  className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-300 relative flex flex-col group
                    ${isDone ? 'border-emerald-100 shadow-emerald-50' : 'border-transparent shadow-sm hover:shadow-xl hover:shadow-indigo-50'}`}
                >
                  {isDone && (
                    <div data-test="mastered-badge" className="absolute top-0 right-0 bg-emerald-500 text-white px-5 py-2 rounded-bl-3xl flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Dominado</span>
                    </div>
                  )}

                  <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${isDone ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors'}`}>
                    <BookOpen className="w-7 h-7" />
                  </div>

                  <h3 data-test="topic-title" className="text-xl font-black text-slate-800 mb-4 leading-tight">
                    {topic.title}
                  </h3>

                  <div className="bg-slate-50/50 rounded-2xl p-4 mb-8 border border-slate-50 group-hover:bg-white group-hover:border-slate-100 transition-all">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estructura Base</p>
                    <p data-test="topic-formula-preview" className="text-slate-500 font-mono text-[11px] font-bold truncate">
                      {/* Mostramos la fórmula directamente del objeto o del primer ejercicio */}
                      {topic.formula || topic.questions?.[0]?.formula || 'Estructura no definida'}
                    </p>
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                    <button 
                      data-test="details-button"
                      onClick={() => setSelectedTopic({ id, ...topic })}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" /> Detalles
                    </button>

                    <button 
                      data-test="practice-button"
                      onClick={() => navigate(`/exercise/${id}`)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 shadow-lg
                        ${isDone 
                          ? 'bg-white border border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-emerald-50' 
                          : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'}`}
                    >
                      <PlayCircle className="w-4 h-4" />
                      {isDone ? 'Repasar' : 'Practicar'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL DE TEORÍA */}
        {selectedTopic && (
          <div data-test="theory-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-3xl ${completedTopics.includes(selectedTopic.id) ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-600'}`}>
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <button data-test="close-modal" onClick={() => setSelectedTopic(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <h2 data-test="modal-title" className="text-3xl font-black text-slate-800 mb-2 leading-tight">{selectedTopic.title}</h2>
                <div className="mb-8">
                  <span data-test="modal-status" className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${completedTopics.includes(selectedTopic.id) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {completedTopics.includes(selectedTopic.id) ? 'Status: Dominado' : 'Status: Pendiente'}
                  </span>
                </div>

                <div className="space-y-8">
                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Estructura Gramatical</h4>
                    <div className="bg-indigo-50/30 border-2 border-dashed border-indigo-100 p-6 rounded-3xl flex items-center gap-4">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-50">
                        <Zap className="w-5 h-5 text-indigo-500 fill-current" />
                      </div>
                      <p data-test="modal-formula" className="text-indigo-900 font-bold text-lg tracking-tight">
                        {selectedTopic.formula || selectedTopic.questions?.[0]?.formula}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Ejemplo Ilustrativo</h4>
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                      <p data-test="modal-example" className="text-slate-700 font-medium text-xl italic leading-relaxed">
                        {/* Verificamos si hay preguntas para mostrar el ejemplo */}
                        {selectedTopic.questions?.[0] 
                          ? `"${selectedTopic.questions[0].question.replace('___', selectedTopic.questions[0].acceptedAnswers?.[0] || '...')}"`
                          : "Ejemplo cargándose desde la Wiki..."}
                      </p>
                    </div>
                  </section>
                </div>

                <button 
                  data-test="modal-practice-button"
                  onClick={() => navigate(`/exercise/${selectedTopic.id}`)}
                  className={`w-full mt-10 py-6 rounded-[2rem] font-black text-white shadow-xl shadow-indigo-200 transition-all active:scale-95 bg-gradient-to-r ${currentLevel.bannerBg}`}
                >
                  PRACTICAR ESTE TEMA
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