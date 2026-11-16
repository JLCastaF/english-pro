import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Lock, Mail, UserPlus, LogIn, Star, ShieldCheck } from 'lucide-react';
import Footer from '../components/Footer';
import { auth, db } from '../firebase'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const [error, setError] = useState('');
  const [passError, setPassError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (val.length > 0 && val.length < 6) {
      setPassError('Mínimo 6 caracteres requeridos');
    } else {
      setPassError('');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: username,
          email: email,
          createdAt: new Date(),
          maxStreak: 0
        });

        loginUser(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        loginUser(userCredential.user);
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Este correo ya está registrado.');
      else if (err.code === 'auth/wrong-password') setError('Contraseña incorrecta.');
      else if (err.code === 'auth/user-not-found') setError('No existe una cuenta con este correo.');
      else setError('Error de acceso. Revisa tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const loginUser = (user) => {
    localStorage.setItem('current_user_id', user.uid);
    localStorage.setItem('user_name', user.displayName || user.email.split('@')[0]);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-100/40 to-transparent rounded-full blur-3xl -z-10"></div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center mb-10">
          <div className="inline-flex bg-indigo-600 p-4 rounded-[2rem] shadow-2xl shadow-indigo-200 mb-6 transform hover:rotate-6 transition-transform duration-500">
            <Star className="text-white w-8 h-8 fill-current" />
          </div>
          <h1 data-test="auth-title" className="text-4xl font-black text-slate-800 tracking-tighter uppercase">
            {isRegistering ? 'Únete Pro' : 'English Pro'}
          </h1>
          <div className="flex justify-center items-center gap-3 mt-3">
            <span className="h-[1px] w-10 bg-slate-200"></span>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">QAUPVE High Performance</p>
            <span className="h-[1px] w-10 bg-slate-200"></span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white/60 relative">
          
          <div className="absolute -top-4 -right-4">
             <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg animate-bounce">
                <ShieldCheck className="w-5 h-5" />
             </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {isRegistering && (
              <div className="relative group">
                <UserPlus className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  data-test="username-input"
                  type="text"
                  placeholder="Nombre de Usuario"
                  className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-slate-50/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={isRegistering}
                />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                data-test="email-input"
                type="email"
                placeholder="Correo Electrónico"
                className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-slate-50/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                data-test="password-input"
                type="password"
                placeholder="Contraseña"
                className={`w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-slate-50/50 border-2 outline-none transition-all font-bold text-slate-700
                  ${passError ? 'border-amber-400 bg-amber-50/20' : 'border-transparent focus:border-indigo-500 focus:bg-white'}`}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
              />
              {passError && (
                <p data-test="password-error" className="text-[10px] text-amber-600 font-black mt-2 ml-4 uppercase tracking-wider animate-pulse">
                  {passError}
                </p>
              )}
            </div>

            {error && (
              <div data-test="auth-error-msg" className="bg-red-50 text-red-500 p-4 rounded-2xl text-[11px] font-black border border-red-100 uppercase tracking-tight">
                {error}
              </div>
            )}
            
            <button 
              data-test="auth-submit"
              type="submit" 
              disabled={loading || (isRegistering && password.length < 6)}
              className={`w-full py-5 rounded-[1.5rem] font-black text-md transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group
                ${(loading || (isRegistering && password.length < 6)) 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-1 active:scale-95'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegistering ? 'Crear Cuenta Pro' : 'Iniciar Sesión'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <button 
            data-test="auth-toggle"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); setPassError(''); }}
            className="w-full mt-8 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            {isRegistering ? '¿Ya tienes cuenta? Login' : '¿Eres nuevo? Regístrate aquí'}
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );
}