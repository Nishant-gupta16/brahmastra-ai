import { useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { Mail, Send, MessageSquare } from 'lucide-react';
import emailjs from '@emailjs/browser';

const GithubIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.94 10.94 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.07.78 2.16v3.21c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

const LinkedinIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function Contact() {
  const form = useRef();
  const [status, setStatus] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus('sending');

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        setStatus('success');
        form.current.reset();
      })
      .catch((error) => {
        console.error('Email send failed:', error);
        setStatus('error');
      });
  };

  return (
    <div className="min-h-screen bg-[#040404] text-white overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[40vw] h-[40vh] bg-cyan-600/10 blur-[120px] pointer-events-none z-0"></div>
      <Navbar />
      <div className="relative z-10 px-3 py-6 sm:p-8 md:p-20 max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 sm:gap-16 animate-fade-in-up">
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Contact Us
          </h1>

          <div className="flex flex-col gap-3 sm:gap-4">
            <a
              href="mailto:nishant100.g@gmail.com"
              className="flex items-center gap-3 sm:gap-4 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 hover:border-cyan-400 transition group hover:-translate-x-1 duration-300"
            >
              <Mail size={18} className="text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-[11px] sm:text-sm tracking-widest uppercase">Email Me</span>
            </a>

            <a
              href="https://github.com/Nishant-gupta16"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 sm:gap-4 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 hover:border-fuchsia-400 transition group hover:-translate-x-1 duration-300"
            >
              <GithubIcon size={18} className="text-fuchsia-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-[11px] sm:text-sm tracking-widest uppercase">GitHub Profile</span>
            </a>

            <a
              href="https://www.linkedin.com/in/nishant-gupta-2483b7334/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 sm:gap-4 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10 hover:border-blue-400 transition group hover:-translate-x-1 duration-300"
            >
              <LinkedinIcon size={18} className="text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-[11px] sm:text-sm tracking-widest uppercase">LinkedIn Profile</span>
            </a>
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="bg-white/5 border border-white/10 p-5 sm:p-7 md:p-8 rounded-2xl hover:border-cyan-400/30 transition-colors min-h-[420px] sm:min-h-[480px]">
            <h2 className="text-lg sm:text-2xl font-bold mb-5 sm:mb-7 flex items-center gap-2">
              <MessageSquare size={20} className="text-cyan-400" /> Send a Message
            </h2>

            <form ref={form} onSubmit={sendEmail} className="flex flex-col gap-4 sm:gap-5 scroll-mb-24">
              <input
                type="text"
                name="from_name"
                placeholder="Your Name"
                required
                className="bg-black/40 border border-white/10 rounded-lg p-3 sm:p-4 text-sm sm:text-base outline-none focus:border-cyan-400 transition"
              />
              <input
                type="email"
                name="from_email"
                placeholder="Your Email"
                required
                className="bg-black/40 border border-white/10 rounded-lg p-3 sm:p-4 text-sm sm:text-base outline-none focus:border-cyan-400 transition"
              />
              <textarea
                rows="6"
                name="message"
                placeholder="Your Message"
                required
                className="bg-black/40 border border-white/10 rounded-lg p-3 sm:p-4 text-sm sm:text-base outline-none focus:border-cyan-400 transition resize-none"
              ></textarea>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex items-center justify-center gap-2 bg-cyan-500 text-black font-bold py-3 sm:py-3.5 rounded-lg hover:bg-cyan-400 transition mt-1 sm:mt-2 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-sm sm:text-base"
              >
                <Send size={16} /> {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>

              {status === 'success' && (
                <p className="text-green-400 text-sm sm:text-base text-center">Message sent successfully!</p>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-sm sm:text-base text-center">Failed to send. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}