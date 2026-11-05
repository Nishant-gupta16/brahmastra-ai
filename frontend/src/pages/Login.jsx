import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwdReadOnly, setPwdReadOnly] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/loginchat', { replace: true });
    });
    return () => unsub();
  }, [navigate]);

  const resetFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    resetFields();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name.');
      setLoading(false);
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        navigate('/loginchat', { replace: true });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/loginchat', { replace: true });
      }
    } catch (err) {
      const code = err.code;
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login.');
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak (at least 6 characters).');
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password.');
      } else {
        setError(err.message || 'Operation failed, please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020206] text-white">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-10">
        <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,255,0.05)]">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-400 transition mb-4">
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <h2 className="text-2xl font-bold text-center mb-2 text-cyan-400 flex items-center justify-center gap-2">
            <Zap size={24} /> {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-center text-xs text-gray-500 mb-6">
            {isSignUp ? "Join Brahmastra AI — it's free." : 'Login to your account to continue.'}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-3 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-9 text-sm outline-none focus:border-cyan-400 transition"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-9 text-sm outline-none focus:border-cyan-400 transition"
                required
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                readOnly={pwdReadOnly}
                onFocus={() => setPwdReadOnly(false)}
                onBlur={() => setPwdReadOnly(true)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-9 pr-10 text-sm outline-none focus:border-cyan-400 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {isSignUp && (
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-9 text-sm outline-none focus:border-cyan-400 transition"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition mt-2 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={handleToggleMode} className="text-cyan-400 ml-1 hover:underline font-semibold">
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}