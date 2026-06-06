import { useState, useEffect } from 'react';
import { onAuthChange, isAdminEmail } from '../firebase/auth';

const useAuth = () => {
  const [user, setUser] = useState(undefined); // undefined = still loading

  useEffect(() => {
    return onAuthChange(setUser);
  }, []);

  const loading = user === undefined;
  const isAdmin = !loading && user !== null && isAdminEmail(user.email);

  return { user: user ?? null, loading, isAdmin };
};

export default useAuth;
