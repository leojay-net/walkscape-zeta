'use client';

import {
    Home,
    QrCode,
    Flower2,
    Users,
    TrendingUp
} from 'lucide-react';

interface NavigationProps {
    activeTab: string;
    onTabChange: (tab: 'dashboard' | 'scan' | 'garden' | 'colony' | 'stake') => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
    const tabs = [
        { id: 'dashboard', icon: Home, label: 'Home' },
        { id: 'scan', icon: QrCode, label: 'Scan' },
        { id: 'garden', icon: Flower2, label: 'Garden' },
        { id: 'colony', icon: Users, label: 'Colony' },
        { id: 'stake', icon: TrendingUp, label: 'Stake' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 z-50">
            <div className="max-w-md mx-auto px-2 py-2">
                <div className="flex justify-around">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id as 'dashboard' | 'scan' | 'garden' | 'colony' | 'stake')}
                                className={`navigation-tab ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span className="text-xs mt-1">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
