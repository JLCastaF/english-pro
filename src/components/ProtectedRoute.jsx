import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const name = localStorage.getItem('user_name');

  useEffect(() => {
    if (!name) {
      navigate('/');
    }
  }, [name, navigate]);

  if (!name) return null;

  return <>{children}</>;
}