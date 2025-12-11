import React, { useState, useRef } from 'react';
import { Icons } from '../constants';
import { generateVideo } from '../services/geminiService';

interface VideoGeneratorProps {
    onBack: () => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onBack }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setVideoUrl(null);
            setError(null);
        }
    };

    const handleGenerate = async () => {
        if (!selectedFile) return;

        // Ensure user has selected a key for Veo
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
            }
        }

        setLoading(true);
        setError(null);
        setVideoUrl(null);

        try {
            const result = await generateVideo(selectedFile, prompt);
            if (result) {
                setVideoUrl(result);
            } else {
                setError("Could not generate video. Please try again.");
            }
        } catch (err) {
            setError("Error generating video. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[85vh] w-full max-w-5xl mx-auto glass-card rounded-3xl overflow-hidden relative shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-secondary-light/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors text-primary-dark">
                         <Icons.ChevronLeft />
                    </button>
                    <div>
                        <h3 className="font-display font-bold text-xl text-primary-dark">Veo Animator</h3>
                        <p className="text-xs text-secondary-dark">Bring images to life</p>
                    </div>
                </div>
                <div className="bg-primary-light p-2 rounded-full text-primary-dark">
                    <Icons.Movie />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-gradient-to-b from-transparent to-white/20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    {/* Input Side */}
                    <div className="flex flex-col gap-6">
                        <div 
                            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${selectedFile ? 'border-primary-dark/30 bg-white/30' : 'border-secondary-dark/30 hover:bg-white/30'}`}
                            onClick={() => fileInputRef.current?.click()}
                            style={{ minHeight: '300px' }}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileSelect} 
                            />
                            
                            {previewUrl ? (
                                <img src={previewUrl} alt="Original" className="max-h-[280px] max-w-full rounded-lg shadow-sm" />
                            ) : (
                                <>
                                    <div className="bg-primary-light p-4 rounded-full text-primary-dark mb-4">
                                        <Icons.Upload />
                                    </div>
                                    <p className="font-medium text-primary-dark">Upload photo to animate</p>
                                </>
                            )}
                        </div>

                        <div className="bg-white/40 p-6 rounded-2xl border border-white/50">
                            <label className="block text-sm font-medium text-secondary-dark mb-2">
                                Prompt (Optional)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-white/60 p-3 rounded-xl border border-secondary-light focus:border-primary-dark outline-none text-sm"
                                    placeholder="e.g. 'Cinematic slow motion'"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !selectedFile}
                                    className="px-6 py-2 bg-primary-dark text-white rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all hover:scale-105 flex items-center gap-2"
                                >
                                    {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span> : <Icons.Movie />}
                                    Generate
                                </button>
                            </div>
                            {error && <p className="mt-2 text-xs text-error">{error}</p>}
                        </div>
                    </div>

                    {/* Result Side */}
                    <div className="bg-white/20 rounded-2xl border border-white/30 flex items-center justify-center relative overflow-hidden min-h-[400px]">
                        {videoUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <video 
                                    src={videoUrl} 
                                    controls 
                                    autoPlay 
                                    loop 
                                    className="max-h-full max-w-full rounded-lg shadow-2xl" 
                                />
                            </div>
                        ) : (
                            <div className="text-center opacity-40 p-8">
                                <p>{loading ? "Generating video... This may take a moment." : "Animated video will appear here"}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoGenerator;