import Navbar from '../components/Navbar';
import { Sparkles, ArrowUpRight, Brain, Code, FileText } from 'lucide-react';

export default function Explore() {
  return (
    <>
      <style>{`
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>

      <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden hide-scrollbar">
        <div className="fixed top-0 right-0 w-[50vw] h-full bg-gradient-to-l from-cyan-600/10 to-transparent blur-[120px] pointer-events-none z-0"></div>
        <Navbar />

        <div className="relative z-10 p-6 sm:p-8 md:p-14 lg:p-16 max-w-6xl mx-auto animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 leading-tight">
            Explore AI Capabilities
          </h1>
          <p className="text-gray-400 mb-8 sm:mb-10 md:mb-12 max-w-2xl text-sm md:text-sm lg:text-sm">
            Discover what Brahmastra can do. From writing code to generating creative ideas, explore the full potential of our AI.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {[
              { title: "Creative Writing", desc: "Generate blogs, stories, and emails with human-like tone.", icon: <FileText /> },
              { title: "Code Generation", desc: "Write complex React, Python, or Node.js code instantly.", icon: <Code /> },
              { title: "Idea Brainstorming", desc: "Get creative ideas for your business or project.", icon: <Brain /> },
              { title: "Language Translation", desc: "Translate text seamlessly across 100+ languages.", icon: <Sparkles /> },
              { title: "Data Analysis", desc: "Analyze complex datasets and get instant insights.", icon: <Brain /> },
              { title: "Image Prompting", desc: "Generate high-quality image prompts for Midjourney/DALL-E.", icon: <Sparkles /> },
            ].map((item, index) => (
              <div key={index} className="group p-5 sm:p-6 md:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-white/10 transition-all cursor-pointer hover:-translate-y-1 duration-300">
                <div className="text-cyan-400 mb-3 md:mb-3">{item.icon}</div>
                <h3 className="text-base md:text-base lg:text-base font-bold mb-2">{item.title}</h3>
                <p className="text-xs md:text-xs lg:text-[13px] text-gray-400 leading-relaxed">{item.desc}</p>
                <div className="mt-4 flex items-center text-[10px] md:text-[10px] lg:text-[10px] text-cyan-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Try Now <ArrowUpRight size={14} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}