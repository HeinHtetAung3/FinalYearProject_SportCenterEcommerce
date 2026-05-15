import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCheckoutCommerceConfig } from '../services/commerceService';

const CommerceConfigContext = createContext({
  config: null,
  loading: true,
  error: '',
  refetch: async () => {}
});

export function CommerceConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCheckoutCommerceConfig();
      setConfig(data);
    } catch (err) {
      setConfig(null);
      setError(err.message || 'Unable to load store checkout configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onRemoteChange = () => {
      void load();
    };
    window.addEventListener('sportshub:commerce-settings-changed', onRemoteChange);
    return () => window.removeEventListener('sportshub:commerce-settings-changed', onRemoteChange);
  }, [load]);

  const value = useMemo(
    () => ({
      config,
      loading,
      error,
      refetch: load
    }),
    [config, loading, error, load]
  );

  return <CommerceConfigContext.Provider value={value}>{children}</CommerceConfigContext.Provider>;
}

export function useCommerceConfig() {
  return useContext(CommerceConfigContext);
}
