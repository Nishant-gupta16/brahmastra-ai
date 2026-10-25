import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Zap } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Abhi ke liye dummy login (baad mein Firebase se connect karenge)
    if (email && password) {
      localStorage.setItem('user', email); // User ko save kar lein
      navigate('/'); // Home par wapas bhej dein
    }
  };

  return (
    <div className="min-h-screen bg-[#020206] text-white">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-cyan-400 flex items-center justify-center gap-2">
            <Zap size={24} /> {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-cyan-400"
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-cyan-400"
              required
            />
            <button type="submit" className="bg-cyan-500 text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition mt-2">
              {isSignUp ? 'Sign Up' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-cyan-400 ml-1 hover:underline">
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
