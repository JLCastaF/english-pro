import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function BackButton({ to = "/dashboard", text = "Volver" }) {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(to)}
      className="flex items-center text-slate-400 hover:text-indigo-600 font-black uppercase text-xs tracking-widest mb-8 transition-all group"
    >
      <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
      {text}
    </button>
  );
}