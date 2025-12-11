import React from 'react';
import { Icons } from '../constants';
import { Feature } from '../types';

interface LifestyleHubProps {
    onBack: () => void;
    onLaunchTool: (toolId: string) => void;
}

const LifestyleHub: React.FC<LifestyleHubProps> = ({ onBack, onLaunchTool }) => {
    
    const tools: Feature[] = [
        {
            id: 'halal-food',
            title: 'Halal Food Finder',
            description: 'Find top-rated Halal restaurants and markets near you using Google Search.',
            icon: <Icons.Food />,
        },
        {
            id: 'zakat',
            title: 'Zakat Calculator',
            description: 'Precise calculation of your annual obligatory charity based on your assets.',
            icon: <Icons.Calculator />,
        },
        {
            id: 'modest-fashion',
            title: 'Modest Fashion',
            description: 'Discover trending modest fashion brands and style advice.',
            icon: <Icons.Fashion />,
        },
        {
            id: 'charity',
            title: 'Charity Platform',
            description: 'Find trusted organizations and causes to donate your Sadaqah and Zakat.',
            icon: <Icons.Charity />,
        }
    ];

    return (
        <div className="flex flex-col h-[85vh] w-full max-w-4xl mx-auto glass-card rounded-3xl overflow-hidden relative shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-light/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors text-primary-dark">
                         <Icons.ChevronLeft />
                    </button>
                    <div>
                        <h3 className="font-display font-bold text-xl text-primary-dark">Lifestyle Hub</h3>
                        <p className="text-xs text-secondary-dark">Tools for a confident Halal life</p>
                    </div>
                </div>
                <div className="bg-primary-light p-2 rounded-full text-primary-dark">
                    <Icons.Lifestyle />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-gradient-to-b from-transparent to-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tools.map((tool, idx) => (
                        <div 
                            key={tool.id}
                            onClick={() => onLaunchTool(tool.id)}
                            className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-white/40 cursor-pointer hover:bg-white/70 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-light/50 rounded-xl text-primary-dark group-hover:scale-110 transition-transform">
                                    {tool.icon}
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-lg text-primary-dark mb-1">{tool.title}</h4>
                                    <p className="text-sm text-secondary-dark leading-relaxed">{tool.description}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary-dark opacity-60 group-hover:opacity-100 transition-opacity">
                                <span>Open Tool</span>
                                <Icons.ArrowRight />
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 p-6 bg-primary-dark/5 rounded-2xl border border-primary-dark/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Icons.Bot />
                        <h4 className="font-bold text-primary-dark">Did you know?</h4>
                    </div>
                    <p className="text-sm text-secondary-dark italic">
                        "The best of people are those that bring most benefit to the rest of mankind." 
                        <br/>
                        <span className="text-xs opacity-70 not-italic mt-1 block">— Prophet Muhammad (ﷺ)</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LifestyleHub;