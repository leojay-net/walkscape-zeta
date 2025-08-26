'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { getContract } from '@/lib/web3';
import {
    Flower2,
    PawPrint,
    Trophy,
    Plus,
    Heart,
    Loader2,
    Star,
    Calendar
} from 'lucide-react';

enum PetType {
    PLANT = 0,
    CREATURE = 1,
    DIGITAL_COMPANION = 2
}

interface Pet {
    id: string;
    owner: string;
    pet_type: number;
    level: bigint;
    happiness: bigint;
    evolution_stage: number;
    last_fed: bigint;
    special_traits: bigint;
}

export default function Garden() {
    const { provider, address, playerStats, refreshPlayerStats, isRegistered } = useWallet();
    const [activeTab, setActiveTab] = useState<'pets' | 'artifacts'>('pets');
    const [pets, setPets] = useState<Pet[]>([]);
    const [artifacts, setArtifacts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMinting, setIsMinting] = useState(false);
    const [isFeeding, setIsFeeding] = useState<string | null>(null);

    const loadGardenData = useCallback(async () => {
        if (!address || !playerStats) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const contract = getContract();

            const artifactIds = await (contract as unknown as { getPlayerArtifacts: (address: string) => Promise<bigint[]> }).getPlayerArtifacts(address);
            setArtifacts(artifactIds.map(id => id.toString()));

            const petIds = await (contract as unknown as { getPlayerPets: (address: string) => Promise<bigint[]> }).getPlayerPets(address);
            const petData: Pet[] = [];

            // Load stats for each pet owned by the player
            for (const petId of petIds) {
                try {
                    const petStats = await contract.getPetStats(petId);
                    petData.push({
                        id: petId.toString(),
                        ...petStats
                    });
                } catch (error) {
                    console.error(`Failed to load pet ${petId}:`, error);
                    continue;
                }
            }

            setPets(petData);
        } catch (error) {
            console.error('Failed to load garden data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [address, playerStats]);

    useEffect(() => {
        loadGardenData();
    }, [loadGardenData]);

    if (!isRegistered) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <Flower2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">Please complete registration first</p>
                </div>
            </div>
        );
    }

    const handleMintPet = async (petType: PetType) => {
        if (!provider || !address) return;

        setIsMinting(true);
        try {
            const signer = await provider.getSigner();
            const contract = getContract(provider);
            const contractWithSigner = contract.connect(signer);
            await (contractWithSigner as unknown as { mintPet: (petType: number) => Promise<unknown> }).mintPet(petType);

            // Refresh data after minting
            setTimeout(() => {
                refreshPlayerStats();
                loadGardenData();
                setIsMinting(false);
            }, 3000);
        } catch (error) {
            console.error('Failed to mint pet:', error);
            setIsMinting(false);
        }
    };

    const handleFeedPet = async (petId: string) => {
        if (!provider || !address) return;

        setIsFeeding(petId);
        try {
            const signer = await provider.getSigner();
            const contract = getContract(provider);
            const contractWithSigner = contract.connect(signer);
            // Using a good nutrition score of 85 for feeding
            await (contractWithSigner as unknown as { feedPet: (petId: bigint, nutritionScore: number) => Promise<unknown> }).feedPet(BigInt(petId), 85);

            setTimeout(() => {
                loadGardenData();
                setIsFeeding(null);
            }, 3000);
        } catch (error) {
            console.error('Failed to feed pet:', error);
            setIsFeeding(null);
        }
    };

    const getPetTypeInfo = (petType: number) => {
        const types = [
            { name: 'Plant', icon: 'Plant', color: 'green' },
            { name: 'Creature', icon: 'Creature', color: 'gray' },
            { name: 'Digital Companion', icon: 'Digital', color: 'gray' }
        ];
        return types[petType] || types[0];
    };

    const getArtifactInfo = (artifactId: string) => {
        // Simulate artifact data based on ID
        const types = ['Mushroom', 'Fossil', 'Graffiti', 'Pixel Plant'];
        const typeIndex = parseInt(artifactId) % 4;
        const rarity = Math.floor(Math.random() * 5) + 1;

        return {
            name: types[typeIndex],
            rarity,
            id: artifactId
        };
    };

    const getRarityClass = (rarity: number) => {
        const classes = ['rarity-common', 'rarity-uncommon', 'rarity-rare', 'rarity-epic', 'rarity-legendary'];
        return classes[rarity - 1] || classes[0];
    };

    const canMintPet = () => {
        return playerStats && Number(playerStats.walksXp) >= 100;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-slate-400 mt-2">Loading your garden...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                    <Flower2 size={32} className="text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">My Garden</h2>
                <p className="text-slate-400 text-sm">
                    Your digital biome of pets and artifacts
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('pets')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === 'pets'
                        ? 'bg-green-600 text-white animate-pulse-soft'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <PawPrint size={16} className="inline mr-2" />
                    <span>Pets ({pets.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('artifacts')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === 'artifacts'
                        ? 'bg-green-600 text-white animate-pulse-soft'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Trophy size={16} className="inline mr-2" />
                    <span>Artifacts ({artifacts.length})</span>
                </button>
            </div>

            {/* Pets Tab */}
            {activeTab === 'pets' && (
                <div className="space-y-4">
                    {/* Mint New Pet */}
                    <div className="card-forest">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Plus size={16} />
                            Mint New Pet
                        </h3>
                        <p className="text-sm text-slate-300 mb-4">
                            Cost: 100 XP • Current XP: {playerStats ? Number(playerStats.walksXp) : 0}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                            {[
                                { type: PetType.PLANT, name: 'Plant', icon: Flower2 },
                                { type: PetType.CREATURE, name: 'Creature', icon: PawPrint },
                                { type: PetType.DIGITAL_COMPANION, name: 'Digital', icon: Trophy }
                            ].map((pet, index) => {
                                const IconComponent = pet.icon;
                                return (
                                    <button
                                        key={pet.type}
                                        onClick={() => handleMintPet(pet.type)}
                                        disabled={!canMintPet() || isMinting}
                                        className={`pet-card p-3 text-center disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-105 transition-transform duration-300 animate-fade-in delay-${index * 100}`}
                                    >
                                        <IconComponent size={24} className="mx-auto mb-1 text-green-400 animate-bob" />
                                        <div className="text-xs">{pet.name}</div>
                                    </button>
                                );
                            })}
                        </div>

                        {!canMintPet() && (
                            <p className="text-xs text-gray-300 text-center">
                                Need {100 - (playerStats ? Number(playerStats.walksXp) : 0)} more XP to mint
                            </p>
                        )}
                    </div>

                    {/* Pet List */}
                    {pets.length > 0 ? (
                        <div className="space-y-3">
                            {pets.map((pet, index) => {
                                const petInfo = getPetTypeInfo(pet.pet_type);
                                const daysSinceLastFed = Math.floor(
                                    (Date.now() / 1000 - Number(pet.last_fed)) / 86400
                                );

                                return (
                                    <div
                                        key={pet.id}
                                        className={`pet-card animate-slide-up delay-${index * 100} hover:shadow-lg transform transition-all duration-300`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                                            <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center animate-bob">
                                                    {petInfo.icon === 'Plant' && <Flower2 size={20} className="text-white" />}
                                                    {petInfo.icon === 'Creature' && <PawPrint size={20} className="text-white" />}
                                                    {petInfo.icon === 'Digital' && <Trophy size={20} className="text-white" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{petInfo.name} #{pet.id}</h4>
                                                    <p className="text-xs text-slate-400">Level {Number(pet.level)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Heart size={12} className={`text-gray-400 ${Number(pet.happiness) > 70 ? 'animate-pulse' : ''}`} />
                                                    <span className="text-sm">{Number(pet.happiness)}%</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star size={12} className="text-gray-300" />
                                                    <span className="text-xs">Stage {pet.evolution_stage}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div className="text-xs text-slate-400 mb-2 sm:mb-0">
                                                <Calendar size={12} className="inline mr-1" />
                                                Fed {daysSinceLastFed}d ago
                                            </div>
                                            <button
                                                onClick={() => handleFeedPet(pet.id)}
                                                disabled={isFeeding === pet.id}
                                                className="btn-primary text-xs py-1 px-3 w-full sm:w-auto hover:transform hover:scale-105 transition-transform duration-300"
                                            >
                                                {isFeeding === pet.id ? (
                                                    <Loader2 size={12} className="animate-spin mx-auto" />
                                                ) : (
                                                    'Feed'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card text-center text-slate-400 animate-fade-in">
                            <PawPrint size={32} className="mx-auto mb-2 opacity-50 animate-bob" />
                            <p>No pets yet</p>
                            <p className="text-xs">Mint your first pet above!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Artifacts Tab */}
            {activeTab === 'artifacts' && (
                <div className="space-y-4">
                    {artifacts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {artifacts.map((artifactId, index) => {
                                const artifact = getArtifactInfo(artifactId);

                                return (
                                    <div
                                        key={artifactId}
                                        className={`artifact-card artifact-mushroom p-4 hover:transform hover:scale-105 transition-all duration-300 animate-fade-in delay-${index % 5 * 100}`}
                                    >
                                        <div className="text-center">
                                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bob">
                                                <Trophy size={16} className="text-white" />
                                            </div>
                                            <h4 className="font-medium text-sm mb-1">{artifact.name}</h4>
                                            <div className="flex items-center justify-center gap-1">
                                                {[...Array(artifact.rarity)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={`${getRarityClass(artifact.rarity)} ${i === 0 ? 'animate-pulse' : ''}`}
                                                        fill="currentColor"
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">#{artifactId}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card text-center text-slate-400 animate-fade-in">
                            <Trophy size={32} className="mx-auto mb-2 opacity-50 animate-bob" />
                            <p>No artifacts yet</p>
                            <p className="text-xs">Scan locations to find artifacts!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
