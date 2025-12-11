import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../constants';

interface HadithReaderProps {
    onBack: () => void;
}

interface Collection {
    id: string;
    title: string;
    description: string;
}

interface Section {
    id: string; // usually number as string
    title: string;
}

interface Grade {
    name: string;
    grade: string;
}

interface Hadith {
    hadithnumber: string;
    arabicnumber: string;
    text: string;
    reference: {
        book: number;
        hadith: number;
    };
    grades?: Grade[];
}

const COLLECTIONS: Collection[] = [
    { id: 'eng-bukhari', title: 'Sahih al-Bukhari', description: 'One of the most authentic collections of Hadith.' },
    { id: 'eng-muslim', title: 'Sahih Muslim', description: 'Considered the second most authentic collection.' },
    { id: 'eng-tirmidhi', title: 'Jami` at-Tirmidhi', description: 'Contains Hadith on law, dogma, and ethics.' },
    { id: 'eng-abudawud', title: 'Sunan Abu Dawud', description: 'Focuses on legal rulings (Ahkam).' },
];

const HadithReader: React.FC<HadithReaderProps> = ({ onBack }) => {
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('All');

    const fetchSections = async (collectionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collectionId}/sections.json`);
            const data = await res.json();
            if (data && typeof data === 'object') {
                // API returns object { "1": "Revelation", "2": "Belief" ... }
                // Convert to array
                const sectionArray = Object.entries(data).map(([id, title]) => ({
                    id,
                    title: title as string
                })).filter(s => s.id !== "0" && s.title); // Filter out metadata sections if any
                setSections(sectionArray);
            }
        } catch (e) {
            setError('Failed to load sections.');
        } finally {
            setLoading(false);
        }
    };

    const fetchHadiths = async (collectionId: string, sectionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collectionId}/sections/${sectionId}.json`);
            const data = await res.json();
            if (data && data.hadiths) {
                setHadiths(data.hadiths);
            }
        } catch (e) {
            setError('Failed to load hadiths.');
        } finally {
            setLoading(false);
        }
    };

    const handleCollectionClick = (col: Collection) => {
        setSelectedCollection(col);
        setSelectedSection(null);
        setHadiths([]);
        fetchSections(col.id);
    };

    const handleSectionClick = (sec: Section) => {
        if (!selectedCollection) return;
        setSelectedSection(sec);
        // Reset filters when changing section
        setSearchTerm('');
        setSelectedGrade('All');
        fetchHadiths(selectedCollection.id, sec.id);
    };

    const resetSelection = () => {
        setSelectedCollection(null);
        setSelectedSection(null);
        setSections([]);
        setHadiths([]);
        setSearchTerm('');
        setSelectedGrade('All');
    };

    // Extract available grades from the loaded hadiths
    const availableGrades = useMemo(() => {
        const grades = new Set<string>();
        hadiths.forEach(h => {
            h.grades?.forEach(g => grades.add(g.grade));
        });
        return Array.from(grades).sort();
    }, [hadiths]);

    // Filter Logic
    const filteredHadiths = useMemo(() => {
        return hadiths.filter(h => {
            const matchesSearch = h.text.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGrade = selectedGrade === 'All' || h.grades?.some(g => g.grade === selectedGrade);
            
            // For Bukhari/Muslim, usually no grades are provided, so grade filter doesn't apply effectively unless explicit
            // If the user selects a grade but the hadith has no grades array, it won't match (unless 'All')
            
            return matchesSearch && matchesGrade;
        });
    }, [hadiths, searchTerm, selectedGrade]);

    return (
        <div className="flex flex-col h-[85vh] w-full max-w-5xl mx-auto glass-card rounded-3xl overflow-hidden relative shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-light/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors text-primary-dark">
                         <Icons.ChevronLeft />
                    </button>
                    <div>
                        <h3 className="font-display font-bold text-xl text-primary-dark">Hadith Reader</h3>
                        <div className="flex items-center gap-2 text-xs text-secondary-dark">
                            <span onClick={resetSelection} className={`cursor-pointer ${selectedCollection ? 'hover:underline' : ''}`}>Collections</span>
                            {selectedCollection && (
                                <>
                                    <span>/</span>
                                    <span onClick={() => { setSelectedSection(null); setHadiths([]); }} className={`cursor-pointer ${selectedSection ? 'hover:underline' : ''}`}>
                                        {selectedCollection.title}
                                    </span>
                                </>
                            )}
                            {selectedSection && (
                                <>
                                    <span>/</span>
                                    <span>{selectedSection.title}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-primary-light p-2 rounded-full text-primary-dark">
                    <Icons.Scroll />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-gradient-to-b from-transparent to-white/20">
                {loading && (
                    <div className="flex justify-center items-center h-40">
                         <div className="w-8 h-8 border-4 border-primary-dark/30 border-t-primary-dark rounded-full animate-spin"></div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-error/10 text-error rounded-xl text-center">
                        {error}
                        <button onClick={resetSelection} className="block mx-auto mt-2 text-sm underline">Go back</button>
                    </div>
                )}
                
                {/* Level 1: Collection List */}
                {!loading && !selectedCollection && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {COLLECTIONS.map(col => (
                            <button
                                key={col.id}
                                onClick={() => handleCollectionClick(col)}
                                className="text-left p-6 bg-white/40 hover:bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40 transition-all hover:-translate-y-1 shadow-sm"
                            >
                                <h4 className="font-bold text-lg text-primary-dark mb-2">{col.title}</h4>
                                <p className="text-sm text-secondary-dark">{col.description}</p>
                            </button>
                        ))}
                    </div>
                )}

                {/* Level 2: Section List */}
                {!loading && selectedCollection && !selectedSection && (
                    <div className="space-y-2">
                        <button 
                             onClick={() => setSelectedCollection(null)} 
                             className="mb-4 flex items-center gap-1 text-sm text-secondary-dark hover:text-primary-dark"
                        >
                            <Icons.ChevronLeft /> Back to Collections
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {sections.map(sec => (
                                <button
                                    key={sec.id}
                                    onClick={() => handleSectionClick(sec)}
                                    className="text-left p-4 bg-white/30 hover:bg-white/60 rounded-xl border border-white/30 transition-colors flex items-center gap-3"
                                >
                                    <span className="w-8 h-8 flex items-center justify-center bg-primary-light text-primary-dark rounded-full text-xs font-bold shrink-0">
                                        {sec.id}
                                    </span>
                                    <span className="font-medium text-neutral-dark truncate" title={sec.title}>{sec.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Level 3: Hadith List with Search/Filter */}
                {!loading && selectedSection && (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                            <button 
                                onClick={() => setSelectedSection(null)} 
                                className="flex items-center gap-1 text-sm text-secondary-dark hover:text-primary-dark shrink-0"
                            >
                                <Icons.ChevronLeft /> Back to {selectedCollection?.title}
                            </button>
                            
                            {/* Search and Filter Controls */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <div className="relative flex-1 sm:w-64">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-dark">
                                        <Icons.Search />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search narrator or text..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white/60 border border-secondary-light rounded-xl text-sm focus:outline-none focus:border-primary-dark transition-colors"
                                    />
                                </div>
                                
                                {availableGrades.length > 0 && (
                                    <select
                                        value={selectedGrade}
                                        onChange={(e) => setSelectedGrade(e.target.value)}
                                        className="px-4 py-2 bg-white/60 border border-secondary-light rounded-xl text-sm focus:outline-none focus:border-primary-dark cursor-pointer text-secondary-dark font-medium"
                                    >
                                        <option value="All">All Grades</option>
                                        {availableGrades.map(grade => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-primary-dark">{selectedSection.title}</h2>
                            <p className="text-sm text-secondary-dark opacity-70">
                                {selectedCollection?.title} • {filteredHadiths.length} Hadiths
                            </p>
                        </div>

                        {filteredHadiths.length === 0 ? (
                            <div className="text-center py-10 opacity-60">
                                <p className="text-lg text-secondary-dark">No hadiths found matching your criteria.</p>
                                <button 
                                    onClick={() => { setSearchTerm(''); setSelectedGrade('All'); }}
                                    className="mt-2 text-primary-dark hover:underline text-sm"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            filteredHadiths.map((hadith, index) => (
                                <div key={index} className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm animate-fade-in-up">
                                    <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                                        <span className="bg-secondary-light px-2 py-1 rounded text-xs font-bold text-primary-dark">
                                            Hadith {hadith.hadithnumber}
                                        </span>
                                        {hadith.grades && hadith.grades.length > 0 && (
                                            <div className="flex flex-wrap gap-1 justify-end">
                                                {hadith.grades.map((g, i) => (
                                                    <span 
                                                        key={i} 
                                                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                            g.grade.toLowerCase().includes('sahih') ? 'bg-emerald-100 text-emerald-800' :
                                                            g.grade.toLowerCase().includes('hasan') ? 'bg-blue-100 text-blue-800' :
                                                            g.grade.toLowerCase().includes('daif') ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}
                                                        title={`Graded by ${g.name}`}
                                                    >
                                                        {g.grade}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-lg text-neutral-dark leading-relaxed font-serif">
                                        {hadith.text}
                                    </p>
                                </div>
                            ))
                        )}
                        
                        <div className="h-10"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HadithReader;