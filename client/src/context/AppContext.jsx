import { createContext, useContext, useState, useEffect } from 'react';
import { storage, initializeStorage } from '../storage';

initializeStorage();

const AppContext = createContext();

export function AppProvider({ children }) {
  const [volunteers, setVolunteers] = useState(() => storage.getVolunteers());
  const [walkies, setWalkies] = useState(() => storage.getWalkies());
  const [liftCards, setLiftCards] = useState(() => storage.getLiftCards());
  const [config, setConfig] = useState(() => storage.getConfig());
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading] = useState(false);

  // Apply theme to document
  useEffect(() => {
    if (config.theme === 'lunar') {
      document.documentElement.setAttribute('data-theme', 'lunar');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [config.theme]);

  const refresh = () => {
    setVolunteers(storage.getVolunteers());
    setWalkies(storage.getWalkies());
    setLiftCards(storage.getLiftCards());
    setConfig(storage.getConfig());
  };

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
