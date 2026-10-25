import { ArrowRight, Sparkles, Play, Zap, User, Globe, Rocket, Orbit, Star, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-[#020206] overflow-x-hidden font-sans text-white selection:bg-fuchsia-500/30">
      
      {}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-purple-900/20 rounded-full blur-[150px] animate-[spin_30s_linear_infinite]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-900/20 rounded-full blur-[150px] animate-[spin_40s_linear_infinite_reverse]"></div>
        <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-fuchsia-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-[pulse_5s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 animate-[slide_60s_linear_infinite]"></div>
        <div className="absolute top-[10%] right-[20%] w-[2px] h-[100px] bg-gradient-to-b from-white to-transparent rotate-45 animate-[shooting_4s_ease-in-out_infinite]"></div>
        <div className="absolute top-[30%] right-[50%] w-[1px] h-[80px] bg-gradient-to-b from-cyan-400 to-transparent rotate-45 animate-[shooting_6s_ease-in-out_infinite_2s]"></div>
        <div className="absolute top-[15%] left-[10%] text-fuchsia-500/20 animate-bounce" style={{ animationDuration: '4s' }}><Star size={40} /></div>
        <div className="absolute bottom-[20%] left-[20%] text-cyan-400/20 animate-[spin_10s_linear_infinite]"><Orbit size={60} /></div>
        <div className="absolute top-[60%] right-[10%] text-blue-500/20 animate-pulse"><Rocket size={50} /></div>
      </div>

      <Navbar />

      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 md:px-20 pt-12 pb-12 gap-8 lg:gap-0 lg:min-h-[calc(100vh-80px)]">
        
        {}
        <div className="w-full lg:w-[55%] flex flex-col justify-center z-20 text-center lg:text-left items-center lg:items-start">
          <p className="text-cyan-400 text-[10px] md:text-xs tracking-[0.4em] uppercase mb-4 flex items-center justify-center lg:justify-start gap-2 animate-pulse">
            <Sparkles size={14} /> A Calmer Tomorrow
          </p>
          
          <h1 className="font-black leading-[0.9] mb-4 w-full flex justify-center lg:justify-start">
            <span className="block text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem] xl:text-[7rem] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-500 drop-shadow-[0_0_40px_rgba(0,255,255,0.2)]">
              BRAHMASTRA
            </span>
          </h1>

          <p className="text-gray-400 text-[10px] md:text-sm tracking-[0.3em] uppercase mb-8 lg:mb-12">Where Creativity <br /> Meets Intelligence</p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button onClick={() => navigate('/chat')} className="group relative flex items-center gap-3 bg-white/5 border border-cyan-400/50 text-cyan-300 px-8 py-4 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-cyan-400 hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] transform hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <Play size={18} className="group-hover:rotate-12 transition-transform" /> 
              View Demo 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-gray-400 hover:text-white px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all hover:bg-white/5 rounded-full border border-transparent hover:border-white/10">
              <LogIn size={16} className="text-fuchsia-500" /> Login / Sign Up
            </button>
          </div>
        </div>

        {}
        <div className="w-full lg:w-[45%] relative flex items-center justify-center mt-4 lg:mt-0 lg:h-[600px]">
          <div className="relative w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] flex items-center justify-center">
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-500/40 via-blue-900/40 to-fuchsia-900/40 backdrop-blur-sm shadow-[inset_-20px_-20px_60px_rgba(0,0,0,0.8),_0_0_80px_rgba(0,255,255,0.2)] border border-white/10 overflow-hidden animate-[spin_60s_linear_infinite]">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30 mix-blend-overlay"></div>
               <div className="absolute top-1/4 left-0 w-full h-10 bg-cyan-400/10 blur-md"></div>
               <div className="absolute bottom-1/3 left-0 w-full h-16 bg-fuchsia-500/10 blur-md"></div>
            </div>
            <div className="absolute inset-0 border border-cyan-400/20 rounded-full animate-[spin_15s_linear_infinite] shadow-[0_0_20px_rgba(0,255,255,0.1)]" style={{ transform: 'rotateX(75deg)' }}></div>
            <div className="absolute inset-[-20px] border border-fuchsia-500/20 rounded-full animate-[spin_25s_linear_infinite_reverse]" style={{ transform: 'rotateX(75deg) rotateZ(20deg)' }}></div>
            <div className="absolute top-[10%] left-[10%] w-6 h-6 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-[spin_10s_linear_infinite]">
               <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-600 rounded-full opacity-50"></div>
            </div>
            <div className="relative z-10 w-20 h-20 md:w-28 md:h-28 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,255,255,0.3)] animate-[pulse_3s_ease-in-out_infinite]">
              <Globe size={40} className="text-cyan-300 animate-[spin_10s_linear_infinite]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
