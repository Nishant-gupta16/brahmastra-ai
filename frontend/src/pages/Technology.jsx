import Navbar from '../components/Navbar';
import { Cpu, Zap, Shield, BrainCircuit, Layers, Database, Gauge } from 'lucide-react';

export default function Technology() {
  const features = [
    { icon: <BrainCircuit size={28} />, border: "hover:border-fuchsia-400/50", bg: "bg-fuchsia-500/20", text: "text-fuchsia-400", title: "Brahmastra Neural Core", desc: "Our proprietary language engine, fine-tuned for deep reasoning, contextual accuracy, and nuanced human-like responses across every domain." },
    { icon: <Zap size={28} />, border: "hover:border-cyan-400/50", bg: "bg-cyan-500/20", text: "text-cyan-400", title: "Real-time Streaming", desc: "Experience zero-lag conversations with our chunk-based streaming API integration. Words appear as they are generated." },
    { icon: <Cpu size={28} />, border: "hover:border-blue-400/50", bg: "bg-blue-500/20", text: "text-blue-400", title: "Advanced Context Memory", desc: "Brahmastra remembers your previous prompts within a session to maintain a natural, flowing conversation." },
    { icon: <Shield size={28} />, border: "hover:border-white/50", bg: "bg-white/10", text: "text-white", title: "Secure Architecture", desc: "Your data is processed securely with end-to-end encryption and modern API key management." },
    { icon: <Layers size={28} />, border: "hover:border-emerald-400/50", bg: "bg-emerald-500/20", text: "text-emerald-400", title: "Layered Reasoning Engine", desc: "Multi-step internal reasoning before every response — delivering more accurate, thoughtful, and structured answers." },
    { icon: <Database size={28} />, border: "hover:border-purple-400/50", bg: "bg-purple-500/20", text: "text-purple-400", title: "Smart Retrieval System", desc: "Context-aware retrieval of relevant information reduces hallucinations and keeps every response grounded and reliable." },
    { icon: <Gauge size={28} />, border: "hover:border-amber-400/50", bg: "bg-amber-500/20", text: "text-amber-400", title: "Low Latency Pipeline", desc: "Optimized request routing and intelligent response caching keep average response time under one second." },
  ];

  return (
    <>
      <style>{`
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>

      <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden hide-scrollbar">
        <div className="fixed bottom-0 left-0 w-[50vw] h-[50vh] bg-fuchsia-600/10 blur-[120px] pointer-events-none z-0"></div>
        <Navbar />

        <div className="relative z-10 p-6 sm:p-8 md:p-14 lg:p-16 max-w-5xl mx-auto animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500 leading-tight">
            Under The Hood
          </h1>
          <p className="text-gray-400 mb-8 sm:mb-10 md:mb-12 max-w-2xl text-sm md:text-sm lg:text-sm">
            Brahmastra is powered by cutting-edge AI technology designed for speed, security, and human-like intelligence.
          </p>

          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
            {features.map((feature, index) => (
              <div key={index} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 md:gap-6 p-5 sm:p-6 md:p-5 rounded-2xl bg-white/5 border border-white/10 ${feature.border} transition-colors hover:bg-white/10`}>
                <div className={`p-3 md:p-3 ${feature.bg} rounded-xl ${feature.text} shrink-0`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-base md:text-base lg:text-lg font-bold mb-1.5 md:mb-1.5">{feature.title}</h3>
                  <p className="text-gray-400 text-xs md:text-xs lg:text-[13px] leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}