import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function Home() {
  const { config, walkies, loading } = useApp();

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  const inUse = walkies.filter(w => w.assignedTo).length;
  const total = walkies.length;

  return (
    <div className="container">
      <div className="header">
        <h1>{config.eventName}</h1>
        <p className="status">
          {inUse} of {total} walkies in use
        </p>
      </div>

      <Link to="/sign-out">
        <button className="btn btn-primary">Take Walkie</button>
      </Link>

      <Link to="/return">
        <button className="btn btn-secondary">Return Walkie</button>
      </Link>

      <div className="admin-link">
        <Link to="/admin">Admin</Link>
      </div>
    </div>
  );
}

export default Home;
