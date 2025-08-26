'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import NetworkSwitcher from './NetworkSwitcher';
import {
    BarChart3,
    Camera,
    Leaf,
    Users,
    Coins,
    LogOut,
    TreePine
} from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isConnected, isRegistered, address, disconnect, isLoading } = useWallet();
    const pathname = usePathname();
    const router = useRouter();

    // Only show layout for connected and registered users on protected routes
    const protectedRoutes = ['/dashboard', '/scanner', '/garden', '/colony', '/staking'];
    const isProtectedRoute = protectedRoutes.includes(pathname);

    // Show loading or let pages handle their own loading states
    if (isLoading || !isConnected || (isProtectedRoute && !isRegistered)) {
        return <>{children}</>;
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
        { id: 'scanner', label: 'Scanner', icon: Camera, path: '/scanner' },
        { id: 'garden', label: 'Garden', icon: Leaf, path: '/garden' },
        { id: 'colony', label: 'Colony', icon: Users, path: '/colony' },
        { id: 'staking', label: 'Staking', icon: Coins, path: '/staking' }
    ];

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col animate-fade-in">
            <NetworkSwitcher />

            {/* Top Navigation */}
            <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 animate-slide-up">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and Navigation */}
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <TreePine className="h-8 w-8 text-green-500 animate-bob" />
                                <span className="ml-2 text-xl font-bold text-white">WalkScape</span>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden lg:flex ml-6 items-center space-x-2">
                                {tabs.map((tab, index) => {
                                    const IconComponent = tab.icon;
                                    const isActive = pathname === tab.path;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleNavigate(tab.path)}
                                            className={`px-3 py-2 rounded-md text-sm flex items-center space-x-2 transition-all duration-300 animate-fade-in delay-${index * 100} ${isActive
                                                ? 'bg-green-600 text-white animate-pulse-soft'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:transform hover:scale-105'
                                                }`}
                                        >
                                            <IconComponent size={16} className={isActive ? 'animate-bob' : ''} />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:block text-right">
                                <div className="text-sm font-medium text-white">Connected</div>
                                <div className="text-xs text-slate-400">
                                    {address?.slice(0, 6)}...{address?.slice(-4)}
                                </div>
                            </div>
                            <button
                                onClick={() => disconnect()}
                                className="p-2 text-slate-400 hover:text-white transition-colors duration-300 hover:transform hover:rotate-12"
                                title="Disconnect Wallet"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Dashboard Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation (Mobile/Tablet) */}
                <aside className="lg:hidden w-16 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 space-y-4 animate-slide-left">
                    {tabs.map((tab, index) => {
                        const IconComponent = tab.icon;
                        const isActive = pathname === tab.path;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleNavigate(tab.path)}
                                className={`p-3 rounded-lg transition-all duration-300 animate-fade-in delay-${index * 100} ${isActive
                                    ? 'bg-green-600 text-white animate-pulse-soft'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700 hover:transform hover:scale-110'
                                    }`}
                                title={tab.label}
                            >
                                <IconComponent size={20} className={isActive ? 'animate-bob' : ''} />
                            </button>
                        );
                    })}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                    <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-slide-up delay-200">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
