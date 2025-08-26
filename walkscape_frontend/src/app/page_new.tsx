'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import WalletConnection from '@/components/WalletConnection';
import Dashboard from '@/components/Dashboard';
import Navigation from '@/components/Navigation';
import ArtifactScanner from '@/components/ArtifactScanner';
import Garden from '@/components/Garden';
import Colony from '@/components/Colony';
import Staking from '@/components/Staking';

type ActiveTab = 'dashboard' | 'scan' | 'garden' | 'colony' | 'stake';

export default function Home() {
    const { isConnected, isRegistered } = useWallet();
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <WalletConnection />
            </div>
        );
    }

    if (!isRegistered) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <WalletConnection showRegistration />
            </div>
        );
    }

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'scan':
                return <ArtifactScanner />;
            case 'garden':
                return <Garden />;
            case 'colony':
                return <Colony />;
            case 'stake':
                return <Staking />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
                <div className="max-w-md mx-auto px-4 py-3">
                    <h1 className="text-xl font-bold text-gradient-nature text-center">
                        🌱 WalkScape
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto p-4">
                {renderActiveTab()}
            </main>

            {/* Bottom Navigation */}
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}
