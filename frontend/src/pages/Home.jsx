import { ArrowRight, Sparkles, Play, Zap, Globe, Rocket, Orbit, Star, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Home() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    const handler = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handler);
    return () => {
      clearTimeout(t);
      window.removeEventListener('mousemove', handler);
    };
  }, []);

  return (
    <div className="relative h-screen w-full bg-[#020206] overflow-hidden font-sans text-white selection:bg-fuchsia-500/30">

      {/* ===== COSMIC BACKGROUND ===== */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-25%] left-[-15%] w-[90vw] h-[90vw] bg-purple-700/15 rounded-full blur-[180px] animate-nebula-drift-1"
          style={{
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
            transition: 'transform 0.8s ease-out',
          }}
        />
        <div
          className="absolute bottom-[-25%] right-[-15%] w-[80vw] h-[80vw] bg-blue-700/15 rounded-full blur-[180px] animate-nebula-drift-2"
          style={{
            transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
            transition: 'transform 0.8s ease-out',
          }}
        />
        <div
          className="absolute top-[30%] left-[40%] w-[50vw] h-[50vw] bg-fuchsia-700/10 rounded-full blur-[160px] animate-pulse-slow"
          style={{
            transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`,
            transition: 'transform 1s ease-out',
          }}
        />

        <div
          className="absolute inset-0 opacity-40 animate-star-drift"
          style={{
            backgroundImage: `radial-gradient(1px 1px at 20% 30%, white, transparent),
                              radial-gradient(1px 1px at 60% 70%, white, transparent),
                              radial-gradient(1px 1px at 40% 90%, white, transparent),
                              radial-gradient(2px 2px at 80% 20%, white, transparent),
                              radial-gradient(1px 1px at 10% 60%, white, transparent),
                              radial-gradient(1px 1px at 90% 80%, rgba(0,255,255,0.8), transparent)`,
            backgroundSize: '400px 400px',
          }}
        />
        <div
          className="absolute inset-0 opacity-30 animate-star-drift-reverse"
          style={{
            backgroundImage: `radial-gradient(1px 1px at 30% 20%, #a78bfa, transparent),
                              radial-gradient(1px 1px at 70% 50%, #f0abfc, transparent),
                              radial-gradient(2px 2px at 50% 80%, #67e8f9, transparent)`,
            backgroundSize: '600px 600px',
          }}
        />

        <div className="absolute top-[12%] left-[25%] w-1 h-1 rounded-full bg-white/80 animate-twinkle" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[28%] left-[65%] w-1 h-1 rounded-full bg-cyan-300/80 animate-twinkle" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-[45%] left-[15%] w-1 h-1 rounded-full bg-fuchsia-300/80 animate-twinkle" style={{ animationDelay: '2.4s' }} />
        <div className="absolute top-[70%] left-[80%] w-1 h-1 rounded-full bg-white/80 animate-twinkle" style={{ animationDelay: '0.6s' }} />
        <div className="absolute top-[85%] left-[40%] w-1 h-1 rounded-full bg-cyan-300/80 animate-twinkle" style={{ animationDelay: '1.8s' }} />
        <div className="absolute top-[55%] left-[55%] w-1 h-1 rounded-full bg-white/60 animate-twinkle" style={{ animationDelay: '3s' }} />

        <div className="absolute top-[15%] right-[30%] w-[2px] h-[90px] bg-gradient-to-b from-white via-white/60 to-transparent rotate-45 animate-shooting-star-1" />
        <div className="absolute top-[35%] right-[60%] w-[1.5px] h-[70px] bg-gradient-to-b from-cyan-300 via-cyan-300/60 to-transparent rotate-45 animate-shooting-star-2" />
        <div className="absolute top-[55%] right-[15%] w-[1px] h-[60px] bg-gradient-to-b from-fuchsia-300 via-fuchsia-300/60 to-transparent rotate-45 animate-shooting-star-3" />
        <div className="absolute top-[75%] right-[45%] w-[1.5px] h-[65px] bg-gradient-to-b from-purple-300 via-purple-300/60 to-transparent rotate-45 animate-shooting-star-4" />

        <div className="absolute top-[10%] left-[8%] text-fuchsia-500/15 animate-float-slow">
          <Star size={44} />
        </div>
        <div className="absolute bottom-[15%] left-[15%] text-cyan-400/15 animate-spin-slow-reverse">
          <Orbit size={70} />
        </div>
        <div className="absolute top-[65%] right-[8%] text-blue-500/15 animate-float-medium">
          <Rocket size={40} />
        </div>
        <div className="absolute top-[40%] right-[20%] text-purple-500/10 animate-spin-very-slow">
          <Zap size={44} />
        </div>
      </div>

      <Navbar />

      {/* ===== HERO ===== */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 sm:px-6 md:px-20 pt-8 sm:pt-10 md:pt-12 pb-4 lg:pb-0 gap-6 lg:gap-0 h-[calc(100vh-80px)] flex-1">

        {/* LEFT */}
        <div className={`w-full lg:w-[55%] flex flex-col justify-center z-20 text-center lg:text-left items-center lg:items-start mt-2 lg:-mt-10 transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md hover:border-cyan-400/40 transition-all duration-300 animate-badge-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <Sparkles size={12} className="text-cyan-400 animate-sparkle" />
            <span className="text-[9px] sm:text-[11px] md:text-xs tracking-[0.25em] uppercase text-cyan-300 font-medium">
              Next-Gen AI Assistant
            </span>
          </div>

          <h1 className="font-extrabold leading-[0.95] mb-2 sm:mb-4 w-full flex justify-center lg:justify-start">
            <span className="relative block text-[2rem] sm:text-[2.8rem] md:text-[4.5rem] lg:text-[5.5rem] xl:text-[6.5rem] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-500 animate-gradient-shift drop-shadow-[0_0_35px_rgba(0,255,255,0.18)] animate-text-glow">
              BRAHMASTRA
            </span>
          </h1>

          <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm tracking-[0.3em] uppercase mb-5 sm:mb-7 leading-relaxed animate-fade-in-delay-1">
            Where Creativity
            <span className="mx-2 text-cyan-400 animate-rotate-star">✦</span>
            Meets Intelligence
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto animate-fade-in-delay-2">
            <button
              onClick={() => navigate('/chat')}
              className="group relative flex items-center justify-center gap-1.5 bg-white/5 border border-cyan-400/50 text-cyan-300 px-3.5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-cyan-400 hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:shadow-[0_0_60px_rgba(0,255,255,0.7)] transform hover:-translate-y-1 overflow-hidden animate-btn-glow w-fit"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.2s_infinite]" />
              <Play size={12} className="group-hover:rotate-12 transition-transform duration-300 shrink-0" />
              <span className="whitespace-nowrap">Try Demo</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 text-gray-400 hover:text-white px-3.5 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300 hover:bg-white/5 rounded-full border border-transparent hover:border-white/10 active:scale-95 w-fit"
            >
              <LogIn size={14} className="text-fuchsia-500 shrink-0" />
              <span className="whitespace-nowrap">Login / Sign Up</span>
            </button>
          </div>

          <div className="mt-6 sm:mt-10 flex items-center justify-center lg:justify-start gap-6 sm:gap-10 w-full animate-fade-in-delay-3">
            <div className="group cursor-default text-center lg:text-left">
              <p className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors duration-300">∞</p>
              <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mt-1">Ideas</p>
            </div>
            <div className="w-px h-8 sm:h-10 bg-white/10"></div>
            <div className="group cursor-default text-center lg:text-left">
              <p className="text-xl sm:text-2xl font-black text-cyan-400 group-hover:text-fuchsia-400 transition-colors duration-300">24/7</p>
              <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mt-1">Available</p>
            </div>
            <div className="w-px h-8 sm:h-10 bg-white/10"></div>
            <div className="group cursor-default text-center lg:text-left">
              <p className="text-xl sm:text-2xl font-black text-fuchsia-400 group-hover:text-cyan-400 transition-colors duration-300">100+</p>
              <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest mt-1">Languages</p>
            </div>
          </div>
        </div>

        {/* RIGHT — PLANET */}
        <div className={`w-full lg:w-[45%] relative flex flex-1 lg:flex-none items-center justify-center mt-2 sm:mt-4 lg:mt-0 transition-all duration-1000 delay-200 ease-out ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="relative w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px] flex items-center justify-center">

            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/10 to-purple-500/20 blur-3xl animate-breathe-glow"></div>

            <div
              className="absolute inset-6 rounded-full bg-gradient-to-br from-cyan-500/40 via-blue-900/60 to-fuchsia-900/50 backdrop-blur-sm shadow-[inset_-30px_-30px_80px_rgba(0,0,0,0.85),_0_0_120px_rgba(0,255,255,0.3)] border border-white/15 overflow-hidden animate-spin-planet"
              style={{
                transform: `translate(${mousePos.x * 12 - 6}px, ${mousePos.y * 12 - 6}px)`,
                transition: 'transform 0.4s ease-out',
              }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-40 mix-blend-overlay"></div>
              <div className="absolute top-1/4 left-0 w-full h-12 bg-cyan-400/20 blur-lg"></div>
              <div className="absolute bottom-1/3 left-0 w-full h-20 bg-fuchsia-500/20 blur-lg"></div>
              <div className="absolute top-2/3 left-0 w-full h-8 bg-purple-500/25 blur-md"></div>
            </div>

            <div
              className="absolute inset-2 border border-cyan-400/30 rounded-full animate-spin-ring-1"
              style={{ transform: 'rotateX(75deg)' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(0,255,255,1)] animate-pulse-dot"></div>
            </div>

            <div
              className="absolute inset-[-20px] border border-fuchsia-500/25 rounded-full animate-spin-ring-2"
              style={{ transform: 'rotateX(75deg) rotateZ(20deg)' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,1)] animate-pulse-dot" style={{ animationDelay: '0.4s' }}></div>
            </div>

            <div
              className="absolute inset-[-45px] border border-purple-400/15 rounded-full animate-spin-ring-3"
              style={{ transform: 'rotateX(75deg) rotateZ(-15deg)' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,1)] animate-pulse-dot" style={{ animationDelay: '0.8s' }}></div>
            </div>

            <div className="absolute top-[8%] right-[8%] w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-gray-200 to-gray-500 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.6)] animate-moon-drift">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-400/40 to-transparent"></div>
            </div>

            <div className="relative z-10 w-28 h-28 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-black/60 backdrop-blur-xl border border-white/25 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(0,255,255,0.4)] animate-hub-pulse">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-hub-ring"></div>
              <Globe size={48} className="text-cyan-300 animate-globe-spin sm:w-12 sm:h-12 md:w-14 md:h-14" />
            </div>

            <div className="absolute top-[-10px] left-[20%] text-cyan-400/50 animate-float-soft">
              <Rocket size={24} className="sm:w-[26px] sm:h-[26px]" />
            </div>
            <div className="absolute bottom-[10%] right-[10%] text-fuchsia-400/40 animate-float-soft-slow">
              <Zap size={28} className="sm:w-[30px] sm:h-[30px]" />
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-10 flex flex-col items-center pb-2 sm:pb-4 text-gray-600 text-[7px] sm:text-[9px] uppercase tracking-[0.4em]">
        <span className="animate-pulse-slow">Brahmastra AI · 2026</span>
        <div className="mt-1 sm:mt-2 w-px h-4 sm:h-6 bg-gradient-to-b from-cyan-400/50 to-transparent animate-line-grow"></div>
      </div>

      {/* ===== KEYFRAMES ===== */}
      <style>{`
        @keyframes starDrift {
          from { background-position: 0 0; }
          to { background-position: 400px 400px; }
        }
        .animate-star-drift { animation: starDrift 200s linear infinite; }
        .animate-star-drift-reverse { animation: starDrift 150s linear infinite reverse; }

        @keyframes nebula-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
        }
        @keyframes nebula-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 20px) scale(1.08); }
        }
        .animate-nebula-drift-1 { animation: nebula-drift-1 20s ease-in-out infinite; }
        .animate-nebula-drift-2 { animation: nebula-drift-2 25s ease-in-out infinite; }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }

        @keyframes shoot1 {
          0% { transform: translate(0, 0) rotate(45deg); opacity: 0; }
          5% { opacity: 1; }
          15% { transform: translate(-500px, 500px) rotate(45deg); opacity: 0; }
          100% { transform: translate(-500px, 500px) rotate(45deg); opacity: 0; }
        }
        @keyframes shoot2 {
          0% { transform: translate(0, 0) rotate(45deg); opacity: 0; }
          5% { opacity: 1; }
          15% { transform: translate(-400px, 400px) rotate(45deg); opacity: 0; }
          100% { transform: translate(-400px, 400px) rotate(45deg); opacity: 0; }
        }
        @keyframes shoot3 {
          0% { transform: translate(0, 0) rotate(45deg); opacity: 0; }
          5% { opacity: 1; }
          15% { transform: translate(-350px, 350px) rotate(45deg); opacity: 0; }
          100% { transform: translate(-350px, 350px) rotate(45deg); opacity: 0; }
        }
        @keyframes shoot4 {
          0% { transform: translate(0, 0) rotate(45deg); opacity: 0; }
          5% { opacity: 1; }
          15% { transform: translate(-450px, 450px) rotate(45deg); opacity: 0; }
          100% { transform: translate(-450px, 450px) rotate(45deg); opacity: 0; }
        }
        .animate-shooting-star-1 { animation: shoot1 6s ease-in infinite; }
        .animate-shooting-star-2 { animation: shoot2 8s ease-in infinite 2s; }
        .animate-shooting-star-3 { animation: shoot3 10s ease-in infinite 4s; }
        .animate-shooting-star-4 { animation: shoot4 12s ease-in infinite 6s; }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(6deg); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-10px) translateX(8px); }
        }
        .animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
        .animate-float-medium { animation: floatMedium 10s ease-in-out infinite 2s; }

        @keyframes floatSoft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-soft { animation: floatSoft 7s ease-in-out infinite; }
        .animate-float-soft-slow { animation: floatSoft 9s ease-in-out infinite 1s; }

        .animate-spin-slow-reverse { animation: spin 20s linear infinite reverse; }
        .animate-spin-very-slow { animation: spin 30s linear infinite; }
        .animate-spin-planet { animation: spin 80s linear infinite; }
        .animate-spin-ring-1 { animation: spin 20s linear infinite; }
        .animate-spin-ring-2 { animation: spin 30s linear infinite reverse; }
        .animate-spin-ring-3 { animation: spin 45s linear infinite; }
        .animate-globe-spin { animation: spin 15s linear infinite; }

        @keyframes moonDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-8px, -12px) scale(1.05); }
        }
        .animate-moon-drift { animation: moonDrift 6s ease-in-out infinite; }

        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 12px currentColor, 0 0 20px currentColor; opacity: 1; }
          50% { box-shadow: 0 0 20px currentColor, 0 0 35px currentColor; opacity: 0.85; }
        }
        .animate-pulse-dot { animation: pulseDot 2s ease-in-out infinite; }

        @keyframes hubPulse {
          0%, 100% { box-shadow: 0 0 60px rgba(0,255,255,0.3), 0 0 100px rgba(217,70,239,0.15); }
          50% { box-shadow: 0 0 100px rgba(0,255,255,0.6), 0 0 150px rgba(217,70,239,0.3); }
        }
        @keyframes hubRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-hub-pulse { animation: hubPulse 3s ease-in-out infinite; }
        .animate-hub-ring { animation: hubRing 3s ease-out infinite; }

        @keyframes breatheGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }
        .animate-breathe-glow { animation: breatheGlow 5s ease-in-out infinite; }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradientShift 6s ease-in-out infinite;
        }

        @keyframes textGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(0,255,255,0.2)); }
          50% { filter: drop-shadow(0 0 40px rgba(0,255,255,0.5)) drop-shadow(0 0 60px rgba(217,70,239,0.3)); }
        }
        .animate-text-glow { animation: textGlow 4s ease-in-out infinite; }

        @keyframes badgeGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(0,255,255,0); }
          50% { box-shadow: 0 0 20px rgba(0,255,255,0.15); }
        }
        .animate-badge-glow { animation: badgeGlow 4s ease-in-out infinite; }

        @keyframes sparkle {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: 1; }
          50% { transform: rotate(180deg) scale(1.2); opacity: 0.8; }
        }
        .animate-sparkle { animation: sparkle 4s ease-in-out infinite; }

        @keyframes rotateStar {
          0%, 100% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-rotate-star { display: inline-block; animation: rotateStar 8s linear infinite; }

        @keyframes btnGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,255,255,0.1); }
          50% { box-shadow: 0 0 40px rgba(0,255,255,0.3); }
        }
        .animate-btn-glow { animation: btnGlow 3s ease-in-out infinite; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-delay-1 { animation: fadeIn 1s ease-out 0.4s both; }
        .animate-fade-in-delay-2 { animation: fadeIn 1s ease-out 0.6s both; }
        .animate-fade-in-delay-3 { animation: fadeIn 1s ease-out 0.8s both; }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes pulseSlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow { animation: pulseSlow 4s ease-in-out infinite; }

        @keyframes lineGrow {
          0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        .animate-line-grow { animation: lineGrow 3s ease-in-out infinite; }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}