import Navbar from '../components/Navbar';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';

export default function Journal() {
  return (
    <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden">
      <Navbar />
      <div className="relative z-10 p-8 md:p-20 max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">AI Journal</h1>
        <p className="text-gray-400 mb-12 text-sm md:text-base">Latest news, updates, and deep dives into the world of Brahmastra AI.</p>
        
        <div className="flex flex-col gap-6">
          {[
            { title: "How Brahmastra Handles Context", desc: "A deep dive into how our LLM remembers your previous messages for natural conversations.", time: "5 min read" },
            { title: "The Future of AI Agents", desc: "Why 2026 is the year of autonomous AI agents and how Brahmastra fits into the picture.", time: "8 min read" },
            { title: "Optimizing Streaming Responses", desc: "Learn how we reduced latency by 40% using chunked streaming APIs.", time: "4 min read" },
          ].map((post, index) => (
            <div key={index} className="group p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer hover:bg-white/10">
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 uppercase tracking-wider">
                <span className="flex items-center gap-1"><Calendar size={12} /> Oct 2026</span>
                <span className="flex items-center gap-1"><User size={12} /> Nishant</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {post.time}</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 group-hover:text-cyan-400 transition">{post.title}</h2>
              <p className="text-gray-400 text-sm">{post.desc}</p>
              <div className="mt-4 flex items-center text-cyan-400 text-xs font-bold uppercase tracking-widest">
                Read More <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}