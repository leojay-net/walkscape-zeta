"use client";

import { useState, useEffect, useCallback } from "react";
import { parseEther, formatEther } from 'ethers';
import { useWallet } from '@/contexts/WalletContext';
import { getContract } from '@/lib/web3';
import {
    TrendingUp,
    Coins,
    Clock,
    Gift,
    Loader2,
    Star,
    PawPrint,
    AlertCircle
} from 'lucide-react';

interface StakeInfo {
    amountStaked: bigint;
    stakeTimestamp: bigint;
    growthMultiplier: bigint;
    lastHarvest: bigint;
}

export default function Staking() {
    const { provider, address, refreshPlayerStats, isRegistered } = useWallet();
    const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStaking, setIsStaking] = useState(false);
    const [isHarvesting, setIsHarvesting] = useState(false);
    const [stakeAmount, setStakeAmount] = useState('');

    const loadStakeInfo = useCallback(async () => {
        if (!address) return;

        setIsLoading(true);
        try {
            const contract = getContract(provider || undefined);
            const info = await (contract as unknown as {
                getStakeInfo(addr: string): Promise<StakeInfo>;
            }).getStakeInfo(address);
            setStakeInfo({
                amountStaked: info.amountStaked,
                stakeTimestamp: info.stakeTimestamp,
                growthMultiplier: info.growthMultiplier,
                lastHarvest: info.lastHarvest
            });
        } catch (error) {
            console.error('Failed to load stake info:', error);
            setStakeInfo(null);
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    useEffect(() => {
        loadStakeInfo();
    }, [loadStakeInfo, address]);

    if (!isRegistered) {
        return (
            <div className="min-h-[400px] flex items-center justify-center animate-fade-in">
                <div className="text-center">
                    <Coins className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-bob" />
                    <p className="text-slate-400 text-lg">Please complete registration first</p>
                </div>
            </div>
        );
    }

    const handleStake = async () => {
        if (!provider || !address || !stakeAmount.trim()) return;

        // Validate numeric value
        const numeric = Number(stakeAmount);
        if (isNaN(numeric) || numeric <= 0) {
            console.error('Invalid stake amount');
            return;
        }

        setIsStaking(true);
        try {
            const signer = await provider.getSigner();
            const contract = getContract(provider);
            const contractWithSigner = contract.connect(signer);
            const weiAmount = parseEther(stakeAmount); // supports decimals
            await (contractWithSigner as unknown as {
                stakeForGrowth(amount: bigint): Promise<void>;
            }).stakeForGrowth(weiAmount as unknown as bigint);

            setTimeout(() => {
                loadStakeInfo();
                setIsStaking(false);
                setStakeAmount('');
            }, 3000);
        } catch (error) {
            console.error('Failed to stake:', error);
            setIsStaking(false);
        }
    };

    const handleHarvest = async () => {
        if (!provider || !address) return;

        setIsHarvesting(true);
        try {
            const signer = await provider.getSigner();
            const contract = getContract(provider);
            const contractWithSigner = contract.connect(signer);
            const rewardPetId = await (contractWithSigner as unknown as {
                harvestGrowthReward(): Promise<number | string | bigint>;
            }).harvestGrowthReward();

            setTimeout(() => {
                loadStakeInfo();
                refreshPlayerStats();
                setIsHarvesting(false);
                alert("Harvested! New pet ID: " + rewardPetId);
            }, 3000);
        } catch (error) {
            console.error('Failed to harvest:', error);
            setIsHarvesting(false);
        }
    };

    const getStakeTier = (amount: bigint) => {
        // Convert wei -> ETH for tier logic
        const amt = Number(formatEther(amount));
        if (amt >= 1000) return { tier: 'Legendary', multiplier: 300, color: 'text-gray-300' };
        if (amt >= 500) return { tier: 'Epic', multiplier: 200, color: 'text-gray-400' };
        if (amt >= 100) return { tier: 'Rare', multiplier: 150, color: 'text-green-400' };
        if (amt >= 50) return { tier: 'Common', multiplier: 100, color: 'text-gray-500' };
        return { tier: 'None', multiplier: 0, color: 'text-slate-400' };
    };

    const canHarvest = () => {
        if (!stakeInfo || Number(stakeInfo.amountStaked) === 0) return false;

        const currentTime = Math.floor(Date.now() / 1000);
        const stakeDuration = currentTime - Number(stakeInfo.stakeTimestamp);
        const harvestCooldown = currentTime - Number(stakeInfo.lastHarvest);
        const ONE_DAY = 86400; // matches contract MIN_HARVEST_TIME
        return stakeDuration >= ONE_DAY && harvestCooldown >= ONE_DAY;
    };

    const getTimeUntilHarvest = () => {
        if (!stakeInfo || Number(stakeInfo.amountStaked) === 0) return null;

        const currentTime = Math.floor(Date.now() / 1000);
        const stakeDuration = currentTime - Number(stakeInfo.stakeTimestamp);
        const harvestCooldown = currentTime - Number(stakeInfo.lastHarvest);
        const ONE_DAY = 86400;
        const stakeTimeRemaining = Math.max(0, ONE_DAY - stakeDuration);
        const cooldownTimeRemaining = Math.max(0, ONE_DAY - harvestCooldown);
        const timeRemaining = Math.max(stakeTimeRemaining, cooldownTimeRemaining);

        if (timeRemaining === 0) return null;

        const days = Math.floor(timeRemaining / 86400);
        const hours = Math.floor((timeRemaining % 86400) / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);

        return days + 'd ' + hours + 'h ' + minutes + 'm';
    };

    const formatAmount = (amount: bigint) => {
        try {
            const eth = formatEther(amount);
            // Show up to 4 decimal places trimming trailing zeros
            const num = parseFloat(eth);
            return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
        } catch {
            return amount.toString();
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center animate-fade-in">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-slate-400 mt-2">Loading staking info...</p>
                </div>
            </div>
        );
    }

    const currentTier = stakeInfo ? getStakeTier(stakeInfo.amountStaked) : null;
    const timeUntilHarvest = getTimeUntilHarvest();

    return (
        <div className="space-y-6">
            <div className="text-center animate-slide-up">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                    <TrendingUp size={32} className="text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">ETH Growth Staking</h2>
                <p className="text-slate-400 text-sm">Stake ETH tokens to grow legendary pets</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">ETH Token</span>
                </div>
            </div>

            {stakeInfo && Number(stakeInfo.amountStaked) > 0 ? (
                <div className="card-forest animate-slide-up delay-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="mb-2 sm:mb-0">
                            <h3 className="text-lg font-bold">Current Stake</h3>
                            <p className="text-sm text-slate-400">
                                Staked: {new Date(Number(stakeInfo.stakeTimestamp) * 1000).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-2xl font-bold text-green-400 flex items-center gap-1 justify-start sm:justify-end">
                                {formatAmount(stakeInfo.amountStaked)}
                                <span className="text-sm text-yellow-400 font-medium">ETH</span>
                            </p>
                            <p className={"text-sm " + (currentTier?.color || '')}>
                                {currentTier?.tier} Tier
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="stat-card">
                            <div className="flex items-center gap-2 mb-1">
                                <Star size={14} className="text-gray-300 animate-pulse" />
                                <span className="text-sm">Multiplier</span>
                            </div>
                            <p className="text-lg font-bold">{currentTier?.multiplier}%</p>
                        </div>

                        <div className="stat-card">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={14} className="text-gray-400" />
                                <span className="text-sm">Status</span>
                            </div>
                            <p className="text-sm font-medium">
                                {canHarvest() ? (
                                    <span className="text-green-400 animate-pulse">Ready!</span>
                                ) : timeUntilHarvest ? (
                                    <span className="text-gray-300">{timeUntilHarvest}</span>
                                ) : (
                                    <span className="text-slate-400">Staking...</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleHarvest}
                        disabled={!canHarvest() || isHarvesting}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-105 transition-transform duration-300"
                    >
                        {isHarvesting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Harvesting...
                            </>
                        ) : canHarvest() ? (
                            <>
                                <Gift size={16} className="animate-bob" />
                                Harvest Legendary Pet
                            </>
                        ) : (
                            <>
                                <Clock size={16} />
                                Harvest in {timeUntilHarvest}
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="card animate-slide-up delay-100">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Coins size={16} className="animate-bob text-yellow-400" />
                        Start ETH Staking
                    </h3>
                    <p className="text-sm text-slate-300 mb-4">
                        Stake ETH tokens for 1 week to grow a legendary pet with special traits
                    </p>

                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Amount of ETH to stake..."
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(e.target.value)}
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors duration-300 pr-12"
                                min="1"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                <Coins size={14} className="text-yellow-400" />
                                <span className="text-xs text-yellow-400 font-medium">ETH</span>
                            </div>
                        </div>

                        <button
                            onClick={handleStake}
                            disabled={!stakeAmount.trim() || isStaking}
                            className="btn-primary w-full flex items-center justify-center gap-2 hover:transform hover:scale-105 transition-transform duration-300"
                        >
                            {isStaking ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Staking ETH...
                                </>
                            ) : (
                                <>
                                    <TrendingUp size={16} />
                                    Stake ETH for Growth
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
