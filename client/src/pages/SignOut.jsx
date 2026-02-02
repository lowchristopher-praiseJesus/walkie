import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function SignOut() {
  const { volunteers, walkies, refresh } = useApp();
  const navigate = useNavigate();

  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [message, setMessage] = useState(null);

  const filteredVolunteers = selectedLetter
    ? volunteers.filter(v => v.firstName.toUpperCase().startsWith(selectedLetter))
    : [];

  const availableWalkies = walkies
    .filter(w => !w.assignedTo && !w.unusable)
    .sort((a, b) => a.number - b.number);

  const getAssignedWalkies = (volunteerId) => {
    return walkies
      .filter(w => w.assignedTo === volunteerId)
      .map(w => w.number)
      .sort((a, b) => a - b);
  };

  const handleSignOut = async (walkie) => {
    try {
      await api.signOutWalkie(walkie.id, selectedVolunteer.id);
      setMessage({ type: 'success', text: `Walkie ${walkie.number} signed out to ${selectedVolunteer.firstName}` });
      await refresh();
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Step 1: Select letter
  if (!selectedLetter) {
    return (
      <div className="container">
        <div className="back-link">
          <Link to="/">&larr; Back</Link>
        </div>
        <h2 className="section-title">Select first letter of first name</h2>
        <div className="letter-grid">
          {LETTERS.map(letter => (
            <button
              key={letter}
              className="letter-btn"
              onClick={() => setSelectedLetter(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Select volunteer
  if (!selectedVolunteer) {
    return (
      <div className="container">
        <div className="back-link">
          <a href="#" onClick={(e) => { e.preventDefault(); setSelectedLetter(null); }}>
            &larr; Back to letters
          </a>
        </div>
        <h2 className="section-title">Select your name ({selectedLetter})</h2>
        {filteredVolunteers.length === 0 ? (
          <div className="empty-state">
            <p>No volunteers found with first name starting with "{selectedLetter}"</p>
          </div>
        ) : (
          <ul className="volunteer-list">
            {filteredVolunteers.map(v => {
              const assignedWalkies = getAssignedWalkies(v.id);
              return (
                <li
                  key={v.id}
                  className="volunteer-item"
                  onClick={() => setSelectedVolunteer(v)}
                >
                  {v.firstName} {v.lastName}
                  {assignedWalkies.length > 0 && (
                    <span style={{ color: '#FF9500', marginLeft: 8 }}>
                      (has {assignedWalkies.length === 1 ? 'walkie' : 'walkies'} #{assignedWalkies.join(', #')})
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // Step 3: Select walkie
  return (
    <div className="container">
      <div className="back-link">
        <a href="#" onClick={(e) => { e.preventDefault(); setSelectedVolunteer(null); }}>
          &larr; Back to volunteers
        </a>
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <h2 className="section-title">
        Hi {selectedVolunteer.firstName}! Select a walkie
      </h2>

      {availableWalkies.length === 0 ? (
        <div className="empty-state">
          <p>No walkies available</p>
        </div>
      ) : (
        <div className="grid">
          {availableWalkies.map(w => (
            <div
              key={w.id}
              className="tile"
              onClick={() => handleSignOut(w)}
            >
              <span className="number">{w.number}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SignOut;
