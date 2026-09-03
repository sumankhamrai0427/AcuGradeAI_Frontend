import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm SahajPath AI Support. How can I help you today?", isBot: true }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), text: inputText, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, text: "Thanks for reaching out! I'm a demo AI assistant right now. We'll connect real AI logic soon.", isBot: true };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border border-stone-200 shadow-2xl rounded-2xl w-80 sm:w-96 h-[28rem] mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-4 text-white flex justify-between items-center shadow-xs">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Mentor Support</h3>
                <p className="text-[10px] text-yellow-100 font-medium">Online • Replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={lex gap-2 }>
                <div className={w-6 h-6 rounded-full flex items-center justify-center shrink-0 }>
                  {msg.isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div className={px-3 py-2 rounded-2xl max-w-[80%] text-xs shadow-xs }>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100 flex gap-2 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-stone-100 border-none rounded-full px-4 py-2 text-xs focus:ring-2 focus:ring-yellow-400 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 }
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};
