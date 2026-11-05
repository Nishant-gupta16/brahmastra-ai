// Pick the most natural available voice
const pickBestVoice = () => {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Priority order: neural/natural voices first
  const preferred = [
    'Google UK English Female',
    'Google US English',
    'Microsoft Aria Online (Natural)',
    'Microsoft Jenny Online (Natural)',
    'Microsoft Guy Online (Natural)',
    'Samantha',
    'Google हिन्दी',
    'Google UK English Male',
  ];

  for (const name of preferred) {
    const v = voices.find(voice => voice.name === name);
    if (v) return v;
  }

  // Fallback: any English voice, preferring localService=false (cloud = more natural)
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));
  const cloud = englishVoices.find(v => !v.localService);
  return cloud || englishVoices[0] || voices[0];
};

let cachedVoice = null;

// Preload voices (browsers load them async)
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = pickBestVoice();
  };
  // Trigger initial load
  window.speechSynthesis.getVoices();
}

export const speak = (text) => {
  if (!('speechSynthesis' in window)) {
    alert('Your browser does not support text-to-speech.');
    return;
  }
  window.speechSynthesis.cancel();

  // Strip markdown symbols for cleaner speech
  const clean = text
    .replace(/```[\s\S]*?```/g, ' code block ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_#>~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, '. ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(clean);
  const voice = cachedVoice || pickBestVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = 'en-IN';
  }
  // Natural pacing
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
};

export const shareText = async (text) => {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Brahmastra AI', text });
      return true;
    } catch {
      return false;
    }
  }
  return copyToClipboard(text);
};