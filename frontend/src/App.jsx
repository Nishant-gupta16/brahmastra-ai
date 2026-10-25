import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Technology from './pages/Technology';
import Journal from './pages/Journal';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Chat from './pages/Chat';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/technology" element={<Technology />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/chat" element={<Chat />} /> {/* ✅ Route */}
    </Routes>
  );
}

export default App;