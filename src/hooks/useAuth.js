import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
    isAdmin: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        loading: false,
        user: user,
        isAdmin: user?.email === 'genius.ice@gmail.com'
      });
    });
    return () => unsubscribe();
  }, []);

  return authState;
}