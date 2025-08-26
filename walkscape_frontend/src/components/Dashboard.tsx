'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import {
    MapPin,
    Trophy,
    Heart,
    Zap,
    Calendar,
    PawPrint,
    Coins,
    User,
    Flame,
    Star,
    Sparkles,
    Leaf,
    Target,
    Clock,
    Award,
    ChevronRight,
    Activity
} from 'lucide-react';

export default function Dashboard() {
    const { playerStats, refreshPlayerStats, address, isRegistered, isLoading } = useWallet();
    const [lastRefresh, setLastRefresh] = useState(Date.now());

    // Debug log
    console.log('Dashboard state:', {
        isRegistered,
        isLoading,
        hasPlayerStats: !!playerStats,
        address: address?.slice(0, 8)
    });

    useEffect(() => {
        // Refresh stats when component mounts if user is registered
        if (isRegistered && !playerStats && !isLoading) {
            console.log('Attempting to refresh player stats...');
            refreshPlayerStats();
        }
    }, [isRegistered, playerStats, refreshPlayerStats, isLoading]);

    useEffect(() => {
        // Refresh stats every 30 seconds if user is registered
        if (isRegistered) {
            const interval = setInterval(() => {
                refreshPlayerStats();
                setLastRefresh(Date.now());
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [refreshPlayerStats, isRegistered]);

    // Show loading if wallet context is still loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-slate-400 mt-4 text-lg">Loading wallet status...</p>
                </div>
            </div>
        );
    }

    // Show loading if not registered or stats not loaded yet
    if (!isRegistered) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">Please complete registration first</p>
                </div>
            </div>
        );
    }

    // Check if playerStats is actually null/undefined (not just 0n)
    if (playerStats === null || playerStats === undefined) {
        // Show skeleton loader
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-full max-w-md mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-slate-800 rounded w-2/3 mx-auto" />
                        <div className="h-6 bg-slate-800 rounded w-1/2 mx-auto" />
                        <div className="h-40 bg-slate-800 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    // Handle the case where playerStats is 0n (registered but no activity)
    let actualStats;
    if (typeof playerStats === 'bigint' && playerStats === BigInt(0)) {
        // Create default stats for a new player
        actualStats = {
            walksXp: BigInt(0),
            grassTouchStreak: BigInt(0),
            totalArtifacts: BigInt(0),
            petsOwned: BigInt(0),
            healthScore: BigInt(0),
            lastCheckin: BigInt(0),
            currentBiome: BigInt(0),
            currentColony: BigInt(0)
        };
    } else {
        actualStats = playerStats;
    }

    const formatXP = (xp: bigint) => {
        return Number(xp).toLocaleString();
    };

    const getStreakIcon = (streak: bigint) => {
        const streakNum = Number(streak);
        if (streakNum >= 30) return <Flame className="w-6 h-6 text-white" />;
        if (streakNum >= 14) return <Star className="w-6 h-6 text-gray-300" />;
        if (streakNum >= 7) return <Sparkles className="w-6 h-6 text-green-300" />;
        if (streakNum >= 3) return <Leaf className="w-6 h-6 text-green-400" />;
        return <Leaf className="w-6 h-6 text-green-300" />;
    };

    const calculateLevel = (xp: bigint) => {
        return Math.floor(Math.sqrt(Number(xp) / 100)) + 1;
    };

    const calculateNextLevelXP = (xp: bigint) => {
        const currentLevel = calculateLevel(xp);
        return Math.pow(currentLevel, 2) * 100;
    };

    const xpProgress = () => {
        const currentXP = Number(actualStats.walksXp);
        const currentLevel = calculateLevel(actualStats.walksXp);
        const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
        const nextLevelXP = Math.pow(currentLevel, 2) * 100;

        return ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    };

    // Check if this is a new player (all stats are zero)
    const isNewPlayer = Object.values(actualStats).every(
        v => typeof v === 'bigint' ? v === BigInt(0) : v === 0
    );

    // Check if user touched grass today
    const touchedGrassToday = () => {
        if (!actualStats.lastCheckin || actualStats.lastCheckin === BigInt(0)) {
            return false;
        }

        const lastCheckinDate = new Date(Number(actualStats.lastCheckin) * 1000);
        const today = new Date();

        // Check if last checkin was today
        return lastCheckinDate.toDateString() === today.toDateString();
    };

    return (
        <div className="space-y-6 md:space-y-8 px-2 sm:px-4 md:px-0">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-green-900/20 to-gray-900/20 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 border border-green-500/20 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 animate-slide-up">
                            Welcome back, Explorer!
                        </h1>
                        <p className="text-slate-300 text-base sm:text-lg animate-slide-up-delay-1">
                            Level {calculateLevel(actualStats.walksXp)} • {formatXP(actualStats.walksXp)} XP
                        </p>
                        <p className="text-slate-400 text-xs sm:text-sm mt-1 animate-slide-up-delay-2">
                            {address?.slice(0, 8)}...{address?.slice(-6)}
                        </p>
                    </div>
                    <div className="text-left sm:text-right animate-slide-up-delay-3">
                        <div className="text-3xl sm:text-4xl mb-2">
                            <Zap className="text-white w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <p className="text-green-400 font-bold text-lg sm:text-xl">
                            {Number(actualStats.grassTouchStreak)} Day Streak
                        </p>
                    </div>
                </div>

                {/* XP Progress */}
                <div className="mt-4 sm:mt-6 animate-slide-up-delay-4">
                    <div className="flex justify-between text-xs sm:text-sm text-slate-400 mb-2">
                        <span>Level Progress</span>
                        <span>{Math.round(xpProgress())}% to Level {calculateLevel(actualStats.walksXp) + 1}</span>
                    </div>
                    <div className="progress-bar h-2 sm:h-3">
                        <div
                            className="progress-fill h-2 sm:h-3 animate-width-expand"
                            style={{ width: `${xpProgress()}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-stagger-children">
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-4 sm:p-6 border border-green-500/30 animate-slide-up hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg">
                            <MapPin size={20} className="text-green-400 sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-xl sm:text-2xl">{getStreakIcon(actualStats.grassTouchStreak)}</span>
                    </div>
                    <h3 className="text-green-400 font-semibold mb-1 text-sm sm:text-base">Touch Grass Streak</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{Number(actualStats.grassTouchStreak)}</p>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">consecutive days</p>
                </div>

                <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 rounded-xl p-4 sm:p-6 border border-gray-500/30 animate-slide-up-delay-1 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-gray-500/20 rounded-lg">
                            <Trophy size={20} className="text-gray-300 sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-xl sm:text-2xl"><Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" /></span>
                    </div>
                    <h3 className="text-gray-300 font-semibold mb-1 text-sm sm:text-base">Artifacts Found</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{Number(actualStats.totalArtifacts)}</p>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">unique discoveries</p>
                </div>

                <div className="bg-gradient-to-br from-green-800/30 to-green-700/20 rounded-xl p-4 sm:p-6 border border-green-400/30 animate-slide-up-delay-2 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-green-400/20 rounded-lg">
                            <PawPrint size={20} className="text-green-300 sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-xl sm:text-2xl"><PawPrint className="w-5 h-5 sm:w-6 sm:h-6 text-green-300" /></span>
                    </div>
                    <h3 className="text-green-300 font-semibold mb-1 text-sm sm:text-base">Pets Owned</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{Number(actualStats.petsOwned)}</p>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">faithful companions</p>
                </div>

                <div className="bg-gradient-to-br from-slate-900/30 to-slate-800/20 rounded-xl p-4 sm:p-6 border border-slate-500/30 animate-slide-up-delay-3 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 bg-slate-500/20 rounded-lg">
                            <Heart size={20} className="text-slate-300 sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-xl sm:text-2xl"><Heart className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" /></span>
                    </div>
                    <h3 className="text-slate-300 font-semibold mb-1 text-sm sm:text-base">Health Score</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{Number(actualStats.healthScore)}%</p>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">wellness rating</p>
                </div>
            </div>

            {/* Secondary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-stagger-children-delay">
                {/* Daily Actions */}
                <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700 animate-slide-up">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gray-500/20 rounded-lg">
                            <Calendar size={18} className="text-gray-300 sm:w-5 sm:h-5" />
                        </div>
                        Daily Actions
                    </h3>

                    <div className="space-y-3 sm:space-y-4">
                        <div
                            onClick={() => window.location.href = '/scanner'}
                            className="flex items-center justify-between p-3 sm:p-4 bg-green-900/20 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer animate-slide-up-delay-1 hover:scale-102"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <MapPin size={14} className="text-green-400 sm:w-4 sm:h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-white text-sm sm:text-base">Touch Grass</p>
                                    <p className="text-xs text-slate-400">Daily check-in with nature</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-green-400 font-bold text-sm sm:text-base">+15 XP</span>
                            </div>
                        </div>

                        <div
                            onClick={() => window.location.href = '/scanner'}
                            className="flex items-center justify-between p-3 sm:p-4 bg-gray-900/20 rounded-lg border border-gray-500/20 hover:border-gray-500/40 transition-all cursor-pointer animate-slide-up-delay-2 hover:scale-102"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-500/20 rounded-lg">
                                    <Trophy size={14} className="text-gray-300 sm:w-4 sm:h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-white text-sm sm:text-base">Scan Location</p>
                                    <p className="text-xs text-slate-400">Discover hidden artifacts</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-300 font-bold text-sm sm:text-base">Artifact</span>
                            </div>
                        </div>

                        <div
                            onClick={() => window.location.href = '/garden'}
                            className="flex items-center justify-between p-3 sm:p-4 bg-green-800/20 rounded-lg border border-green-400/20 hover:border-green-400/40 transition-all cursor-pointer animate-slide-up-delay-3 hover:scale-102"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-400/20 rounded-lg">
                                    <PawPrint size={14} className="text-green-300 sm:w-4 sm:h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-white text-sm sm:text-base">Care for Pets</p>
                                    <p className="text-xs text-slate-400">Feed and nurture companions</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-green-300 font-bold text-sm sm:text-base">Happiness</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Overview */}
                <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700 animate-slide-up-delay-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gray-500/20 rounded-lg">
                            <Zap size={18} className="text-gray-300 sm:w-5 sm:h-5" />
                        </div>
                        Activity Overview
                    </h3>

                    <div className="space-y-4 sm:space-y-6">
                        <div className="animate-slide-up-delay-1">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-300 text-sm sm:text-base">Last Check-in</span>
                                <span className="text-white font-medium text-sm sm:text-base">
                                    {actualStats.lastCheckin
                                        ? new Date(Number(actualStats.lastCheckin) * 1000).toLocaleDateString()
                                        : 'Never'
                                    }
                                </span>
                            </div>
                        </div>

                        <div className="animate-slide-up-delay-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-300 text-sm sm:text-base">Explorer Status</span>
                                <span className={`font-medium text-sm sm:text-base ${Number(actualStats.grassTouchStreak) > 0
                                    ? 'text-green-400'
                                    : 'text-gray-300'
                                    }`}>
                                    {Number(actualStats.grassTouchStreak) > 0 ? 'Active Explorer' : 'Getting Started'}
                                </span>
                            </div>
                        </div>

                        {Number(actualStats.currentColony) > 0 && (
                            <div className="animate-slide-up-delay-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-300 text-sm sm:text-base">Colony Member</span>
                                    <span className="text-green-400 font-medium text-sm sm:text-base">
                                        Colony #{Number(actualStats.currentColony)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-700 animate-slide-up-delay-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="animate-slide-up-delay-5">
                                    <p className="text-xl sm:text-2xl font-bold text-green-400">{calculateLevel(actualStats.walksXp)}</p>
                                    <p className="text-xs text-slate-400">Explorer Level</p>
                                </div>
                                <div className="animate-slide-up-delay-6">
                                    <p className="text-xl sm:text-2xl font-bold text-gray-300">{formatXP(actualStats.walksXp)}</p>
                                    <p className="text-xs text-slate-400">Total XP</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl p-4 sm:p-6 border border-slate-700 animate-fade-in-delay-2">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="text-gray-300" size={18} />
                    Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                    <button
                        onClick={() => window.location.href = '/scanner'}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all hover:scale-105 active:scale-95 text-sm sm:text-base animate-slide-up"
                    >
                        <MapPin size={14} />
                        <span>Touch Grass</span>
                    </button>
                    <button
                        onClick={() => window.location.href = '/scanner'}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all hover:scale-105 active:scale-95 text-sm sm:text-base animate-slide-up-delay-1"
                    >
                        <Trophy size={14} />
                        <span>Scan Area</span>
                    </button>
                    <button
                        onClick={() => window.location.href = '/garden'}
                        className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all hover:scale-105 active:scale-95 text-sm sm:text-base animate-slide-up-delay-2"
                    >
                        <PawPrint size={14} />
                        <span>Visit Garden</span>
                    </button>
                    <button
                        onClick={() => window.location.href = '/staking'}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all hover:scale-105 active:scale-95 text-sm sm:text-base animate-slide-up-delay-3"
                    >
                        <Coins size={14} />
                        <span>Stake Tokens</span>
                    </button>
                </div>
            </div>

            {/* Achievements & Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-stagger-children-delay-2">
                {/* Achievements */}
                <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700 animate-slide-up">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gray-500/20 rounded-lg">
                            <Award size={18} className="text-gray-300 sm:w-5 sm:h-5" />
                        </div>
                        Achievements
                    </h3>

                    <div className="space-y-3 sm:space-y-4">
                        {/* First Steps Achievement */}
                        <div className={`p-3 sm:p-4 rounded-lg border transition-all animate-slide-up-delay-1 hover:scale-102 ${Number(actualStats.grassTouchStreak) > 0
                            ? 'bg-green-900/20 border-green-500/30'
                            : 'bg-slate-700/20 border-slate-600/30'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${Number(actualStats.grassTouchStreak) > 0
                                        ? 'bg-green-500/20'
                                        : 'bg-slate-500/20'
                                        }`}>
                                        <Leaf size={14} className={
                                            Number(actualStats.grassTouchStreak) > 0
                                                ? 'text-green-400'
                                                : 'text-slate-400'
                                        } />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-sm sm:text-base">First Steps</p>
                                        <p className="text-xs text-slate-400">Touch grass for the first time</p>
                                    </div>
                                </div>
                                {Number(actualStats.grassTouchStreak) > 0 && (
                                    <div className="text-green-400 animate-bounce-soft">
                                        <Trophy size={14} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Explorer Achievement */}
                        <div className={`p-3 sm:p-4 rounded-lg border transition-all animate-slide-up-delay-2 hover:scale-102 ${Number(actualStats.totalArtifacts) > 0
                            ? 'bg-gray-900/20 border-gray-500/30'
                            : 'bg-slate-700/20 border-slate-600/30'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${Number(actualStats.totalArtifacts) > 0
                                        ? 'bg-gray-500/20'
                                        : 'bg-slate-500/20'
                                        }`}>
                                        <Trophy size={14} className={
                                            Number(actualStats.totalArtifacts) > 0
                                                ? 'text-gray-300'
                                                : 'text-slate-400'
                                        } />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-sm sm:text-base">Explorer</p>
                                        <p className="text-xs text-slate-400">Find your first artifact</p>
                                    </div>
                                </div>
                                {Number(actualStats.totalArtifacts) > 0 && (
                                    <div className="text-gray-300 animate-bounce-soft">
                                        <Trophy size={14} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Streak Master Achievement */}
                        <div className={`p-3 sm:p-4 rounded-lg border transition-all animate-slide-up-delay-3 hover:scale-102 ${Number(actualStats.grassTouchStreak) >= 7
                            ? 'bg-green-900/20 border-green-500/30'
                            : 'bg-slate-700/20 border-slate-600/30'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${Number(actualStats.grassTouchStreak) >= 7
                                        ? 'bg-green-500/20'
                                        : 'bg-slate-500/20'
                                        }`}>
                                        <Flame size={14} className={
                                            Number(actualStats.grassTouchStreak) >= 7
                                                ? 'text-green-400'
                                                : 'text-slate-400'
                                        } />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-sm sm:text-base">Streak Master</p>
                                        <p className="text-xs text-slate-400">Maintain a 7-day streak</p>
                                    </div>
                                </div>
                                {Number(actualStats.grassTouchStreak) >= 7 && (
                                    <div className="text-green-400 animate-bounce-soft">
                                        <Trophy size={14} />
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 animate-slide-up-delay-4">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>{Number(actualStats.grassTouchStreak)}/7 days</span>
                                    <span>{Math.min(Math.round((Number(actualStats.grassTouchStreak) / 7) * 100), 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-green-400 h-2 rounded-full transition-all duration-300 animate-width-expand"
                                        style={{ width: `${Math.min((Number(actualStats.grassTouchStreak) / 7) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Goals */}
                <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700 animate-slide-up-delay-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gray-500/20 rounded-lg">
                            <Target size={18} className="text-gray-300 sm:w-5 sm:h-5" />
                        </div>
                        Daily Goals
                    </h3>

                    <div className="space-y-3 sm:space-y-4">
                        {/* Touch Grass Goal */}
                        <div className="p-3 sm:p-4 bg-green-900/10 rounded-lg border border-green-500/20 animate-slide-up-delay-1 hover:scale-102 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <MapPin size={14} className="text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-sm sm:text-base">Daily Touch Grass</p>
                                        <p className="text-xs text-slate-400">Stay connected with nature</p>
                                    </div>
                                </div>
                                <div className="text-green-400 font-bold text-sm sm:text-base">
                                    +15 XP
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Today&apos;s progress</span>
                                <span>{touchedGrassToday() ? 'Complete!' : 'Pending'}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 animate-width-expand ${touchedGrassToday() ? 'bg-green-400' : 'bg-slate-600'
                                        }`}
                                    style={{ width: touchedGrassToday() ? '100%' : '0%' }}
                                />
                            </div>
                        </div>

                        {/* Exploration Goal */}
                        <div className="p-3 sm:p-4 bg-gray-900/10 rounded-lg border border-gray-500/20 animate-slide-up-delay-2 hover:scale-102 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-500/20 rounded-lg">
                                        <Trophy size={14} className="text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-sm sm:text-base">Explore & Discover</p>
                                        <p className="text-xs text-slate-400">Find hidden artifacts</p>
                                    </div>
                                </div>
                                <div className="text-gray-300 font-bold text-sm sm:text-base">
                                    Artifact
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Weekly goal: 3 artifacts</span>
                                <span>{Number(actualStats.totalArtifacts)}/3</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-gray-300 h-2 rounded-full transition-all duration-300 animate-width-expand"
                                    style={{ width: `${Math.min((Number(actualStats.totalArtifacts) / 3) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Health Goal */}
                        <div className="p-3 sm:p-4 bg-gray-900/10 rounded-lg border border-gray-500/20 animate-slide-up-delay-3 hover:scale-102 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-500/20 rounded-lg">
                                        <Heart size={14} className="text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-sm sm:text-base">Health & Wellness</p>
                                        <p className="text-xs text-slate-400">Maintain good health score</p>
                                    </div>
                                </div>
                                <div className="text-gray-300 font-bold text-sm sm:text-base">
                                    {Number(actualStats.healthScore)}%
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Target: 80% health</span>
                                <span>{Number(actualStats.healthScore) >= 80 ? 'Achieved!' : 'In Progress'}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 animate-width-expand ${Number(actualStats.healthScore) >= 80 ? 'bg-green-400' : 'bg-gray-400'
                                        }`}
                                    style={{ width: `${Math.min(Number(actualStats.healthScore), 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700 animate-fade-in-delay-3">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                    <div className="p-2 bg-slate-500/20 rounded-lg">
                        <Clock size={18} className="text-slate-400 sm:w-5 sm:h-5" />
                    </div>
                    Recent Activity
                </h3>

                {isNewPlayer ? (
                    <div className="text-center py-6 sm:py-8 animate-slide-up">
                        <div className="p-4 bg-slate-700/30 rounded-lg inline-block mb-4 animate-pulse">
                            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 mx-auto" />
                        </div>
                        <p className="text-slate-400 mb-2 text-sm sm:text-base">No activity yet</p>
                        <p className="text-xs sm:text-sm text-slate-500">Start your WalkScape journey by touching grass!</p>
                        <button
                            onClick={() => window.location.href = '/scanner'}
                            className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all mx-auto hover:scale-105 active:scale-95 text-sm sm:text-base animate-slide-up-delay-1"
                        >
                            <MapPin size={14} />
                            <span>Touch Grass Now</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-green-900/10 rounded-lg border border-green-500/20 animate-slide-up hover:scale-102 transition-all">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <MapPin size={14} className="text-green-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium text-sm sm:text-base">Touched grass</p>
                                <p className="text-xs text-slate-400">
                                    {actualStats.lastCheckin
                                        ? new Date(Number(actualStats.lastCheckin) * 1000).toLocaleDateString()
                                        : 'Recently'
                                    }
                                </p>
                            </div>
                            <div className="text-green-400 font-bold text-sm">+15 XP</div>
                        </div>

                        {Number(actualStats.totalArtifacts) > 0 && (
                            <div className="flex items-center gap-4 p-3 bg-gray-900/10 rounded-lg border border-gray-500/20 animate-slide-up-delay-1 hover:scale-102 transition-all">
                                <div className="p-2 bg-gray-500/20 rounded-lg">
                                    <Trophy size={14} className="text-gray-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium text-sm sm:text-base">Found artifacts</p>
                                    <p className="text-xs text-slate-400">Total: {Number(actualStats.totalArtifacts)}</p>
                                </div>
                                <div className="text-gray-300 font-bold text-sm">Rare</div>
                            </div>
                        )}

                        <div className="text-center py-4 animate-slide-up-delay-2">
                            <button className="text-gray-300 hover:text-white text-sm flex items-center gap-1 mx-auto transition-colors hover:scale-105">
                                View All Activity
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
