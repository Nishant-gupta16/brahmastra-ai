import { ArrowRight, Sparkles, Play, Zap, Send, Bot, User, Globe, Rocket, Orbit, Star } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!response.ok) throw new Error('Network error');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const textChunk = decoder.decode(value, { stream: true });
        assistantContent += textChunk;
        
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: assistantContent };
          return copy;
        });
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Could not connect to the backend." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020206] overflow-x-hidden font-sans text-white selection:bg-fuchsia-500/30">
      
      {/* 🌌 SPACE BACKGROUND */}
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
        
        {/* LEFT SIDE */}
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
            <button onClick={() => setShowChat(true)} className="group relative flex items-center gap-3 bg-white/5 border border-cyan-400/50 text-cyan-300 px-8 py-4 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-cyan-400 hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] transform hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <Zap size={18} className="group-hover:rotate-12 transition-transform" /> 
              Start AI 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="flex items-center gap-2 text-gray-400 hover:text-white px-6 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all hover:bg-white/5 rounded-full border border-transparent hover:border-white/10">
              <Play size={16} className="text-fuchsia-500" /> View Demo
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Planet Visual */}
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

      {/* CHAT OVERLAY */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="w-full max-w-2xl h-[85vh] bg-[#0a0a0a]/90 border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(0,255,255,0.15)] flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">
            
            <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
              <span className="text-cyan-400 font-bold flex items-center gap-3 tracking-[0.2em] text-sm uppercase">
                <Zap size={18} className="animate-pulse" /> BRAHMASTRA AI
              </span>
              <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white text-xl transition-transform hover:rotate-90">✕</button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-gray-500 text-xs text-center mt-10 tracking-widest uppercase animate-fade-in-up">
                  Brahmastra is active. Ask anything...
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''} animate-[fadeInUp_0.4s_ease-out]`}>
                  <div className={`p-3 rounded-full h-fit border ${msg.role === 'user' ? 'border-fuchsia-500/30 bg-fuchsia-500/10' : 'border-cyan-400/30 bg-cyan-400/10'}`}>
                    {msg.role === 'user' ? <User size={18} className="text-fuchsia-400" /> : <Bot size={18} className="text-cyan-400" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${msg.role === 'user' ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-gray-200 rounded-tr-sm' : 'bg-white/5 border-white/10 text-gray-300 rounded-tl-sm'}`}>
                    
                    {/* ✅ Yahan ReactMarkdown use kiya hai formatting ke liye */}
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-cyan-300" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 text-cyan-300" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-1 text-cyan-300" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                        code: ({node, inline, ...props}) => 
                          inline ? <code className="bg-black/50 px-1 py-0.5 rounded text-fuchsia-400 text-xs" {...props} /> 
                                 : <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto text-xs my-2 border border-white/10"><code {...props} /></pre>
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>

                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 max-w-[85%] animate-[fadeInUp_0.4s_ease-out]">
                  <div className="p-3 rounded-full h-fit border border-cyan-400/30 bg-cyan-400/10">
                    <Bot size={18} className="text-cyan-400 animate-bounce" />
                  </div>
                  <div className="p-4 rounded-2xl text-sm bg-white/5 border border-white/10 text-cyan-400 rounded-tl-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    <span className="ml-2 text-gray-400">Brahmastra is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-5 border-t border-white/10 bg-black/20">
              <div className="flex gap-3 bg-white/5 rounded-xl p-2 border border-white/10 focus-within:border-cyan-400/50 focus-within:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Type your message..." 
                  className="flex-1 bg-transparent px-4 outline-none text-white placeholder-gray-600 text-sm" 
                />
                <button type="submit" disabled={isLoading} className="p-3 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg hover:bg-fuchsia-500 hover:text-white transition-all disabled:opacity-50 transform active:scale-90">
                  <Send size={18} className={isLoading ? 'animate-pulse' : ''} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}