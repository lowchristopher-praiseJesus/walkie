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
          <Link
            to="/admin"
            className={`text-sm transition-colors ${isLunarTheme ? 'text-amber-300/70 hover:text-amber-200' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Admin
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Home;
