import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';

interface QuranReaderProps {
    onBack: () => void;
}

interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
}

interface DisplayAyah {
    number: number;
    text: string;
    numberInSurah: number;
    translation: string;
    audio: string;
}

const QuranReader: React.FC<QuranReaderProps> = ({ onBack }) => {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
    const [verses, setVerses] = useState<DisplayAyah[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSurah, setLoadingSurah] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Audio State
    const [playingAyah, setPlayingAyah] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Fetch Surah List
        fetch('https://api.alquran.cloud/v1/surah')
            .then(res => res.json())
            .then(data => {
                if (data.code === 200) {
                    setSurahs(data.data);
                } else {
                    setError('Failed to load Surah list.');
                }
            })
            .catch(() => setError('Connection error.'))
            .finally(() => setLoading(false));

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const fetchSurahContent = async (surahNumber: number) => {
        setLoadingSurah(true);
        setError(null);
        setVerses([]);
        
        // Reset Audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setPlayingAyah(null);

        try {
            // Fetch Arabic (Uthmani), English (Sahih International), and Audio (Mishary Rashid Alafasy)
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,ar.alafasy`);
            const data = await response.json();
            
            if (data.code === 200 && data.data.length === 3) {
                const arabicData = data.data[0].ayahs;
                const englishData = data.data[1].ayahs;
                const audioData = data.data[2].ayahs;

                const combinedVerses: DisplayAyah[] = arabicData.map((ayah: any, index: number) => ({
                    number: ayah.number,
                    text: ayah.text,
                    numberInSurah: ayah.numberInSurah,
                    translation: englishData[index].text,
                    audio: audioData[index].audio
                }));

                setVerses(combinedVerses);
            } else {
                setError('Failed to load Surah content.');
            }
        } catch (e) {
            setError('Could not fetch Surah. Please check connection.');
        } finally {
            setLoadingSurah(false);
        }
    };

    const handleSurahClick = (surah: Surah) => {
        setSelectedSurah(surah);
        fetchSurahContent(surah.number);
    };

    const togglePlay = (ayahNumber: number, audioUrl: string) => {
        if (playingAyah === ayahNumber) {
            // Pause
            if (audioRef.current) {
                audioRef.current.pause();
                setPlayingAyah(null);
            }
        } else {
            // Play new
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const newAudio = new Audio(audioUrl);
            newAudio.onended = () => setPlayingAyah(null);
            newAudio.play().catch(e => console.error("Audio play failed", e));
            audioRef.current = newAudio;
            setPlayingAyah(ayahNumber);
        }
    };

    return (
        <div className="flex flex-col h-[85vh] w-full max-w-6xl mx-auto glass-card rounded-3xl overflow-hidden relative shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-light/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors text-primary-dark">
                         <Icons.ChevronLeft />
                    </button>
                    <div>
                        <h3 className="font-display font-bold text-xl text-primary-dark">Quran Reader</h3>
                        <p className="text-xs text-secondary-dark">{selectedSurah ? `${selectedSurah.englishName} - ${selectedSurah.name}` : 'Select a Surah'}</p>
                    </div>
                </div>
                <div className="bg-primary-light p-2 rounded-full text-primary-dark">
                    <Icons.BookOpen />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Surah List */}
                <div className={`w-full md:w-1/3 lg:w-1/4 overflow-y-auto border-r border-secondary-light/30 bg-white/20 ${selectedSurah ? 'hidden md:block' : 'block'}`}>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                             <div className="w-6 h-6 border-2 border-primary-dark/30 border-t-primary-dark rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {surahs.map(surah => (
                                <button
                                    key={surah.number}
                                    onClick={() => handleSurahClick(surah)}
                                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                                        selectedSurah?.number === surah.number 
                                            ? 'bg-primary-dark text-white shadow-lg' 
                                            : 'hover:bg-white/40 text-neutral-dark'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${
                                            selectedSurah?.number === surah.number ? 'bg-white/20' : 'bg-secondary-light text-primary-dark'
                                        }`}>
                                            {surah.number}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{surah.englishName}</p>
                                            <p className={`text-xs ${selectedSurah?.number === surah.number ? 'text-white/70' : 'text-secondary-dark'}`}>
                                                {surah.englishNameTranslation}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-serif text-lg ${selectedSurah?.number === surah.number ? 'text-white' : 'text-primary-dark'}`}>
                                        {surah.name.replace('سُورَةُ', '')}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content: Reader */}
                <div className={`flex-1 overflow-y-auto bg-gradient-to-b from-white/30 to-white/10 relative ${!selectedSurah ? 'hidden md:flex' : 'flex'}`}>
                    {!selectedSurah ? (
                        <div className="m-auto text-center p-8 opacity-50">
                            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4 text-primary-dark">
                                <Icons.BookOpen />
                            </div>
                            <h3 className="text-xl font-bold text-primary-dark">Read the Holy Quran</h3>
                            <p className="text-secondary-dark">Select a Surah from the list to begin reading.</p>
                        </div>
                    ) : (
                        <div className="w-full">
                            {/* Mobile Back to List */}
                            <button 
                                onClick={() => setSelectedSurah(null)}
                                className="md:hidden m-4 mb-0 flex items-center gap-2 text-sm text-secondary-dark hover:text-primary-dark"
                            >
                                <Icons.ChevronLeft /> Back to Surahs
                            </button>

                            {loadingSurah ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <div className="w-10 h-10 border-4 border-primary-dark/30 border-t-primary-dark rounded-full animate-spin"></div>
                                    <p className="text-sm text-secondary-dark">Loading {selectedSurah.englishName}...</p>
                                </div>
                            ) : (
                                <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-12">
                                    {/* Bismillah */}
                                    {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                                        <div className="text-center font-serif text-3xl md:text-4xl text-primary-dark mb-12 animate-fade-in-up">
                                            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                        </div>
                                    )}

                                    {verses.map((ayah, index) => (
                                        <div key={ayah.number} className="space-y-4 border-b border-secondary-light/30 pb-8 last:border-0 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                            {/* Toolbar */}
                                            <div className="flex items-center gap-2 mb-2">
                                                 <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold bg-secondary-light/50 text-primary-dark rounded-full">
                                                    {ayah.numberInSurah}
                                                 </span>
                                                 <button 
                                                    onClick={() => togglePlay(ayah.number, ayah.audio)}
                                                    className={`p-2 rounded-full transition-all ${
                                                        playingAyah === ayah.number 
                                                            ? 'bg-primary-dark text-white shadow-md' 
                                                            : 'bg-white/50 text-secondary-dark hover:bg-primary-light hover:text-primary-dark'
                                                    }`}
                                                    title={playingAyah === ayah.number ? "Pause Recitation" : "Play Recitation"}
                                                 >
                                                    {playingAyah === ayah.number ? <Icons.Pause /> : <Icons.Play />}
                                                 </button>
                                            </div>

                                            {/* Arabic */}
                                            <div className="w-full text-right" dir="rtl">
                                                <p className="font-serif text-3xl md:text-4xl leading-[2.5] text-neutral-dark">
                                                    {ayah.text} 
                                                </p>
                                            </div>
                                            
                                            {/* English */}
                                            <div className="text-left max-w-2xl">
                                                <p className="text-lg text-secondary-dark leading-relaxed">
                                                    {ayah.translation}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="h-20 flex items-center justify-center text-sm text-secondary-dark/50">
                                        End of Surah {selectedSurah.englishName}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuranReader;