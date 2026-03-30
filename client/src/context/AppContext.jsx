import { createContext, useContext, useState, useEffect } from 'react';
import { storage, initializeStorage } from '../storage';
import { StaleDataModal } from '../components/StaleDataModal';

initializeStorage();

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

const AppContext = createContext();

export function AppProvider({ children }) {
  const [volunteers, setVolunteers] = useState(() => storage.getVolunteers());
  const [walkies, setWalkies] = useState(() => storage.getWalkies());
  const [liftCards, setLiftCards] = useState(() => storage.getLiftCards());
  const [config, setConfig] = useState(() => storage.getConfig());
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading] = useState(false);
  const [showStaleModal, setShowStaleModal] = useState(false);
  const [staleTimestamp, setStaleTimestamp] = useState(null);

  // Apply theme to document
  useEffect(() => {
    if (config.theme === 'lunar') {
      document.documentElement.setAttribute('data-theme', 'lunar');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [config.theme]);

  // Check for stale data on mount
  useEffect(() => {
    const ts = storage.getDataTimestamp();
    const ageMs = Date.now() - new Date(ts).getTime();
    if (ageMs > STALE_THRESHOLD_MS) {
      setStaleTimestamp(ts);
      setShowStaleModal(true);
    }
  }, []);

  const refresh = () => {
    setVolunteers(storage.getVolunteers());
    setWalkies(storage.getWalkies());
    setLiftCards(storage.getLiftCards());
    setConfig(storage.getConfig());
  };

  const handleKeepData = () => {
    storage.refreshDataTimestamp();
    setShowStaleModal(false);
  };

  const handleClearEventData = () => {
    storage.clearEventData();
    refresh();
    setShowStaleModal(false);
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

  return (
    <AppContext.Provider value={value}>
      {children}
      {showStaleModal && (
        <StaleDataModal
          timestamp={staleTimestamp}
          onKeep={handleKeepData}
          onClear={handleClearEventData}
        />
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
