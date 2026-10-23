import Navbar from '../components/Navbar';
import { Mail, Send, MessageSquare } from 'lucide-react';

const GithubIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.94 10.94 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.07.78 2.16v3.21c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[40vw] h-[40vh] bg-cyan-600/10 blur-[120px] pointer-events-none z-0"></div>
      <Navbar />
      <div className="relative z-10 p-8 md:p-20 max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 animate-fade-in-up">
        <div className="w-full lg:w-1/2">
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Contact Us</h1>
          <p className="text-gray-300 mb-8 text-sm md:text-base leading-relaxed">
            Namaste! Main <strong className="text-fuchsia-400 font-bold">Nishant</strong> hoon, Brahmastra AI ka creator. Agar aapko Brahmastra ke baare mein koi sawal hai, ya aap is project mein contribute karna chahte hain, toh mujhse sampark karein.
          </p>
          
          <div className="flex flex-col gap-4">
            <a href="mailto:contact@brahmastra.ai" className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-cyan-400 transition group hover:-translate-x-1 duration-300">
              <Mail className="text-cyan-400 group-hover:scale-110 transition-transform" /> 
              <span className="text-sm tracking-widest uppercase">Email Me</span>
            </a>
            <a href="#" className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:border-fuchsia-400 transition group hover:-translate-x-1 duration-300">
              <GithubIcon size={24} className="text-fuchsia-400 group-hover:scale-110 transition-transform" /> 
              <span className="text-sm tracking-widest uppercase">GitHub Profile</span>
            </a>
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl hover:border-cyan-400/30 transition-colors">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={18} className="text-cyan-400" /> Send a Message</h2>
            <form className="flex flex-col gap-4">
              <input type="text" placeholder="Your Name" className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-cyan-400 transition" />
              <input type="email" placeholder="Your Email" className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-cyan-400 transition" />
              <textarea rows="4" placeholder="Your Message" className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-cyan-400 transition"></textarea>
              <button type="button" className="flex items-center justify-center gap-2 bg-cyan-500 text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition mt-2 transform hover:scale-[1.02] active:scale-95">
                <Send size={16} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}