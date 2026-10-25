import 'regenerator-runtime/runtime';
import { ArrowLeft, Send, Zap, Mic, Image as ImageIcon, MicOff, Sparkles, User, Cpu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const SpeechRec = SpeechRecognition.default || SpeechRecognition;

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const silenceTimerRef = useRef(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    const savedMessages = sessionStorage.getItem('brahmastra_chat');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('brahmastra_chat', JSON.stringify(messages));
    } else {
      sessionStorage.removeItem('brahmastra_chat');
    }
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isVoiceMode && listening && transcript.trim().length > 0) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        const voiceMessage = transcript.trim();
        if (voiceMessage.length > 0) {
          setInput('');
          resetTranscript();
          safeStopListening();
          sendMessage(voiceMessage);
        }
      }, 800); 
    }
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [transcript, listening, isVoiceMode]);

  const safeStopListening = () => {
    try {
      if (SpeechRec && typeof SpeechRec.stopListening === 'function') {
        SpeechRec.stopListening();
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const safeStartListening = () => {
    try {
      if (SpeechRec && typeof SpeechRec.startListening === 'function') {
        SpeechRec.startListening({ continuous: true, language: 'en-IN' });
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText || isLoading) return;
    const userMsg = { role: 'user', content: messageText };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('https://brahmastra-ai-1.onrender.com/api/chat', {
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
      if (isVoiceMode) {
        setTimeout(() => {
          resetTranscript();
          safeStartListening(); 
        }, 100); 
      }
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (isVoiceMode) {
      setIsVoiceMode(false);
      safeStopListening();
    }
    sendMessage(input);
    setInput('');
    resetTranscript();
  };

  const handleMicClick = () => {
    if (isVoiceMode) {
      setIsVoiceMode(false);
      safeStopListening();
      resetTranscript();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    } else {
      setIsVoiceMode(true);
      resetTranscript();
      safeStartListening(); 
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) alert(`Photo selected: ${file.name}. Photo analysis coming soon!`);
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-white text-center mt-20 px-4">
        Your browser doesn't support speech recognition. Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full bg-[#020206] text-white font-sans selection:bg-fuchsia-500/30 flex flex-col overflow-hidden">
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-purple-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-900/10 rounded-full blur-[150px]"></div>
      </div>

      <header className="relative z-50 w-full border-b border-white/5 bg-[#020206]/90 backdrop-blur-md shrink-0">
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft size={20} />
            <span className="text-xs font-bold tracking-widest uppercase hidden sm:block">Back</span>
          </Link>
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-[0.2em] text-sm uppercase">
            <Zap size={18} className="animate-pulse" /> BRAHMASTRA AI
          </div>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex justify-center w-full px-2 sm:px-4 overflow-hidden">
        <div className="w-full max-w-4xl flex flex-col bg-white/5 border-x-0 sm:border border-white/10 sm:rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.05)] backdrop-blur-xl overflow-hidden">
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex flex-col gap-5 custom-scrollbar w-full">
            
            {isVoiceMode && (
              <div className="sticky top-0 z-10 mx-auto bg-black/60 backdrop-blur-md border border-cyan-400/30 text-cyan-400 text-xs font-medium px-4 py-2 rounded-full animate-pulse flex items-center gap-2 shadow-lg">
                <Mic size={14} /> {listening ? "Listening..." : isLoading ? "Thinking..." : "Mic is active"}
              </div>
            )}

            {messages.length === 0 && !isVoiceMode && (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-70 mt-10">
                <Sparkles size={40} className="text-cyan-400 mb-4 animate-bounce" />
                <h2 className="text-xl font-bold text-white mb-2">How can I help you today?</h2>
                <p className="text-gray-400 text-sm max-w-sm">Ask anything, upload an image, or click the mic to speak.</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 sm:gap-4 w-full max-w-full ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                
                <div className={`shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-400' 
                    : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Cpu size={18} />}
                </div>
                
                <div className={`p-3 sm:p-4 rounded-2xl text-sm leading-relaxed border max-w-[85%] sm:max-w-[80%] break-words overflow-hidden
                  ${msg.role === 'user' 
                    ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-gray-100 rounded-tr-sm' 
                    : 'bg-[#0a0a0a]/80 border-white/10 text-gray-300 rounded-tl-sm shadow-md'}`}>
                  
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => {
                        const hasCode = node.children.some(child => 
                          child.tagName === 'code' || child.tagName === 'pre'
                        );
                        if (hasCode) return <div className="mb-2 last:mb-0" {...props} />;
                        return <p className="mb-2 last:mb-0" {...props} />;
                      },
                      strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                      a: ({node, ...props}) => <a className="text-cyan-400 hover:underline break-all" {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline ? <code className="bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded text-xs break-all" {...props} /> 
                               : <div className="w-full overflow-x-auto my-2"><pre className="bg-black/80 p-3 rounded-lg text-xs border border-white/10"><code {...props} /></pre></div>
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 sm:gap-4 max-w-[90%]">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-cyan-500/30 bg-cyan-500/20 text-cyan-400">
                  <Cpu size={18} className="animate-bounce" />
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-[#0a0a0a]/80 border border-white/10 rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-2 sm:p-4 bg-[#020206]/90 backdrop-blur-md border-t border-white/5 shrink-0">
            <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-1 sm:gap-2 bg-white/5 rounded-xl p-1.5 sm:p-2 border border-white/10 focus-within:border-cyan-400/50 transition-all items-center">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              
              <button type="button" onClick={handlePhotoClick} className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
                <ImageIcon size={18} />
              </button>

              <button 
                type="button" 
                onClick={handleMicClick} 
                className={`relative p-2 transition-all rounded-full ${
                  isVoiceMode 
                    ? 'text-white bg-red-500/20 shadow-[0_0_20px_rgba(255,0,0,0.5)]' 
                    : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10'
                }`}
              >
                {isVoiceMode && (
                  <span className="absolute inset-0 rounded-full border-2 border-red-500/50 animate-ping"></span>
                )}
                {isVoiceMode ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder={isVoiceMode ? (listening ? "Listening..." : "Processing...") : "Type message..."} 
                className="flex-1 bg-transparent px-1 outline-none text-white placeholder-gray-600 text-sm min-w-0" 
              />
              
              <button type="submit" disabled={isLoading || !input.trim()} className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-black transition-all disabled:opacity-30 transform active:scale-95">
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}