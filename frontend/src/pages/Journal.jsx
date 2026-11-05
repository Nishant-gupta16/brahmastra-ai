import Navbar from '../components/Navbar';
import { Calendar, User, Clock, ArrowRight, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Journal() {
  const [openPost, setOpenPost] = useState(null);

  useEffect(() => {
    document.body.style.overflow = openPost ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [openPost]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpenPost(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const posts = [
    {
      title: "Understanding How Large Language Models Think",
      desc: "A simple look at how AI models predict, reason, and generate human-like text — without any magic involved.",
      time: "6 min read",
      author: "AI Editorial",
      date: "Nov 2026",
      content: `
Large Language Models (LLMs) feel almost magical. You ask a question, and a thoughtful answer appears. But under the hood, there is no magic — just a very large pattern-recognition engine trained on enormous amounts of text.

## What Is a Language Model?

A language model is a system that predicts the next word in a sentence. Give it "The sky is", and it estimates that "blue" is more likely than "purple". That is the core idea — everything else is scale.

Modern models do this with billions of parameters. Each parameter is a tiny adjustable number that helps the model decide how likely a word is in a given context.

## Training in Three Stages

### 1. Pre-training
The model reads massive amounts of text — books, articles, websites. It learns grammar, facts, reasoning patterns, and writing styles. This stage takes weeks and huge compute.

### 2. Fine-tuning
The base model is then trained on curated examples to follow instructions, answer politely, and avoid harmful outputs.

### 3. Alignment
Human feedback is used to make the model more helpful, honest, and safe. This is where "AI personality" is shaped.

## How It Actually Generates Text

When you send a prompt, the model:

- Breaks your text into tokens (small chunks of words)
- Converts tokens into numbers (embeddings)
- Passes them through dozens of neural network layers
- Predicts the most likely next token
- Repeats this process, one token at a time

Every response you see is the result of thousands of these tiny predictions chained together in real time.

## Why It Sometimes Gets Things Wrong

The model is not "looking up" facts — it is predicting plausible text. When its training data is thin or ambiguous, it can produce confident but incorrect answers. This is called hallucination, and it is an active area of research.

## What Makes It Feel Human

Three things:

- Context — the model considers the entire conversation, not just your last message
- Style — it mirrors the tone, formality, and structure of your prompt
- Coherence — its training taught it to keep ideas logically connected

LLMs are not conscious, and they do not "understand" in the human sense. But they are extraordinarily good at producing text that feels thoughtful and relevant.

## The Takeaway

A language model is a prediction engine, trained at massive scale, tuned to be helpful. Once you understand that, AI becomes less mysterious — and far more useful.
      `,
    },
    {
      title: "The Art of Asking Better Questions to AI",
      desc: "The same AI can give a brilliant answer or a useless one. The difference is almost always in how you ask.",
      time: "5 min read",
      author: "AI Editorial",
      date: "Nov 2026",
      content: `
Two people ask the same AI the same question. One gets a sharp, useful answer. The other gets something vague and forgettable. The difference is rarely the AI — it is the prompt.

## Why Prompts Matter

AI models respond to context, clarity, and structure. A vague prompt gives the model too many possible directions, so it picks a safe, generic path. A specific prompt narrows the space of good answers.

## Five Simple Principles

### 1. Be Specific
Instead of "write an email", say "write a short, polite email to a client apologizing for a one-day delay in delivery". Specificity gives the model a target.

### 2. Give Context
Tell the model who you are, what you are working on, and why. "I am a student preparing for an exam" leads to very different advice than "I am a manager preparing a presentation".

### 3. Define the Format
If you want a list, say "in bullet points". If you want a table, ask for one. If you want it short, say "in under 100 words". The model will respect it.

### 4. Set a Role
"Act as a senior editor" or "respond as a friendly teacher" changes the tone and depth instantly. Roles guide the model's style.

### 5. Show an Example
Give one sample input and output. This is called few-shot prompting, and it dramatically improves consistency for structured tasks.

## Before and After

Before: "Give me ideas for a blog."

After: "Give me 5 blog post ideas for a beginner-friendly AI newsletter, each with a catchy title and a one-line summary. Keep the tone friendly and practical."

The second prompt will produce ideas you can actually use.

## Common Mistakes

- Asking multiple unrelated questions in one prompt
- Being too vague and hoping the AI "guesses" correctly
- Giving contradictory instructions (short but detailed)
- Not specifying the audience

## A Simple Habit

Before sending a prompt, ask yourself: would a smart colleague understand exactly what I want from this message? If not, the AI probably won't either.

Better prompts are not about tricks. They are about clear thinking — and that skill pays off everywhere.
      `,
    },
    {
      title: "AI and Creativity: Tool, Partner, or Replacement?",
      desc: "AI can write, draw, compose, and design. But what does that mean for human creativity — and for creators?",
      time: "7 min read",
      author: "AI Editorial",
      date: "Nov 2026",
      content: `
AI can now write stories, compose music, generate images, and design layouts. Every few months, a new capability arrives that feels like it should belong only to humans. So what does this mean for creativity?

## Three Ways to See AI in Creative Work

### 1. AI as a Tool
Like a brush for a painter or a camera for a photographer, AI is a tool. It extends what a creator can do, but the vision still comes from the human. This is the most common and most practical view.

### 2. AI as a Partner
AI can brainstorm, offer variations, and push back on ideas. A writer might ask for ten alternate opening lines, then choose and refine the best one. The human stays in control, but the process becomes faster and more playful.

### 3. AI as a Replacement
Some tasks — like drafting routine descriptions or generating basic graphics — can be fully automated. This frees humans for higher-level work, but it also raises real questions about jobs and credit.

## What AI Does Well

- Generating variations quickly
- Overcoming blank-page anxiety
- Producing drafts for editing
- Mixing styles and ideas in unusual ways

## What AI Still Struggles With

- Genuine originality rooted in lived experience
- Emotional nuance that comes from real feeling
- Long-form narrative consistency
- Understanding why something matters to an audience

AI can imitate style, but it does not have intention. That gap is where human creativity still lives.

## The Real Shift

The value of creative work is moving from execution to direction. Knowing what to make, why to make it, and how to judge quality is becoming more important than the raw ability to produce.

This is not new. Photography did not kill painting — it pushed painting in new directions. AI is doing something similar to writing, design, and music.

## A Practical Approach

- Use AI for the first draft, not the final one
- Keep your unique voice — edit heavily, add your perspective
- Treat AI output as a starting point, never as the answer
- Stay curious about what only you can bring

## Final Thought

AI is neither a savior nor a threat to creativity. It is a powerful new instrument. The people who learn to play it well — while staying true to their own voice — will create things that neither humans alone nor AI alone could make.

That is not the end of creativity. It is a new chapter.
      `,
    },
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
        <Navbar />

        <div className="relative z-10 px-5 py-10 sm:px-8 sm:py-12 md:px-14 md:py-14 max-w-4xl mx-auto animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Sparkles size={18} className="text-cyan-400" />
            <span className="text-[10px] sm:text-xs md:text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-semibold">
              Insights & Ideas
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 leading-tight">
            AI Journal
          </h1>
          <p className="text-gray-400 mb-8 sm:mb-10 md:mb-12 text-sm md:text-sm leading-relaxed max-w-2xl">
            Thoughtful reads on artificial intelligence — how it works, how to use it well, and what it means for the future.
          </p>

          <div className="flex flex-col gap-4 sm:gap-5 md:gap-5">
            {posts.map((post, index) => (
              <div
                key={index}
                onClick={() => setOpenPost(post)}
                className="group p-5 sm:p-6 md:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer hover:bg-white/10 active:scale-[0.99]"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-xs md:text-[10px] text-gray-500 mb-2.5 md:mb-3 uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                  <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {post.time}</span>
                </div>

                <h2 className="text-lg sm:text-xl md:text-xl font-bold mb-2 group-hover:text-cyan-400 transition leading-snug">
                  {post.title}
                </h2>

                <p className="text-gray-400 text-xs sm:text-sm md:text-[13px] leading-relaxed">{post.desc}</p>

                <div className="mt-3 md:mt-3.5 flex items-center text-cyan-400 text-[10px] sm:text-xs md:text-[10px] font-bold uppercase tracking-widest">
                  Read More
                  <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* READ MORE MODAL */}
        {openPost && (
          <div
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm overflow-y-auto hide-scrollbar animate-fade-in"
            onClick={() => setOpenPost(null)}
          >
            <div className="min-h-full flex items-start sm:items-center justify-center p-0 sm:p-6 md:p-8">
              <div
                className="relative bg-[#0a0a0a] border-0 sm:border sm:border-white/10 rounded-none sm:rounded-2xl w-full max-w-3xl min-h-screen sm:min-h-0 sm:my-8 shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/10 bg-[#0a0a0a] rounded-none sm:rounded-t-2xl z-20">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] sm:text-xs md:text-[10px] text-gray-500 uppercase tracking-wider min-w-0">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {openPost.date}</span>
                    <span className="flex items-center gap-1"><User size={11} /> {openPost.author}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {openPost.time}</span>
                  </div>
                  <button
                    onClick={() => setOpenPost(null)}
                    className="shrink-0 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition active:scale-90"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-5 sm:p-8 md:p-9 pb-16 sm:pb-10">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black mb-5 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 leading-tight">
                    {openPost.title}
                  </h1>

                  <div className="prose prose-invert max-w-none">
                    {openPost.content.split('\n').map((line, i) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={i} className="h-2.5 sm:h-3" />;

                      if (trimmed.startsWith('## ')) {
                        return <h2 key={i} className="text-base sm:text-lg md:text-lg font-bold text-white mt-5 sm:mt-6 mb-2 sm:mb-3">{trimmed.replace('## ', '')}</h2>;
                      }
                      if (trimmed.startsWith('### ')) {
                        return <h3 key={i} className="text-sm sm:text-base md:text-[15px] font-semibold text-white mt-4 mb-1.5 sm:mb-2">{trimmed.replace('### ', '')}</h3>;
                      }
                      if (trimmed.startsWith('- ')) {
                        return (
                          <li key={i} className="text-gray-300 text-xs sm:text-sm md:text-[13px] leading-relaxed ml-4 list-disc mb-1">
                            {formatInline(trimmed.replace('- ', ''))}
                          </li>
                        );
                      }
                      if (/^\d+\.\s/.test(trimmed)) {
                        return (
                          <li key={i} className="text-gray-300 text-xs sm:text-sm md:text-[13px] leading-relaxed ml-4 list-decimal mb-1">
                            {formatInline(trimmed.replace(/^\d+\.\s/, ''))}
                          </li>
                        );
                      }
                      if (trimmed.startsWith('> ')) {
                        return (
                          <blockquote key={i} className="border-l-2 border-cyan-400/50 pl-3 my-2 text-gray-400 italic text-xs sm:text-sm md:text-[13px]">
                            {formatInline(trimmed.replace('> ', ''))}
                          </blockquote>
                        );
                      }

                      return (
                        <p key={i} className="text-gray-300 text-xs sm:text-sm md:text-[13px] leading-relaxed mb-3">
                          {formatInline(trimmed)}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function formatInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded text-[11px] md:text-[11px] break-all">{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
}