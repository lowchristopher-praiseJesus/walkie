import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui';
import PageWrapper from '../components/PageWrapper';

function Home() {
  const { config, walkies, liftCards, loading } = useApp();
  const isLunarTheme = config.theme === 'lunar';

  if (loading) {
    return (
      <PageWrapper centered>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100">Loading...</h1>
        </div>
      </PageWrapper>
    );
  }

  const walkiesInUse = walkies.filter(w => w.assignedTo).length;
  const liftCardsInUse = liftCards.filter(lc => lc.assignedTo).length;

  return (
    <PageWrapper>
      {/* Gear icon - top right */}
      <Link
        to="/admin"
        className={`fixed top-4 right-4 z-20 p-2 rounded-lg transition-colors ${isLunarTheme ? 'text-amber-300/70 hover:text-amber-200 hover:bg-black/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
        aria-label="Admin"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </Link>

      <div className="max-w-md mx-auto w-full px-4 pt-[40vh] pb-6">
        <header className="text-center py-4 mb-4">
          <h1 className={`text-3xl font-bold ${isLunarTheme ? 'text-amber-100 drop-shadow-lg' : 'text-zinc-100'}`}>
            {config.eventName}
          </h1>
          <p className={`mt-2 ${isLunarTheme ? 'text-amber-200/90' : 'text-zinc-400'}`}>
            {walkiesInUse} {walkiesInUse === 1 ? 'walkie' : 'walkies'}, {liftCardsInUse} {liftCardsInUse === 1 ? 'lift card' : 'lift cards'} issued
          </p>
        </header>

        <div className="space-y-4">
          <Link to="/sign-out" className="block">
            <Button variant="default" size="lg" className="w-full" style={!isLunarTheme ? { color: '#c9a84c' } : undefined}>
              Collect Walkie / Lift Card
            </Button>
          </Link>

          <Link to="/return" className="block">
            <Button variant="secondary" size="lg" className="w-full" style={!isLunarTheme ? { color: '#c9a84c' } : undefined}>
              Return Walkie / Lift Card
            </Button>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Home;
