import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Technology from './pages/Technology';
import Journal from './pages/Journal';
import Contact from './pages/Contact';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/technology" element={<Technology />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

export default App;