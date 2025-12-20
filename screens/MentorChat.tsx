
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import BottomNav from '../components/BottomNav';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const MentorChat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'hola alex. soy tu mentor supra. ¿en qué batalla mental estás hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: 'Eres el Mentor de SUPRA, una app de bienestar para la Generación Z. Tu tono es estoico moderno: pragmático, empoderador, directo y sin adornos innecesarios. No eres un psicólogo clínico, eres un guía de hábitos atómicos y fortaleza mental. Responde siempre de forma concisa (máximo 3 párrafos cortos) y en minúsculas (estilo supra). Si el usuario está ansioso, dale una perspectiva estoica sobre lo que puede controlar.',
        },
      });

      // Sending full history for context
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...history, { role: 'user', parts: [{ text: input }] }],
        config: {
            systemInstruction: 'Eres el Mentor de SUPRA, una app de bienestar para la Generación Z. Tu tono es estoico moderno: pragmático, empoderador, directo y sin adornos innecesarios. No eres un psicólogo clínico, eres un guía de hábitos atómicos y fortaleza mental. Responde siempre de forma concisa y en minúsculas (estilo supra).'
        }
      });

      const responseText = result.text || 'la mente a veces se queda en silencio. respira.';
      setMessages(prev => [...prev, { role: 'model', text: responseText.toLowerCase() }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'error en la conexión. mantén la calma.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black h-full lowercase overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 border-b border-white/5 apple-blur sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-to-tr from-purple-600 to-emerald-400 p-[1px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[20px] icon-filled">auto_awesome</span>
                </div>
            </div>
            <div>
                <h2 className="text-base font-bold text-white tracking-tight">mentor supra</h2>
                <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">ia activa</span>
                </div>
            </div>
        </div>
        <button onClick={() => setMessages([{ role: 'model', text: 'historia borrada. mente nueva.' }])} className="text-neutral-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
        </button>
      </header>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6 no-scrollbar"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 text-base leading-relaxed ${
              m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai text-white/90'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai rounded-[1.5rem] px-5 py-3.5 flex gap-1 items-center">
              <div className="size-1.5 bg-neutral-500 rounded-full typing-dot" />
              <div className="size-1.5 bg-neutral-500 rounded-full typing-dot [animation-delay:0.2s]" />
              <div className="size-1.5 bg-neutral-500 rounded-full typing-dot [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <footer className="p-6 pb-32">
        <div className="bg-neutral-900 rounded-[2rem] border border-white/5 p-2 flex items-center gap-2 focus-within:border-white/20 transition-all">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="habla conmigo..."
            className="flex-1 bg-transparent border-none text-white px-4 py-3 outline-none focus:ring-0 text-base"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`size-12 rounded-full flex items-center justify-center transition-all ${
                input.trim() ? 'bg-white text-black scale-100' : 'bg-neutral-800 text-neutral-600 scale-90'
            }`}
          >
            <span className="material-symbols-outlined">north</span>
          </button>
        </div>
      </footer>
      
      <BottomNav />
    </div>
  );
};

export default MentorChat;
