import { useState, useEffect } from 'react';
import { onAuthChange, isAdminEmail, getGoogleRedirectResult } from '../firebase/auth';

const useAuth = () => {
  const [user, setUser] = useState(undefined); // undefined = still loading

  useEffect(() => {
    // Resolve any pending redirect sign-in before subscribing to auth state
    getGoogleRedirectResult().catch(() => {});
    return onAuthChange(setUser);
  }, []);

  const loading = user === undefined;
  const isAdmin = !loading && user !== null && isAdminEmail(user.email);

  return { user: user ?? null, loading, isAdmin };
};

export default useAuth;
