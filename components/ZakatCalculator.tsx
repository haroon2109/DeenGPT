import React, { useState } from 'react';
import { Icons } from '../constants';

interface ZakatCalculatorProps {
    onBack: () => void;
}

const ZakatCalculator: React.FC<ZakatCalculatorProps> = ({ onBack }) => {
    const [assets, setAssets] = useState({
        savings: 0,
        gold: 0,
        investments: 0,
        liabilities: 0
    });
    
    const [result, setResult] = useState<number | null>(null);

    const calculateZakat = () => {
        const totalAssets = assets.savings + assets.gold + assets.investments;
        const netWorth = Math.max(0, totalAssets - assets.liabilities);
        // Nisab assumption (approximate, should be fetched or user input, but hardcoded for MVP simplicity)
        const NISAB_THRESHOLD = 5000; 
        
        if (netWorth >= NISAB_THRESHOLD) {
            setResult(netWorth * 0.025);
        } else {
            setResult(0);
        }
    };

    const handleInputChange = (field: keyof typeof assets, value: string) => {
        const numValue = parseFloat(value) || 0;
        setAssets(prev => ({ ...prev, [field]: numValue }));
        setResult(null); // Reset result on change
    };

    return (
        <div className="flex flex-col h-[85vh] w-full max-w-2xl mx-auto glass-card rounded-3xl overflow-hidden relative shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-light/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors text-primary-dark">
                         <Icons.ChevronLeft />
                    </button>
                    <div>
                        <h3 className="font-display font-bold text-xl text-primary-dark">Zakat Calculator</h3>
                        <p className="text-xs text-secondary-dark">Calculate your annual 2.5% contribution</p>
                    </div>
                </div>
                <div className="bg-primary-light p-2 rounded-full">
                    <Icons.Calculator />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-gradient-to-b from-transparent to-white/20">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/40 p-4 rounded-2xl border border-white/50">
                            <label className="block text-sm font-semibold text-primary-dark mb-2">Cash & Savings</label>
                            <input 
                                type="number" 
                                className="w-full bg-white/50 p-3 rounded-xl border border-secondary-light focus:border-primary-dark outline-none text-lg font-mono"
                                placeholder="0.00"
                                value={assets.savings || ''}
                                onChange={(e) => handleInputChange('savings', e.target.value)}
                            />
                        </div>
                         <div className="bg-white/40 p-4 rounded-2xl border border-white/50">
                            <label className="block text-sm font-semibold text-primary-dark mb-2">Gold & Silver Value</label>
                            <input 
                                type="number" 
                                className="w-full bg-white/50 p-3 rounded-xl border border-secondary-light focus:border-primary-dark outline-none text-lg font-mono"
                                placeholder="0.00"
                                value={assets.gold || ''}
                                onChange={(e) => handleInputChange('gold', e.target.value)}
                            />
                        </div>
                        <div className="bg-white/40 p-4 rounded-2xl border border-white/50">
                            <label className="block text-sm font-semibold text-primary-dark mb-2">Investments & Stocks</label>
                            <input 
                                type="number" 
                                className="w-full bg-white/50 p-3 rounded-xl border border-secondary-light focus:border-primary-dark outline-none text-lg font-mono"
                                placeholder="0.00"
                                value={assets.investments || ''}
                                onChange={(e) => handleInputChange('investments', e.target.value)}
                            />
                        </div>
                        <div className="bg-white/40 p-4 rounded-2xl border border-white/50">
                            <label className="block text-sm font-semibold text-error mb-2">Liabilities & Debts</label>
                            <input 
                                type="number" 
                                className="w-full bg-white/50 p-3 rounded-xl border border-error/30 focus:border-error outline-none text-lg font-mono"
                                placeholder="0.00"
                                value={assets.liabilities || ''}
                                onChange={(e) => handleInputChange('liabilities', e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={calculateZakat}
                        className="w-full py-4 bg-primary-dark text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all"
                    >
                        Calculate Zakat
                    </button>

                    {result !== null && (
                        <div className="mt-8 p-6 bg-gradient-to-br from-primary-dark to-secondary-dark rounded-3xl text-white text-center shadow-xl animate-fade-in-up">
                            <p className="text-white/70 mb-2 font-medium">Total Zakat Due</p>
                            <h2 className="text-5xl font-display font-bold">
                                ${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <p className="text-xs text-white/50 mt-4 max-w-xs mx-auto">
                                Based on a simplified calculation of 2.5% on net zakatable assets above Nisab threshold.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZakatCalculator;