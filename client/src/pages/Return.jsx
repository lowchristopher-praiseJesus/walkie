import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import { Alert } from '../components/ui';
import PageWrapper from '../components/PageWrapper';

const STORAGE_KEY = 'returnPageState';

function getStoredState() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
}

function saveState(initialItems, returnedItems) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ initialItems, returnedItems }));
}

function Return() {
  const { volunteers, walkies, liftCards, config, refresh } = useApp();
  const isLunarTheme = config.theme === 'lunar';
  const [message, setMessage] = useState(null);

  // Initialize state from sessionStorage or current data
  const [state, setState] = useState(() => {
    const stored = getStoredState();
    if (stored) {
      return stored;
    }
    return {
      initialItems: {
        walkies: walkies.filter(w => w.assignedTo).map(w => ({ ...w })),
        liftCards: liftCards.filter(lc => lc.assignedTo).map(lc => ({ ...lc }))
      },
      returnedItems: {
        walkies: {},
        liftCards: {}
      }
    };
  });

  const { initialItems, returnedItems } = state;

  // Sync state with server data: add new items, update re-assigned items
  useEffect(() => {
    setState(prev => {
      const currentWalkieIds = new Set(prev.initialItems.walkies.map(w => w.id));
      const currentLiftCardIds = new Set(prev.initialItems.liftCards.map(lc => lc.id));

      // Find newly checked-out items
      const newWalkies = walkies.filter(w => w.assignedTo && !currentWalkieIds.has(w.id));
      const newLiftCards = liftCards.filter(lc => lc.assignedTo && !currentLiftCardIds.has(lc.id));

      // Find items that were returned but have been re-assigned to someone else
      const reAssignedWalkieIds = new Set();
      const reAssignedLiftCardIds = new Set();

      walkies.forEach(w => {
        if (w.assignedTo && prev.returnedItems.walkies[w.id]) {
          reAssignedWalkieIds.add(w.id);
        }
      });

      liftCards.forEach(lc => {
        if (lc.assignedTo && prev.returnedItems.liftCards[lc.id]) {
          reAssignedLiftCardIds.add(lc.id);
        }
      });

      const hasNewItems = newWalkies.length > 0 || newLiftCards.length > 0;
      const hasReAssignments = reAssignedWalkieIds.size > 0 || reAssignedLiftCardIds.size > 0;

      if (!hasNewItems && !hasReAssignments) {
        return prev;
      }

      let updatedWalkies = prev.initialItems.walkies.map(w => {
        if (reAssignedWalkieIds.has(w.id)) {
          const current = walkies.find(cw => cw.id === w.id);
          return current ? { ...current } : w;
        }
        return w;
      });
      updatedWalkies = [...updatedWalkies, ...newWalkies.map(w => ({ ...w }))];

      let updatedLiftCards = prev.initialItems.liftCards.map(lc => {
        if (reAssignedLiftCardIds.has(lc.id)) {
          const current = liftCards.find(clc => clc.id === lc.id);
          return current ? { ...current } : lc;
        }
        return lc;
      });
      updatedLiftCards = [...updatedLiftCards, ...newLiftCards.map(lc => ({ ...lc }))];

      const updatedReturnedWalkies = { ...prev.returnedItems.walkies };
      const updatedReturnedLiftCards = { ...prev.returnedItems.liftCards };
      reAssignedWalkieIds.forEach(id => delete updatedReturnedWalkies[id]);
      reAssignedLiftCardIds.forEach(id => delete updatedReturnedLiftCards[id]);

      const updated = {
        initialItems: {
          walkies: updatedWalkies,
          liftCards: updatedLiftCards
        },
        returnedItems: {
          walkies: updatedReturnedWalkies,
          liftCards: updatedReturnedLiftCards
        }
      };

      saveState(updated.initialItems, updated.returnedItems);
      return updated;
    });
  }, [walkies, liftCards]);

  const checkedOutWalkies = [...initialItems.walkies].sort((a, b) => a.number - b.number);
  const checkedOutLiftCards = [...initialItems.liftCards].sort((a, b) => a.number - b.number);
  const totalCheckedOut = checkedOutWalkies.length + checkedOutLiftCards.length;

  const getVolunteerName = (volunteerId) => {
    const v = volunteers.find(vol => vol.id === volunteerId);
    return v ? `${v.firstName} ${v.lastName.charAt(0)}.` : 'Unknown';
  };

  const handleWalkieClick = async (walkie) => {
    const isReturned = returnedItems.walkies[walkie.id];

    if (isReturned) {
      try {
        await api.signOutWalkie(walkie.id, isReturned);
        setState(prev => {
          const { [walkie.id]: _, ...rest } = prev.returnedItems.walkies;
          const updated = { ...prev, returnedItems: { ...prev.returnedItems, walkies: rest } };
          saveState(updated.initialItems, updated.returnedItems);
          return updated;
        });
        setMessage({ type: 'success', text: `Walkie #${walkie.number} restored` });
        await refresh();
        setTimeout(() => setMessage(null), 1000);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    } else {
      try {
        await api.returnWalkie(walkie.id);
        setState(prev => {
          const updated = {
            ...prev,
            returnedItems: {
              ...prev.returnedItems,
              walkies: { ...prev.returnedItems.walkies, [walkie.id]: walkie.assignedTo }
            }
          };
          saveState(updated.initialItems, updated.returnedItems);
          return updated;
        });
        setMessage({ type: 'success', text: `Walkie #${walkie.number} returned` });
        await refresh();
        setTimeout(() => setMessage(null), 1000);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    }
  };

  const handleLiftCardClick = async (liftCard) => {
    const isReturned = returnedItems.liftCards[liftCard.id];

    if (isReturned) {
      try {
        await api.signOutLiftCard(liftCard.id, isReturned);
        setState(prev => {
          const { [liftCard.id]: _, ...rest } = prev.returnedItems.liftCards;
          const updated = { ...prev, returnedItems: { ...prev.returnedItems, liftCards: rest } };
          saveState(updated.initialItems, updated.returnedItems);
          return updated;
        });
        setMessage({ type: 'success', text: `Lift Card #${liftCard.number} restored` });
        await refresh();
        setTimeout(() => setMessage(null), 1000);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    } else {
      try {
        await api.returnLiftCard(liftCard.id);
        setState(prev => {
          const updated = {
            ...prev,
            returnedItems: {
              ...prev.returnedItems,
              liftCards: { ...prev.returnedItems.liftCards, [liftCard.id]: liftCard.assignedTo }
            }
          };
          saveState(updated.initialItems, updated.returnedItems);
          return updated;
        });
        setMessage({ type: 'success', text: `Lift Card #${liftCard.number} returned` });
        await refresh();
        setTimeout(() => setMessage(null), 1000);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto w-full px-4 py-6">
        <Link to="/" className={`hover:underline text-base mb-4 inline-block ${isLunarTheme ? 'text-amber-300' : 'text-[--color-primary]'}`}>
          &larr; Back
        </Link>

        {message && (
          <Alert variant={message.type} className="mb-4">
            {message.text}
          </Alert>
        )}

        <h2 className={`text-base mb-4 ${isLunarTheme ? 'text-amber-200' : 'text-zinc-400'}`}>Tap item to return</h2>

        {totalCheckedOut === 0 ? (
          <div className={`text-center py-12 ${isLunarTheme ? 'text-amber-300/70' : 'text-zinc-500'}`}>
            <p>No equipment is currently signed out</p>
          </div>
        ) : (
          <>
            {/* Walkies Section */}
            {checkedOutWalkies.length > 0 && (
              <>
                <h3 className={`text-sm font-medium mt-4 mb-2 ${isLunarTheme ? 'text-amber-300/80' : 'text-zinc-500'}`}>
                  Walkies ({checkedOutWalkies.length})
                </h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3">
                  {checkedOutWalkies.map(w => {
                    const isReturned = returnedItems.walkies[w.id];
                    return (
                      <button
                        key={w.id}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all cursor-pointer active:scale-95 ${
                          isReturned
                            ? 'opacity-40 bg-zinc-700 border-zinc-600 line-through'
                            : isLunarTheme
                              ? 'bg-black/40 border-amber-700/50 hover:border-amber-500'
                              : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
                        }`}
                        onClick={() => handleWalkieClick(w)}
                      >
                        <span className={`text-2xl font-bold ${isLunarTheme ? 'text-amber-100' : 'text-zinc-100'}`}>{w.number}</span>
                        <span className={`text-xs mt-1 px-1 truncate max-w-full ${isLunarTheme ? 'text-amber-300/80' : 'text-zinc-400'}`}>
                          {getVolunteerName(w.assignedTo)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Lift Cards Section */}
            {checkedOutLiftCards.length > 0 && (
              <>
                <h3 className={`text-sm font-medium mt-6 mb-2 ${isLunarTheme ? 'text-amber-300/80' : 'text-zinc-500'}`}>
                  Lift Cards ({checkedOutLiftCards.length})
                </h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3">
                  {checkedOutLiftCards.map(lc => {
                    const isReturned = returnedItems.liftCards[lc.id];
                    return (
                      <button
                        key={lc.id}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all cursor-pointer active:scale-95 ${
                          isReturned
                            ? 'opacity-40 bg-zinc-700 border-zinc-600 line-through'
                            : isLunarTheme
                              ? 'bg-amber-900/40 border-amber-500 hover:border-amber-400'
                              : 'bg-amber-900/30 border-[--color-gold] hover:border-amber-400'
                        }`}
                        onClick={() => handleLiftCardClick(lc)}
                      >
                        <span className={`text-2xl font-bold ${isLunarTheme ? 'text-amber-100' : 'text-zinc-100'}`}>{lc.number}</span>
                        <span className={`text-xs mt-1 px-1 truncate max-w-full ${isLunarTheme ? 'text-amber-300/80' : 'text-zinc-400'}`}>
                          {getVolunteerName(lc.assignedTo)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default Return;
