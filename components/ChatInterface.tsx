import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';
import { Message, User, ChatConfig } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface ChatInterfaceProps {
    user: User;
    onBack: () => void;
    chatConfig?: ChatConfig;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onBack, chatConfig }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize with welcome message based on config or default
        const initialText = chatConfig?.initialMessage 
            ? chatConfig.initialMessage.replace('${user.name}', user.name)
            : `Salaam ${user.name}, I am DeenGPT. How can I assist you in your spiritual journey today?`;

        setMessages([
            {
                id: 'welcome',
                role: 'model',
                text: initialText,
                timestamp: new Date()
            }
        ]);
    }, [chatConfig, user.name]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Prepare history for API
        const history = messages.map(m => ({ role: m.role, text: m.text }));

        try {
            const responseText = await sendMessageToGemini(history, userMsg.text, chatConfig);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[85vh] w-full max-w-4xl mx-auto glass-card rounded-3xl overflow-hidden relative shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-light/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                         <Icons.ChevronLeft />
                    </button>
                    <div className="p-2 bg-primary-light rounded-full text-primary-dark">
                        {chatConfig?.icon || <Icons.Bot />}
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-primary-dark">{chatConfig?.title || 'DeenGPT'}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <p className="text-xs text-secondary-dark">
                                {chatConfig?.useGoogleSearch ? 'Search Enabled' : chatConfig?.thinkingBudget ? 'Deep Thinking Mode' : 'Online'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-white/20">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl ${
                                msg.role === 'user'
                                    ? 'bg-primary-dark text-white rounded-br-none'
                                    : 'bg-white/80 backdrop-blur-sm text-neutral-dark shadow-sm border border-white/60 rounded-bl-none'
                            }`}
                        >
                            <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                                {msg.text}
                            </div>
                            <span className={`text-[10px] block mt-2 ${msg.role === 'user' ? 'text-white/60' : 'text-neutral-500'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start w-full">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl rounded-bl-none shadow-sm border border-white/60">
                            <div className="flex gap-2">
                                <span className="w-2 h-2 bg-primary-dark/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-primary-dark/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-primary-dark/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/40 backdrop-blur-md border-t border-secondary-light/50">
                <div className="flex items-center gap-2 bg-white/70 rounded-2xl p-2 border border-white shadow-inner">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={chatConfig ? `Ask ${chatConfig.title}...` : "Ask about Quran, Hadith, or daily guidance..."}
                        className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-neutral-dark placeholder-neutral-500/70"
                        autoFocus
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-primary-dark text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        <Icons.Send />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-secondary-dark/60">AI can make mistakes. Verify important information.</p>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;