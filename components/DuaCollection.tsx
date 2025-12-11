import React, { useState } from 'react';
import { Icons } from '../constants';

interface DuaCollectionProps {
    onBack: () => void;
}

interface Dua {
    id: string;
    title: string;
    arabic: string;
    transliteration: string;
    translation: string;
    reference: string;
}

interface Category {
    id: string;
    title: string;
    duas: Dua[];
}

const DUA_DATA: Category[] = [
    {
        id: 'morning',
        title: 'Morning Adhkar',
        duas: [
            {
                id: 'm1',
                title: 'Asking for knowledge and provision',
                arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
                transliteration: 'Allahumma inni as\'aluka \'ilman nafi\'an, wa rizqan tayyiban, wa \'amalan mutaqabbalan.',
                translation: 'O Allah, I ask You for beneficial knowledge, goodly provision, and acceptable deeds.',
                reference: 'Ibn Majah'
            },
            {
                id: 'm2',
                title: 'Trust in Allah',
                arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
                transliteration: 'HasbiyAllahu la ilaha illa Huwa \'alayhi tawakkaltu wa Huwa Rabbul \'Arshil \'Azim.',
                translation: 'Allah is sufficient for me. There is no god but He. I have placed my trust in Him, He is Lord of the Majestic Throne.',
                reference: 'Surah At-Tawbah 9:129'
            }
        ]
    },
    {
        id: 'anxiety',
        title: 'Distress & Anxiety',
        duas: [
            {
                id: 'a1',
                title: 'For removing anxiety',
                arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ',
                transliteration: 'Allahumma inni a\'udhu bika minal-hammi wal-hazani, wal-\'ajzi wal-kasali, wal-bukhli wal-jubni, wa dala\'id-dayni wa ghalabatir-rijal.',
                translation: 'O Allah, I take refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and being overpowered by men.',
                reference: 'Al-Bukhari'
            },
            {
                id: 'a2',
                title: 'Prophet Yunus (AS) Prayer',
                arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
                transliteration: 'La ilaha illa anta subhanaka inni kuntu minaz-zalimin.',
                translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
                reference: 'Surah Al-Anbiya 21:87'
            }
        ]
    },
    {
        id: 'forgiveness',
        title: 'Seeking Forgiveness',
        duas: [
            {
                id: 'f1',
                title: 'Sayyidul Istighfar (Best way to ask forgiveness)',
                arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
                transliteration: 'Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduka, wa ana \'ala \'ahdika wa wa\'dika mastata\'tu. A\'udhu bika min sharri ma sana\'tu, abu\'u laka bini\'matika \'alayya, wa abu\'u bidhanbi faghfir li, fa innahu la yaghfirudh-dhunuba illa anta.',
                translation: 'O Allah, You are my Lord. There is no god except You. You created me and I am Your slave. I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin. So forgive me, for surely no one forgives sins except You.',
                reference: 'Al-Bukhari'
            }
        ]
    }
];

const DuaCollection: React.FC<DuaCollectionProps> = ({ onBack }) => {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    return (
        <div className="flex flex-col h-[85vh] w-full max-w-4xl mx-auto glass-card rounded-3xl overflow-hidden relative shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-light/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors text-primary-dark">
                         <Icons.ChevronLeft />
                    </button>
                    <div>
                        <h3 className="font-display font-bold text-xl text-primary-dark">Fortress of a Believer</h3>
                        <p className="text-xs text-secondary-dark">{selectedCategory ? selectedCategory.title : 'Authentic Dua & Adhkar'}</p>
                    </div>
                </div>
                <div className="bg-primary-light p-2 rounded-full text-primary-dark">
                    <Icons.PrayingHands />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-gradient-to-b from-transparent to-white/20">
                {!selectedCategory ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {DUA_DATA.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat)}
                                className="p-6 bg-white/40 hover:bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 text-left transition-all hover:-translate-y-1 shadow-sm group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-lg text-primary-dark">{cat.title}</h4>
                                    <span className="text-primary-light bg-primary-dark/10 p-1.5 rounded-full group-hover:bg-primary-dark group-hover:text-white transition-colors">
                                        <Icons.ArrowRight />
                                    </span>
                                </div>
                                <p className="text-sm text-secondary-dark opacity-80">{cat.duas.length} supplications</p>
                            </button>
                        ))}
                        <div className="md:col-span-2 mt-4 p-6 bg-primary-dark/5 rounded-2xl border border-primary-dark/10 text-center">
                            <p className="text-sm text-secondary-dark italic">
                                "And your Lord says, 'Call upon Me; I will respond to you.'"
                                <span className="block text-xs font-semibold mt-1 not-italic">Surah Ghafir 40:60</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <button 
                            onClick={() => setSelectedCategory(null)}
                            className="flex items-center gap-2 text-sm text-secondary-dark hover:text-primary-dark mb-4"
                        >
                            <Icons.ChevronLeft /> Back to Categories
                        </button>

                        {selectedCategory.duas.map((dua) => (
                            <div key={dua.id} className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm animate-fade-in-up">
                                <h5 className="font-bold text-primary-dark mb-4 border-b border-secondary-light/50 pb-2">{dua.title}</h5>
                                
                                <p className="text-right font-serif text-2xl md:text-3xl leading-loose text-neutral-dark mb-6" dir="rtl">
                                    {dua.arabic}
                                </p>
                                
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-secondary-dark mb-1">Transliteration</p>
                                        <p className="text-sm text-neutral-dark/80 italic">{dua.transliteration}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-secondary-dark mb-1">Meaning</p>
                                        <p className="text-sm text-neutral-dark">{dua.translation}</p>
                                    </div>
                                    <p className="text-xs text-secondary-dark/60 text-right mt-2">{dua.reference}</p>
                                </div>
                            </div>
                        ))}
                        <div className="h-10"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DuaCollection;