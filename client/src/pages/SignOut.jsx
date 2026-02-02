import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import { Button, Alert, Badge } from '../components/ui';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_WALKIES = 2;
const MAX_LIFT_CARDS = 2;

function SignOut() {
  const { volunteers, walkies, liftCards, refresh } = useApp();
  const navigate = useNavigate();

  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedWalkies, setSelectedWalkies] = useState([]);
  const [selectedLiftCards, setSelectedLiftCards] = useState([]);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredVolunteers = selectedLetter
    ? volunteers.filter(v => v.firstName.toUpperCase().startsWith(selectedLetter))
    : [];

  const availableWalkies = walkies
    .filter(w => !w.assignedTo && !w.unusable)
    .sort((a, b) => a.number - b.number);

  const availableLiftCards = liftCards
    .filter(lc => !lc.assignedTo && !lc.unusable)
    .sort((a, b) => a.number - b.number);

  const getAssignedWalkies = (volunteerId) => {
    return walkies
      .filter(w => w.assignedTo === volunteerId)
      .map(w => w.number)
      .sort((a, b) => a - b);
  };

  const getAssignedLiftCards = (volunteerId) => {
    return liftCards
      .filter(lc => lc.assignedTo === volunteerId)
      .map(lc => lc.number)
      .sort((a, b) => a - b);
  };

  const toggleWalkie = (walkie) => {
    const isSelected = selectedWalkies.some(w => w.id === walkie.id);
    if (isSelected) {
      setSelectedWalkies(selectedWalkies.filter(w => w.id !== walkie.id));
    } else if (selectedWalkies.length < MAX_WALKIES) {
      setSelectedWalkies([...selectedWalkies, walkie]);
    }
  };

  const toggleLiftCard = (liftCard) => {
    const isSelected = selectedLiftCards.some(lc => lc.id === liftCard.id);
    if (isSelected) {
      setSelectedLiftCards(selectedLiftCards.filter(lc => lc.id !== liftCard.id));
    } else if (selectedLiftCards.length < MAX_LIFT_CARDS) {
      setSelectedLiftCards([...selectedLiftCards, liftCard]);
    }
  };

  const handleDone = async () => {
    if (selectedWalkies.length === 0 && selectedLiftCards.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one item' });
      return;
    }

    setSubmitting(true);
    try {
      const results = [];

      for (const walkie of selectedWalkies) {
        await api.signOutWalkie(walkie.id, selectedVolunteer.id);
        results.push(`Walkie #${walkie.number}`);
      }

      for (const liftCard of selectedLiftCards) {
        await api.signOutLiftCard(liftCard.id, selectedVolunteer.id);
        results.push(`Lift Card #${liftCard.number}`);
      }

      setMessage({ type: 'success', text: `${results.join(', ')} signed out to ${selectedVolunteer.firstName}` });
      await refresh();
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setSubmitting(false);
    }
  };

  const formatSelectedNumbers = (items) => {
    return items.map(item => `#${item.number}`).join(', ');
  };

  // Step 1: Select letter
  if (!selectedLetter) {
    return (
      <div className="min-h-screen">
        <div className="max-w-md mx-auto w-full px-4 py-6">
          <Link to="/" className="text-[--color-primary] hover:underline text-base mb-4 inline-block">
            &larr; Back
          </Link>
          <h2 className="text-zinc-400 text-base mb-4">Type the first letter of your name</h2>
          <div className="grid grid-cols-6 gap-2">
            {LETTERS.map(letter => (
              <button
                key={letter}
                className="aspect-square flex items-center justify-center text-lg font-semibold bg-zinc-800 border-2 border-zinc-700 rounded-lg text-zinc-100 hover:bg-zinc-700 active:bg-[--color-primary] active:border-[--color-primary] transition-colors"
                onClick={() => setSelectedLetter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Select volunteer
  if (!selectedVolunteer) {
    return (
      <div className="min-h-screen">
        <div className="max-w-md mx-auto w-full px-4 py-6">
          <button
            onClick={() => setSelectedLetter(null)}
            className="text-[--color-primary] hover:underline text-base mb-4"
          >
            &larr; Back to letters
          </button>
          <h2 className="text-zinc-400 text-base mb-4">Select your name ({selectedLetter})</h2>
          {filteredVolunteers.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p>No servers found with first name starting with "{selectedLetter}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVolunteers.map(v => {
                const assignedWalkies = getAssignedWalkies(v.id);
                const assignedLiftCards = getAssignedLiftCards(v.id);
                const hasEquipment = assignedWalkies.length > 0 || assignedLiftCards.length > 0;
                return (
                  <button
                    key={v.id}
                    className="w-full text-left p-4 bg-zinc-800 rounded-lg border-2 border-transparent hover:border-zinc-600 active:border-[--color-primary] transition-colors"
                    onClick={() => setSelectedVolunteer(v)}
                  >
                    <span className="text-zinc-100">{v.firstName} {v.lastName}</span>
                    {hasEquipment && (
                      <Badge variant="warning" className="ml-2">
                        has {[
                          assignedWalkies.length > 0 && `walkie${assignedWalkies.length > 1 ? 's' : ''} #${assignedWalkies.join(', #')}`,
                          assignedLiftCards.length > 0 && `lift card${assignedLiftCards.length > 1 ? 's' : ''} #${assignedLiftCards.join(', #')}`
                        ].filter(Boolean).join(', ')}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Select equipment
  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto w-full px-4 py-6">
        <button
          onClick={() => { setSelectedVolunteer(null); setSelectedWalkies([]); setSelectedLiftCards([]); }}
          className="text-[--color-primary] hover:underline text-base mb-4"
        >
          &larr; Back to servers
        </button>

        {message && (
          <Alert variant={message.type} className="mb-4">
            {message.text}
          </Alert>
        )}

        <h2 className="text-zinc-400 text-base mb-4">
          Hi {selectedVolunteer.firstName}! Select your equipment
        </h2>

        {/* Walkies Section */}
        <h3 className="text-zinc-500 text-sm font-medium mt-4 mb-2 flex items-center gap-2">
          Walkies (up to {MAX_WALKIES})
          {selectedWalkies.length > 0 && (
            <Badge variant="success">{formatSelectedNumbers(selectedWalkies)} selected</Badge>
          )}
        </h3>
        {availableWalkies.length === 0 ? (
          <div className="text-center py-4 text-zinc-500 text-sm">
            <p>No walkies available</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3">
            {availableWalkies.map(w => {
              const isSelected = selectedWalkies.some(sw => sw.id === w.id);
              const isDisabled = !isSelected && selectedWalkies.length >= MAX_WALKIES;
              return (
                <button
                  key={w.id}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all ${
                    isSelected
                      ? 'bg-[--color-success] border-[--color-success] text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:border-zinc-500'
                  } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                  onClick={() => !isDisabled && toggleWalkie(w)}
                  disabled={isDisabled}
                >
                  {w.number}
                </button>
              );
            })}
          </div>
        )}

        {/* Lift Cards Section */}
        <h3 className="text-zinc-500 text-sm font-medium mt-6 mb-2 flex items-center gap-2">
          Lift Cards (up to {MAX_LIFT_CARDS}, optional)
          {selectedLiftCards.length > 0 && (
            <Badge variant="success">{formatSelectedNumbers(selectedLiftCards)} selected</Badge>
          )}
        </h3>
        {availableLiftCards.length === 0 ? (
          <div className="text-center py-4 text-zinc-500 text-sm">
            <p>No lift cards available</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3">
            {availableLiftCards.map(lc => {
              const isSelected = selectedLiftCards.some(slc => slc.id === lc.id);
              const isDisabled = !isSelected && selectedLiftCards.length >= MAX_LIFT_CARDS;
              return (
                <button
                  key={lc.id}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all ${
                    isSelected
                      ? 'bg-[--color-success] border-[--color-success] text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-100 hover:border-zinc-500'
                  } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                  onClick={() => !isDisabled && toggleLiftCard(lc)}
                  disabled={isDisabled}
              >
                  {lc.number}
                </button>
              );
            })}
          </div>
        )}

        {/* Done Button */}
        <Button
          variant="default"
          className="w-full mt-6"
          onClick={handleDone}
          disabled={submitting || (selectedWalkies.length === 0 && selectedLiftCards.length === 0)}
        >
          {submitting ? 'Signing out...' : 'Done'}
        </Button>
      </div>
    </div>
  );
}

export default SignOut;
