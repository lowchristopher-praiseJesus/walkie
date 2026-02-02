import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import SignOut from './pages/SignOut';
import Return from './pages/Return';
import Admin from './pages/Admin';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-out" element={<SignOut />} />
          <Route path="/return" element={<Return />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
