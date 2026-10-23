import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, X, Home as HomeIcon } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: <HomeIcon size={14} /> },
    { name: 'Explore', path: '/explore' },
    { name: 'Technology', path: '/technology' },
    { name: 'Journal', path: '/journal' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="relative z-50 flex justify-between items-center px-6 md:px-12 py-5 border-b border-white/5 backdrop-blur-xl bg-black/40">
      <div className="flex items-center gap-6 md:gap-12">
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white hover:text-cyan-400 transition">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className="hidden md:flex gap-8 text-[10px] tracking-[0.3em] text-gray-400 uppercase font-semibold items-center">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`hover:text-white transition flex items-center gap-2 ${location.pathname === link.path ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' : ''}`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <Link to="/" className="text-[11px] tracking-[0.3em] uppercase font-bold text-gray-300 hover:text-white transition">
        By <span className="text-cyan-400">Nishant</span>
      </Link>

      <div className="flex items-center gap-6">
        <Search className="text-white cursor-pointer hover:text-fuchsia-400 transition" size={20} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#050505] border-b border-white/10 flex flex-col items-center py-6 gap-6 md:hidden z-50">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              onClick={() => setIsOpen(false)}
              className="text-xs tracking-[0.3em] text-gray-300 uppercase hover:text-cyan-400 transition flex items-center gap-2"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}