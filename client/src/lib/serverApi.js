const WORKER_URL = import.meta.env.VITE_WORKER_URL;

export async function fetchServerConfig(uuid) {
  const res = await fetch(`${WORKER_URL}/walkie-shares/${uuid}`);
  if (res.status === 404) throw Object.assign(new Error('not_found'), { code: 'not_found' });
  if (!res.ok) throw Object.assign(new Error('network_error'), { code: 'network_error' });
  return res.json();
}

export async function uploadServerConfig({ volunteers, walkies, liftCards, eventName }) {
  const res = await fetch(`${WORKER_URL}/walkie-shares/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      volunteers,
      walkies: walkies.map(({ assignedTo: _a, assignedAt: _b, ...w }) => w),
      liftCards: liftCards.map(({ assignedTo: _a, assignedAt: _b, ...lc }) => lc),
      eventName,
    }),
  });
  if (!res.ok) throw new Error('upload_failed');
  return res.json();
}
