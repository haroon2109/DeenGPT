import React, { useState } from 'react';
import { Icons } from '../constants';
import { sendMessageToGemini } from '../services/geminiService';

interface LectureSummarizerProps {
    onBack: () => void;
}

const LectureSummarizer: React.FC<LectureSummarizerProps> = ({ onBack }) => {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;

        setLoading(true);
        setResult(null);

        const prompt = `
            Please analyze the following text (which may be a transcript of an Islamic Khutbah or lecture, or a URL to one).
            
            Perform the following tasks:
            1. **Key Themes**: Extract the central messages and spiritual themes.
            2. **References**: List all cited Quranic verses (Surah:Ayah) and Hadiths. Verify their context if possible.
            3. **Structured Outline**: Create a concise, bullet-point summary or time-stamped outline of the content.
            
            Input content:
            "${inputText}"
        `;

        try {
            // We reuse the chat service but as a single-turn request.
            // Using gemini-2.5-flash which is efficient for large text.
            const response = await sendMessageToGemini(
                [], // No history
                prompt, 
                {
                    id: 'summarizer',
                    title: 'Summarizer',
                    systemInstruction: 'You are an expert Islamic Content Analyst. Your goal is to summarize lectures accurately, identifying key theological points, practical advice, and authentic references.',
                    model: 'gemini-2.5-flash',
                    useGoogleSearch: true, // Enable search in case input is a URL or needs verification
                    initialMessage: '' // Added to satisfy ChatConfig required property
                }
            );
            setResult(response);
        } catch (error) {
            console.error(error);
            setResult("An error occurred while analyzing the content. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[85vh] w-full max-w-4xl mx-auto glass-card rounded-3xl overflow-hidden relative shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-light/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors text-primary-dark">
                         <Icons.ChevronLeft />
                    </button>
                    <div>
                        <h3 className="font-display font-bold text-xl text-primary-dark">Khutbah & Lecture AI</h3>
                        <p className="text-xs text-secondary-dark">Summarize, Index & Extract Wisdom</p>
                    </div>
                </div>
                <div className="bg-primary-light p-2 rounded-full text-primary-dark">
                    <Icons.FileText />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-gradient-to-b from-transparent to-white/20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Input Section */}
                    <div className="flex flex-col h-full space-y-4">
                        <div className="bg-white/40 p-4 rounded-2xl border border-white/50 flex-1 flex flex-col">
                            <label className="block text-sm font-bold text-primary-dark mb-2">
                                Input Text or URL
                            </label>
                            <textarea
                                className="flex-1 w-full bg-white/50 p-4 rounded-xl border border-secondary-light focus:border-primary-dark outline-none resize-none text-sm leading-relaxed"
                                placeholder="Paste the full text of a Khutbah, lecture notes, or a URL to a transcript here..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={loading || !inputText.trim()}
                                    className="px-6 py-3 bg-primary-dark text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Icons.AdvancedAI />
                                            Analyze Content
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="bg-primary-light/50 p-4 rounded-xl border border-primary-light text-xs text-secondary-dark">
                            <strong>Tip:</strong> You can paste a URL to a public article or transcript. The AI will use Google Search to try and retrieve context.
                        </div>
                    </div>

                    {/* Result Section */}
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-6 overflow-y-auto shadow-inner h-full min-h-[400px]">
                        {!result && !loading && (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-40 space-y-4">
                                <Icons.FileText />
                                <p>Analysis results will appear here.<br/>Extract themes, verses, and outlines instantly.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-secondary-light rounded w-3/4"></div>
                                <div className="h-4 bg-secondary-light rounded w-1/2"></div>
                                <div className="h-32 bg-secondary-light rounded w-full"></div>
                                <div className="h-4 bg-secondary-light rounded w-5/6"></div>
                            </div>
                        )}

                        {result && (
                            <div className="prose prose-sm max-w-none text-neutral-dark">
                                <div className="whitespace-pre-wrap leading-relaxed">
                                    {result}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LectureSummarizer;