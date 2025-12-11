import React from 'react';

export enum AppView {
    LANDING = 'LANDING',
    DASHBOARD = 'DASHBOARD',
    CHAT = 'CHAT',
    AUTH = 'AUTH',
    PRAYER_TIMES = 'PRAYER_TIMES',
    ZAKAT = 'ZAKAT',
    LIFESTYLE_HUB = 'LIFESTYLE_HUB',
    LEARNING_HUB = 'LEARNING_HUB',
    LECTURE_SUMMARIZER = 'LECTURE_SUMMARIZER',
    QURAN_READER = 'QURAN_READER',
    HADITH_READER = 'HADITH_READER',
    DUA_COLLECTION = 'DUA_COLLECTION'
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
    isLoading?: boolean;
}

export interface Feature {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    colSpan?: string;
    rowSpan?: string;
    subFeatures?: string[];
    action?: () => void;
}

export interface ChatConfig {
    id: string;
    title: string;
    systemInstruction: string;
    initialMessage: string;
    icon?: React.ReactNode;
    model?: string;
    useGoogleSearch?: boolean;
    thinkingBudget?: number;
}