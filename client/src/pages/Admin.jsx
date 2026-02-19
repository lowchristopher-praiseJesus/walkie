import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { storage } from '../storage';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, Alert, Badge } from '../components/ui';
import PageWrapper from '../components/PageWrapper';

function Admin() {
  const { volunteers, walkies, liftCards, config, setIsAdmin, refresh } = useApp();
  const isLunarTheme = config.theme === 'lunar';
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
  const [importText, setImportText] = useState('');

  const fetchAuditLog = () => {
    setAuditLog(storage.getAuditLog());
  };

  useEffect(() => {
    setIsAdmin(true);
  }, [setIsAdmin]);

  useEffect(() => {
    if (activeTab === 'log') {
      fetchAuditLog();
    }
  }, [activeTab]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Volunteer handlers
  const handleAddVolunteer = (e) => {
    e.preventDefault();
    try {
      storage.addVolunteer(newVolunteer);
      setNewVolunteer({ firstName: '', lastName: '', phone: '' });
      refresh();
      showMessage('success', 'Server added');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateVolunteer = (e) => {
    e.preventDefault();
    try {
      storage.updateVolunteer(editingVolunteer.id, editingVolunteer);
      setEditingVolunteer(null);
      refresh();
      showMessage('success', 'Server updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteVolunteer = (id) => {
    if (!confirm('Delete this server?')) return;
    try {
      storage.deleteVolunteer(id);
      refresh();
      showMessage('success', 'Server deleted');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  // Walkie handlers
  const handleAddWalkie = (e) => {
    e.preventDefault();
    try {
      storage.addWalkie({ ...newWalkie, number: parseInt(newWalkie.number) });
      setNewWalkie({ number: '', notes: '' });
      refresh();
      showMessage('success', 'Walkie added');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateWalkie = (e) => {
    e.preventDefault();
    try {
      storage.updateWalkie(editingWalkie.id, {
        ...editingWalkie,
        number: parseInt(editingWalkie.number)
      });
      setEditingWalkie(null);
      refresh();
      showMessage('success', 'Walkie updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteWalkie = (id) => {
    if (!confirm('Delete this walkie?')) return;
    try {
      storage.deleteWalkie(id);
      refresh();
      showMessage('success', 'Walkie deleted');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleToggleWalkieUnusable = (id) => {
    try {
      storage.toggleWalkieUnusable(id);
      refresh();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  // Lift Card handlers
  const handleAddLiftCard = (e) => {
    e.preventDefault();
    try {
      storage.addLiftCard({ ...newLiftCard, number: parseInt(newLiftCard.number) });
      setNewLiftCard({ number: '', notes: '' });
      refresh();
      showMessage('success', 'Lift card added');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateLiftCard = (e) => {
    e.preventDefault();
    try {
      storage.updateLiftCard(editingLiftCard.id, {
        ...editingLiftCard,
        number: parseInt(editingLiftCard.number)
      });
      setEditingLiftCard(null);
      refresh();
      showMessage('success', 'Lift card updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleDeleteLiftCard = (id) => {
    if (!confirm('Delete this lift card?')) return;
    try {
      storage.deleteLiftCard(id);
      refresh();
      showMessage('success', 'Lift card deleted');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleToggleLiftCardUnusable = (id) => {
    try {
      storage.toggleLiftCardUnusable(id);
      refresh();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleResetAllEquipment = () => {
    if (!confirm('Reset all equipment? This will clear all sign-outs for walkies and lift cards.')) return;
    try {
      storage.resetWalkies();
      storage.resetLiftCards();
      sessionStorage.removeItem('returnPageState');
      refresh();
      showMessage('success', 'All equipment reset');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleUpdateEventName = () => {
    try {
      storage.updateConfig({ eventName });
      refresh();
      showMessage('success', 'Event name updated');
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleThemeChange = (newTheme) => {
    try {
      storage.updateConfig({ theme: newTheme });
      refresh();
      showMessage('success', `Theme changed to ${newTheme === 'lunar' ? 'Lunar New Year' : 'Default'}`);
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleClearAuditLog = () => {
    if (!confirm('Clear all audit log entries? This cannot be undone.')) return;
    try {
      storage.clearAuditLog();
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
            <TabsTrigger active={activeTab === 'data'} onClick={() => setActiveTab('data')}>
              Data
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

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400 mb-4">
                    Copy your current state to share with another device via WhatsApp or Telegram.
                  </p>
                  <Button className="w-full" onClick={() => {
                    try {
                      const encoded = storage.exportAllData();
                      navigator.clipboard.writeText(encoded).then(() => {
                        showMessage('success', 'Copied to clipboard! Paste into WhatsApp or Telegram to share.');
                      }).catch(() => {
                        showMessage('error', 'Failed to copy. Try again.');
                      });
                    } catch (err) {
                      showMessage('error', err.message);
                    }
                  }}>
                    Copy to Clipboard
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Import Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400 mb-4">
                    Paste exported data from another device. This will replace all current data.
                  </p>
                  <textarea
                    className="w-full h-32 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-mono resize-none focus:outline-none focus:border-[--color-primary] placeholder-zinc-500"
                    placeholder="Paste WALKIE:... data here"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <Button className="w-full mt-4" disabled={!importText.trim()} onClick={() => {
                    const preview = storage.parseImportData(importText);
                    if (!preview.success) {
                      showMessage('error', preview.error);
                      return;
                    }
                    const s = preview.summary;
                    const msg = `This will replace ALL current data with:\n• ${s.volunteers} servers\n• ${s.walkies} walkies\n• ${s.liftCards} lift cards\n• ${s.auditLog} log entries\n\nContinue?`;
                    if (!confirm(msg)) return;
                    const result = storage.importAllData(importText);
                    if (result.success) {
                      setImportText('');
                      refresh();
                      showMessage('success', `Imported: ${result.summary.volunteers} servers, ${result.summary.walkies} walkies, ${result.summary.liftCards} lift cards`);
                    } else {
                      showMessage('error', result.error);
                    }
                  }}>
                    Import
                  </Button>
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

              {auditLog.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">No activity recorded yet</div>
              ) : (
                <div className="space-y-2">
                  {auditLog.map(entry => (
                    <div key={entry.id} className={`p-3 bg-zinc-800 rounded-lg ${entry.action === 'sign-out' ? 'text-green-400' : 'text-red-400'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={entry.action === 'sign-out' ? 'warning' : 'success'}>
                          {entry.action === 'sign-out' ? 'Collected' : 'Returned'}
                        </Badge>
                        <span className="font-medium">
                          {entry.itemType === 'walkie' ? 'Walkie' : 'Lift Card'} #{entry.itemNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{entry.volunteerName}</span>
                        <span className="opacity-70">{formatTimestamp(entry.timestamp)}</span>
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
