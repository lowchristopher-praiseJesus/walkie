import { Button } from './ui/button';

function formatAge(isoTimestamp) {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 48) return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
}

export function StaleDataModal({ timestamp, onKeep, onClear }) {
  const age = formatAge(timestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Existing Data Detected</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Data from a previous session was found — it is{' '}
            <span className="text-zinc-200 font-semibold">{age} old</span>.
          </p>
          <p className="text-sm text-zinc-400 mt-2">
            Would you like to clear all equipment sign-outs and the audit log
            to start fresh for a new event?
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="destructive" className="w-full" onClick={onClear}>
            Clear Event Data
          </Button>
          <Button variant="outline" className="w-full" onClick={onKeep}>
            Keep Existing Data
          </Button>
        </div>
      </div>
    </div>
  );
}
