import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; // Importamos auth
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Edit3, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

export default function WikiEditor() {
  const [topics, setTopics] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [formData, setFormData] = useState({ title: '', formula: '', questions: [] });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // --- SEGURIDAD DE ADMINISTRADOR ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const ADMIN_UID = "Tcbx4uim5hFeD9vdO4iUMefk6zni1"; // <--- PEGA TU UID AQUÍ
      
      if (!user || user.uid !== ADMIN_UID) {
        console.warn("Acceso no autorizado al editor detectado.");
        navigate('/dashboard'); // Expulsión inmediata
      } else {
        fetchTopics(); // Solo descarga datos si es el admin
      }
    });

    const fetchTopics = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'exercises'));
        setTopics(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { 
        console.error(e); 
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, [navigate]);
  // ----------------------------------

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) return;
    const topic = topics.find(t => t.id === id);
    setFormData({
      title: topic?.title || '',
      formula: topic?.formula || '',
      questions: topic?.questions || []
    });
  };

  const addQuestion = () => {
    const newQ = { id: Date.now(), verb: "", question: "___", acceptedAnswers: [""], hint: "" };
    setFormData({ ...formData, questions: [newQ, ...formData.questions] });
  };

  const removeQuestion = (id) => {
    const updatedQs = formData.questions.filter(q => q.id !== id);
    setFormData({ ...formData, questions: updatedQs });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'exercises', selectedId), formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (e) { console.error(e); }
    setIsSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-start mb-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 font-bold text-xs uppercase text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={16}/> Volver al Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
          <h1 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <Edit3 className="text-indigo-500" size={20} /> Editor de Contenido (Admin Mode)
          </h1>

          <select 
            value={selectedId} 
            onChange={handleSelectChange} 
            className="w-full p-4 bg-slate-50 rounded-xl font-bold mb-6 outline-none border-2 border-transparent focus:border-indigo-100 transition-all cursor-pointer"
          >
            <option value="">Selecciona un tiempo verbal...</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>

          {selectedId && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest">Preguntas</h3>
                <button 
                  onClick={addQuestion} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                >
                  <Plus size={14}/> Añadir Pregunta
                </button>
              </div>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {formData.questions.map((q, i) => (
                  <div key={q.id || i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group transition-all hover:border-indigo-100">
                    <button 
                      onClick={() => removeQuestion(q.id)}
                      className="absolute -right-2 -top-2 bg-white text-red-400 p-1.5 rounded-full shadow-sm border border-red-50 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Frase</label>
                        <input 
                          value={q.question} 
                          onChange={(e) => {
                            const up = [...formData.questions];
                            up[i].question = e.target.value;
                            setFormData({...formData, questions: up});
                          }}
                          className="w-full p-3 rounded-xl border-none font-bold text-slate-700 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Verbo</label>
                          <input 
                            value={q.verb} 
                            onChange={(e) => {
                              const up = [...formData.questions];
                              up[i].verb = e.target.value;
                              setFormData({...formData, questions: up});
                            }}
                            className="w-full p-3 rounded-xl border-none text-sm font-bold text-indigo-600 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Respuestas</label>
                          <input 
                            value={q.acceptedAnswers.join(',')} 
                            onChange={(e) => {
                              const up = [...formData.questions];
                              up[i].acceptedAnswers = e.target.value.split(',').map(ans => ans.trim());
                              setFormData({...formData, questions: up});
                            }}
                            className="w-full p-3 rounded-xl border-none text-sm font-medium outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-amber-500 mb-1 block">Sugerencia (Hint)</label>
                        <input 
                          value={q.hint || ''} 
                          onChange={(e) => {
                            const up = [...formData.questions];
                            up[i].hint = e.target.value;
                            setFormData({...formData, questions: up});
                          }}
                          className="w-full p-3 rounded-xl border-none text-sm font-medium text-amber-700 bg-amber-50 focus:ring-2 focus:ring-amber-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className={`w-full py-5 rounded-2xl font-black text-sm text-white transition-all flex items-center justify-center gap-3 shadow-xl
                  ${showSuccess ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-slate-800'} 
                  ${isSaving ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
              >
                {isSaving ? "Guardando..." : showSuccess ? "¡Hecho!" : "Guardar Cambios"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}