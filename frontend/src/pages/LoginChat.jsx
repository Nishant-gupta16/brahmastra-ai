import 'regenerator-runtime/runtime';
import {
  Send, Zap, Mic, Image as ImageIcon, MicOff, Sparkles, User, Cpu, LogOut, Plus,
  MessageSquare, Settings, Trash2, X, MoreHorizontal, PanelLeftClose, PanelLeft,
  Shield, Bell, Trash, Copy, Volume2, VolumeX, RefreshCw, Share2, Pin, PinOff,
  Check, Search, Info, Mail, Key, ChevronRight, Square, Pencil, RotateCcw, AlertTriangle
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  collection, doc, addDoc, getDocs, query, orderBy, serverTimestamp,
  deleteDoc, updateDoc, writeBatch
} from 'firebase/firestore';
import { speak, stopSpeaking, copyToClipboard, shareText } from '../utils/speech';
import emailjs from '@emailjs/browser';

const SpeechRec = SpeechRecognition.default || SpeechRecognition;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const API_URL = 'https://brahmastra-ai-1.onrender.com/api/chat';

const groupChatsByDate = (chats) => {
  const pinned = chats.filter(c => c.pinned);
  const rest = chats.filter(c => !c.pinned);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const groups = { pinned: [], today: [], yesterday: [], previous: [] };
  groups.pinned = pinned;
  rest.forEach(c => {
    const d = c.updatedAt?.toDate ? c.updatedAt.toDate() : new Date(c.updatedAt || 0);
    if (d >= today) groups.today.push(c);
    else if (d >= yesterday) groups.yesterday.push(c);
    else groups.previous.push(c);
  });
  return groups;
};

const daysLeft = (deletedAt) => {
  if (!deletedAt) return 0;
  const d = deletedAt?.toDate ? deletedAt.toDate() : new Date(deletedAt);
  return Math.max(0, Math.ceil((SEVEN_DAYS_MS - (Date.now() - d.getTime())) / (24 * 60 * 60 * 1000)));
};

const nextOrder = (msgs) => {
  if (!msgs.length) return 0;
  return Math.max(...msgs.map(m => typeof m.order === 'number' ? m.order : 0)) + 1;
};

const normalizeUrl = (u) => u.replace(/\/+$/, '');

export default function LoginChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [binnedChats, setBinnedChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBin, setShowBin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [hoveredChatId, setHoveredChatId] = useState(null);

  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [contactStatus, setContactStatus] = useState('');

  const contactFormRef = useRef();
  const editTextareaRef = useRef(null);
  const streamsRef = useRef(new Map());
  const [streamingChats, setStreamingChats] = useState(new Set());

  const chatIdRef = useRef(null);
  useEffect(() => { chatIdRef.current = chatId; }, [chatId]);

  const messagesRef = useRef([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const profileMenuRef = useRef(null);

  const scrollModeRef = useRef('end');
  const lockedScrollTopRef = useRef(0);
  const streamingFollowIdRef = useRef(null);

  const navigate = useNavigate();
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const isLoading = chatId ? streamingChats.has(chatId) : false;

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind, id: Date.now() });
    setTimeout(() => setToast(null), 2600);
  };

  const askConfirm = ({ title, message, confirmText = 'Delete', danger = true, onConfirm }) => {
    setConfirmState({ title, message, confirmText, danger, onConfirm });
  };

  const sendContactEmail = (e) => {
    e.preventDefault();
    setContactStatus('sending');
    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        contactFormRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        setContactStatus('success');
        contactFormRef.current.reset();
        setTimeout(() => {
          setShowContactPopup(false);
          setContactStatus('');
        }, 2000);
      })
      .catch((err) => {
        console.error('Email send failed:', err);
        setContactStatus('error');
      });
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/login');
      else setCurrentUser(user);
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => { if (currentUser) loadChatList(); }, [currentUser]);

  useEffect(() => {
    const setDefault = () => setSidebarOpen(window.innerWidth >= 768);
    setDefault();
    window.addEventListener('resize', setDefault);
    return () => window.removeEventListener('resize', setDefault);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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

  const loadChatList = async () => {
    try {
      const chatsRef = collection(db, 'users', currentUser.uid, 'chats');
      const q = query(chatsRef, orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const active = [];
      const binned = [];
      const toPurge = [];
      const now = Date.now();

      for (const c of all) {
        if (c.deletedAt) {
          const delMs = c.deletedAt?.toDate ? c.deletedAt.toDate().getTime() : new Date(c.deletedAt).getTime();
          if (now - delMs >= SEVEN_DAYS_MS) toPurge.push(c);
          else binned.push(c);
        } else {
          active.push(c);
        }
      }

      if (toPurge.length > 0) {
        (async () => {
          for (const c of toPurge) {
            try {
              const msgsRef = collection(db, 'users', currentUser.uid, 'chats', c.id, 'messages');
              const msgsSnap = await getDocs(msgsRef);
              const batch = writeBatch(db);
              msgsSnap.docs.forEach(m => batch.delete(m.ref));
              batch.delete(doc(db, 'users', currentUser.uid, 'chats', c.id));
              await batch.commit();
            } catch (e) { console.error('Purge error:', e); }
          }
        })();
      }

      setChatList(active);
      setBinnedChats(binned);
    } catch (err) { console.error('Chat list error:', err); }
  };

  const loadMessages = async (cid) => {
    try {
      const msgsRef = collection(db, 'users', currentUser.uid, 'chats', cid, 'messages');
      const snap = await getDocs(msgsRef);
      let loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      loaded.sort((a, b) => {
        const ao = typeof a.order === 'number' ? a.order : -1;
        const bo = typeof b.order === 'number' ? b.order : -1;
        if (ao !== -1 && bo !== -1) return ao - bo;
        const at = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bt = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return at - bt;
      });

      const stream = streamsRef.current.get(cid);
      if (stream && stream.active) {
        loaded.push({
          id: 'stream-' + cid,
          role: 'assistant',
          content: stream.buffer || '',
          _streaming: true,
          order: nextOrder(loaded),
        });
      }

      scrollModeRef.current = 'end';
      streamingFollowIdRef.current = null;
      setChatId(cid);
      setMessages(loaded);
      messagesRef.current = loaded;
      if (window.innerWidth < 768) setSidebarOpen(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (messagesContainerRef.current) {
            lockedScrollTopRef.current = messagesContainerRef.current.scrollTop;
          }
          scrollModeRef.current = 'lock';
        });
      });
    } catch (err) { console.error('Messages load error:', err); }
  };

  const startNewChat = () => {
    scrollModeRef.current = 'end';
    streamingFollowIdRef.current = null;
    setChatId(null);
    setMessages([]);
    messagesRef.current = [];
    setEditingMsgId(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const moveToBin = async (cid, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const stream = streamsRef.current.get(cid);
    if (stream?.controller) stream.controller.abort();
    streamsRef.current.delete(cid);
    setStreamingChats(prev => { const s = new Set(prev); s.delete(cid); return s; });

    const chat = chatList.find(c => c.id === cid);
    if (chat) {
      setChatList(prev => prev.filter(c => c.id !== cid));
      setBinnedChats(prev => [{ ...chat, deletedAt: new Date() }, ...prev]);
    }
    if (cid === chatId) { setChatId(null); setMessages([]); messagesRef.current = []; }

    showToast('Chat moved to bin', 'success');
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'chats', cid), { deletedAt: serverTimestamp() });
    } catch (err) {
      console.error('Move to bin error:', err);
      showToast('Failed to move to bin', 'error');
      await loadChatList();
    }
  };

  const restoreFromBin = async (cid, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const chat = binnedChats.find(c => c.id === cid);
    if (chat) {
      setBinnedChats(prev => prev.filter(c => c.id !== cid));
      setChatList(prev => [{ ...chat, deletedAt: null }, ...prev]);
    }
    showToast('Chat restored', 'success');
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'chats', cid), { deletedAt: null });
    } catch (err) {
      console.error('Restore error:', err);
      showToast('Failed to restore', 'error');
      await loadChatList();
    }
  };

  const permanentlyDelete = (cid, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const chat = binnedChats.find(c => c.id === cid);
    askConfirm({
      title: 'Delete forever?',
      message: `"${chat?.title || 'This chat'}" will be permanently deleted. This cannot be undone.`,
      confirmText: 'Delete forever',
      danger: true,
      onConfirm: async () => {
        setBinnedChats(prev => prev.filter(c => c.id !== cid));
        if (cid === chatId) { setChatId(null); setMessages([]); messagesRef.current = []; }
        showToast('Chat deleted permanently', 'success');
        try {
          const msgsRef = collection(db, 'users', currentUser.uid, 'chats', cid, 'messages');
          const snap = await getDocs(msgsRef);
          const batch = writeBatch(db);
          snap.docs.forEach(d => batch.delete(d.ref));
          batch.delete(doc(db, 'users', currentUser.uid, 'chats', cid));
          await batch.commit();
        } catch (err) {
          console.error('Permanent delete error:', err);
          showToast('Failed to delete', 'error');
          await loadChatList();
        }
      }
    });
  };

  const clearBin = () => {
    const count = binnedChats.length;
    askConfirm({
      title: 'Empty bin?',
      message: `${count} chat${count !== 1 ? 's' : ''} will be permanently deleted. This cannot be undone.`,
      confirmText: 'Empty bin',
      danger: true,
      onConfirm: async () => {
        const snapshot = [...binnedChats];
        setBinnedChats([]);
        showToast('Bin emptied', 'success');
        try {
          for (const c of snapshot) {
            const msgsRef = collection(db, 'users', currentUser.uid, 'chats', c.id, 'messages');
            const snap = await getDocs(msgsRef);
            const batch = writeBatch(db);
            snap.docs.forEach(d => batch.delete(d.ref));
            batch.delete(doc(db, 'users', currentUser.uid, 'chats', c.id));
            await batch.commit();
          }
        } catch (err) { console.error('Clear bin error:', err); await loadChatList(); }
      }
    });
  };

  const togglePin = async (cid, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const chat = chatList.find(c => c.id === cid) || binnedChats.find(c => c.id === cid);
    if (!chat) return;
    const newPinned = !chat.pinned;

    setChatList(prev => prev.map(c => c.id === cid ? { ...c, pinned: newPinned } : c));
    setBinnedChats(prev => prev.map(c => c.id === cid ? { ...c, pinned: newPinned } : c));

    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'chats', cid), { pinned: newPinned });
    } catch (err) {
      console.error('Pin error:', err);
      setChatList(prev => prev.map(c => c.id === cid ? { ...c, pinned: !newPinned } : c));
      setBinnedChats(prev => prev.map(c => c.id === cid ? { ...c, pinned: !newPinned } : c));
    }
  };

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
  }, [messages, streamingChats, chatId]);

  useEffect(() => {
    if (isVoiceMode && listening && transcript.trim().length > 0) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        const voiceMessage = transcript.trim();
        if (voiceMessage.length > 0) {
          setInput(''); resetTranscript(); safeStopListening();
          sendMessage(voiceMessage);
        }
      }, 800);
    }
    return () => { if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); };
  }, [transcript, listening, isVoiceMode]);

  // 🔥 MIC FIX: jab bhi voice mode band ho, actual mic ko forcefully band karo
  useEffect(() => {
    if (!isVoiceMode) {
      try {
        if (SpeechRec?.stopListening) SpeechRec.stopListening();
      } catch (e) { /* ignore */ }
    }
  }, [isVoiceMode]);

  // 🔥 MIC FIX: unmount / tab switch / tab close par mic release
  useEffect(() => {
    const cleanup = () => {
      try {
        if (SpeechRec?.stopListening) SpeechRec.stopListening();
      } catch (e) { /* ignore */ }
    };
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cleanup();
    });
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      window.removeEventListener('pagehide', cleanup);
      cleanup();
    };
  }, []);

  const safeStopListening = () => { try { if (SpeechRec?.stopListening) SpeechRec.stopListening(); } catch (e) { console.warn(e); } };
  const safeStartListening = () => { try { if (SpeechRec?.startListening) SpeechRec.startListening({ continuous: true, language: 'en-IN' }); } catch (e) { console.warn(e); } };

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
          try { bodyText = await res.text(); } catch { }
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

  const stopStreamForChat = async (cid) => {
    const stream = streamsRef.current.get(cid);
    if (!stream) return;
    if (stream.controller) stream.controller.abort();
    const partial = (stream.buffer || '').trim();
    if (partial && currentUser) {
      try {
        const msgsRef = collection(db, 'users', currentUser.uid, 'chats', cid, 'messages');
        await addDoc(msgsRef, {
          role: 'assistant',
          content: partial + '\n\n_[Stopped by user]_',
          createdAt: serverTimestamp(),
          order: nextOrder(messagesRef.current),
        });
        await updateDoc(doc(db, 'users', currentUser.uid, 'chats', cid), { updatedAt: serverTimestamp() });
      } catch (e) { console.error(e); }
    }
    streamsRef.current.delete(cid);
    setStreamingChats(prev => { const s = new Set(prev); s.delete(cid); return s; });

    if (chatIdRef.current === cid) {
      setMessages(prev => {
        const copy = prev.filter(m => !m.id.startsWith('stream-'));
        messagesRef.current = copy;
        return copy;
      });
    }
  };

  const updateChatInList = (cid, patch) => {
    setChatList(prev => prev.map(c => c.id === cid ? { ...c, ...patch } : c));
  };

  const streamAssistantReply = async (conversationMessages, targetChatId) => {
    if (streamsRef.current.has(targetChatId)) return;

    const controller = new AbortController();
    streamsRef.current.set(targetChatId, { controller, buffer: '', active: true });
    setStreamingChats(prev => new Set(prev).add(targetChatId));

    const placeholderId = 'stream-' + targetChatId;
    const baseOrder = nextOrder(messagesRef.current);

    if (chatIdRef.current === targetChatId) {
      setMessages(prev => {
        const copy = [...prev, {
          id: placeholderId,
          role: 'assistant',
          content: '',
          _streaming: true,
          order: baseOrder,
        }];
        messagesRef.current = copy;
        return copy;
      });
      streamingFollowIdRef.current = placeholderId;
      scrollModeRef.current = 'follow';
    }

    try {
      const response = await fetchStream(conversationMessages, controller.signal);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });

        const stream = streamsRef.current.get(targetChatId);
        if (stream) stream.buffer = assistantContent;

        if (chatIdRef.current === targetChatId) {
          setMessages(prev => {
            const copy = [...prev];
            const idx = copy.findIndex(m => m.id === placeholderId);
            if (idx !== -1) copy[idx] = { ...copy[idx], content: assistantContent };
            messagesRef.current = copy;
            return copy;
          });
        }
      }

      if (!assistantContent.trim()) {
        assistantContent = '⚠️ No response from server. Please try again.';
      }

      const msgsRef = collection(db, 'users', currentUser.uid, 'chats', targetChatId, 'messages');
      const saved = await addDoc(msgsRef, {
        role: 'assistant',
        content: assistantContent,
        createdAt: serverTimestamp(),
        order: baseOrder,
      });
      await updateDoc(doc(db, 'users', currentUser.uid, 'chats', targetChatId), {
        updatedAt: serverTimestamp(),
        messageCount: conversationMessages.length + 1,
      });

      if (chatIdRef.current === targetChatId) {
        setMessages(prev => {
          const copy = [...prev];
          const idx = copy.findIndex(m => m.id === placeholderId);
          if (idx !== -1) copy[idx] = { id: saved.id, role: 'assistant', content: assistantContent, order: baseOrder };
          messagesRef.current = copy;
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
      }

      updateChatInList(targetChatId, { updatedAt: new Date(), messageCount: conversationMessages.length + 1 });

      streamsRef.current.delete(targetChatId);
      setStreamingChats(prev => { const s = new Set(prev); s.delete(targetChatId); return s; });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Stream error:', err);
        const errorMsg = '⚠️ Server error, please try again later.';
        if (chatIdRef.current === targetChatId) {
          setMessages(prev => {
            const copy = [...prev];
            const idx = copy.findIndex(m => m.id === placeholderId);
            if (idx !== -1) copy[idx] = {
              ...copy[idx],
              id: 'error-' + Date.now(),
              content: errorMsg,
              _streaming: false,
            };
            messagesRef.current = copy;
            return copy;
          });
        }
        showToast('Server error — please retry', 'error');
      }
      streamsRef.current.delete(targetChatId);
      setStreamingChats(prev => { const s = new Set(prev); s.delete(targetChatId); return s; });
      scrollModeRef.current = 'lock';
      streamingFollowIdRef.current = null;
    }
  };

  const streamAssistantReplyInPlace = async (contextMessages, targetChatId, insertAt, reservedOrder) => {
    if (streamsRef.current.has(targetChatId)) return;

    const controller = new AbortController();
    streamsRef.current.set(targetChatId, { controller, buffer: '', active: true });
    setStreamingChats(prev => new Set(prev).add(targetChatId));

    const placeholderId = 'stream-placeholder-' + Date.now();
    const baseOrder = typeof reservedOrder === 'number' ? reservedOrder : nextOrder(messagesRef.current);

    if (chatIdRef.current === targetChatId) {
      setMessages(prev => {
        const copy = [...prev];
        copy.splice(insertAt, 0, {
          id: placeholderId,
          role: 'assistant',
          content: '',
          _streaming: true,
          order: baseOrder,
        });
        messagesRef.current = copy;
        return copy;
      });
      streamingFollowIdRef.current = placeholderId;
      scrollModeRef.current = 'follow';
    }

    try {
      const response = await fetchStream(contextMessages, controller.signal);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        const stream = streamsRef.current.get(targetChatId);
        if (stream) stream.buffer = assistantContent;

        if (chatIdRef.current === targetChatId) {
          setMessages(prev => {
            const copy = [...prev];
            const i = copy.findIndex(m => m.id === placeholderId);
            if (i !== -1) copy[i] = { ...copy[i], content: assistantContent };
            messagesRef.current = copy;
            return copy;
          });
        }
      }

      if (!assistantContent.trim()) {
        assistantContent = '⚠️ No response from server. Please try again.';
      }

      const msgsRef = collection(db, 'users', currentUser.uid, 'chats', targetChatId, 'messages');
      const saved = await addDoc(msgsRef, {
        role: 'assistant',
        content: assistantContent,
        createdAt: serverTimestamp(),
        order: baseOrder,
      });

      if (chatIdRef.current === targetChatId) {
        setMessages(prev => {
          const copy = [...prev];
          const i = copy.findIndex(m => m.id === placeholderId);
          if (i !== -1) copy[i] = { id: saved.id, role: 'assistant', content: assistantContent, order: baseOrder };
          messagesRef.current = copy;
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
      }

      updateChatInList(targetChatId, { updatedAt: new Date() });

      streamsRef.current.delete(targetChatId);
      setStreamingChats(prev => { const s = new Set(prev); s.delete(targetChatId); return s; });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Stream error:', err);
        const errorMsg = '⚠️ Server error, please try again later.';
        if (chatIdRef.current === targetChatId) {
          setMessages(prev => {
            const copy = [...prev];
            const i = copy.findIndex(m => m.id === placeholderId);
            if (i !== -1) copy[i] = {
              ...copy[i],
              id: 'error-' + Date.now(),
              content: errorMsg,
              _streaming: false,
            };
            messagesRef.current = copy;
            return copy;
          });
        }
        showToast('Server error — please retry', 'error');
      }
      streamsRef.current.delete(targetChatId);
      setStreamingChats(prev => { const s = new Set(prev); s.delete(targetChatId); return s; });
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText || !currentUser) return;
    if (chatIdRef.current && streamingChats.has(chatIdRef.current)) return;

    scrollModeRef.current = 'end';
    streamingFollowIdRef.current = null;

    let activeChatId = chatIdRef.current;
    if (!activeChatId) {
      const chatsRef = collection(db, 'users', currentUser.uid, 'chats');
      const newChat = await addDoc(chatsRef, {
        title: messageText.slice(0, 40),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: 0,
        pinned: false,
        deletedAt: null,
      });
      activeChatId = newChat.id;
      setChatId(activeChatId);
      chatIdRef.current = activeChatId;
      setMessages([]);
      messagesRef.current = [];

      const optimisticChat = {
        id: activeChatId,
        title: messageText.slice(0, 40),
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 1,
        pinned: false,
        deletedAt: null,
      };
      setChatList(prev => [optimisticChat, ...prev]);
    }

    const userMsg = { role: 'user', content: messageText, id: 'temp-user-' + Date.now(), order: nextOrder(messagesRef.current) };
    const newMessages = [...messagesRef.current, userMsg];
    setMessages(newMessages);
    messagesRef.current = newMessages;

    try {
      const msgsRef = collection(db, 'users', currentUser.uid, 'chats', activeChatId, 'messages');
      await addDoc(msgsRef, { role: 'user', content: messageText, createdAt: serverTimestamp(), order: userMsg.order });
    } catch (e) { console.error('Save user msg:', e); }

    streamAssistantReply(newMessages, activeChatId);

    // 🔥 MIC FIX: message bhejte hi mic forcibly band, dobara start nahi
    safeStopListening();
    setIsVoiceMode(false);
    resetTranscript();
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (chatIdRef.current && streamingChats.has(chatIdRef.current)) return;
    if (isVoiceMode) { setIsVoiceMode(false); safeStopListening(); }
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
      // 🔥 Mic ON karte hi AI ki current speech (TTS) turant band karo
      stopSpeaking();
      setSpeakingId(null);
      setIsVoiceMode(true);
      resetTranscript();
      safeStartListening();
    }
  };

  const handlePhotoClick = () => { showToast('📷 Photo upload — Available Soon!', 'info'); };

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    askConfirm({
      title: 'Log out?',
      message: 'You will be signed out of Brahmastra. Your chats are safe and will be here when you return.',
      confirmText: 'Log out',
      danger: true,
      onConfirm: async () => {
        try {
          await signOut(auth);
          navigate('/login');
        } catch (e) { console.error(e); showToast('Failed to log out', 'error'); }
      }
    });
  };

  const handleUpdateName = async (newName) => {
    if (!newName.trim() || !currentUser) return;
    try {
      await updateProfile(currentUser, { displayName: newName });
      setCurrentUser({ ...currentUser, displayName: newName });
      showToast('Name updated', 'success');
    } catch (e) { console.error('Update name error:', e); }
  };

  const handleCopy = async (msg) => {
    const ok = await copyToClipboard(msg.content);
    if (ok) { setCopiedId(msg.id || msg.content); setTimeout(() => setCopiedId(null), 1500); }
  };

  const handleSpeak = (msg) => {
    if (speakingId === msg.id) { stopSpeaking(); setSpeakingId(null); }
    else {
      // 🔥 Manual "Read aloud" dabate hi mic band karo (conflict na ho)
      if (isVoiceMode) {
        setIsVoiceMode(false);
        safeStopListening();
        resetTranscript();
      }
      speak(msg.content);
      setSpeakingId(msg.id || msg.content);
    }
  };

  const handleShare = async (msg) => {
    const ok = await shareText(msg.content);
    if (ok) showToast('Copied to clipboard', 'success');
  };

  const regenerateFrom = async (userMsg) => {
    const cid = chatIdRef.current;
    if (!cid || streamingChats.has(cid)) return;

    const snapshot = messagesRef.current;
    const idx = snapshot.findIndex(m => m.id === userMsg.id);
    if (idx === -1) return;

    const nextIdx = idx + 1;
    if (nextIdx >= snapshot.length) return;
    const targetAssistant = snapshot[nextIdx];
    if (!targetAssistant || targetAssistant.role !== 'assistant') return;

    if (messagesContainerRef.current) {
      lockedScrollTopRef.current = messagesContainerRef.current.scrollTop;
    }
    scrollModeRef.current = 'lock';
    streamingFollowIdRef.current = null;

    if (targetAssistant.id && !targetAssistant.id.startsWith('stream-') && !targetAssistant.id.startsWith('temp') && !targetAssistant.id.startsWith('error-')) {
      deleteDoc(doc(db, 'users', currentUser.uid, 'chats', cid, 'messages', targetAssistant.id)).catch(e => console.error(e));
    }

    const contextUpTo = snapshot.slice(0, idx + 1);
    const newLocalMessages = snapshot.filter((_, i) => i !== nextIdx);
    setMessages(newLocalMessages);
    messagesRef.current = newLocalMessages;

    const reservedOrder = typeof targetAssistant.order === 'number' ? targetAssistant.order : nextOrder(snapshot);

    await streamAssistantReplyInPlace(contextUpTo, cid, nextIdx, reservedOrder);
  };

  const handleRegenerate = async () => {
    const cid = chatIdRef.current;
    const snapshot = messagesRef.current;
    if (!cid || streamingChats.has(cid) || snapshot.length < 2) return;

    let lastUserIdx = -1;
    for (let i = snapshot.length - 1; i >= 0; i--) {
      if (snapshot[i].role === 'user') { lastUserIdx = i; break; }
    }
    if (lastUserIdx === -1) return;

    const lastAssistant = snapshot[snapshot.length - 1];

    if (messagesContainerRef.current) {
      lockedScrollTopRef.current = messagesContainerRef.current.scrollTop;
    }
    scrollModeRef.current = 'lock';
    streamingFollowIdRef.current = null;

    if (
      lastAssistant &&
      lastAssistant.role === 'assistant' &&
      lastAssistant.id &&
      !lastAssistant.id.startsWith('stream-') &&
      !lastAssistant.id.startsWith('temp') &&
      !lastAssistant.id.startsWith('error-')
    ) {
      deleteDoc(doc(db, 'users', currentUser.uid, 'chats', cid, 'messages', lastAssistant.id)).catch(e => console.error(e));
    }

    const trimmed = snapshot.slice(0, lastUserIdx + 1);

    let reservedOrder = nextOrder(trimmed);
    if (lastAssistant && lastAssistant.role === 'assistant' && typeof lastAssistant.order === 'number') {
      reservedOrder = lastAssistant.order;
    }

    setMessages(trimmed);
    messagesRef.current = trimmed;

    await streamAssistantReplyInPlace(trimmed, cid, trimmed.length, reservedOrder);
  };

  const handleDeleteMessage = (msg) => {
    const cid = chatIdRef.current;
    if (!msg.id || !cid || msg.id.startsWith('stream-')) return;
    askConfirm({
      title: msg.role === 'user' ? 'Delete message and its AI reply?' : 'Delete this reply?',
      message: 'This action cannot be undone.',
      confirmText: 'Delete',
      danger: true,
      onConfirm: async () => {
        const snapshot = messagesRef.current;
        let filtered;
        const toDeleteIds = [];

        if (msg.role === 'user') {
          const idx = snapshot.findIndex(m => m.id === msg.id);
          const next = snapshot[idx + 1];
          filtered = snapshot.filter((m, i) => i !== idx && !(next && next.role === 'assistant' && i === idx + 1));
          if (!msg.id.startsWith('error-') && !msg.id.startsWith('temp')) toDeleteIds.push(msg.id);
          if (next && next.role === 'assistant' && next.id && !next.id.startsWith('stream-') && !next.id.startsWith('temp') && !next.id.startsWith('error-')) {
            toDeleteIds.push(next.id);
          }
        } else {
          filtered = snapshot.filter(m => m.id !== msg.id);
          if (!msg.id.startsWith('error-')) toDeleteIds.push(msg.id);
        }

        setMessages(filtered);
        messagesRef.current = filtered;

        toDeleteIds.forEach(id => {
          deleteDoc(doc(db, 'users', currentUser.uid, 'chats', cid, 'messages', id)).catch(e => console.error(e));
        });

        showToast('Message deleted', 'success');
      }
    });
  };

  const startEdit = (msg) => {
    if (!msg.id || msg.id.startsWith('temp') || msg.id.startsWith('stream-')) return;
    setEditingMsgId(msg.id);
    setEditingText(msg.content);
  };

  const cancelEdit = () => { setEditingMsgId(null); setEditingText(''); };

  const commitEdit = async (msg) => {
    const cid = chatIdRef.current;
    const newText = editingText.trim();
    if (!cid || !newText || newText === msg.content) { cancelEdit(); return; }
    if (streamingChats.has(cid)) { cancelEdit(); return; }

    if (messagesContainerRef.current) {
      lockedScrollTopRef.current = messagesContainerRef.current.scrollTop;
    }
    scrollModeRef.current = 'lock';
    streamingFollowIdRef.current = null;

    const snapshot = messagesRef.current;
    const idx = snapshot.findIndex(m => m.id === msg.id);
    if (idx === -1) { cancelEdit(); return; }

    const next = snapshot[idx + 1];
    const hasNextAssistant = next && next.role === 'assistant';

    updateDoc(doc(db, 'users', currentUser.uid, 'chats', cid, 'messages', msg.id), { content: newText }).catch(e => console.error(e));
    if (hasNextAssistant && next.id && !next.id.startsWith('stream-') && !next.id.startsWith('temp') && !next.id.startsWith('error-')) {
      deleteDoc(doc(db, 'users', currentUser.uid, 'chats', cid, 'messages', next.id)).catch(e => console.error(e));
    }

    const updatedUser = { ...snapshot[idx], content: newText };
    const newArr = snapshot.map((m, i) => {
      if (i === idx) return updatedUser;
      if (hasNextAssistant && i === idx + 1) return null;
      return m;
    }).filter(Boolean);

    setMessages(newArr);
    messagesRef.current = newArr;
    setEditingMsgId(null);
    setEditingText('');

    const contextUpTo = snapshot.slice(0, idx).concat([updatedUser]);
    const reservedOrder = hasNextAssistant && typeof next.order === 'number' ? next.order : nextOrder(snapshot);

    await streamAssistantReplyInPlace(contextUpTo, cid, idx + 1, reservedOrder);
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chatList;
    const q = searchQuery.toLowerCase();
    return chatList.filter(c => (c.title || '').toLowerCase().includes(q));
  }, [chatList, searchQuery]);

  if (!browserSupportsSpeechRecognition) {
    return <div className="text-white text-center mt-20 px-4">Your browser doesn't support speech recognition. Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.</div>;
  }

  const grouped = groupChatsByDate(filteredChats);

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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] animate-slide-down pointer-events-none">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl border backdrop-blur-md text-xs font-medium ${
            toast.kind === 'error' ? 'bg-red-500/15 border-red-500/40 text-red-200'
              : toast.kind === 'info' ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
          }`}>
            {toast.kind === 'error' ? <AlertTriangle size={14} /> : <Check size={14} />}
            {toast.msg}
          </div>
        </div>
      )}

      <aside className={`fixed md:relative top-0 left-0 z-40 h-full flex flex-col bg-[#0a0a0a] border-r border-white/10 transition-transform duration-300 ease-out shrink-0 w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}`}>
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-cyan-400 tracking-wider flex items-center gap-1.5">
            <Zap size={16} /> BRAHMASTRA
          </span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"><X size={16} /></button>
        </div>

        <div className="p-2 space-y-2 border-b border-white/5 shrink-0">
          <button onClick={startNewChat} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-200 text-sm text-gray-300 active:scale-[0.98]">
            <Plus size={16} /> New chat
          </button>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-400/40 transition-all duration-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-white rounded transition"><X size={12} /></button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
          {filteredChats.length === 0 && (
            <p className="text-gray-600 text-xs text-center mt-6 animate-fade-in">
              {searchQuery ? `No chats matching "${searchQuery}"` : 'No chats yet'}
            </p>
          )}

          {grouped.pinned.length > 0 && (
            <div className="animate-fade-in">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-1 flex items-center gap-1"><Pin size={10} /> Pinned</p>
              {grouped.pinned.map(c => (
                <ChatItem key={c.id} chat={c} active={c.id === chatId} streaming={streamingChats.has(c.id)} hovered={hoveredChatId === c.id} onHover={(v) => setHoveredChatId(v ? c.id : null)} onClick={() => loadMessages(c.id)} onDelete={(e) => moveToBin(c.id, e)} onPin={(e) => togglePin(c.id, e)} />
              ))}
            </div>
          )}
          {grouped.today.length > 0 && (
            <div className="animate-fade-in">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-1">Today</p>
              {grouped.today.map(c => (
                <ChatItem key={c.id} chat={c} active={c.id === chatId} streaming={streamingChats.has(c.id)} hovered={hoveredChatId === c.id} onHover={(v) => setHoveredChatId(v ? c.id : null)} onClick={() => loadMessages(c.id)} onDelete={(e) => moveToBin(c.id, e)} onPin={(e) => togglePin(c.id, e)} />
              ))}
            </div>
          )}
          {grouped.yesterday.length > 0 && (
            <div className="animate-fade-in">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-1">Yesterday</p>
              {grouped.yesterday.map(c => (
                <ChatItem key={c.id} chat={c} active={c.id === chatId} streaming={streamingChats.has(c.id)} hovered={hoveredChatId === c.id} onHover={(v) => setHoveredChatId(v ? c.id : null)} onClick={() => loadMessages(c.id)} onDelete={(e) => moveToBin(c.id, e)} onPin={(e) => togglePin(c.id, e)} />
              ))}
            </div>
          )}
          {grouped.previous.length > 0 && (
            <div className="animate-fade-in">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest px-2 mb-1">Previous 7 days</p>
              {grouped.previous.map(c => (
                <ChatItem key={c.id} chat={c} active={c.id === chatId} streaming={streamingChats.has(c.id)} hovered={hoveredChatId === c.id} onHover={(v) => setHoveredChatId(v ? c.id : null)} onClick={() => loadMessages(c.id)} onDelete={(e) => moveToBin(c.id, e)} onPin={(e) => togglePin(c.id, e)} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-2 relative shrink-0" ref={profileMenuRef}>
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all duration-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-black shrink-0">
              {(currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm text-gray-200 truncate">{currentUser?.displayName || 'User'}</p>
              <p className="text-[10px] text-gray-500 truncate">{currentUser?.email}</p>
            </div>
            <MoreHorizontal size={16} className="text-gray-500 shrink-0" />
          </button>

          {showProfileMenu && (
            <div className="absolute bottom-full left-2 right-2 mb-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in origin-bottom">
              <button onClick={() => { setShowSettings(true); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition">
                <Settings size={16} /> Settings
              </button>
              <div className="border-t border-white/5" />
              <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition">
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="shrink-0 border-b border-white/5 bg-[#020206]/90 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 text-gray-400 hover:text-cyan-400 transition-all duration-200 rounded-lg hover:bg-white/5 active:scale-95">
                {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
              </button>

              {!sidebarOpen && (
                <>
                  <button onClick={startNewChat} className="p-1.5 text-gray-400 hover:text-cyan-400 transition-all duration-200 rounded-lg hover:bg-white/5 active:scale-95" title="New chat">
                    <Plus size={18} />
                  </button>
                  <span className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-cyan-400 tracking-wider ml-1">
                    <Zap size={14} /> BRAHMASTRA
                  </span>
                </>
              )}
            </div>
            <div className="w-8"></div>
          </div>
        </header>

        <main ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 py-3 sm:py-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto flex flex-col gap-3 sm:gap-6 min-h-full">
            {isVoiceMode && (
              <div className="sticky top-2 z-10 mx-auto bg-black/60 backdrop-blur-md border border-cyan-400/30 text-cyan-400 text-xs px-4 py-2 rounded-full animate-pulse flex items-center gap-2 animate-slide-down">
                <Mic size={14} /> {listening ? "Listening..." : isLoading ? "Thinking..." : "Mic active"}
              </div>
            )}

            {messages.length === 0 && !isVoiceMode && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 px-4 animate-fade-in" style={{ minHeight: 'calc(100dvh - 220px)' }}>
                <Sparkles size={36} className="text-cyan-400 mb-4 animate-bounce-slow" />
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2">How can I help you today?</h2>
                <p className="text-gray-500 text-xs sm:text-sm max-w-sm">Ask anything, or click the mic to speak.</p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isStreamingMsg = msg._streaming || (msg.id && msg.id.startsWith('stream-'));
              const isLast = i === messages.length - 1;
              const isError = msg.role === 'assistant' && typeof msg.content === 'string' && msg.content.startsWith('⚠️');
              const showAssistantActions = msg.role === 'assistant' && !isStreamingMsg && msg.content;
              const isEditing = editingMsgId === msg.id;
              const showUserActions = msg.role === 'user' && !isEditing && msg.id && !msg.id.startsWith('temp');
              const nextMsg = messages[i + 1];
              const canRegenFromUser = showUserActions && !isLoading &&
                nextMsg && nextMsg.role === 'assistant' && !(nextMsg.id && nextMsg.id.startsWith('stream-'));

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
                    <div className={`text-[13px] sm:text-sm leading-relaxed transition-shadow duration-200 ${msg.role === 'user' ? 'bg-fuchsia-500/10 border border-fuchsia-500/20 text-gray-100 rounded-2xl rounded-tr-sm px-3 sm:px-4 py-2 sm:py-2.5' : 'text-gray-300 markdown-body'} ${isEditing ? 'ring-2 ring-cyan-400/50' : ''} ${isError ? 'text-red-300' : ''}`}>
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
                        <MsgButton title="Copy" onClick={() => handleCopy(msg)} icon={copiedId === (msg.id || msg.content) ? <Check size={13} /> : <Copy size={13} />} />
                        {canRegenFromUser && (
                          <MsgButton title="Regenerate reply" onClick={() => regenerateFrom(msg)} icon={<RefreshCw size={13} />} />
                        )}
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
                        <MsgButton title="Copy" onClick={() => handleCopy(msg)} icon={copiedId === (msg.id || msg.content) ? <Check size={14} /> : <Copy size={14} />} />
                        {!isError && (
                          <MsgButton title={speakingId === msg.id ? 'Stop' : 'Read aloud'} onClick={() => handleSpeak(msg)} icon={speakingId === msg.id ? <VolumeX size={14} /> : <Volume2 size={14} />} />
                        )}
                        {!isError && (
                          <MsgButton title="Share" onClick={() => handleShare(msg)} icon={<Share2 size={14} />} />
                        )}
                        {(isLast || isError) && !isStreamingMsg && <MsgButton title="Regenerate" onClick={handleRegenerate} icon={<RefreshCw size={14} />} />}
                        {msg.id && !msg.id.startsWith('stream-') && !msg.id.startsWith('temp') && <MsgButton title="Delete" onClick={() => handleDeleteMessage(msg)} icon={<Trash2 size={14} />} danger />}
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
          <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-1 sm:gap-1.5 bg-white/5 rounded-2xl p-1.5 sm:p-2 border border-white/10 focus-within:border-cyan-400/40 transition-all duration-200 items-center">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={() => {}} className="hidden" />
            <button type="button" onClick={handlePhotoClick} title="Photo upload" className="p-1.5 sm:p-2 text-gray-500 hover:text-cyan-400 transition rounded-lg hover:bg-white/5 shrink-0 active:scale-90"><ImageIcon size={18} /></button>
            <button type="button" onClick={handleMicClick} className={`relative p-1.5 sm:p-2 rounded-lg transition shrink-0 active:scale-90 ${isVoiceMode ? 'text-red-400 bg-red-500/10' : 'text-gray-500 hover:text-cyan-400 hover:bg-white/5'}`}>
              {isVoiceMode && <span className="absolute inset-0 rounded-lg border border-red-500/50 animate-ping" />}
              {isVoiceMode ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={isVoiceMode ? (listening ? "Listening..." : "Processing...") : "Message Brahmastra..."} className="flex-1 bg-transparent px-1 sm:px-2 outline-none text-white placeholder-gray-600 text-sm min-w-0" />
            {isLoading ? (
              <button type="button" onClick={() => stopStreamForChat(chatId)} className="p-1.5 sm:p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shrink-0 active:scale-90" title="Stop generating">
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="p-1.5 sm:p-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition disabled:opacity-30 disabled:bg-gray-700 shrink-0 active:scale-90"><Send size={16} /></button>
            )}
          </form>
          <p className="text-center text-[9px] sm:text-[10px] text-gray-600 mt-1.5 sm:mt-2">Brahmastra can make mistakes. Verify important info.</p>
        </div>
      </div>

      {showBin && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4 animate-fade-in" onClick={() => setShowBin(false)}>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Trash2 size={16} className="text-rose-400" /> Bin {binnedChats.length > 0 && <span className="text-[10px] text-gray-500">({binnedChats.length})</span>}</h3>
              <button onClick={() => setShowBin(false)} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"><X size={18} /></button>
            </div>
            <p className="text-[10px] text-gray-500 px-4 pt-3">Chats are permanently deleted after 7 days.</p>
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {binnedChats.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-12 opacity-50 animate-fade-in">
                  <Trash2 size={28} className="text-gray-600 mb-2" />
                  <p className="text-xs text-gray-500">Bin is empty</p>
                </div>
              )}
              {binnedChats.map(c => (
                <div key={c.id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors duration-150 animate-fade-in">
                  <MessageSquare size={12} className="shrink-0 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">{c.title || 'Untitled'}</p>
                    <p className="text-[10px] text-gray-600">{daysLeft(c.deletedAt)} days left</p>
                  </div>
                  <button onClick={(e) => restoreFromBin(c.id, e)} className="p-1 rounded hover:bg-cyan-500/10 text-gray-500 hover:text-cyan-400 transition shrink-0" title="Restore"><RotateCcw size={13} /></button>
                  <button onClick={(e) => permanentlyDelete(c.id, e)} className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition shrink-0" title="Delete forever"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            {binnedChats.length > 0 && (
              <div className="p-3 border-t border-white/5 shrink-0">
                <button onClick={clearBin} className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-2 rounded-lg hover:bg-red-500/20 transition active:scale-[0.98]"><Trash2 size={13} /> Empty Bin (permanent)</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4 animate-fade-in" onClick={() => setShowSettings(false)}>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl max-h-[92vh] sm:max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Settings size={16} className="text-cyan-400" /> Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"><X size={18} /></button>
            </div>
            <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
              <div className="sm:w-40 border-b sm:border-b-0 sm:border-r border-white/5 p-2 flex sm:flex-col gap-1 overflow-x-auto shrink-0">
                {[
                  { key: 'general', label: 'General', icon: <Settings size={14} /> },
                  { key: 'account', label: 'Account', icon: <User size={14} /> },
                  { key: 'data', label: 'Data', icon: <Shield size={14} /> },
                  { key: 'about', label: 'About', icon: <Info size={14} /> },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setSettingsTab(tab.key)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all duration-200 ${settingsTab === tab.key ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                {settingsTab === 'general' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-2"><Bell size={14} /> Chat Behavior</h4>
                      <div className="space-y-2">
                        <SettingRow label="Enter to send" desc="Press Enter to send message" defaultOn={true} />
                        <SettingRow label="Sound effects" desc="Play sound on new message" defaultOn={false} />
                      </div>
                    </div>
                  </div>
                )}
                {settingsTab === 'account' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1.5">Display Name</label>
                      <input type="text" defaultValue={currentUser?.displayName || ''} onBlur={(e) => handleUpdateName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 text-white transition" placeholder="Your name" />
                      <p className="text-[10px] text-gray-600 mt-1">Press Enter or click outside to save.</p>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1.5">Email</label>
                      <p className="text-sm text-gray-400 bg-black/30 p-2.5 rounded-lg truncate">{currentUser?.email}</p>
                    </div>
                    <div className="border-t border-white/5 pt-4">
                      <button onClick={() => { setShowSettings(false); handleLogoutClick(); }} className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-2.5 rounded-lg hover:bg-red-500/20 transition active:scale-[0.98]"><LogOut size={14} /> Log out</button>
                    </div>
                  </div>
                )}
                {settingsTab === 'data' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-2"><MessageSquare size={14} /> Chat History</h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed mb-3">You have <span className="text-cyan-400 font-bold">{chatList.length}</span> active and <span className="text-rose-300 font-bold">{binnedChats.length}</span> binned.</p>
                      <button onClick={() => { setShowSettings(false); setSidebarOpen(true); }} className="w-full flex items-center justify-between bg-black/30 hover:bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition">
                        <span className="flex items-center gap-2"><MessageSquare size={14} /> Manage chats</span>
                        <ChevronRight size={14} />
                      </button>
                      <button onClick={() => { setShowSettings(false); setShowBin(true); }} className="mt-2 w-full flex items-center justify-between bg-black/30 hover:bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition">
                        <span className="flex items-center gap-2"><Trash2 size={14} /> Open Bin {binnedChats.length > 0 && <span className="text-rose-300 text-[10px] bg-rose-500/20 px-1.5 rounded-full">{binnedChats.length}</span>}</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="border-t border-white/5 pt-4">
                      <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-2"><Trash size={14} /> Danger Zone</h4>
                      <button onClick={() => {
                        askConfirm({
                          title: 'Delete everything?',
                          message: 'All chats (active + bin) will be permanently deleted. This cannot be undone.',
                          confirmText: 'Delete everything',
                          danger: true,
                          onConfirm: async () => {
                            for (const stream of streamsRef.current.values()) if (stream.controller) stream.controller.abort();
                            streamsRef.current.clear(); setStreamingChats(new Set());
                            const allChats = [...chatList, ...binnedChats];
                            setChatList([]); setBinnedChats([]); setChatId(null); setMessages([]); messagesRef.current = [];
                            setShowSettings(false);
                            showToast('All chats deleted', 'success');
                            try {
                              for (const c of allChats) {
                                const msgsRef = collection(db, 'users', currentUser.uid, 'chats', c.id, 'messages');
                                const snap = await getDocs(msgsRef);
                                const batch = writeBatch(db);
                                snap.docs.forEach(d => batch.delete(d.ref));
                                batch.delete(doc(db, 'users', currentUser.uid, 'chats', c.id));
                                await batch.commit();
                              }
                            } catch (err) { console.error(err); }
                          }
                        });
                      }} className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-2.5 rounded-lg hover:bg-red-500/20 transition active:scale-[0.98]"><Trash2 size={14} /> Delete everything</button>
                      <p className="text-[10px] text-gray-600 mt-1.5">This permanently deletes all your conversations.</p>
                    </div>
                  </div>
                )}
                {settingsTab === 'about' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-col items-center text-center py-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center mb-3 animate-pulse-slow">
                        <Zap size={26} className="text-black" />
                      </div>
                      <h4 className="text-base font-bold text-white">Brahmastra AI</h4>
                      <p className="text-[11px] text-gray-500">Version 1.0.0</p>
                    </div>

                    <div className="border-t border-white/5 pt-4 space-y-1">
                      <button
                        onClick={() => { setShowSettings(false); setShowContactPopup(true); }}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition text-sm text-gray-300"
                      >
                        <span className="flex items-center gap-2"><Mail size={14} /> Contact</span>
                        <ChevronRight size={14} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => { setShowSettings(false); setShowPrivacyPopup(true); }}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition text-sm text-gray-300"
                      >
                        <span className="flex items-center gap-2"><Shield size={14} /> Privacy Policy</span>
                        <ChevronRight size={14} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => { setShowSettings(false); setShowTermsPopup(true); }}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition text-sm text-gray-300"
                      >
                        <span className="flex items-center gap-2"><Key size={14} /> Terms of Service</span>
                        <ChevronRight size={14} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showContactPopup && (
        <div
          className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm sm:p-4 animate-fade-in"
          onClick={() => { setShowContactPopup(false); setContactStatus(''); }}
        >
          <div
            className="bg-[#1a1a1a] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Mail size={16} className="text-cyan-400" /> Contact
              </h3>
              <button
                onClick={() => { setShowContactPopup(false); setContactStatus(''); }}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href="mailto:nishant100.g@gmail.com"
                  className="flex items-center gap-2 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 p-2.5 rounded-lg transition text-sm text-gray-300"
                >
                  <Mail size={16} className="text-cyan-400 shrink-0" />
                  <span className="truncate">Email</span>
                </a>
                <a
                  href="https://github.com/Nishant-gupta16"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/5 hover:bg-fuchsia-500/10 border border-white/10 hover:border-fuchsia-400/40 p-2.5 rounded-lg transition text-sm text-gray-300"
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className="text-fuchsia-400 shrink-0">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.94 10.94 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.07.78 2.16v3.21c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                  </svg>
                  <span className="truncate">GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/nishant-gupta-2483b7334/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-400/40 p-2.5 rounded-lg transition text-sm text-gray-300"
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className="text-blue-400 shrink-0">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="truncate">LinkedIn</span>
                </a>
              </div>

              <div className="border-t border-white/5 pt-3">
                <h4 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <MessageSquare size={14} className="text-cyan-400" /> Send a message
                </h4>
                <form ref={contactFormRef} onSubmit={sendContactEmail} className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    name="from_name"
                    placeholder="Your name"
                    required
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition text-white placeholder-gray-600"
                  />
                  <input
                    type="email"
                    name="from_email"
                    placeholder="Your email"
                    required
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition text-white placeholder-gray-600"
                  />
                  <textarea
                    name="message"
                    placeholder="Your message"
                    rows="4"
                    required
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400 transition text-white placeholder-gray-600 resize-none"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={contactStatus === 'sending'}
                    className="flex items-center justify-center gap-2 bg-cyan-500 text-black font-semibold py-2.5 rounded-lg hover:bg-cyan-400 transition text-sm disabled:opacity-50 active:scale-[0.98]"
                  >
                    <Send size={14} />
                    {contactStatus === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                  {contactStatus === 'success' && (
                    <p className="text-green-400 text-xs text-center">Message sent successfully!</p>
                  )}
                  {contactStatus === 'error' && (
                    <p className="text-red-400 text-xs text-center">Failed to send. Please try again.</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPrivacyPopup && (
        <div
          className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm sm:p-4 animate-fade-in"
          onClick={() => setShowPrivacyPopup(false)}
        >
          <div
            className="bg-[#1a1a1a] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield size={16} className="text-cyan-400" /> Privacy Policy
              </h3>
              <button
                onClick={() => setShowPrivacyPopup(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-sm text-gray-300 leading-relaxed space-y-4">
              <p className="text-[11px] text-gray-500">Last updated: November 2025</p>
              <div>
                <h4 className="text-white font-semibold mb-1.5">1. Information We Collect</h4>
                <p>When you use Brahmastra AI, we collect your email address and display name for account authentication. Your chat messages are stored securely in Firebase Firestore to provide chat history across devices.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">2. How We Use Your Data</h4>
                <p>Your data is used solely to provide and improve the AI chat service. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">3. Chat History & Storage</h4>
                <p>All conversations are stored in your private Firebase account. Deleted chats remain in the Bin for 7 days before permanent deletion. You can delete any chat or your entire history at any time from the Settings → Data section.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">4. Security</h4>
                <p>We use industry-standard Firebase Authentication and Firestore Security Rules. Only you can access your own chats. However, no method of transmission over the internet is 100% secure.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">5. Cookies</h4>
                <p>We use browser localStorage and sessionStorage to maintain your session and preferences. No third-party tracking cookies are used.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">6. Your Rights</h4>
                <p>You have the right to access, update, or delete your personal data at any time. Contact us at nishant100.g@gmail.com for any privacy-related requests.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">7. Changes to This Policy</h4>
                <p>We may update this privacy policy from time to time. Continued use of Brahmastra AI after changes constitutes acceptance of the updated policy.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTermsPopup && (
        <div
          className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm sm:p-4 animate-fade-in"
          onClick={() => setShowTermsPopup(false)}
        >
          <div
            className="bg-[#1a1a1a] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Key size={16} className="text-cyan-400" /> Terms of Service
              </h3>
              <button
                onClick={() => setShowTermsPopup(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-sm text-gray-300 leading-relaxed space-y-4">
              <p className="text-[11px] text-gray-500">Last updated: November 2025</p>
              <div>
                <h4 className="text-white font-semibold mb-1.5">1. Acceptance of Terms</h4>
                <p>By accessing or using Brahmastra AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">2. Use of Service</h4>
                <p>You agree to use Brahmastra AI only for lawful purposes. You must not use the service to generate harmful, illegal, or abusive content, or to attempt to compromise the security of the platform.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">3. Account Responsibility</h4>
                <p>You are responsible for maintaining the confidentiality of your account credentials. You are fully responsible for all activities that occur under your account.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">4. AI Limitations</h4>
                <p>Brahmastra AI is powered by large language models. Responses may be inaccurate, incomplete, or outdated. Always verify critical information. The service is provided "as is" without warranty of any kind.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">5. Intellectual Property</h4>
                <p>All content, features, and functionality of Brahmastra AI are owned by Nishant and are protected by copyright and other intellectual property laws.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">6. Limitation of Liability</h4>
                <p>In no event shall Brahmastra AI or its creator be liable for any indirect, incidental, or consequential damages arising out of the use of the service.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">7. Modifications</h4>
                <p>We reserve the right to modify these terms at any time. Continued use of the service after modifications constitutes acceptance of the updated terms.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1.5">8. Contact</h4>
                <p>For questions about these terms, contact us at nishant100.g@gmail.com.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmState && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setConfirmState(null)}>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmState.danger ? 'bg-red-500/15 border border-red-500/30' : 'bg-cyan-500/15 border border-cyan-400/30'}`}>
                {confirmState.danger ? <AlertTriangle size={22} className="text-red-400" /> : <Info size={22} className="text-cyan-400" />}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{confirmState.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{confirmState.message}</p>
            </div>
            <div className="flex gap-2 p-4 border-t border-white/5">
              <button
                onClick={() => setConfirmState(null)}
                className="flex-1 px-4 py-2.5 text-sm rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition active:scale-[0.98] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const fn = confirmState.onConfirm;
                  setConfirmState(null);
                  fn?.();
                }}
                className={`flex-1 px-4 py-2.5 text-sm rounded-lg font-semibold transition active:scale-[0.98] ${
                  confirmState.danger
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-cyan-500 text-black hover:bg-cyan-400'
                }`}
              >
                {confirmState.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
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

function SettingRow({ label, desc, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
      <div><p className="text-sm text-gray-200">{label}</p><p className="text-[10px] text-gray-500">{desc}</p></div>
      <button onClick={() => setOn(!on)} className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${on ? 'bg-cyan-500' : 'bg-gray-700'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all duration-200 ${on ? 'right-0.5' : 'left-0.5'}`}></div>
      </button>
    </div>
  );
}

function ChatItem({ chat, active, streaming, hovered, onHover, onClick, onDelete, onPin }) {
  const showActions = active || hovered || streaming;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-all duration-200 ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
    >
      {streaming ? (
        <span className="shrink-0 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" title="Reply coming..."></span>
      ) : (
        <MessageSquare size={12} className="shrink-0 opacity-50" />
      )}
      <span className="truncate flex-1">{chat.title || 'Untitled'}</span>

      <div className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button onClick={onPin} title={chat.pinned ? 'Unpin' : 'Pin'} className={`p-1 rounded hover:bg-white/10 transition ${chat.pinned ? 'text-cyan-400' : 'text-gray-500'}`}>
          {chat.pinned ? <PinOff size={13} /> : <Pin size={13} />}
        </button>
        <button onClick={onDelete} title="Move to bin" className="p-1 rounded hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}