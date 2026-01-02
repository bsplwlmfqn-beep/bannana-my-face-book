
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithGemini } from '../services/geminiService';
import { Button } from './Button';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Banana here! 🍌 Ready to peel back some data and find your winning campaign strategy?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatWithGemini(messages, input);
      setMessages(prev => [...prev, { role: 'model', text: responseText || 'No response' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Peel error. Try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-slate-950 rounded-[32px] shadow-2xl w-[380px] h-[550px] flex flex-col border-2 border-yellow-400 overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Outlined Header */}
          <div className="bg-black p-6 flex items-center justify-between border-b-2 border-yellow-400">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border-2 border-yellow-400 rounded-xl flex items-center justify-center bg-transparent">
                <span className="text-xl">🍌</span>
              </div>
              <div>
                <h3 className="text-yellow-400 font-black text-xs uppercase tracking-widest leading-none mb-1">Banana Strategist</h3>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-tighter italic">Ripening Success</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-yellow-400 hover:scale-110 hover:rotate-90 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-black scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] leading-relaxed font-bold ${
                  msg.role === 'user' 
                    ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.2)]' 
                    : 'bg-slate-900 text-slate-200 border border-slate-800'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-slate-950 border-t border-slate-900 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask for banana-fuelled advice..."
              className="flex-1 bg-black border-2 border-yellow-400/60 rounded-xl px-4 py-3 text-xs text-slate-300 placeholder:text-slate-700 focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading} 
              className="bg-yellow-400 p-3 rounded-xl text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors shadow-lg shadow-yellow-900/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-transparent text-yellow-400 rounded-[20px] shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-2 border-yellow-400 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-yellow-400/5 group-hover:bg-yellow-400/10 transition-colors"></div>
          <span className="text-3xl relative z-10 group-hover:rotate-12 transition-transform">🍌</span>
        </button>
      )}
    </div>
  );
};
