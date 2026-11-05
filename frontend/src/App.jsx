import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Home from './pages/Home';
import Explore from './pages/Explore';
import Technology from './pages/Technology';
import Journal from './pages/Journal';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Chat from './pages/Chat';
import LoginChat from './pages/LoginChat';

function AuthGate({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#020206] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return children(user);
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthGate>
            {(user) => (user ? <Navigate to="/loginchat" replace /> : <Login />)}
          </AuthGate>
        }
      />
      <Route
        path="/loginchat"
        element={
          <AuthGate>
            {(user) => (user ? <LoginChat /> : <Navigate to="/login" replace />)}
          </AuthGate>
        }
      />
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/technology" element={<Technology />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}

export default App;