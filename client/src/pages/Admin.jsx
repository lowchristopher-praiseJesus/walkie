import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';

function Admin() {
  const { volunteers, walkies, config, isAdmin, setIsAdmin, refresh } = useApp();
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('volunteers');
  const [message, setMessage] = useState(null);

  // Form states
  const [newVolunteer, setNewVolunteer] = useState({ firstName: '', lastName: '', phone: '' });
  const [newWalkie, setNewWalkie] = useState({ number: '', notes: '' });
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [editingWalkie, setEditingWalkie] = useState(null);
  const [eventName, setEventName] = useState(config.eventName);

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.verifyPin(pin);
      setIsAdmin(true);
      setPinError(false);
    } catch {
      setPinError(true);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Volunteer handlers
  const handleAddVolunteer = async (e) => {
    e.preventDefault();
    try {
      await api.addVolunteer(newVolunteer);
      setNewVolunteer({ firstName: '', lastName: '', phone: '' });
      await refresh();
      showMessage('success', 'Volunteer added');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateVolunteer = async (e) => {
    e.preventDefault();
    try {
      await api.updateVolunteer(editingVolunteer.id, editingVolunteer);
      setEditingVolunteer(null);
      await refresh();
      showMessage('success', 'Volunteer updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteVolunteer = async (id) => {
    if (!confirm('Delete this volunteer?')) return;
    try {
      await api.deleteVolunteer(id);
      await refresh();
      showMessage('success', 'Volunteer deleted');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  // Walkie handlers
  const handleAddWalkie = async (e) => {
    e.preventDefault();
    try {
      await api.addWalkie({ ...newWalkie, number: parseInt(newWalkie.number) });
      setNewWalkie({ number: '', notes: '' });
      await refresh();
      showMessage('success', 'Walkie added');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateWalkie = async (e) => {
    e.preventDefault();
    try {
      await api.updateWalkie(editingWalkie.id, {
        ...editingWalkie,
        number: parseInt(editingWalkie.number)
      });
      setEditingWalkie(null);
      await refresh();
      showMessage('success', 'Walkie updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteWalkie = async (id) => {
    if (!confirm('Delete this walkie?')) return;
    try {
      await api.deleteWalkie(id);
      await refresh();
      showMessage('success', 'Walkie deleted');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleToggleUnusable = async (id) => {
    try {
      await api.toggleUnusable(id);
      await refresh();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleResetWalkies = async () => {
    if (!confirm('Reset all walkies? This will clear all sign-outs.')) return;
    try {
      await api.resetWalkies();
      await refresh();
      showMessage('success', 'All walkies reset');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateEventName = async () => {
    try {
      await api.updateConfig({ eventName });
      await refresh();
      showMessage('success', 'Event name updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  // PIN screen
  if (!isAdmin) {
    return (
      <div className="container">
        <div className="back-link">
          <Link to="/">&larr; Back</Link>
        </div>
        <div className="header">
          <h1>Admin Access</h1>
        </div>
        <form onSubmit={handlePinSubmit}>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            className="input pin-input"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
          />
          {pinError && <div className="message error">Invalid PIN</div>}
          <button type="submit" className="btn btn-primary">Enter</button>
        </form>
      </div>
    );
  }

  const sortedVolunteers = [...volunteers].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  const sortedWalkies = [...walkies].sort((a, b) => a.number - b.number);

  return (
    <div className="container">
      <div className="back-link">
        <Link to="/">&larr; Back</Link>
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'volunteers' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteers')}
        >
          Volunteers
        </button>
        <button
          className={`tab ${activeTab === 'walkies' ? 'active' : ''}`}
          onClick={() => setActiveTab('walkies')}
        >
          Walkies
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Volunteers Tab */}
      {activeTab === 'volunteers' && (
        <div>
          {editingVolunteer ? (
            <form onSubmit={handleUpdateVolunteer}>
              <h3 className="section-title">Edit Volunteer</h3>
              <div className="form-group">
                <label>First Name</label>
                <input
                  className="input"
                  value={editingVolunteer.firstName}
                  onChange={(e) => setEditingVolunteer({...editingVolunteer, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  className="input"
                  value={editingVolunteer.lastName}
                  onChange={(e) => setEditingVolunteer({...editingVolunteer, lastName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone (optional)</label>
                <input
                  className="input"
                  value={editingVolunteer.phone}
                  onChange={(e) => setEditingVolunteer({...editingVolunteer, phone: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditingVolunteer(null)}>
                Cancel
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleAddVolunteer}>
                <h3 className="section-title">Add Volunteer</h3>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    className="input"
                    value={newVolunteer.firstName}
                    onChange={(e) => setNewVolunteer({...newVolunteer, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    className="input"
                    value={newVolunteer.lastName}
                    onChange={(e) => setNewVolunteer({...newVolunteer, lastName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone (optional)</label>
                  <input
                    className="input"
                    value={newVolunteer.phone}
                    onChange={(e) => setNewVolunteer({...newVolunteer, phone: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Volunteer</button>
              </form>

              <h3 className="section-title" style={{ marginTop: 24 }}>
                Volunteers ({volunteers.length})
              </h3>
              {sortedVolunteers.map(v => (
                <div key={v.id} className="list-item">
                  <span>{v.lastName}, {v.firstName}</span>
                  <div className="list-item-actions">
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => setEditingVolunteer(v)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteVolunteer(v.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Walkies Tab */}
      {activeTab === 'walkies' && (
        <div>
          {editingWalkie ? (
            <form onSubmit={handleUpdateWalkie}>
              <h3 className="section-title">Edit Walkie</h3>
              <div className="form-group">
                <label>Number</label>
                <input
                  className="input"
                  type="number"
                  value={editingWalkie.number}
                  onChange={(e) => setEditingWalkie({...editingWalkie, number: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <input
                  className="input"
                  value={editingWalkie.notes}
                  onChange={(e) => setEditingWalkie({...editingWalkie, notes: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditingWalkie(null)}>
                Cancel
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleAddWalkie}>
                <h3 className="section-title">Add Walkie</h3>
                <div className="form-group">
                  <label>Number</label>
                  <input
                    className="input"
                    type="number"
                    value={newWalkie.number}
                    onChange={(e) => setNewWalkie({...newWalkie, number: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Notes (optional)</label>
                  <input
                    className="input"
                    value={newWalkie.notes}
                    onChange={(e) => setNewWalkie({...newWalkie, notes: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Walkie</button>
              </form>

              <h3 className="section-title" style={{ marginTop: 24 }}>
                Walkies ({walkies.length})
              </h3>
              {sortedWalkies.map(w => (
                <div key={w.id} className="list-item">
                  <span>
                    #{w.number}
                    {w.assignedTo && <span style={{ color: '#FF9500' }}> (in use)</span>}
                    {w.unusable && <span style={{ color: '#FF3B30' }}> (unusable)</span>}
                  </span>
                  <div className="list-item-actions">
                    <button
                      className="btn btn-small"
                      style={{
                        background: w.unusable ? '#34C759' : '#FF9500',
                        color: 'white'
                      }}
                      onClick={() => handleToggleUnusable(w.id)}
                    >
                      {w.unusable ? 'Enable' : 'Disable'}
                    </button>
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => setEditingWalkie(w)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteWalkie(w.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <h3 className="section-title">Event Settings</h3>
          <div className="form-group">
            <label>Event Name</label>
            <input
              className="input"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleUpdateEventName}>
            Update Event Name
          </button>

          <h3 className="section-title" style={{ marginTop: 32 }}>Reset</h3>
          <button className="btn btn-danger" onClick={handleResetWalkies}>
            Reset All Walkies
          </button>
          <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            This clears all sign-outs for a new event.
          </p>
        </div>
      )}
    </div>
  );
}

export default Admin;
