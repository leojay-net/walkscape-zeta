'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { getContract, bytes32ToString, stringToBytes32 } from '@/lib/web3';
import {
    Users,
    Plus,
    Crown,
    Trophy,
    Calendar,
    Loader2,
    UserPlus,
    LogOut
} from 'lucide-react';

interface Colony {
    id: string;
    name: string;
    creator: string;
    member_count: bigint;
    total_xp: bigint;
    created_at: bigint;
    weekly_challenge_score: bigint;
}

interface PopularColony {
    id: string;
    name: string;
    member_count: number;
    total_xp: number;
    level: number;
}

export default function Colony() {
    const { provider, playerStats, refreshPlayerStats, address, isRegistered } = useWallet();
    const [activeTab, setActiveTab] = useState<'my-colony' | 'discover'>('my-colony');
    const [colony, setColony] = useState<Colony | null>(null);
    const [createdColonies, setCreatedColonies] = useState<Colony[]>([]);
    const [popularColonies, setPopularColonies] = useState<PopularColony[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPopular, setIsLoadingPopular] = useState(false);
    const [isLoadingCreated, setIsLoadingCreated] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState<string | null>(null);
    const [newColonyName, setNewColonyName] = useState('');
    const [joinColonyId, setJoinColonyId] = useState('');
    const [error, setError] = useState<string | null>(null);

    const loadColonyData = useCallback(async () => {
        if (!address) {
            setIsLoading(false);
            return;
        }

        if (!playerStats) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const colonyIdBigInt = BigInt(playerStats.currentColony);
            const colonyId = Number(colonyIdBigInt);

            if (colonyIdBigInt > BigInt(0)) {
                const contract = getContract(provider || undefined);
                const colonyStats = await contract.colonies(colonyIdBigInt);

                const colonyData = {
                    id: colonyId.toString(),
                    name: bytes32ToString(colonyStats.name),
                    creator: colonyStats.creator,
                    member_count: colonyStats.memberCount,
                    total_xp: colonyStats.totalXp,
                    created_at: colonyStats.createdAt,
                    weekly_challenge_score: colonyStats.weeklyChallengeScore
                };
                setColony(colonyData);
            } else {
                setColony(null);
            }
        } catch {
            setError('Failed to load colony information. This might be a network issue.');
            setColony(null);
        } finally {
            setIsLoading(false);
        }
    }, [address, playerStats]);

    const loadCreatedColonies = useCallback(async () => {
        if (!address) return;

        setIsLoadingCreated(true);
        try {
            const contract = getContract(provider || undefined);
            const colonies: Colony[] = [];

            for (let i = 1; i <= 20; i++) {
                try {
                    const colonyStats = await contract.colonies(BigInt(i));
                    if (colonyStats.creator === address) {
                        colonies.push({
                            id: i.toString(),
                            name: bytes32ToString(colonyStats.name),
                            creator: colonyStats.creator,
                            member_count: colonyStats.memberCount,
                            total_xp: colonyStats.totalXp,
                            created_at: colonyStats.createdAt,
                            weekly_challenge_score: colonyStats.weeklyChallengeScore
                        });
                    }
                } catch {
                    continue;
                }
            }

            setCreatedColonies(colonies);
        } catch {
            console.error('Failed to load created colonies');
        } finally {
            setIsLoadingCreated(false);
        }
    }, [address]);

    const loadPopularColonies = useCallback(async () => {
        if (!address) return;

        setIsLoadingPopular(true);
        try {
            const contract = getContract(provider || undefined);
            const colonies: PopularColony[] = [];

            for (let i = 1; i <= 10; i++) {
                try {
                    const colonyStats = await contract.colonies(BigInt(i));
                    if (colonyStats.memberCount > 0) {
                        colonies.push({
                            id: i.toString(),
                            name: bytes32ToString(colonyStats.name),
                            member_count: Number(colonyStats.memberCount),
                            total_xp: Number(colonyStats.totalXp),
                            level: Math.floor(Math.sqrt(Number(colonyStats.totalXp) / 1000)) + 1
                        });
                    }
                } catch {
                    continue;
                }
            }

            // Sort by total XP and take top 5
            setPopularColonies(
                colonies
                    .sort((a, b) => b.total_xp - a.total_xp)
                    .slice(0, 5)
            );
        } catch {
            console.error('Failed to load popular colonies');
        } finally {
            setIsLoadingPopular(false);
        }
    }, [address]);

    useEffect(() => {
        if (isRegistered && address) {
            loadColonyData();
            loadCreatedColonies();
        }
    }, [loadColonyData, loadCreatedColonies, isRegistered, address, playerStats]);

    useEffect(() => {
        if (activeTab === 'discover') {
            loadPopularColonies();
        }
    }, [activeTab, loadPopularColonies]);

    const handleCreateColony = async () => {
        if (!provider || !address || !newColonyName.trim()) return;

        setIsCreating(true);
        setError(null);
        try {
            const signer = await provider.getSigner();
            const contract = getContract(provider);
            const contractWithSigner = contract.connect(signer);

            const nameBytes32 = stringToBytes32(newColonyName.trim());
            const tx = await (contractWithSigner as unknown as { createColony: (name: string) => Promise<{ hash: string; wait: () => Promise<unknown> }> }).createColony(nameBytes32);
            await tx.wait();

            setTimeout(async () => {
                await refreshPlayerStats();
                await loadColonyData();
                await loadCreatedColonies();
                setIsCreating(false);
                setNewColonyName('');
                setError(null);
                setActiveTab('my-colony');
            }, 3000);
        } catch (error: unknown) {
            const err = error as Error;

            let errorMessage = 'Failed to create colony';
            if (err?.message?.includes('Already in a colony')) {
                errorMessage = 'You are already in a colony. Leave your current colony first to create a new one.';
            } else if (err?.message?.includes('Colony name already exists')) {
                errorMessage = 'A colony with this name already exists. Please choose a different name.';
            } else if (err?.message?.includes('Invalid name')) {
                errorMessage = 'Invalid colony name. Please use only letters, numbers, and spaces.';
            } else if (err?.message?.includes('execution was reverted')) {
                errorMessage = 'Transaction failed. You might already be in a colony or there was a contract error.';
            }

            setError(errorMessage);
            setIsCreating(false);
        }
    };

    const handleJoinColony = async (colonyId?: string) => {
        const targetColonyId = colonyId || joinColonyId;
        if (!provider || !address || !targetColonyId.trim()) return;

        setIsJoining(targetColonyId);
        setError(null);
        try {
            const signer = await provider.getSigner();
            const contract = getContract(provider);
            const contractWithSigner = contract.connect(signer);

            const tx = await (contractWithSigner as unknown as { joinColony: (colonyId: bigint) => Promise<{ hash: string; wait: () => Promise<unknown> }> }).joinColony(BigInt(targetColonyId));
            await tx.wait();

            setTimeout(() => {
                refreshPlayerStats();
                loadColonyData();
                setIsJoining(null);
                if (!colonyId) {
                    setJoinColonyId('');
                }
                setActiveTab('my-colony');
                setError(null);
            }, 3000);
        } catch (error: unknown) {
            const err = error as Error;

            let errorMessage = 'Failed to join colony';
            if (err?.message?.includes('Already in a colony')) {
                errorMessage = 'You are already in a colony. Leave your current colony first to join a different one.';
            } else if (err?.message?.includes('Colony does not exist')) {
                errorMessage = 'Colony not found. Please check the colony ID and try again.';
            } else if (err?.message?.includes('Colony is full')) {
                errorMessage = 'This colony is full and cannot accept new members.';
            }

            setError(errorMessage);
            setIsJoining(null);
        }
    };

    const handleLeaveColony = async () => {
        if (!provider || !address) return;

        setError(null);
        try {
            const signer = await provider.getSigner();
            const contract = getContract(provider);
            const contractWithSigner = contract.connect(signer);

            const tx = await (contractWithSigner as unknown as { leaveColony: () => Promise<{ hash: string; wait: () => Promise<unknown> }> }).leaveColony();
            await tx.wait();

            setTimeout(() => {
                refreshPlayerStats();
                loadColonyData();
                setError(null);
            }, 3000);
        } catch (error: unknown) {
            const err = error as Error;

            let errorMessage = 'Failed to leave colony';
            if (err?.message?.includes('Not in a colony')) {
                errorMessage = 'You are not currently in a colony.';
            }

            setError(errorMessage);
        }
    };

    const formatAddress = (addr: string | bigint) => {
        const addressStr = typeof addr === 'bigint'
            ? `0x${addr.toString(16).padStart(64, '0')}`
            : addr;
        return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;
    };

    const formatXP = (xp: bigint) => {
        return Number(xp).toLocaleString();
    };

    const getColonyLevel = (totalXP: bigint) => {
        return Math.floor(Math.sqrt(Number(totalXP) / 1000)) + 1;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-slate-400 mt-2">Loading colony data...</p>
                </div>
            </div>
        );
    }

    if (!isRegistered) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">Please complete registration first</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                    <Users size={32} className="text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">Colonies</h2>
                <p className="text-slate-400 text-sm">
                    Connect with fellow explorers
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-gray-200">
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="mt-2 text-xs text-gray-400 hover:text-gray-300 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('my-colony')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'my-colony'
                        ? 'bg-green-600 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Users size={16} className="inline mr-2" />
                    My Colony
                </button>
                <button
                    onClick={() => setActiveTab('discover')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'discover'
                        ? 'bg-green-600 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Plus size={16} className="inline mr-2" />
                    Join/Create
                </button>
            </div>

            {/* My Colony Tab */}
            {activeTab === 'my-colony' && (
                <div className="space-y-4">
                    {colony ? (
                        <>
                            {/* Colony Info */}
                            <div className="card-forest">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            {colony.creator === address && <Crown size={16} className="text-gray-300" />}
                                            {colony.name}
                                        </h3>
                                        <p className="text-sm text-slate-400">Colony #{colony.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-green-400">
                                            Level {getColonyLevel(colony.total_xp)}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {formatXP(colony.total_xp)} XP
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="stat-card">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users size={14} className="text-green-400" />
                                            <span className="text-sm">Members</span>
                                        </div>
                                        <p className="text-lg font-bold">{Number(colony.member_count)}</p>
                                    </div>

                                    <div className="stat-card">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Trophy size={14} className="text-gray-300" />
                                            <span className="text-sm">Weekly Score</span>
                                        </div>
                                        <p className="text-lg font-bold">{Number(colony.weekly_challenge_score)}</p>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-400 space-y-1">
                                    <p className="flex items-center gap-1">
                                        <Crown size={12} />
                                        Creator: {formatAddress(colony.creator)}
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        Created: {new Date(Number(colony.created_at) * 1000).toLocaleDateString()}
                                    </p>
                                </div>

                                {colony.creator !== address && (
                                    <button
                                        onClick={handleLeaveColony}
                                        className="btn-secondary w-full mt-4 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300"
                                    >
                                        <LogOut size={16} />
                                        Leave Colony
                                    </button>
                                )}
                            </div>

                            {/* Created Colonies Section */}
                            {createdColonies.length > 0 && (
                                <div className="card">
                                    <h4 className="font-bold mb-3 flex items-center gap-2">
                                        <Crown size={16} className="text-gray-300" />
                                        Colonies You Created
                                    </h4>
                                    {isLoadingCreated ? (
                                        <div className="text-center text-slate-400">
                                            <Loader2 size={16} className="animate-spin mx-auto mb-2" />
                                            <p className="text-sm">Loading your colonies...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {createdColonies.map((createdColony) => (
                                                <div key={createdColony.id} className="bg-slate-700 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-semibold flex items-center gap-1">
                                                            <Crown size={14} className="text-gray-300" />
                                                            {createdColony.name}
                                                        </h5>
                                                        <span className="text-xs text-slate-400">#{createdColony.id}</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-slate-400">Members:</span>
                                                            <p className="font-semibold">{Number(createdColony.member_count)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400">XP:</span>
                                                            <p className="font-semibold">{formatXP(createdColony.total_xp)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400">Level:</span>
                                                            <p className="font-semibold">{getColonyLevel(createdColony.total_xp)}</p>
                                                        </div>
                                                    </div>
                                                    {createdColony.id !== colony?.id && (<button
                                                        onClick={() => handleJoinColony(createdColony.id)}
                                                        className="btn-secondary w-full mt-2 text-xs py-1"
                                                        disabled={isJoining === createdColony.id}
                                                    >
                                                        {isJoining === createdColony.id ? (
                                                            <>
                                                                <Loader2 size={12} className="animate-spin mr-1" />
                                                                Switching...
                                                            </>
                                                        ) : (
                                                            'Switch to this Colony'
                                                        )}
                                                    </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Colony Benefits */}
                            <div className="card">
                                <h4 className="font-bold mb-3 flex items-center gap-2">
                                    <Trophy size={16} className="text-green-400" />
                                    Colony Benefits
                                </h4>
                                <div className="space-y-2 text-sm text-slate-300">
                                    <p>• Shared XP pool boosts individual rewards</p>
                                    <p>• Weekly challenges and competitions</p>
                                    <p>• Collaborative artifact discoveries</p>
                                    <p>• Member-only events and rewards</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Show created colonies even when not in one */}
                            {createdColonies.length > 0 && (
                                <div className="card">
                                    <h4 className="font-bold mb-3 flex items-center gap-2">
                                        <Crown size={16} className="text-gray-300" />
                                        Colonies You Created
                                    </h4>
                                    {isLoadingCreated ? (
                                        <div className="text-center text-slate-400">
                                            <Loader2 size={16} className="animate-spin mx-auto mb-2" />
                                            <p className="text-sm">Loading your colonies...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {createdColonies.map((createdColony) => (
                                                <div key={createdColony.id} className="bg-slate-700 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-semibold flex items-center gap-1">
                                                            <Crown size={14} className="text-gray-300" />
                                                            {createdColony.name}
                                                        </h5>
                                                        <span className="text-xs text-slate-400">#{createdColony.id}</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-slate-400">Members:</span>
                                                            <p className="font-semibold">{Number(createdColony.member_count)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400">XP:</span>
                                                            <p className="font-semibold">{formatXP(createdColony.total_xp)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400">Level:</span>
                                                            <p className="font-semibold">{getColonyLevel(createdColony.total_xp)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleJoinColony(createdColony.id)}
                                                        className="btn-primary w-full mt-2 text-xs py-1"
                                                        disabled={isJoining === createdColony.id}
                                                    >
                                                        {isJoining === createdColony.id ? (
                                                            <>
                                                                <Loader2 size={12} className="animate-spin mr-1" />
                                                                Rejoining...
                                                            </>
                                                        ) : (
                                                            'Rejoin this Colony'
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="card text-center text-slate-400">
                                <Users size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="mb-2">You&apos;re not in a colony yet</p>
                                <p className="text-xs mb-4">Join or create a colony to connect with other explorers!</p>
                                <button
                                    onClick={() => setActiveTab('discover')}
                                    className="btn-primary"
                                >
                                    Find a Colony
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Discover/Create Tab */}
            {activeTab === 'discover' && (
                <div className="space-y-4">
                    {!colony && (
                        <>
                            {/* Create Colony */}
                            <div className="card-forest">
                                <h3 className="font-bold mb-3 flex items-center gap-2">
                                    <Plus size={16} />
                                    Create New Colony
                                </h3>
                                <p className="text-sm text-slate-300 mb-4">
                                    Start your own exploration community
                                </p>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Colony name..."
                                        value={newColonyName}
                                        onChange={(e) => setNewColonyName(e.target.value)}
                                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                                        maxLength={31} // felt252 limit
                                    />

                                    <button
                                        onClick={handleCreateColony}
                                        disabled={!newColonyName.trim() || isCreating}
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={16} />
                                                Create Colony
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Join Colony */}
                            <div className="card">
                                <h3 className="font-bold mb-3 flex items-center gap-2">
                                    <UserPlus size={16} />
                                    Join Existing Colony
                                </h3>
                                <p className="text-sm text-slate-300 mb-4">
                                    Enter a colony ID to join
                                </p>

                                <div className="space-y-3">
                                    <input
                                        type="number"
                                        placeholder="Colony ID..."
                                        value={joinColonyId}
                                        onChange={(e) => setJoinColonyId(e.target.value)}
                                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                                    />

                                    <button
                                        onClick={() => handleJoinColony()}
                                        disabled={!joinColonyId.trim() || isJoining === joinColonyId}
                                        className="btn-secondary w-full flex items-center justify-center gap-2"
                                    >
                                        {isJoining === joinColonyId ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Joining...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={16} />
                                                Join Colony
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Popular Colonies */}
                    <div className="card">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Trophy size={16} className="text-green-400" />
                            Popular Colonies
                            {isLoadingPopular && <Loader2 size={16} className="animate-spin" />}
                        </h3>
                        {isLoadingPopular ? (
                            <div className="text-center text-slate-400">
                                <p className="text-sm">Loading popular colonies...</p>
                            </div>
                        ) : popularColonies.length > 0 ? (
                            <div className="space-y-3">
                                {popularColonies.map((popularColony) => (
                                    <div key={popularColony.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-sm">{popularColony.name}</h4>
                                            <p className="text-xs text-slate-400">
                                                {popularColony.member_count} members • {popularColony.total_xp.toLocaleString()} XP • Level {popularColony.level}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleJoinColony(popularColony.id)}
                                            className="btn-primary text-xs py-1 px-3"
                                            disabled={!!colony || isJoining === popularColony.id}
                                        >
                                            {isJoining === popularColony.id ? (
                                                <>
                                                    <Loader2 size={12} className="animate-spin mr-1" />
                                                    Joining...
                                                </>
                                            ) : (
                                                'Join'
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-slate-400">
                                <p className="text-sm">No popular colonies found</p>
                                <p className="text-xs mt-1">Be the first to create a thriving colony!</p>
                            </div>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="card">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Trophy size={16} className="text-gray-300" />
                            Colony Tips
                        </h3>
                        <div className="space-y-2 text-sm text-slate-400">
                            <p>• Colonies can have up to 50 members</p>
                            <p>• All member XP contributes to colony level</p>
                            <p>• Higher level colonies unlock better rewards</p>
                            <p>• Only colony creators can manage settings</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
