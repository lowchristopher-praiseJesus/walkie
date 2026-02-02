import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';

function Return() {
  const { volunteers, walkies, refresh } = useApp();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);

  const checkedOutWalkies = walkies
    .filter(w => w.assignedTo)
    .sort((a, b) => a.number - b.number);

  const getVolunteerName = (volunteerId) => {
    const v = volunteers.find(vol => vol.id === volunteerId);
    return v ? `${v.firstName} ${v.lastName.charAt(0)}.` : 'Unknown';
  };

  const handleReturn = async (walkie) => {
    try {
      await api.returnWalkie(walkie.id);
      setMessage({ type: 'success', text: `Walkie ${walkie.number} returned` });
      await refresh();
      setTimeout(() => {
        if (checkedOutWalkies.length <= 1) {
          navigate('/');
        } else {
          setMessage(null);
        }
      }, 1000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="container">
      <div className="back-link">
        <Link to="/">&larr; Back</Link>
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <h2 className="section-title">Tap walkie to return</h2>

      {checkedOutWalkies.length === 0 ? (
        <div className="empty-state">
          <p>No walkies are currently signed out</p>
        </div>
      ) : (
        <div className="grid">
          {checkedOutWalkies.map(w => (
            <div
              key={w.id}
              className="tile"
              onClick={() => handleReturn(w)}
            >
              <span className="number">{w.number}</span>
              <span className="name">{getVolunteerName(w.assignedTo)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Return;
