import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home as HomeIcon, BookOpen, Cpu, Compass, Mail, LogIn, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const location = useLocation();

  const isLoggedIn = false;
  const user = { name: 'Nishant', email: 'nishant@brahmastra.ai' };

  const navLinks = [
    { name: 'Home', path: '/', icon: <HomeIcon size={16} /> },
    { name: 'Explore', path: '/explore', icon: <Compass size={16} /> },
    { name: 'Technology', path: '/technology', icon: <Cpu size={16} /> },
    { name: 'Journal', path: '/journal', icon: <BookOpen size={16} /> },
    { name: 'Contact', path: '/contact', icon: <Mail size={16} /> },
  ];

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else if (shouldRender) {
      const t = setTimeout(() => setShouldRender(false), 600);
      return () => clearTimeout(t);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <nav className="relative z-50 grid grid-cols-3 items-center px-6 md:px-12 py-5 border-b border-white/5 backdrop-blur-xl bg-black/40">
        {/* LEFT */}
        <div className="flex items-center gap-6 md:gap-12">
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden text-white hover:text-cyan-400 transition active:scale-90"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex gap-8 text-[10px] tracking-[0.3em] text-gray-400 uppercase font-semibold items-center">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative hover:text-white transition flex items-center gap-2 py-1 ${
                    active ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' : ''
                  }`}
                >
                  {link.icon}
                  {link.name}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* CENTER — By Nishant (shifted slightly right) */}
        <div className="flex justify-center md:justify-end md:pr-8 lg:pr-16">
          <Link
            to="/"
            className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-300 hover:text-white transition whitespace-nowrap"
          >
            By <span className="text-cyan-400">Nishant</span>
          </Link>
        </div>

        {/* RIGHT — empty (desktop) */}
        <div className="flex justify-end" />
      </nav>

      {/* ===== MOBILE SIDEBAR ===== */}
      {shouldRender && (
        <>
          <div
            className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-600 ease-in-out ${
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsOpen(false)}
          />

          <aside
            className={`fixed top-0 left-0 z-[70] h-full w-[80vw] max-w-[300px] bg-[#0a0a0a] border-r border-white/10 flex flex-col md:hidden shadow-2xl transition-transform duration-600 ease-in-out ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
              <span className="text-sm font-semibold text-cyan-400 tracking-wider flex items-center gap-1.5">
                <Zap size={16} />
                BRAHMASTRA
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition active:scale-90"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              <p className="px-4 pt-2 pb-1.5 text-[10px] uppercase tracking-widest text-gray-600 font-semibold">
                Menu
              </p>

              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                      active
                        ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400'
                        : 'text-gray-300 hover:bg-white/5 border-l-2 border-transparent'
                    }`}
                  >
                    <span className={active ? 'text-cyan-400' : 'text-gray-500'}>
                      {link.icon}
                    </span>
                    <span className="font-medium tracking-wide">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="shrink-0 border-t border-white/5">
              {isLoggedIn ? (
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-black text-sm font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-cyan-400 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shrink-0">
                    <LogIn size={16} className="text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">Login / Sign Up</p>
                    <p className="text-[10px] text-gray-500">Continue to Brahmastra</p>
                  </div>
                </Link>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}