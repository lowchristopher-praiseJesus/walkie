import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import { Button, Input, PinInput, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, Alert, Badge } from '../components/ui';
import PageWrapper from '../components/PageWrapper';

function Admin() {
  const { volunteers, walkies, liftCards, config, isAdmin, setIsAdmin, refresh } = useApp();
  const isLunarTheme = config.theme === 'lunar';
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('volunteers');
  const [message, setMessage] = useState(null);

  // Form states
  const [newVolunteer, setNewVolunteer] = useState({ firstName: '', lastName: '', phone: '' });
  const [newWalkie, setNewWalkie] = useState({ number: '', notes: '' });
  const [newLiftCard, setNewLiftCard] = useState({ number: '', notes: '' });
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [editingWalkie, setEditingWalkie] = useState(null);
  const [editingLiftCard, setEditingLiftCard] = useState(null);
  const [eventName, setEventName] = useState(config.eventName);
  const [auditLog, setAuditLog] = useState([]);
  const [loadingLog, setLoadingLog] = useState(false);

  const fetchAuditLog = async () => {
    setLoadingLog(true);
    try {
      const log = await api.getAuditLog();
      setAuditLog(log);
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    } finally {
      setLoadingLog(false);
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'log') {
      fetchAuditLog();
    }
  }, [isAdmin, activeTab]);

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
      showMessage('success', 'Server added');
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
      showMessage('success', 'Server updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteVolunteer = async (id) => {
    if (!confirm('Delete this server?')) return;
    try {
      await api.deleteVolunteer(id);
      await refresh();
      showMessage('success', 'Server deleted');
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

  const handleToggleWalkieUnusable = async (id) => {
    try {
      await api.toggleWalkieUnusable(id);
      await refresh();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  // Lift Card handlers
  const handleAddLiftCard = async (e) => {
    e.preventDefault();
    try {
      await api.addLiftCard({ ...newLiftCard, number: parseInt(newLiftCard.number) });
      setNewLiftCard({ number: '', notes: '' });
      await refresh();
      showMessage('success', 'Lift card added');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateLiftCard = async (e) => {
    e.preventDefault();
    try {
      await api.updateLiftCard(editingLiftCard.id, {
        ...editingLiftCard,
        number: parseInt(editingLiftCard.number)
      });
      setEditingLiftCard(null);
      await refresh();
      showMessage('success', 'Lift card updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteLiftCard = async (id) => {
    if (!confirm('Delete this lift card?')) return;
    try {
      await api.deleteLiftCard(id);
      await refresh();
      showMessage('success', 'Lift card deleted');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleToggleLiftCardUnusable = async (id) => {
    try {
      await api.toggleLiftCardUnusable(id);
      await refresh();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleResetAllEquipment = async () => {
    if (!confirm('Reset all equipment? This will clear all sign-outs for walkies and lift cards.')) return;
    try {
      await Promise.all([
        api.resetWalkies(),
        api.resetLiftCards()
      ]);
      sessionStorage.removeItem('returnPageState');
      await refresh();
      showMessage('success', 'All equipment reset');
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

  const handleThemeChange = async (newTheme) => {
    try {
      await api.updateConfig({ theme: newTheme });
      await refresh();
      showMessage('success', `Theme changed to ${newTheme === 'lunar' ? 'Lunar New Year' : 'Default'}`);
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleClearAuditLog = async () => {
    if (!confirm('Clear all audit log entries? This cannot be undone.')) return;
    try {
      await api.clearAuditLog();
      setAuditLog([]);
      showMessage('success', 'Audit log cleared');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // PIN screen
  if (!isAdmin) {
    return (
      <PageWrapper centered>
        <div className="max-w-md mx-auto w-full px-4 py-6">
          <Link to="/" className={`hover:underline text-base mb-4 inline-block ${isLunarTheme ? 'text-amber-300' : 'text-[--color-primary]'}`}>
            &larr; Back
          </Link>
          <header className="text-center py-6 mb-8">
            <h1 className={`text-2xl font-bold ${isLunarTheme ? 'text-amber-100' : 'text-zinc-100'}`}>Admin Access</h1>
          </header>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <PinInput
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            {pinError && <Alert variant="error">Invalid PIN</Alert>}
            <Button type="submit" className="w-full">Enter</Button>
          </form>
        </div>
      </PageWrapper>
    );
  }

  const sortedVolunteers = [...volunteers].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  const sortedWalkies = [...walkies].sort((a, b) => a.number - b.number);
  const sortedLiftCards = [...liftCards].sort((a, b) => a.number - b.number);

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

        <Tabs>
          <TabsList>
            <TabsTrigger active={activeTab === 'volunteers'} onClick={() => setActiveTab('volunteers')}>
              Servers
            </TabsTrigger>
            <TabsTrigger active={activeTab === 'walkies'} onClick={() => setActiveTab('walkies')}>
              Walkies
            </TabsTrigger>
            <TabsTrigger active={activeTab === 'liftCards'} onClick={() => setActiveTab('liftCards')}>
              Lift Cards
            </TabsTrigger>
            <TabsTrigger active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
              Settings
            </TabsTrigger>
            <TabsTrigger active={activeTab === 'log'} onClick={() => setActiveTab('log')}>
              Log
            </TabsTrigger>
          </TabsList>

          {/* Volunteers Tab */}
          {activeTab === 'volunteers' && (
            <div>
              {editingVolunteer ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Server</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateVolunteer} className="space-y-4">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">First Name</label>
                        <Input
                          value={editingVolunteer.firstName}
                          onChange={(e) => setEditingVolunteer({...editingVolunteer, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Last Name (optional)</label>
                        <Input
                          value={editingVolunteer.lastName}
                          onChange={(e) => setEditingVolunteer({...editingVolunteer, lastName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Phone (optional)</label>
                        <Input
                          value={editingVolunteer.phone}
                          onChange={(e) => setEditingVolunteer({...editingVolunteer, phone: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Save</Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingVolunteer(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Add Server</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddVolunteer} className="space-y-4">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">First Name</label>
                          <Input
                            value={newVolunteer.firstName}
                            onChange={(e) => setNewVolunteer({...newVolunteer, firstName: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Last Name (optional)</label>
                          <Input
                            value={newVolunteer.lastName}
                            onChange={(e) => setNewVolunteer({...newVolunteer, lastName: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Phone (optional)</label>
                          <Input
                            value={newVolunteer.phone}
                            onChange={(e) => setNewVolunteer({...newVolunteer, phone: e.target.value})}
                          />
                        </div>
                        <Button type="submit" className="w-full">Add Server</Button>
                      </form>
                    </CardContent>
                  </Card>

                  <h3 className="text-zinc-400 text-sm font-medium mb-3">
                    Servers ({volunteers.length})
                  </h3>
                  <div className="space-y-2">
                    {sortedVolunteers.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <span className="text-zinc-100">{v.lastName}, {v.firstName}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingVolunteer(v)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteVolunteer(v.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Walkies Tab */}
          {activeTab === 'walkies' && (
            <div>
              {editingWalkie ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Walkie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateWalkie} className="space-y-4">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Number</label>
                        <Input
                          type="number"
                          value={editingWalkie.number}
                          onChange={(e) => setEditingWalkie({...editingWalkie, number: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                        <Input
                          value={editingWalkie.notes}
                          onChange={(e) => setEditingWalkie({...editingWalkie, notes: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Save</Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingWalkie(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Add Walkie</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddWalkie} className="space-y-4">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Number</label>
                          <Input
                            type="number"
                            value={newWalkie.number}
                            onChange={(e) => setNewWalkie({...newWalkie, number: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                          <Input
                            value={newWalkie.notes}
                            onChange={(e) => setNewWalkie({...newWalkie, notes: e.target.value})}
                          />
                        </div>
                        <Button type="submit" className="w-full">Add Walkie</Button>
                      </form>
                    </CardContent>
                  </Card>

                  <h3 className="text-zinc-400 text-sm font-medium mb-3">
                    Walkies ({walkies.length})
                  </h3>
                  <div className="space-y-2">
                    {sortedWalkies.map(w => (
                      <div key={w.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <span className="text-zinc-100 flex items-center gap-2">
                          #{w.number}
                          {w.assignedTo && <Badge variant="warning">in use</Badge>}
                          {w.unusable && <Badge variant="danger">unusable</Badge>}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={w.unusable ? 'secondary' : 'outline'}
                            className={!w.unusable ? 'bg-[--color-warning] text-white hover:bg-[--color-warning]/90' : ''}
                            onClick={() => handleToggleWalkieUnusable(w.id)}
                          >
                            {w.unusable ? 'Enable' : 'Disable'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingWalkie(w)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteWalkie(w.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Lift Cards Tab */}
          {activeTab === 'liftCards' && (
            <div>
              {editingLiftCard ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Lift Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateLiftCard} className="space-y-4">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Number</label>
                        <Input
                          type="number"
                          value={editingLiftCard.number}
                          onChange={(e) => setEditingLiftCard({...editingLiftCard, number: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                        <Input
                          value={editingLiftCard.notes}
                          onChange={(e) => setEditingLiftCard({...editingLiftCard, notes: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Save</Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingLiftCard(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Add Lift Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddLiftCard} className="space-y-4">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Number</label>
                          <Input
                            type="number"
                            value={newLiftCard.number}
                            onChange={(e) => setNewLiftCard({...newLiftCard, number: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Notes (optional)</label>
                          <Input
                            value={newLiftCard.notes}
                            onChange={(e) => setNewLiftCard({...newLiftCard, notes: e.target.value})}
                          />
                        </div>
                        <Button type="submit" className="w-full">Add Lift Card</Button>
                      </form>
                    </CardContent>
                  </Card>

                  <h3 className="text-zinc-400 text-sm font-medium mb-3">
                    Lift Cards ({liftCards.length})
                  </h3>
                  <div className="space-y-2">
                    {sortedLiftCards.map(lc => (
                      <div key={lc.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <span className="text-zinc-100 flex items-center gap-2">
                          #{lc.number}
                          {lc.assignedTo && <Badge variant="warning">in use</Badge>}
                          {lc.unusable && <Badge variant="danger">unusable</Badge>}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={lc.unusable ? 'secondary' : 'outline'}
                            className={!lc.unusable ? 'bg-[--color-warning] text-white hover:bg-[--color-warning]/90' : ''}
                            onClick={() => handleToggleLiftCardUnusable(lc.id)}
                          >
                            {lc.unusable ? 'Enable' : 'Disable'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingLiftCard(lc)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteLiftCard(lc.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Event Name</label>
                    <Input
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={handleUpdateEventName}>
                    Update Event Name
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={() => handleThemeChange('default')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      config.theme !== 'lunar'
                        ? 'border-[--color-primary] bg-zinc-800'
                        : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 ring-2 ring-white/20"></div>
                      <div>
                        <div className="font-medium text-zinc-100">Default Dark</div>
                        <div className="text-sm text-zinc-400">Blue and green accent colors</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleThemeChange('lunar')}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      config.theme === 'lunar'
                        ? 'border-[--color-primary] bg-zinc-800'
                        : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-amber-500 ring-2 ring-white/20"></div>
                      <div>
                        <div className="font-medium text-zinc-100">Lunar New Year</div>
                        <div className="text-sm text-zinc-400">Red and gold prosperity theme</div>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reset</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full" onClick={handleResetAllEquipment}>
                    Reset All Equipment
                  </Button>
                  <p className="text-xs text-zinc-500 mt-2">
                    This clears all sign-outs for walkies and lift cards for a new event.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Log Tab */}
          {activeTab === 'log' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-zinc-400 text-sm font-medium">
                  Activity Log ({auditLog.length} entries)
                </h3>
                {auditLog.length > 0 && (
                  <Button size="sm" variant="destructive" onClick={handleClearAuditLog}>
                    Clear Log
                  </Button>
                )}
              </div>

              {loadingLog ? (
                <div className="text-center py-8 text-zinc-500">Loading...</div>
              ) : auditLog.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">No activity recorded yet</div>
              ) : (
                <div className="space-y-2">
                  {auditLog.map(entry => (
                    <div key={entry.id} className="p-3 bg-zinc-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={entry.action === 'sign-out' ? 'warning' : 'success'}>
                          {entry.action === 'sign-out' ? 'Collected' : 'Returned'}
                        </Badge>
                        <span className="text-zinc-100 font-medium">
                          {entry.itemType === 'walkie' ? 'Walkie' : 'Lift Card'} #{entry.itemNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">{entry.volunteerName}</span>
                        <span className="text-zinc-500">{formatTimestamp(entry.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Tabs>
      </div>
    </PageWrapper>
  );
}

export default Admin;
