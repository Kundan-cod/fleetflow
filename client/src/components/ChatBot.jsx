import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';

const INITIAL_MESSAGES = [
    { role: 'bot', text: 'Hello! I am FleetAssist AI. How can I help you manage your fleet today?' },
];

import api from '../api';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await api.post('/ai/chat', { message: input });
            setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);
        } catch (err) {
            console.error('ChatBot Error:', err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || "I'm having trouble connecting to the fleet control center.";
            setMessages(prev => [...prev, { role: 'bot', text: `⚠️ AI Error: ${errMsg}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-96 h-[500px] glass-card flex flex-col shadow-2xl overflow-hidden border-accent/20"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-accent to-blue-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">FleetAssist AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-white/70">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-2 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-accent/20 border border-accent/30' : 'bg-navy-700'
                                            }`}>
                                            {m.role === 'user' ? <User className="w-4 h-4 text-accent" /> : <Bot className="w-4 h-4 text-blue-400" />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${m.role === 'user'
                                            ? 'bg-accent text-white rounded-tr-none'
                                            : 'bg-navy-800 text-slate-300 border border-white/5 rounded-tl-none'
                                            }`}>
                                            {m.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="bg-navy-800 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-navy-900/50">
                            <div className="relative">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about fleet, drivers, or trips..."
                                    className="w-full bg-navy-800 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-accent rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-dark transition-colors"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-glow-lg transition-all duration-500 ${isOpen ? 'bg-danger rotate-90' : 'bg-accent'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-accent border-2 border-navy-950"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
}
