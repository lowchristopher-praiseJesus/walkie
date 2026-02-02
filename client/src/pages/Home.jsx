import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui';

function Home() {
  const { config, walkies, liftCards, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100">Loading...</h1>
        </div>
      </div>
    );
  }

  const walkiesInUse = walkies.filter(w => w.assignedTo).length;
  const liftCardsInUse = liftCards.filter(lc => lc.assignedTo).length;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <header className="text-center py-6 mb-8">
          <h1 className="text-3xl font-bold text-zinc-100">{config.eventName}</h1>
          <p className="text-zinc-400 mt-2">
            {walkiesInUse} {walkiesInUse === 1 ? 'walkie' : 'walkies'}, {liftCardsInUse} {liftCardsInUse === 1 ? 'lift card' : 'lift cards'} issued
          </p>
        </header>

        <div className="space-y-4">
          <Link to="/sign-out" className="block">
            <Button variant="default" size="lg" className="w-full">
              Collect Walkie / Lift Card
            </Button>
          </Link>

          <Link to="/return" className="block">
            <Button variant="secondary" size="lg" className="w-full">
              Return Walkie / Lift Card
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link to="/admin" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
