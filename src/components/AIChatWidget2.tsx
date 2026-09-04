import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import ApiServices from '../services/ApiServices';

interface AIChatWidgetProps {
  activeChild?: any;
}

export const AIChatWidget: React.FC<AIChatWidgetProps> = ({ activeChild }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: number, text: string, isBot: boolean }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const childName = activeChild?.name || 'your child';
  const childGrade = activeChild?.grade ? ` (Class ${activeChild.grade})` : '';

  useEffect(() => {
    setMessages([
      { id: 1, text: `Hello! I'm AcuGrade Teacher Support. Do you have any questions about ${childName}'s learning journey${childGrade}?`, isBot: true }
    ]);
  }, [activeChild]);

  const hasTakenExams = activeChild?.totalExamsTaken > 0;

  const SUGGESTED_QUESTIONS = hasTakenExams 
    ? [
        `How is ${childName} progressing?`,
        `Which subject does ${childName} need more attention on?`,
        `What should ${childName} practice next?`,
        "Explain the latest exam result to me"
      ]
    : [
        "How do I get started with AcuGrade?",
        `What is the best way to build a daily study routine for ${childName}?`,
        "Can you suggest some fun learning activities?",
        `How can I assess ${childName}'s current knowledge level?`
      ];

  const handleSendText = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { id: Date.now(), text, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build history for backend (skip the first greeting or keep it, backend ignores non user/assistant anyway)
      const chatHistory = messages
        .filter(m => m.id !== 1) // Optional: remove local initial greeting from context if desired, or keep it
        .map(m => ({ role: m.isBot ? "assistant" : "user", content: m.text }));
      chatHistory.push({ role: "user", content: text });

      const res = await ApiServices.sendChatMessage({
        messages: chatHistory,
        student_id: activeChild?.id
      });
      
      const botMsg = { id: Date.now() + 1, text: res.response || "I didn't quite get that.", isBot: true };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting right now. Please try again later.", isBot: true };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendText(inputText);
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
                <h3 className="font-bold text-sm">Teacher Support</h3>
                <p className="text-[10px] text-yellow-100 font-medium">Online • Replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.isBot ? '' : 'flex-row-reverse'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.isBot ? 'bg-amber-100 text-amber-600' : 'bg-stone-200 text-stone-600'}`}>
                  {msg.isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div className={`px-3 py-2 rounded-2xl max-w-[80%] text-xs shadow-xs whitespace-pre-wrap ${msg.isBot ? 'bg-white border border-stone-200 text-stone-700 rounded-tl-none' : 'bg-yellow-500 text-white font-medium rounded-tr-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-col gap-2 pt-2">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider text-center mb-1">Suggested Questions</p>
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendText(q)}
                    className="text-left bg-white border border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 text-stone-700 text-xs px-3 py-2 rounded-xl transition-all shadow-2xs"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-stone-200 rounded-tl-none shadow-xs flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100 flex gap-2 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Teacher Support anything..."
              className="flex-1 bg-stone-100 border-none rounded-full px-4 py-2 text-xs focus:ring-2 focus:ring-yellow-400 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-xs"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 bg-gradient-to-tr from-yellow-500 to-amber-500 text-white hover:shadow-yellow-500/20"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
