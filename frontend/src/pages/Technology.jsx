import Navbar from '../components/Navbar';
import { Cpu, Zap, Shield, BrainCircuit } from 'lucide-react';

export default function Technology() {
  return (
    <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden">
      <div className="fixed bottom-0 left-0 w-[50vw] h-[50vh] bg-fuchsia-600/10 blur-[120px] pointer-events-none z-0"></div>
      <Navbar />
      <div className="relative z-10 p-8 md:p-20 max-w-5xl mx-auto animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Under The Hood</h1>
        <p className="text-gray-400 mb-16 max-w-2xl text-sm md:text-base">Brahmastra is powered by cutting-edge AI technology designed for speed, security, and human-like intelligence.</p>
        
        <div className="flex flex-col gap-8">
          {[
            { icon: <BrainCircuit size={32} />, color: "fuchsia", title: "Gemini 3.8 Flash Engine", desc: "Built on Google's latest LLM architecture, providing lightning-fast responses with deep contextual understanding." },
            { icon: <Zap size={32} />, color: "cyan", title: "Real-time Streaming", desc: "Experience zero-lag conversations with our chunk-based streaming API integration. Words appear as they are generated." },
            { icon: <Cpu size={32} />, color: "blue", title: "Advanced Context Memory", desc: "Brahmastra remembers your previous prompts within a session to maintain a natural, flowing conversation." },
            { icon: <Shield size={32} />, color: "white", title: "Secure Architecture", desc: "Your data is processed securely with end-to-end encryption and modern API key management." },
          ].map((feature, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-${feature.color}-400/50 transition-colors hover:bg-white/10`}>
              <div className={`p-4 bg-${feature.color}-500/20 rounded-xl text-${feature.color}-400`}>{feature.icon}</div>
              <div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}