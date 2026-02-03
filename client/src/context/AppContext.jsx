import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [volunteers, setVolunteers] = useState([]);
  const [walkies, setWalkies] = useState([]);
  const [liftCards, setLiftCards] = useState([]);
  const [config, setConfig] = useState({ eventName: 'Event', theme: 'default' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Apply theme to document
  useEffect(() => {
    if (config.theme === 'lunar') {
      document.documentElement.setAttribute('data-theme', 'lunar');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [config.theme]);

  const refresh = async () => {
    try {
      const [vols, walks, lifts, cfg] = await Promise.all([
        api.getVolunteers(),
        api.getWalkies(),
        api.getLiftCards(),
        api.getConfig(),
      ]);
      setVolunteers(vols);
      setWalkies(walks);
      setLiftCards(lifts);
      setConfig(cfg);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = {
    volunteers,
    walkies,
    liftCards,
    config,
    isAdmin,
    setIsAdmin,
    loading,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
