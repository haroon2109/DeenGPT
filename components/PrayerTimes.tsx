import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { User } from '../types';

interface PrayerTimesProps {
    user: User;
    onBack: () => void;
}

interface PrayerTime {
    name: string;
    time: string; // 24h format HH:MM
    displayTime: string; // 12h format
    isNext: boolean;
    dateObj: Date;
}

const PrayerTimes: React.FC<PrayerTimesProps> = ({ user, onBack }) => {
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationName, setLocationName] = useState('Locating...');
    const [reminders, setReminders] = useState<Record<string, boolean>>({});
    
    // New State Variables
    const [hijriDate, setHijriDate] = useState<string>('');
    const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [progressPercent, setProgressPercent] = useState<number>(0);
    const nextPrayerRef = useRef<PrayerTime | null>(null);
    const [currentTimePosition, setCurrentTimePosition] = useState(0);

    // Location Editing
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Toggle reminder state
    const toggleReminder = (prayerName: string) => {
        setReminders(prev => ({
            ...prev,
            [prayerName]: !prev[prayerName]
        }));
    };

    const convertTo12Hour = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const fetchQibla = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`);
            const data = await response.json();
            if(data.code === 200) {
                setQiblaDirection(Math.round(data.data.direction));
            }
        } catch (e) {
            console.error("Failed to fetch Qibla", e);
        }
    }

    const fetchPrayerTimes = async (lat: number, lng: number, manualName?: string) => {
        setLoading(true);
        setError(null);
        try {
            const date = new Date();
            const timestamp = Math.floor(date.getTime() / 1000);
            
            // 1. Fetch Prayer Times & Hijri Date
            const response = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=2`);
            const data = await response.json();

            if (data.code === 200) {
                const timings = data.data.timings;
                const dateData = data.data.date;
                const meta = data.data.meta;

                // Set Hijri Date
                const hijri = dateData.hijri;
                setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year}`);
                
                // Use manual name if provided, otherwise fallback to timezone from API
                if (manualName) {
                    setLocationName(manualName);
                } else {
                    setLocationName(meta.timezone.split('/')[1]?.replace('_', ' ') || meta.timezone);
                }

                const relevantPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
                const now = new Date();
                
                let nextPrayerFound = false;
                let nextPrayerObj: PrayerTime | null = null;
                let prevPrayerTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to yesterday

                const formattedPrayers: PrayerTime[] = relevantPrayers.map((name, index) => {
                    const time = timings[name];
                    const [h, m] = time.split(':').map(Number);
                    
                    const prayerDate = new Date(now);
                    prayerDate.setHours(h, m, 0, 0);

                    let isNext = false;
                    // If prayer time is later than now and we haven't found the next one yet
                    if (!nextPrayerFound && prayerDate > now) {
                        isNext = true;
                        nextPrayerFound = true;
                        nextPrayerObj = {
                             name,
                             time,
                             displayTime: convertTo12Hour(time),
                             isNext,
                             dateObj: prayerDate
                        };
                        // Previous prayer was the one before this
                        if (index > 0) {
                            const prevName = relevantPrayers[index - 1];
                            const [ph, pm] = timings[prevName].split(':').map(Number);
                            const prevDate = new Date(now);
                            prevDate.setHours(ph, pm, 0, 0);
                            prevPrayerTime = prevDate;
                        }
                    }

                    return {
                        name,
                        time,
                        displayTime: convertTo12Hour(time),
                        isNext,
                        dateObj: prayerDate
                    };
                });

                // Handle case where next prayer is tomorrow's Fajr
                if (!nextPrayerFound && formattedPrayers.length > 0) {
                     const firstPrayer = formattedPrayers[0];
                     const tomorrowFajr = new Date(firstPrayer.dateObj);
                     tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
                     
                     formattedPrayers[0].isNext = true;
                     formattedPrayers[0].dateObj = tomorrowFajr;
                     
                     nextPrayerObj = formattedPrayers[0];

                     // Previous prayer was Isha (today)
                     const isha = formattedPrayers[formattedPrayers.length - 1];
                     prevPrayerTime = isha.dateObj;
                }

                setPrayerTimes(formattedPrayers);
                
                // Set ref for interval to access
                nextPrayerRef.current = nextPrayerObj;

                // Set initial progress references for calculations
                if (nextPrayerObj) {
                     updateTimer(nextPrayerObj, prevPrayerTime);
                }

            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (err) {
            console.error(err);
            setError('Could not fetch prayer times.');
            if (!locationName || locationName === 'Locating...') {
                 setLocationName('Default Location');
            }
            // Fallback data could go here
        } finally {
            setLoading(false);
        }
    };

    const handleManualSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const { latitude, longitude, name, country } = data.results[0];
                const displayName = `${name}, ${country}`;
                await fetchPrayerTimes(latitude, longitude, displayName);
                fetchQibla(latitude, longitude);
                setIsEditingLocation(false);
            } else {
                setError('Location not found. Please try again.');
                setLoading(false);
            }
        } catch (e) {
            setError('Failed to search location.');
            setLoading(false);
        }
    };

    const updateTimer = (next: PrayerTime, prev: Date) => {
        const now = new Date();
        const diff = next.dateObj.getTime() - now.getTime();
        
        // Update current time position for timeline (0 to 100%)
        // We use 24h cycle
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
        const dayPercentage = (currentTotalMinutes / (24 * 60)) * 100;
        setCurrentTimePosition(dayPercentage);
        
        if (diff <= 0) {
             setTimeRemaining('00:00:00');
             setProgressPercent(100);
             return;
        }

        // Format countdown
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeRemaining(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );

        // Progress Bar
        const totalDuration = next.dateObj.getTime() - prev.getTime();
        const elapsed = now.getTime() - prev.getTime();
        const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        setProgressPercent(percent);
    };

    useEffect(() => {
        const timerId = setInterval(() => {
            if (nextPrayerRef.current) {
                const now = new Date();
                const nextDate = nextPrayerRef.current.dateObj;
                
                // Update timeline pos
                const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
                const dayPercentage = (currentTotalMinutes / (24 * 60)) * 100;
                setCurrentTimePosition(dayPercentage);

                const diff = nextDate.getTime() - now.getTime();
                if (diff < 0) {
                     setTimeRemaining('Now');
                } else {
                    const hours = Math.floor((diff / (1000 * 60 * 60)));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeRemaining(
                        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                    );
                }
            }
        }, 1000);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchPrayerTimes(latitude, longitude);
                    fetchQibla(latitude, longitude);
                },
                (err) => {
                    setError('Location access denied. Using Makkah.');
                    fetchPrayerTimes(21.4225, 39.8262);
                    fetchQibla(21.4225, 39.8262);
                }
            );
        } else {
            setError('Geolocation not supported.');
            fetchPrayerTimes(21.4225, 39.8262);
            fetchQibla(21.4225, 39.8262);
        }

        return () => clearInterval(timerId);
    }, []);

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Helper to position prayer dots on timeline
    const getPrayerPosition = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        const mins = h * 60 + m;
        return (mins / (24 * 60)) * 100;
    }

    return (
        <div className="flex flex-col h-[85vh] w-full max-w-lg mx-auto glass-card rounded-3xl overflow-hidden relative shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-light/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3 w-full">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors text-primary-dark shrink-0">
                         <Icons.ChevronLeft />
                    </button>
                    
                    {isEditingLocation ? (
                        <div className="flex items-center gap-2 w-full animate-fade-in-up">
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter city (e.g. London)"
                                className="flex-1 bg-white/60 border border-secondary-light rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-dark"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                            />
                            <button 
                                onClick={handleManualSearch}
                                className="p-1.5 bg-primary-dark text-white rounded-lg hover:bg-primary-dark/90 transition-colors"
                            >
                                <Icons.Search />
                            </button>
                            <button 
                                onClick={() => setIsEditingLocation(false)}
                                className="p-1.5 text-secondary-dark hover:text-error transition-colors"
                            >
                                <Icons.X />
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <h3 className="font-display font-bold text-xl text-primary-dark">Prayer Times</h3>
                                <div className="flex items-center gap-1 text-xs text-secondary-dark mt-0.5 group cursor-pointer" onClick={() => setIsEditingLocation(true)}>
                                    <Icons.MapPin />
                                    <span className="truncate max-w-[150px]">{locationName}</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-primary-dark">
                                        <Icons.Edit />
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsEditingLocation(true)}
                                className="p-2 bg-white/30 rounded-full text-primary-dark hover:bg-white/60 transition-colors"
                                title="Change Location"
                            >
                                <Icons.Edit />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-hide bg-gradient-to-b from-transparent to-white/20">
                {error && (
                    <div className="bg-error/10 text-error text-xs p-3 rounded-xl border border-error/20 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}><Icons.X /></button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="w-8 h-8 border-4 border-primary-dark/30 border-t-primary-dark rounded-full animate-spin" />
                        <p className="text-secondary-dark text-sm animate-pulse">Calculating timings...</p>
                    </div>
                ) : (
                    <>
                        {/* Visual Timeline */}
                        <div className="bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-white/40 mb-2">
                             <div className="flex justify-between text-[10px] text-secondary-dark font-mono mb-2 px-1">
                                 <span>00:00</span>
                                 <span>12:00</span>
                                 <span>23:59</span>
                             </div>
                             <div className="relative h-4 w-full bg-secondary-light/50 rounded-full overflow-visible">
                                 {/* Prayer Dots */}
                                 {prayerTimes.map(p => (
                                     <div 
                                        key={p.name}
                                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white transform transition-all hover:scale-150 cursor-pointer group z-10 ${p.isNext ? 'bg-primary-dark scale-125' : 'bg-tertiary-light'}`}
                                        style={{ left: `${getPrayerPosition(p.time)}%` }}
                                        title={p.name}
                                     >
                                         <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-white/80 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-primary-dark">{p.name}</span>
                                     </div>
                                 ))}
                                 
                                 {/* Current Time Indicator */}
                                 <div 
                                    className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-error rounded-full z-20 shadow-sm transition-all duration-1000 ease-linear"
                                    style={{ left: `${currentTimePosition}%` }}
                                 >
                                     <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-error text-white text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">Now</div>
                                 </div>
                             </div>
                        </div>

                         {/* Hero Card: Next Prayer & Countdown */}
                         {prayerTimes.find(p => p.isNext) && (
                            <div className="bg-primary-dark text-white p-6 rounded-3xl shadow-xl relative overflow-hidden group">
                                {/* Decorative Background Pattern */}
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, white 0%, transparent 50%)' }}></div>
                                <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-1/4 -translate-y-1/4 transition-transform group-hover:scale-110 duration-700">
                                     <Icons.Logo />
                                </div>

                                <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                                    <p className="text-primary-light/80 text-sm font-medium tracking-wide uppercase">Next Prayer</p>
                                    <h2 className="text-5xl font-display font-bold mb-1">{prayerTimes.find(p => p.isNext)?.name}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-medium opacity-90">{prayerTimes.find(p => p.isNext)?.displayTime}</span>
                                        <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                                        <div className="flex items-center gap-1.5 font-mono text-lg text-primary-light bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                            <span>{timeRemaining || "--:--:--"}</span>
                                            <span className="text-[10px] uppercase text-white/50">left</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="mt-6 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                     <div 
                                        className="h-full bg-white/80 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000"
                                        style={{ width: `${progressPercent > 0 ? progressPercent : 5}%` }} 
                                     ></div>
                                </div>
                            </div>
                         )}

                         {/* Info Row: Calendars & Qibla */}
                         <div className="grid grid-cols-2 gap-3">
                            {/* Date Card */}
                            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/40 flex flex-col justify-center">
                                <div className="flex items-center gap-2 text-primary-dark mb-1">
                                    <Icons.Calendar />
                                    <span className="text-xs font-bold uppercase tracking-wider">Date</span>
                                </div>
                                <p className="text-sm font-semibold text-neutral-dark">{currentDate}</p>
                                <p className="text-xs text-secondary-dark mt-1">{hijriDate}</p>
                            </div>

                            {/* Qibla Card */}
                            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/40 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="flex items-center gap-2 w-full mb-2">
                                     <div className="bg-primary-light p-1 rounded-full text-primary-dark">
                                        <Icons.Compass />
                                     </div>
                                     <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">Qibla</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 border-2 border-primary-dark/20 rounded-full flex items-center justify-center bg-white/50">
                                        <div 
                                            className="text-primary-dark transform transition-transform duration-1000 ease-out"
                                            style={{ transform: `rotate(${qiblaDirection || 0}deg)` }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2L15 22L12 18L9 22L12 2Z" />
                                            </svg>
                                        </div>
                                        <div className="absolute top-0 text-[8px] font-bold text-secondary-dark">N</div>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-xl font-bold text-primary-dark">{qiblaDirection}°</span>
                                        <p className="text-[10px] text-secondary-dark leading-tight">from North</p>
                                    </div>
                                </div>
                            </div>
                         </div>

                        {/* Prayer List */}
                        <div className="space-y-3 pb-4">
                            <h4 className="text-sm font-bold text-secondary-dark uppercase tracking-wider ml-1 mb-2 opacity-70">Schedule</h4>
                            {prayerTimes.map((prayer) => (
                                <div 
                                    key={prayer.name}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group ${
                                        prayer.isNext 
                                            ? 'bg-gradient-to-r from-white/80 to-white/60 border-primary-dark/30 shadow-lg scale-[1.01]' 
                                            : 'bg-white/30 border-white/40 hover:bg-white/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                            prayer.isNext ? 'bg-primary-dark text-white' : 'bg-white text-secondary-dark shadow-sm'
                                        }`}>
                                            <span className="font-bold text-sm">{prayer.name[0]}</span>
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${prayer.isNext ? 'text-primary-dark' : 'text-neutral-dark'}`}>
                                                {prayer.name}
                                            </p>
                                            <p className="text-sm text-secondary-dark font-medium">{prayer.displayTime}</p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => toggleReminder(prayer.name)}
                                        className={`p-2.5 rounded-full transition-all ${
                                            reminders[prayer.name]
                                                ? 'bg-primary-dark text-white shadow-md'
                                                : 'bg-transparent text-secondary-dark/40 hover:bg-white hover:text-primary-dark hover:shadow-sm'
                                        }`}
                                        title={reminders[prayer.name] ? "Turn off reminder" : "Set reminder"}
                                    >
                                        {reminders[prayer.name] ? <Icons.Bell /> : <Icons.BellOff />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PrayerTimes;