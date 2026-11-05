import 'regenerator-runtime/runtime';
import {
  Send, Zap, Mic, Image as ImageIcon, MicOff, Sparkles, User, Cpu, ArrowLeft,
  Copy, Volume2, VolumeX, RefreshCw, Share2, Check, Square, Pencil, Trash2,
  MessageSquare, PanelLeftClose, PanelLeft, X, LogIn, Lock
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { speak, stopSpeaking, copyToClipboard, shareText } from '../utils/speech';

const SpeechRec = SpeechRecognition.default || SpeechRecognition;
const LIMIT = 5;
const API_URL = 'https://brahmastra-ai-1.onrender.com/api/chat';

const newLocalChat = () => ({
  id: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
  title: 'New chat',
  updatedAt: Date.now(),
  messages: [],
});

const normalizeUrl = (u) => u.replace(/\/+$/, '');

export default function Chat() {
  const [chatList, setChatList] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [toast, setToast] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const editTextareaRef = useRef(null);

  const abortRef = useRef(null);
  const chatIdRef = useRef(null);
  useEffect(() => { chatIdRef.current = chatId; }, [chatId]);

  const scrollModeRef = useRef('end');
  const lockedScrollTopRef = useRef(0);
  const streamingFollowIdRef = useRef(null);

  const navigate = useNavigate();
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const showToast = (msg, kind = 'info') => {
    setToast({ msg, kind, id: Date.now() });
    setTimeout(() => setToast(null), 2600);
  };

  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const limitReached = userMessageCount >= LIMIT;

  useEffect(() => {
    const setDefault = () => setSidebarOpen(window.innerWidth >= 768);
    setDefault();
    window.addEventListener('resize', setDefault);
    return () => window.removeEventListener('resize', setDefault);
  }, []);

  useEffect(() => {
    if (editingMsgId && editTextareaRef.current) {
      const el = editTextareaRef.current;
      el.focus();
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [editingMsgId]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (scrollModeRef.current === 'lock') {
      el.scrollTop = lockedScrollTopRef.current;
      return;
    }
    if (scrollModeRef.current === 'follow' && streamingFollowIdRef.current) {
      const targetEl = el.querySelector(`[data-streaming-id="${streamingFollowIdRef.current}"]`);
      if (!targetEl) return;
      const elRect = el.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const targetTopRelative = targetRect.top - elRect.top;
      const targetBottomRelative = targetRect.bottom - elRect.top;
      if (targetTopRelative < 0) {
        scrollModeRef.current = 'lock';
        lockedScrollTopRef.current = el.scrollTop;
        return;
      }
      el.scrollTop = el.scrollTop + (targetBottomRelative - el.clientHeight + 16);
      return;
    }
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, chatId]);

  useEffect(() => {
    if (isVoiceMode && listening && transcript.trim().length > 0) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        const voiceMessage = transcript.trim();
        if (voiceMessage.length > 0) {
          setInput(''); resetTranscript(); safeStopListening();
          setIsVoiceMode(false);
          sendMessage(voiceMessage);
        }
      }, 800);
    }
    return () => { if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); };
  }, [transcript, listening, isVoiceMode]);

  const safeStopListening = () => { try { if (SpeechRec?.stopListening) SpeechRec.stopListening(); } catch (e) { console.warn(e); } };
  const safeStartListening = () => { try { if (SpeechRec?.startListening) SpeechRec.startListening({ continuous: true, language: 'en-IN' }); } catch (e) { console.warn(e); } };

  const persistChat = (cid, msgs, title) => {
    setChatList(prev => {
      const exists = prev.find(c => c.id === cid);
      if (exists) {
        return prev.map(c => c.id === cid ? { ...c, messages: msgs, updatedAt: Date.now(), title: title || c.title } : c);
      }
      return [{ id: cid, title: title || 'New chat', updatedAt: Date.now(), messages: msgs }, ...prev];
    });
  };

  const loadMessages = (cid) => {
    const chat = chatList.find(c => c.id === cid);
    if (!chat) return;
    scrollModeRef.current = 'end';
    streamingFollowIdRef.current = null;
    setChatId(cid);
    setMessages(chat.messages);
    if (window.innerWidth < 768) setSidebarOpen(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          lockedScrollTopRef.current = messagesContainerRef.current.scrollTop;
        }
        scrollModeRef.current = 'lock';
      });
    });
  };

  const startNewChat = () => {
    // Demo — new chat is gated behind login
    setShowLoginModal(true);
  };

  const deleteChat = (cid, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (!confirm('Delete this chat?')) return;
    setChatList(prev => prev.filter(c => c.id !== cid));
    if (cid === chatId) { setChatId(null); setMessages([]); }
  };

  // ===== Robust fetch with retries =====
  const fetchStream = async (conversationMessages, signal) => {
    const url = normalizeUrl(API_URL);
    let lastError = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
          },
          body: JSON.stringify({ messages: conversationMessages }),
          signal,
        });

        if (!res.ok) {
          let bodyText = '';
          try { bodyText = await res.text(); } catch { /* ignore */ }
          console.error(`Server responded ${res.status}:`, bodyText);
          throw new Error(`Server returned ${res.status}. ${bodyText.slice(0, 200)}`);
        }

        if (!res.body) {
          throw new Error('Server returned empty body.');
        }

        return res;
      } catch (err) {
        lastError = err;
        if (err.name === 'AbortError') throw err;
        if (attempt < 2) await new Promise(r => setTimeout(r, 800));
      }
    }
    throw lastError || new Error('Network request failed.');
  };

  const streamAssistantReply = async (conversationMessages, targetChatId, insertAt = null, reservedId = null) => {
    if (abortRef.current) return;

    const controller = new AbortController();
    abortRef.current = controller;

    const placeholderId = reservedId || ('stream-' + targetChatId + '-' + Date.now());
    if (insertAt === null) {
      setMessages(prev => [...prev, { id: placeholderId, role: 'assistant', content: '', _streaming: true }]);
    } else {
      setMessages(prev => {
        const copy = [...prev];
        copy.splice(insertAt, 0, { id: placeholderId, role: 'assistant', content: '', _streaming: true });
        return copy;
      });
    }
    streamingFollowIdRef.current = placeholderId;
    scrollModeRef.current = 'follow';
    setIsLoading(true);

    try {
      const response = await fetchStream(conversationMessages, controller.signal);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const copy = [...prev];
          const idx = copy.findIndex(m => m.id === placeholderId);
          if (idx !== -1) copy[idx] = { ...copy[idx], content: assistantContent };
          return copy;
        });
      }

      if (!assistantContent.trim()) {
        assistantContent = '⚠️ No response from server. Please try again.';
      }

      setMessages(prev => {
        const copy = [...prev];
        const idx = copy.findIndex(m => m.id === placeholderId);
        if (idx !== -1) copy[idx] = { id: placeholderId, role: 'assistant', content: assistantContent };
        if (chatIdRef.current === targetChatId) persistChat(targetChatId, copy);
        return copy;
      });

      if (scrollModeRef.current === 'follow' && streamingFollowIdRef.current === placeholderId) {
        const el = messagesContainerRef.current;
        if (el) {
          lockedScrollTopRef.current = el.scrollTop;
          scrollModeRef.current = 'lock';
          streamingFollowIdRef.current = null;
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Stream error:', err);
        const errorMsg = '⚠️ Server error, please try again later.';
        setMessages(prev => {
          const copy = [...prev];
          const idx = copy.findIndex(m => m.id === placeholderId);
          if (idx !== -1) copy[idx] = {
            ...copy[idx],
            id: 'error-' + Date.now(),
            content: errorMsg,
            _streaming: false,
          };
          if (chatIdRef.current === targetChatId) persistChat(targetChatId, copy);
          return copy;
        });
        showToast('Server error — please retry', 'error');
      }
      scrollModeRef.current = 'lock';
      streamingFollowIdRef.current = null;
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsLoading(false);
    }
  };

  const sendMessage = (messageText) => {
    if (!messageText || isLoading) return;

    if (limitReached) {
      setShowLoginModal(true);
      return;
    }

    scrollModeRef.current = 'end';
    streamingFollowIdRef.current = null;

    let activeChatId = chatIdRef.current;
    if (!activeChatId) {
      const nc = newLocalChat();
      nc.title = messageText.slice(0, 40);
      activeChatId = nc.id;
      setChatId(activeChatId);
      chatIdRef.current = activeChatId;
      setChatList(prev => [{ id: nc.id, title: nc.title, updatedAt: Date.now(), messages: [] }, ...prev]);
      setMessages([]);
    }

    const userMsg = { role: 'user', content: messageText, id: 'u-' + Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    persistChat(activeChatId, newMessages, messageText.slice(0, 40));

    streamAssistantReply(newMessages, activeChatId);

    if (isVoiceMode) setTimeout(() => { resetTranscript(); safeStartListening(); }, 100);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (limitReached) { setShowLoginModal(true); return; }
    if (isVoiceMode) { setIsVoiceMode(false); safeStopListening(); }
    sendMessage(input);
    setInput('');
    resetTranscript();
  };

  const handleMicClick = () => {
    if (limitReached) { setShowLoginModal(true); return; }
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
    showToast('📷 Photo upload — Available Soon!');
  };

  const stopGeneration = () => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    setIsLoading(false);
    setMessages(prev => {
      const copy = prev.filter(m => !(m._streaming));
      if (chatIdRef.current) persistChat(chatIdRef.current, copy);
      return copy;
    });
    scrollModeRef.current = 'lock';
    streamingFollowIdRef.current = null;
  };

  const handleCopy = async (msg) => {
    const ok = await copyToClipboard(msg.content);
    if (ok) { setCopiedId(msg.id); setTimeout(() => setCopiedId(null), 1500); }
  };

  const handleSpeak = (msg) => {
    if (speakingId === msg.id) { stopSpeaking(); setSpeakingId(null); }
    else { speak(msg.content); setSpeakingId(msg.id); }
  };

  const handleShare = async (msg) => {
    const ok = await shareText(msg.content);
    if (ok) alert('Shared / copied!');
  };

  const handleRegenerate = () => {
    if (isLoading || !chatId || messages.length < 2) return;
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') { lastUserIdx = i; break; }
    }
    if (lastUserIdx === -1) return;
    const trimmed = messages.slice(0, lastUserIdx + 1);

    if (messagesContainerRef.current) {
      lockedScrollTopRef.current = messagesContainerRef.current.scrollTop;
    }
    scrollModeRef.current = 'lock';
    streamingFollowIdRef.current = null;

    setMessages(trimmed);
    persistChat(chatId, trimmed);

    streamAssistantReply(trimmed, chatId, trimmed.length);
  };

  const startEdit = (msg) => {
    if (!msg.id || msg.id.startsWith('error-') || msg.id.startsWith('stream-')) return;
    setEditingMsgId(msg.id);
    setEditingText(msg.content);
  };

  const cancelEdit = () => { setEditingMsgId(null); setEditingText(''); };

  const commitEdit = (msg) => {
    const cid = chatIdRef.current;
    const newText = editingText.trim();
    if (!cid || !newText || newText === msg.content) { cancelEdit(); return; }
    if (isLoading) { cancelEdit(); return; }

    if (messagesContainerRef.current) {
      lockedScrollTopRef.current = messagesContainerRef.current.scrollTop;
    }
    scrollModeRef.current = 'lock';
    streamingFollowIdRef.current = null;

    const idx = messages.findIndex(m => m.id === msg.id);
    const next = messages[idx + 1];
    const hasNextAssistant = next && next.role === 'assistant';

    const updatedUser = { ...messages[idx], content: newText };
    const newArr = messages.map((m, i) => {
      if (i === idx) return updatedUser;
      if (hasNextAssistant && i === idx + 1) return null;
      return m;
    }).filter(Boolean);

    setMessages(newArr);
    persistChat(cid, newArr);
    setEditingMsgId(null);
    setEditingText('');

    const contextUpTo = messages.slice(0, idx).concat([updatedUser]);
    streamAssistantReply(contextUpTo, cid, idx + 1);
  };

  const handleDeleteMessage = (msg) => {
    const cid = chatIdRef.current;
    if (!msg.id || !cid || msg.id.startsWith('stream-')) return;
    if (!confirm('Delete this message and its AI reply?')) return;

    let filtered;
    if (msg.role === 'user') {
      const idx = messages.findIndex(m => m.id === msg.id);
      const next = messages[idx + 1];
      filtered = messages.filter((m, i) => i !== idx && !(next && next.role === 'assistant' && i === idx + 1));
    } else {
      filtered = messages.filter(m => m.id !== msg.id);
    }
    setMessages(filtered);
    persistChat(cid, filtered);
  };

  const handleHistoryToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="text-white text-center mt-20 px-4">Your browser doesn't support speech recognition. Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.</div>;
  }

  return (
    <div className="relative h-[100dvh] w-full bg-[#020206] text-white font-sans flex overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-purple-900/10 rounded-full blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-900/10 rounded-full blur-[150px] animate-pulse-slow"></div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
      )}

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slide-down pointer-events-none">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl border backdrop-blur-md text-xs font-medium ${
            toast.kind === 'error' ? 'bg-red-500/15 border-red-500/40 text-red-200'
              : toast.kind === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                : 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200'
          }`}>
            {toast.msg}
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:relative top-0 left-0 z-40 h-full flex flex-col bg-[#0a0a0a] border-r border-white/10 transition-transform duration-300 ease-out shrink-0 w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}`}>
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-cyan-400 tracking-wider flex items-center gap-1.5">
            <Zap size={16} /> BRAHMASTRA
          </span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"><X size={16} /></button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 border border-cyan-400/30 flex items-center justify-center mb-5">
            <Lock size={26} className="text-cyan-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Login</h3>
          <p className="text-[11px] text-gray-500 mb-6 leading-relaxed max-w-[200px]">
            Unlock full chat history, save conversations, and access across all your devices.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2 bg-cyan-500 text-black font-bold px-6 py-2.5 rounded-lg hover:bg-cyan-400 transition active:scale-95"
          >
            <LogIn size={16} /> Login
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="shrink-0 border-b border-white/5 bg-[#020206]/90 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={handleHistoryToggle} className="p-1.5 text-gray-400 hover:text-cyan-400 transition-all duration-200 rounded-lg hover:bg-white/5 active:scale-95">
                {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
              </button>

              {!sidebarOpen && (
                <button
                  onClick={startNewChat}
                  className="p-1.5 text-gray-400 hover:text-cyan-400 transition-all duration-200 rounded-lg hover:bg-white/5 active:scale-95"
                  title="New chat"
                >
                  <MessageSquare size={18} />
                </button>
              )}
            </div>
            <Link to="/" className="flex items-center gap-1 text-gray-400 hover:text-cyan-400 transition text-[10px] uppercase tracking-widest">
              <ArrowLeft size={14} /> Back
            </Link>
          </div>
        </header>

        <main ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 py-3 sm:py-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto flex flex-col gap-3 sm:gap-6 min-h-full">
            {isVoiceMode && listening && (
              <div className="sticky top-2 z-10 mx-auto bg-black/60 backdrop-blur-md border border-cyan-400/30 text-cyan-400 text-xs px-4 py-2 rounded-full animate-pulse flex items-center gap-2 animate-slide-down">
                <Mic size={14} /> Listening...
              </div>
            )}

            {messages.length === 0 && !isVoiceMode && (
              <div
                className="flex-1 flex flex-col items-center justify-center text-center opacity-70 px-4 animate-fade-in"
                style={{ minHeight: 'calc(100dvh - 220px)' }}
              >
                <Sparkles size={36} className="text-cyan-400 mb-4 animate-bounce-slow" />
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2">How can I help you today?</h2>
                <p className="text-gray-500 text-xs sm:text-sm max-w-sm">
                  Ask anything — try it out. Login to keep your conversations forever.
                </p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isStreamingMsg = msg._streaming;
              const isLast = i === messages.length - 1;
              const isError = msg.role === 'assistant' && typeof msg.content === 'string' && msg.content.startsWith('⚠️');
              const showAssistantActions = msg.role === 'assistant' && !isStreamingMsg && msg.content;
              const isEditing = editingMsgId === msg.id;
              const showUserActions = msg.role === 'user' && !isEditing && msg.id;

              return (
                <div
                  key={msg.id || i}
                  className={`group flex gap-2 sm:gap-3 w-full animate-msg-in ${msg.role === 'user' ? 'justify-end' : ''}`}
                  data-streaming-id={isStreamingMsg ? msg.id : undefined}
                >
                  {msg.role !== 'user' && (
                    <div className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mt-1">
                      <Cpu size={12} />
                    </div>
                  )}
                  <div className="flex flex-col max-w-[88%] sm:max-w-[85%] min-w-0">
                    <div className={`text-[13px] sm:text-sm leading-relaxed ${msg.role === 'user' ? 'bg-fuchsia-500/10 border border-fuchsia-500/20 text-gray-100 rounded-2xl rounded-tr-sm px-3 sm:px-4 py-2 sm:py-2.5' : 'text-gray-300 markdown-body'} ${isEditing ? 'ring-2 ring-cyan-400/50' : ''} ${isError ? 'text-red-300' : ''}`}>
                      {msg.role === 'user' ? (
                        isEditing ? (
                          <textarea
                            ref={editTextareaRef}
                            value={editingText}
                            onChange={(e) => {
                              setEditingText(e.target.value);
                              const el = e.target;
                              el.style.height = 'auto';
                              el.style.height = el.scrollHeight + 'px';
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(msg); }
                              else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                            }}
                            rows={1}
                            className="w-full bg-transparent border-none outline-none resize-none text-[13px] sm:text-sm text-gray-100 leading-relaxed p-0 m-0 overflow-hidden"
                            style={{ minHeight: '1.5em' }}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        )
                      ) : msg.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                          h1: ({node, ...props}) => <h1 className="text-base sm:text-lg font-bold text-white mt-3 mb-2 first:mt-0" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-[15px] sm:text-base font-bold text-white mt-3 mb-2 first:mt-0" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-[14px] sm:text-[15px] font-semibold text-white mt-2.5 mb-1.5 first:mt-0" {...props} />,
                          h4: ({node, ...props}) => <h4 className="text-[13px] sm:text-sm font-semibold text-gray-200 mt-2 mb-1 first:mt-0" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2.5 last:mb-0 leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-gray-200" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 sm:ml-5 mb-2.5 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-4 sm:ml-5 mb-2.5 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="text-gray-300 leading-relaxed" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-cyan-400/50 pl-3 my-2 text-gray-400 italic" {...props} />,
                          hr: () => <hr className="border-white/10 my-3" />,
                          table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="w-full border-collapse border border-white/10 text-xs" {...props} /></div>,
                          th: ({node, ...props}) => <th className="border border-white/10 bg-white/5 px-2 py-1 text-left font-semibold text-white" {...props} />,
                          td: ({node, ...props}) => <td className="border border-white/10 px-2 py-1 text-gray-300" {...props} />,
                          a: ({node, ...props}) => <a className="text-cyan-400 hover:underline break-all" target="_blank" rel="noreferrer" {...props} />,
                          code: ({node, inline, className, children, ...props}) => {
                            if (inline) {
                              return <code className="bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded text-[12px] break-all" {...props}>{children}</code>;
                            }
                            return (
                              <div className="relative my-2 rounded-lg overflow-hidden border border-white/10 bg-black/80">
                                <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10 text-[10px] text-gray-400">
                                  <span>{className?.replace('language-', '') || 'code'}</span>
                                  <CopyCode text={String(children)} />
                                </div>
                                <pre className="p-3 overflow-x-auto text-[12px] leading-relaxed"><code {...props}>{children}</code></pre>
                              </div>
                            );
                          }
                        }}>{msg.content}</ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-1 py-1">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                      )}
                    </div>

                    {showUserActions && (
                      <div className="flex items-center gap-0.5 mt-1 self-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        <MsgButton title="Edit" onClick={() => startEdit(msg)} icon={<Pencil size={13} />} />
                        <MsgButton title="Copy" onClick={() => handleCopy(msg)} icon={copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />} />
                        <MsgButton title="Delete" onClick={() => handleDeleteMessage(msg)} icon={<Trash2 size={13} />} danger />
                      </div>
                    )}

                    {isEditing && (
                      <div className="flex items-center justify-end gap-1.5 mt-1.5 animate-slide-up">
                        <button onClick={cancelEdit} className="px-2.5 py-1 text-[11px] rounded-md bg-white/5 text-gray-300 hover:bg-white/10 transition">Cancel</button>
                        <button onClick={() => commitEdit(msg)} className="px-2.5 py-1 text-[11px] rounded-md bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition active:scale-95">Save & Regenerate</button>
                      </div>
                    )}

                    {showAssistantActions && (
                      <div className="flex items-center gap-0.5 mt-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        <MsgButton title="Copy" onClick={() => handleCopy(msg)} icon={copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />} />
                        {!isError && (
                          <MsgButton title={speakingId === msg.id ? 'Stop' : 'Read aloud'} onClick={() => handleSpeak(msg)} icon={speakingId === msg.id ? <VolumeX size={14} /> : <Volume2 size={14} />} />
                        )}
                        {!isError && (
                          <MsgButton title="Share" onClick={() => handleShare(msg)} icon={<Share2 size={14} />} />
                        )}
                        {(isLast || isError) && !isStreamingMsg && <MsgButton title="Regenerate" onClick={handleRegenerate} icon={<RefreshCw size={14} />} />}
                        <MsgButton title="Delete" onClick={() => handleDeleteMessage(msg)} icon={<Trash2 size={14} />} danger />
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 mt-1">
                      <User size={12} />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        </main>

        <div className="shrink-0 p-2 sm:p-3 bg-[#020206]/90 backdrop-blur-md border-t border-white/5">
          {limitReached && (
            <div className="max-w-3xl mx-auto mb-2 flex items-center justify-between gap-3 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-400/30 rounded-xl px-3 py-2.5 animate-slide-up">
              <div className="flex items-center gap-2 min-w-0">
                <Lock size={14} className="text-cyan-400 shrink-0" />
                <p className="text-[11px] sm:text-xs text-gray-300 leading-tight">
                  You've reached the free limit. <span className="text-cyan-400 font-semibold">Login</span>
                </p>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="shrink-0 flex items-center gap-1 bg-cyan-500 text-black text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-cyan-400 transition active:scale-95"
              >
                <LogIn size={12} /> Login
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-1 sm:gap-1.5 bg-white/5 rounded-2xl p-1.5 sm:p-2 border border-white/10 focus-within:border-cyan-400/40 transition-all duration-200 items-center">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={() => {}} className="hidden" />
            <button
              type="button"
              onClick={handlePhotoClick}
              disabled={limitReached}
              title="Photo upload"
              className="p-1.5 sm:p-2 text-gray-500 hover:text-cyan-400 transition rounded-lg hover:bg-white/5 shrink-0 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ImageIcon size={18} />
            </button>
            <button
              type="button"
              onClick={handleMicClick}
              disabled={limitReached}
              className={`relative p-1.5 sm:p-2 rounded-lg transition shrink-0 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed ${isVoiceMode ? 'text-red-400 bg-red-500/10' : 'text-gray-500 hover:text-cyan-400 hover:bg-white/5'}`}
            >
              {isVoiceMode && <span className="absolute inset-0 rounded-lg border border-red-500/50 animate-ping" />}
              {isVoiceMode ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={limitReached}
              placeholder={limitReached ? "Login to continue..." : (isVoiceMode ? (listening ? "Listening..." : "Speak now...") : "Message Brahmastra...")}
              className="flex-1 bg-transparent px-1 sm:px-2 outline-none text-white placeholder-gray-600 text-sm min-w-0 disabled:cursor-not-allowed"
            />
            {isLoading ? (
              <button type="button" onClick={stopGeneration} className="p-1.5 sm:p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shrink-0 active:scale-90" title="Stop generating">
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim() || limitReached} className="p-1.5 sm:p-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition disabled:opacity-30 disabled:bg-gray-700 shrink-0 active:scale-90"><Send size={16} /></button>
            )}
          </form>
          <p className="text-center text-[9px] sm:text-[10px] text-gray-600 mt-1.5 sm:mt-2">
            {limitReached
              ? <button onClick={() => setShowLoginModal(true)} className="text-cyan-400 hover:underline">Login</button>
              : <>Free trial — {LIMIT - userMessageCount} message{LIMIT - userMessageCount !== 1 ? 's' : ''} remaining. <button onClick={() => setShowLoginModal(true)} className="text-cyan-400 hover:underline">Login</button></>
            }
          </p>
        </div>
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} navigate={navigate} />}
    </div>
  );
}

function LoginModal({ onClose, navigate }) {
  const handleGoToLogin = (signup = false) => {
    navigate(signup ? '/login?mode=signup' : '/login');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Lock size={16} className="text-cyan-400" /> Login
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="text-center mb-5">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center mb-3">
              <Zap size={22} className="text-black" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Login</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Save chats, access history, and continue across devices.
            </p>
          </div>

          <button
            onClick={() => handleGoToLogin(false)}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-black font-bold py-2.5 rounded-lg hover:bg-cyan-400 transition active:scale-[0.98]"
          >
            <LogIn size={16} /> Login
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Don't have an account?{' '}
            <button
              onClick={() => handleGoToLogin(true)}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Sign up
            </button>
          </p>

          <p className="text-center text-[10px] text-gray-600 mt-3 leading-relaxed">
            By continuing you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function MsgButton({ title, onClick, icon, danger }) {
  return (
    <button onClick={onClick} title={title} className={`p-1.5 rounded-md transition-all duration-150 hover:bg-white/10 active:scale-90 ${danger ? 'text-gray-500 hover:text-red-400' : 'text-gray-500 hover:text-cyan-400'}`}>
      {icon}
    </button>
  );
}

function CopyCode({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        const ok = await copyToClipboard(text);
        if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
      }}
      className="flex items-center gap-1 hover:text-cyan-400 transition"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}