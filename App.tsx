import React, { useState } from 'react';
import { AppView, User, Feature, ChatConfig } from './types';
import { Icons } from './constants';
import ChatInterface from './components/ChatInterface';
import AuthForm from './components/AuthForm';
import PrayerTimes from './components/PrayerTimes';
import ZakatCalculator from './components/ZakatCalculator';
import LifestyleHub from './components/LifestyleHub';
import LearningHub from './components/LearningHub';
import LectureSummarizer from './components/LectureSummarizer';
import QuranReader from './components/QuranReader';
import HadithReader from './components/HadithReader';
import DuaCollection from './components/DuaCollection';

const App = () => {
    const [view, setView] = useState<AppView>(AppView.LANDING);
    const [user, setUser] = useState<User | null>(null);
    const [currentChatConfig, setCurrentChatConfig] = useState<ChatConfig | undefined>(undefined);

    const handleLogin = (newUser: User) => {
        setUser(newUser);
        setView(AppView.DASHBOARD);
    };

    const handleSignOut = () => {
        setUser(null);
        setView(AppView.LANDING);
    };

    const launchChat = (config: ChatConfig) => {
        setCurrentChatConfig(config);
        setView(AppView.CHAT);
    };

    const handleLifestyleToolLaunch = (toolId: string) => {
        switch(toolId) {
            case 'zakat':
                setView(AppView.ZAKAT);
                break;
            case 'halal-food':
                launchChat({
                    id: 'halal-food',
                    title: 'Halal Food Finder',
                    systemInstruction: "You are a helpful assistant for finding Halal food. Use Google Search to find top-rated halal restaurants, markets, or butchers near the user's location or specified area. Provide ratings, addresses, and cuisine types.",
                    initialMessage: "I can help you find Halal food nearby. Where are you located and what are you craving?",
                    icon: <Icons.Food />,
                    useGoogleSearch: true,
                    model: 'gemini-2.5-flash'
                });
                break;
            case 'modest-fashion':
                launchChat({
                    id: 'modest-fashion',
                    title: 'Modest Fashion Stylist',
                    systemInstruction: "You are a Modest Fashion expert. Help users find clothing brands, style outfits, and discover trends that adhere to Islamic modesty principles. Use Google Search to find current collections and links.",
                    initialMessage: "Looking for a new look? I can help you find modest fashion brands and styles. What's the occasion?",
                    icon: <Icons.Fashion />,
                    useGoogleSearch: true,
                    model: 'gemini-2.5-flash'
                });
                break;
            case 'charity':
                launchChat({
                    id: 'charity',
                    title: 'Charity Platform',
                    systemInstruction: "You are a guide for Islamic Charity (Sadaqah/Zakat). Help users find trusted organizations for specific causes (e.g., orphans, water, education) using Google Search. Verify they are reputable.",
                    initialMessage: "Your charity can change lives. Are there specific causes you want to support today?",
                    icon: <Icons.Charity />,
                    useGoogleSearch: true,
                    model: 'gemini-2.5-flash'
                });
                break;
        }
    };

    const handleLearningToolLaunch = (toolId: string) => {
        switch(toolId) {
            case 'hadith-reader':
                setView(AppView.HADITH_READER);
                break;
            case 'lecture-summarizer':
                setView(AppView.LECTURE_SUMMARIZER);
                break;
            case 'history-bot':
                launchChat({
                    id: 'history',
                    title: 'Islamic Historian',
                    systemInstruction: "You are an expert Islamic Historian. Provide detailed narratives from the Seerah, Caliphates, and Islamic Golden Age. Be accurate with dates and sources.",
                    initialMessage: "I can take you back in time. Which era or event in Islamic history would you like to explore?",
                    icon: <Icons.History />,
                    model: 'gemini-3-pro-preview',
                    thinkingBudget: 16000
                });
                break;
            case 'hadith-library-chat':
                launchChat({
                    id: 'hadith',
                    title: 'Hadith Explorer',
                    systemInstruction: "You are a Hadith expert. Help users find hadiths from authentic collections (Bukhari, Muslim, etc.) based on topics or keywords. Provide the Arabic text, translation, and reference number.",
                    initialMessage: "Search the words of the Prophet (ﷺ). What topic or hadith are you looking for?",
                    icon: <Icons.Library />,
                    useGoogleSearch: true,
                    model: 'gemini-2.5-flash'
                });
                break;
            case 'linguistic-explorer':
                launchChat({
                    id: 'linguistics',
                    title: 'Linguistic Explorer',
                    systemInstruction: "You are an expert in Classical Arabic and Quranic Etymology (Ishtiqaq). When a user provides a word or verse, explain the triliteral root, its derivatives, and its usage in the Quran to reveal deeper meanings.",
                    initialMessage: "Enter an Arabic word or Quranic verse to explore its deep linguistic roots and meanings.",
                    icon: <Icons.Learning />,
                    model: 'gemini-3-pro-preview',
                    thinkingBudget: 16000
                });
                break;
        }
    }

    const BentoItem: React.FC<{ feature: Feature; delay: number }> = ({ feature, delay }) => (
        <div 
            className={`glass-card rounded-3xl p-6 lg:p-8 ${feature.colSpan || ''} ${feature.rowSpan || ''} cursor-pointer group hover:translate-y-[-8px] animate-fade-in-up`}
            style={{ animationDelay: `${delay}ms` }}
            onClick={feature.action}
        >
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-secondary-light rounded-xl group-hover:scale-110 transition-transform duration-300 text-primary-dark">
                        {feature.icon}
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-semibold text-primary-dark">{feature.title}</h2>
                </div>
                <p className="text-secondary-dark mb-6 text-sm sm:text-base">{feature.description}</p>
                
                {feature.subFeatures && (
                    <div className={`space-y-3 ${feature.rowSpan ? 'mt-auto' : ''}`}>
                        {feature.subFeatures.map((sf, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/30 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-dark"></span>
                                <span className="font-medium text-primary-dark text-sm">{sf}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const features: Feature[] = [
        {
            id: 'qa',
            title: 'AI Q&A & Ethics',
            description: 'Deep knowledge across Fiqh, Theology, and Interpersonal Ethics.',
            icon: <Icons.Bot />,
            colSpan: 'lg:col-span-3',
            subFeatures: ['Comparative Fiqh (Ikhtilaf)', 'Interpersonal Ethics Coach', 'Theological Reasoning'],
            action: () => launchChat({
                id: 'default',
                title: 'DeenGPT Pro',
                systemInstruction: "You are DeenGPT, a knowledgeable Islamic AI. Use your thinking capabilities to answer complex questions about Islam, Quran, and Sunnah with depth, nuance, and evidence. You are also an Ethics Coach: for interpersonal dilemmas, suggest 3 responses based on Islamic Adab (manners). For Fiqh questions, outline the differences of opinion (Ikhtilaf) and their methodologies.",
                initialMessage: "Salaam ${user.name}. I am equipped with advanced reasoning to help you navigate complex spiritual questions and ethical dilemmas. What is on your mind?",
                model: 'gemini-3-pro-preview',
                thinkingBudget: 32768
            })
        },
        {
            id: 'daily',
            title: 'Daily Essentials',
            description: 'Tools to seamlessly integrate Islamic practice into your daily routine.',
            icon: <Icons.Essentials />,
            colSpan: 'lg:col-span-2',
            subFeatures: ['Prayer Times & Athan', 'Spiritual Streak Tracker', 'Qibla Finder'],
            action: () => setView(AppView.PRAYER_TIMES)
        },
        {
            id: 'learning',
            title: 'Learning Center',
            description: 'Comprehensive resources for in-depth, personalized Islamic study.',
            icon: <Icons.Learning />,
            colSpan: 'lg:col-span-2',
            subFeatures: ['Hadith Collections', 'Khutbah Summarizer', 'History Explorer'],
            action: () => setView(AppView.LEARNING_HUB)
        },
        {
            id: 'quran-main',
            title: 'Noble Quran',
            description: 'Read the Holy Quran Surah by Surah with clear text and translations.',
            icon: <Icons.BookOpen />,
            colSpan: 'lg:col-span-3',
            subFeatures: ['Surah Index', 'Uthmani Script', 'Sahih Translations'],
            action: () => setView(AppView.QURAN_READER)
        },
        {
            id: 'dua-main',
            title: 'Dua & Adhkar',
            description: 'Fortress of the Believer: Authentic supplications for every occasion.',
            icon: <Icons.PrayingHands />,
            colSpan: 'lg:col-span-2',
            subFeatures: ['Morning & Evening', 'Distress & Anxiety', 'Daily Prayers'],
            action: () => setView(AppView.DUA_COLLECTION)
        },
        {
            id: 'lifestyle',
            title: 'Lifestyle Hub',
            description: 'Utilities for a confident Halal life: Food, Finance, Fashion & Charity.',
            icon: <Icons.Lifestyle />,
            colSpan: 'lg:col-span-3',
            subFeatures: ['Halal Food Finder', 'Zakat Calculator', 'Modest Fashion', 'Charity Platform'],
            action: () => setView(AppView.LIFESTYLE_HUB)
        },
        {
            id: 'community',
            title: 'Community',
            description: 'Connect with study partners and finding local events.',
            icon: <Icons.Community />,
            colSpan: 'lg:col-span-5',
            subFeatures: ['Virtual Study Rooms', 'Community Events', 'Discussion Circles'],
            action: () => launchChat({
                id: 'study-room',
                title: 'Virtual Study Partner',
                systemInstruction: "You are a virtual study partner for Islamic studies. You help users learn by quizzing them, explaining concepts simply, and keeping them motivated. You can act as a tutor for Tajweed theory, Fiqh basics, or Seerah.",
                initialMessage: "Salaam! I'm your study partner. What topic are we mastering today? I can help with revision, quizzes, or explaining difficult concepts.",
                icon: <Icons.Community />,
                model: 'gemini-3-pro-preview',
                thinkingBudget: 16000
            })
        }
    ];

    return (
        <div className="min-h-screen overflow-x-hidden relative font-sans text-neutral-dark antialiased">
             {/* Background Layers */}
            <div className="fixed inset-0 animated-gradient z-0"></div>
            <div className="fixed inset-0 bg-background opacity-20 z-10 pointer-events-none"></div>
            <div className="fixed inset-0 z-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(237, 252, 255, 0.1) 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

            {/* Auth Overlay */}
            {view === AppView.AUTH && (
                <AuthForm onLogin={handleLogin} onCancel={() => setView(AppView.LANDING)} />
            )}

            <div className="relative z-30 flex flex-col min-h-screen">
                
                {/* Navbar */}
                <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => user ? setView(AppView.DASHBOARD) : setView(AppView.LANDING)}>
                        <Icons.Logo />
                        <span className="font-display font-bold text-xl text-primary-dark tracking-tight">DeenGPT</span>
                    </div>
                    <div>
                        {user ? (
                             <div className="flex items-center gap-4">
                                <span className="hidden sm:block text-sm font-medium text-secondary-dark">Salaam, {user.name}</span>
                                <button 
                                    onClick={handleSignOut} 
                                    className="px-4 py-2 text-sm text-primary-dark font-semibold border border-primary-dark/30 rounded-full hover:bg-primary-dark hover:text-white transition-all"
                                >
                                    Sign Out
                                </button>
                             </div>
                        ) : (
                            <button 
                                onClick={() => setView(AppView.AUTH)} 
                                className="px-5 py-2.5 bg-primary-dark text-white rounded-full font-semibold shadow-lg shadow-primary-dark/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                Get Started
                            </button>
                        )}
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    
                    {/* Landing View */}
                    {view === AppView.LANDING && (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-up">
                            <div className="mb-6 inline-flex items-center justify-center p-4 bg-primary-light/50 rounded-full shadow-lg border border-secondary-light backdrop-blur-sm text-primary-dark">
                                <Icons.Logo />
                            </div>
                            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-bold text-primary-dark tracking-tight mb-6">
                                DeenGPT
                            </h1>
                            <p className="max-w-2xl font-sans text-lg md:text-xl text-secondary-dark mb-10 leading-relaxed">
                                Your AI Companion for Faith and Knowledge. <br className="hidden md:block"/> 
                                Seamlessly integrating advanced technology with timeless Islamic wisdom.
                            </p>
                            <button 
                                onClick={() => setView(AppView.AUTH)}
                                className="group px-8 py-4 bg-primary-dark text-white text-lg rounded-full font-bold shadow-xl shadow-primary-dark/25 hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                            >
                                Start Your Journey
                                <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
                            </button>
                            
                            {/* Features Preview Grid on Landing Page */}
                            <div className="mt-24 w-full animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                <div className="text-center mb-10">
                                    <h2 className="text-2xl font-bold text-primary-dark">Explore Our Features</h2>
                                    <p className="text-secondary-dark mt-2">A complete ecosystem for your spiritual lifestyle</p>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left opacity-95">
                                    {features.map((feature, index) => (
                                        <BentoItem 
                                            key={feature.id} 
                                            feature={{
                                                ...feature,
                                                action: () => setView(AppView.AUTH) // Force auth on click
                                            }} 
                                            delay={index * 100} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dashboard View (Bento Grid) */}
                    {view === AppView.DASHBOARD && (
                        <div className="py-8">
                            <div className="mb-8 animate-fade-in-up">
                                <h2 className="text-3xl font-display font-bold text-primary-dark">Dashboard</h2>
                                <p className="text-secondary-dark">Select a tool to begin</p>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                {features.map((feature, index) => (
                                    <BentoItem key={feature.id} feature={feature} delay={index * 100} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat View */}
                    {view === AppView.CHAT && user && (
                        <div className="h-full pt-4 animate-fade-in-up">
                            <ChatInterface 
                                user={user} 
                                onBack={() => setView(AppView.DASHBOARD)} 
                                chatConfig={currentChatConfig}
                            />
                        </div>
                    )}

                    {/* Prayer Times View */}
                    {view === AppView.PRAYER_TIMES && user && (
                        <div className="h-full pt-4 animate-fade-in-up">
                            <PrayerTimes user={user} onBack={() => setView(AppView.DASHBOARD)} />
                        </div>
                    )}

                    {/* Lifestyle Hub */}
                    {view === AppView.LIFESTYLE_HUB && user && (
                         <div className="h-full pt-4 animate-fade-in-up">
                            <LifestyleHub 
                                onBack={() => setView(AppView.DASHBOARD)}
                                onLaunchTool={handleLifestyleToolLaunch}
                            />
                        </div>
                    )}

                    {/* Learning Hub */}
                    {view === AppView.LEARNING_HUB && user && (
                         <div className="h-full pt-4 animate-fade-in-up">
                            <LearningHub 
                                onBack={() => setView(AppView.DASHBOARD)}
                                onLaunchTool={handleLearningToolLaunch}
                            />
                        </div>
                    )}

                    {/* Lecture Summarizer View */}
                    {view === AppView.LECTURE_SUMMARIZER && user && (
                         <div className="h-full pt-4 animate-fade-in-up">
                            <LectureSummarizer 
                                onBack={() => setView(AppView.LEARNING_HUB)}
                            />
                        </div>
                    )}

                    {/* Quran Reader View */}
                    {view === AppView.QURAN_READER && user && (
                        <div className="h-full pt-4 animate-fade-in-up">
                            <QuranReader onBack={() => setView(AppView.DASHBOARD)} />
                        </div>
                    )}

                    {/* Hadith Reader View */}
                    {view === AppView.HADITH_READER && user && (
                        <div className="h-full pt-4 animate-fade-in-up">
                            <HadithReader onBack={() => setView(AppView.LEARNING_HUB)} />
                        </div>
                    )}

                    {/* Dua Collection View */}
                    {view === AppView.DUA_COLLECTION && user && (
                        <div className="h-full pt-4 animate-fade-in-up">
                            <DuaCollection onBack={() => setView(AppView.DASHBOARD)} />
                        </div>
                    )}

                    {/* Zakat Calculator View */}
                    {view === AppView.ZAKAT && user && (
                        <div className="h-full pt-4 animate-fade-in-up">
                            <ZakatCalculator onBack={() => setView(AppView.LIFESTYLE_HUB)} />
                        </div>
                    )}

                </main>

                {/* Footer */}
                <footer className="text-center py-8 px-4 relative z-30">
                    <p className="text-secondary-dark/70 text-sm"></p>
                </footer>
            </div>
        </div>
    );
};

export default App;