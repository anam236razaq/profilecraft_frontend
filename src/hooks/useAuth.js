import { useState } from 'react';

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return { loading, error };
};

export default useAuth;
