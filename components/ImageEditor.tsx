import React, { useState, useRef } from 'react';
import { Icons } from '../constants';
import { editImage } from '../services/geminiService';

interface ImageEditorProps {
    onBack: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onBack }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResultUrl(null);
            setError(null);
        }
    };

    const handleEdit = async () => {
        if (!selectedFile || !prompt.trim()) return;

        setLoading(true);
        setError(null);
        setResultUrl(null);

        try {
            const result = await editImage(selectedFile, prompt);
            if (result) {
                setResultUrl(result);
            } else {
                setError("Could not edit image. Please try again.");
            }
        } catch (err) {
            setError("Error processing image. Please check your connection.");
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
                        <h3 className="font-display font-bold text-xl text-primary-dark">Magic Image Editor</h3>
                        <p className="text-xs text-secondary-dark">Powered by Nano Banana</p>
                    </div>
                </div>
                <div className="bg-primary-light p-2 rounded-full text-primary-dark">
                    <Icons.Wand />
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
                                    <p className="font-medium text-primary-dark">Click to upload image</p>
                                    <p className="text-xs text-secondary-dark mt-2">JPG, PNG up to 5MB</p>
                                </>
                            )}
                        </div>

                        <div className="bg-white/40 p-6 rounded-2xl border border-white/50">
                            <label className="block text-sm font-medium text-secondary-dark mb-2">
                                Describe your edit
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-white/60 p-3 rounded-xl border border-secondary-light focus:border-primary-dark outline-none text-sm"
                                    placeholder="e.g. 'Add a retro filter', 'Remove background person'"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                                />
                                <button
                                    onClick={handleEdit}
                                    disabled={loading || !selectedFile || !prompt.trim()}
                                    className="px-4 py-2 bg-primary-dark text-white rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all hover:scale-105"
                                >
                                    {loading ? '...' : <Icons.Wand />}
                                </button>
                            </div>
                            {error && <p className="mt-2 text-xs text-error">{error}</p>}
                        </div>
                    </div>

                    {/* Result Side */}
                    <div className="bg-white/20 rounded-2xl border border-white/30 flex items-center justify-center relative overflow-hidden min-h-[400px]">
                        {resultUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <img src={resultUrl} alt="Edited" className="max-h-full max-w-full rounded-lg shadow-2xl" />
                                <a 
                                    href={resultUrl} 
                                    download={`edited-${Date.now()}.png`}
                                    className="absolute bottom-4 right-4 p-3 bg-white text-primary-dark rounded-full shadow-lg hover:scale-105 transition-transform"
                                >
                                    <Icons.Download />
                                </a>
                            </div>
                        ) : (
                            <div className="text-center opacity-40">
                                <p>Edited image will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;