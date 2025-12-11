import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../constants';
import { generateImage } from '../services/geminiService';

interface WallpaperStudioProps {
    onBack: () => void;
}

interface Surah {
    number: number;
    name: string;
    englishName: string;
}

interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    translation?: string; // We will merge translation here
}

const SAMPLE_WALLPAPERS = [
    { id: 'static-1', url: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=1000&auto=format&fit=crop', title: 'Blue Mosque' },
    { id: 'static-2', url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1000&auto=format&fit=crop', title: 'Quran Recitation' },
    { id: 'static-3', url: 'https://images.unsplash.com/photo-1542283087-25e114175317?q=80&w=1000&auto=format&fit=crop', title: 'Medina Sunset' },
    { id: 'static-4', url: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?q=80&w=1000&auto=format&fit=crop', title: 'Islamic Geometry' },
    { id: 'static-5', url: 'https://images.unsplash.com/photo-1597956324263-23a54911d331?q=80&w=1000&auto=format&fit=crop', title: 'Lanterns' },
    { id: 'static-6', url: 'https://images.unsplash.com/photo-1551041777-ed02bed788a6?q=80&w=1000&auto=format&fit=crop', title: 'Prayer Beads' },
];

const WallpaperStudio: React.FC<WallpaperStudioProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'gallery' | 'create'>('gallery');
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
    
    // Verse Selection State
    const [showVerseSelector, setShowVerseSelector] = useState(false);
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
    const [loadingVerses, setLoadingVerses] = useState(false);

    // Generate 100+ wallpapers using Unsplash Collections
    // Collections: Islamic (827743), Mosque (335434), Ramadan (4739599), Islamic Art (4463728)
    const galleryWallpapers = useMemo(() => {
        const generated = Array.from({ length: 102 }, (_, i) => {
            const collections = ['827743', '335434', '4739599', '4463728']; 
            const titles = ['Islamic Life', 'Mosque', 'Ramadan', 'Islamic Art'];
            const idx = i % collections.length;
            // Using source.unsplash.com with collection ID and signature to ensure stability and variety
            // Fallback to random keyword if collection fails (though collections are generally more reliable for themes)
            return {
                id: `gen-${i}`,
                url: `https://source.unsplash.com/collection/${collections[idx]}/720x1280?sig=${i}`,
                title: `${titles[idx]} ${i + 1}`
            };
        });
        return [...SAMPLE_WALLPAPERS, ...generated];
    }, []);

    useEffect(() => {
        if (showVerseSelector && surahs.length === 0) {
            setLoadingVerses(true);
            fetch('https://api.alquran.cloud/v1/surah')
                .then(res => res.json())
                .then(data => {
                    if (data.code === 200) setSurahs(data.data);
                })
                .catch(err => console.error("Failed to load surahs", err))
                .finally(() => setLoadingVerses(false));
        }
    }, [showVerseSelector, surahs.length]);

    const handleSurahSelect = async (surah: Surah) => {
        setSelectedSurah(surah);
        setLoadingVerses(true);
        try {
            // Fetch Arabic and English
            const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,en.sahih`);
            const data = await res.json();
            if (data.code === 200 && data.data.length === 2) {
                const arabic = data.data[0].ayahs;
                const english = data.data[1].ayahs;
                const combined = arabic.map((ayah: any, index: number) => ({
                    ...ayah,
                    translation: english[index].text
                }));
                setAyahs(combined);
            }
        } catch (e) {
            console.error("Failed to fetch ayahs", e);
        } finally {
            setLoadingVerses(false);
        }
    };

    const handleVerseSelect = (ayah: Ayah) => {
        if (!selectedSurah) return;
        const verseText = `"${ayah.translation}" (Quran ${selectedSurah.englishName} ${selectedSurah.number}:${ayah.numberInSurah})`;
        setPrompt(prev => {
            const separator = prev.trim() ? '\n\n' : '';
            return prev + separator + "Theme based on verse: " + verseText;
        });
        setShowVerseSelector(false);
        setSelectedSurah(null);
        setAyahs([]);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        // Requirement: Ensure user has selected a key for Pro models (which 1K/2K/4K selection implies)
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
            }
        }

        setLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            // Pass size only if we are using the Pro features (implied by the UI existence of size selector)
            const imageBase64 = await generateImage(prompt, imageSize);
            if (imageBase64) {
                setGeneratedImage(imageBase64);
            } else {
                setError("Could not generate image. Please try a different prompt.");
            }
        } catch (err: any) {
            setError(err.message || "Error generating wallpaper. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = (url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `deen-wallpaper-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-[85vh] w-full max-w-5xl mx-auto glass-card rounded-3xl overflow-hidden relative shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-light/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors text-primary-dark">
                         <Icons.ChevronLeft />
                    </button>
                    <div>
                        <h3 className="font-display font-bold text-xl text-primary-dark">Wallpaper Studio</h3>
                        <p className="text-xs text-secondary-dark">Powered by Nano Banana Pro</p>
                    </div>
                </div>
                <div className="flex bg-white/30 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('gallery')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'gallery' ? 'bg-primary-dark text-white shadow-md' : 'text-secondary-dark hover:bg-white/50'}`}
                    >
                        Gallery
                    </button>
                    <button 
                        onClick={() => setActiveTab('create')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'create' ? 'bg-primary-dark text-white shadow-md' : 'text-secondary-dark hover:bg-white/50'}`}
                    >
                        Create New
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-gradient-to-b from-transparent to-white/20">
                
                {/* Gallery Tab */}
                {activeTab === 'gallery' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryWallpapers.map((wp) => (
                            <div 
                                key={wp.id} 
                                className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 bg-gray-100"
                                onClick={() => setSelectedImage(wp.url)}
                            >
                                <img 
                                    src={wp.url} 
                                    alt={wp.title} 
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <span className="text-white font-medium text-sm drop-shadow-md">{wp.title}</span>
                                    <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-primary-dark transition-colors">
                                        <Icons.Image />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Tab */}
                {activeTab === 'create' && (
                    <div className="flex flex-col lg:flex-row gap-8 h-full">
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="bg-white/40 p-6 rounded-2xl border border-white/50">
                                <h4 className="font-bold text-primary-dark mb-4">Create with AI</h4>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-secondary-dark mb-2">Quality (Size)</label>
                                    <div className="flex gap-2">
                                        {(['1K', '2K', '4K'] as const).map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setImageSize(size)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                                                    imageSize === size 
                                                    ? 'bg-primary-dark text-white border-primary-dark' 
                                                    : 'bg-white/50 text-secondary-dark border-secondary-light hover:bg-white/80'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-2 flex justify-between items-center">
                                    <label className="block text-sm font-medium text-secondary-dark">
                                        Prompt / Theme
                                    </label>
                                    <button 
                                        onClick={() => setShowVerseSelector(true)}
                                        className="text-xs bg-primary-light text-primary-dark px-2 py-1 rounded-lg hover:bg-primary-dark hover:text-white transition-colors flex items-center gap-1 font-medium"
                                    >
                                        <Icons.BookOpen /> Add Verse
                                    </button>
                                </div>
                                <textarea
                                    className="w-full bg-white/60 p-4 rounded-xl border border-secondary-light focus:border-primary-dark outline-none resize-none h-32 text-sm mb-4"
                                    placeholder="Describe your wallpaper or select a verse..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                                
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading || !prompt.trim()}
                                        className="px-6 py-3 bg-primary-dark text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Icons.AdvancedAI />
                                                Generate Wallpaper
                                            </>
                                        )}
                                    </button>
                                </div>
                                {error && (
                                    <p className="mt-4 text-xs text-error bg-error/10 p-3 rounded-lg">{error}</p>
                                )}
                            </div>

                            <div className="bg-primary-light/50 p-4 rounded-xl border border-primary-light text-xs text-secondary-dark">
                                <strong>Tip:</strong> Higher resolutions (2K/4K) require a paid API key. Adding a verse adds its meaning to the generation prompt.
                            </div>
                        </div>

                        <div className="flex-1 bg-white/20 rounded-2xl border border-white/30 flex items-center justify-center min-h-[400px] lg:min-h-0 relative overflow-hidden">
                            {generatedImage ? (
                                <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                                    <img 
                                        src={generatedImage} 
                                        alt="Generated" 
                                        className="max-h-full max-w-full rounded-xl shadow-2xl object-contain"
                                        style={{ maxHeight: '500px' }}
                                    />
                                    <div className="absolute bottom-6 flex gap-3">
                                        <button 
                                            onClick={() => downloadImage(generatedImage)}
                                            className="px-4 py-2 bg-white text-primary-dark rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50"
                                        >
                                            <Icons.Download /> Download
                                        </button>
                                        <button 
                                            onClick={() => setGeneratedImage(null)}
                                            className="px-4 py-2 bg-black/50 backdrop-blur text-white rounded-full font-bold shadow-lg hover:bg-black/70"
                                        >
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center opacity-40">
                                    <div className="w-16 h-16 bg-primary-dark/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-dark">
                                        <Icons.Image />
                                    </div>
                                    <p>Your generated masterpiece will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Verse Selector Modal */}
            {showVerseSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm" onClick={() => setShowVerseSelector(false)}>
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-secondary-light/50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-primary-dark">Select a Verse</h3>
                            <button onClick={() => { setShowVerseSelector(false); setSelectedSurah(null); }} className="p-1 hover:bg-secondary-light rounded-full">
                                <Icons.X />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {loadingVerses && (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-primary-dark/30 border-t-primary-dark rounded-full animate-spin"></div>
                                </div>
                            )}

                            {!selectedSurah ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {surahs.map(surah => (
                                        <button 
                                            key={surah.number}
                                            onClick={() => handleSurahSelect(surah)}
                                            className="p-3 text-left bg-white/50 hover:bg-primary-light rounded-xl border border-secondary-light transition-colors"
                                        >
                                            <span className="text-xs font-bold text-primary-dark block mb-1">{surah.number}. {surah.englishName}</span>
                                            <span className="text-xs text-secondary-dark">{surah.name}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <button 
                                        onClick={() => setSelectedSurah(null)}
                                        className="mb-4 text-sm text-secondary-dark hover:text-primary-dark flex items-center gap-1"
                                    >
                                        <Icons.ChevronLeft /> Back to Surahs
                                    </button>
                                    <div className="space-y-3">
                                        {ayahs.map(ayah => (
                                            <button 
                                                key={ayah.number}
                                                onClick={() => handleVerseSelect(ayah)}
                                                className="w-full text-left p-4 bg-white/50 hover:bg-primary-light rounded-xl border border-secondary-light transition-colors group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold bg-primary-dark/10 text-primary-dark px-2 py-0.5 rounded-full">
                                                        Ayah {ayah.numberInSurah}
                                                    </span>
                                                </div>
                                                <p className="text-right font-serif text-lg text-neutral-dark mb-2" dir="rtl">{ayah.text}</p>
                                                <p className="text-sm text-secondary-dark">{ayah.translation}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal for Gallery */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-md w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <img src={selectedImage} alt="Preview" className="w-full h-full object-contain rounded-2xl shadow-2xl" />
                        <button 
                            onClick={() => downloadImage(selectedImage)}
                            className="absolute bottom-4 right-4 p-3 bg-white text-primary-dark rounded-full shadow-lg hover:scale-105 transition-transform"
                        >
                            <Icons.Download />
                        </button>
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                        >
                            <Icons.X />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WallpaperStudio;