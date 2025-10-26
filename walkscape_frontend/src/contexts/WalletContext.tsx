'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, getAddress, isAddress } from 'ethers';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { getContract, PlayerStats } from '@/lib/web3';

interface WalletContextType {
    isLoading: boolean;
    provider: BrowserProvider | null;
    address: string | null;
    isConnected: boolean;
    isRegistered: boolean;
    playerStats: PlayerStats | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    checkRegistration: () => Promise<void>;
    refreshPlayerStats: () => Promise<void>;
    retryRegistrationCheck: () => Promise<void>;
    switchToZetaChainNetwork: () => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const { address, isConnected, chainId } = useAccount();
    const { disconnect: wagmiDisconnect } = useDisconnect();
    const { open } = useAppKit();
    const { data: walletClient } = useWalletClient();

    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Add retry mechanism for registration checks
    const [registrationRetryCount, setRegistrationRetryCount] = useState(0);
    const maxRegistrationRetries = 3;

    // Initialize provider when wallet is connected
    useEffect(() => {
        const initializeProvider = async () => {
            if (isConnected && walletClient) {
                try {
                    console.log('Initializing provider for wallet client');

                    // Check if we're on the correct network
                    if (chainId !== 7000) {
                        console.warn(`Connected to wrong network: ${chainId}. Expected: 7000`);
                        setProvider(null);
                        return;
                    }

                    // Create BrowserProvider from walletClient
                    const ethersProvider = new BrowserProvider(walletClient as any);

                    // Verify the network
                    const network = await ethersProvider.getNetwork();
                    console.log('Connected to network:', network);

                    if (network.chainId !== BigInt(7000)) {
                        console.warn(`Connected to wrong network: ${network.chainId}. Expected: 7000`);
                        setProvider(null);
                        return;
                    }

                    console.log('Created Ethers provider successfully');
                    setProvider(ethersProvider);
                } catch (error) {
                    console.error('Error initializing provider:', error);
                    setProvider(null);
                }
            } else {
                console.log('Not connected or no wallet client available');
                setProvider(null);
            }
        };

        initializeProvider();
    }, [isConnected, walletClient, chainId]);

    const checkPlayerRegistration = useCallback(async (playerAddress: string) => {
        if (!provider) return;

        try {
            setIsLoading(true);

            // First, verify we're on the right network
            const network = await provider.getNetwork();
            if (network.chainId !== BigInt(7000)) {
                console.error(`Connected to wrong network: ${network.chainId}. Expected: 7000`);
                throw new Error(`Wrong network: ${network.chainId}. Please connect to ZetaChain Mainnet (7000)`);
            }

            // Validate and checksum the address to avoid ENS resolution
            if (!playerAddress || !isAddress(playerAddress)) {
                throw new Error(`Invalid wallet address: ${playerAddress}`);
            }
            const checksumAddress = getAddress(playerAddress);

            // Get signer and then contract
            const signer = await provider.getSigner();
            const contract = getContract(provider);

            // Check if player is registered
            const isPlayerRegistered = await contract.registeredPlayers(checksumAddress);

            console.log('Registration check for:', playerAddress, 'Result:', isPlayerRegistered);
            setIsRegistered(isPlayerRegistered);

            if (isPlayerRegistered) {
                await fetchPlayerStats(playerAddress);
                setRegistrationRetryCount(0);
            } else {
                setPlayerStats(null);
            }
        } catch (error) {
            console.error('Error checking player registration:', error);

            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('ENS') || errorMessage.includes('UNSUPPORTED_OPERATION')) {
                console.warn('ENS not supported on this network; skipping retries for this error');
                setIsRegistered(false);
                setPlayerStats(null);
            } else if (registrationRetryCount < maxRegistrationRetries) {
                console.log(`Registration check failed, retrying... (${registrationRetryCount + 1}/${maxRegistrationRetries})`);
                setRegistrationRetryCount(prev => prev + 1);
                setTimeout(() => checkPlayerRegistration(playerAddress), 2000);
            } else {
                console.error('Max registration check retries reached');
                setIsRegistered(false);
                setPlayerStats(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [provider, registrationRetryCount, maxRegistrationRetries]);

    // Check registration status when address changes
    useEffect(() => {
        if (address && provider) {
            checkPlayerRegistration(address);
        } else {
            setIsRegistered(false);
            setPlayerStats(null);
            setRegistrationRetryCount(0);
        }
    }, [address, provider, checkPlayerRegistration]); const fetchPlayerStats = async (playerAddress: string) => {
        if (!provider) return;

        try {
            // Verify network before fetching stats
            const network = await provider.getNetwork();
            if (network.chainId !== BigInt(7000)) {
                console.error(`Connected to wrong network: ${network.chainId}. Expected: 7000`);
                throw new Error(`Wrong network: ${network.chainId}. Please connect to ZetaChain Mainnet (7000)`);
            }

            const contract = getContract(provider);
            const stats = await contract.getPlayerStats(playerAddress);

            const playerStatsFormatted: PlayerStats = {
                walksXp: stats.walksXp,
                healthScore: stats.healthScore,
                lastCheckin: Number(stats.lastCheckin),
                totalArtifacts: stats.totalArtifacts,
                currentColony: stats.currentColony,
                petsOwned: stats.petsOwned,
                grassTouchStreak: stats.grassTouchStreak
            };

            console.log('Player stats fetched:', playerStatsFormatted);
            setPlayerStats(playerStatsFormatted);
        } catch (error) {
            console.error('Error fetching player stats:', error);

            // Handle ENS errors specifically
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('ENS') || errorMessage.includes('UNSUPPORTED_OPERATION')) {
                console.warn('ENS not supported on this network, continuing without ENS');
                // ENS issue but don't panic, we might still be able to use the app
            }

            setPlayerStats(null);
        }
    };

    const connect = async () => {
        try {
            // Open AppKit modal to connect wallet
            await open();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    const disconnect = async () => {
        try {
            await wagmiDisconnect();
            // Clear local state
            setProvider(null);
            setIsRegistered(false);
            setPlayerStats(null);
            setRegistrationRetryCount(0);
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
    };

    const checkRegistration = async () => {
        if (address) {
            await checkPlayerRegistration(address);
        }
    };

    const refreshPlayerStats = async () => {
        if (address && provider) {
            await fetchPlayerStats(address);
        }
    };

    const retryRegistrationCheck = async () => {
        if (address) {
            setRegistrationRetryCount(0);
            await checkPlayerRegistration(address);
        }
    };

    // Helper function to switch to ZetaChain Mainnet
    const switchToZetaChainNetwork = async () => {
        if (!isConnected || !walletClient) {
            console.error('Not connected to any wallet');
            return false;
        }

        try {
            // Use walletClient to switch network
            const provider = walletClient as any;

            if (provider.request) {
                try {
                    // Try to switch to existing ZetaChain network
                    await provider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x1B58' }], // 7000 in hex
                    });

                    console.log('Successfully switched to ZetaChain network');
                    return true;
                } catch (switchError: any) {
                    // If network doesn't exist, add it
                    if (switchError.code === 4902) {
                        try {
                            await provider.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: '0x1B58', // 7000 in hex
                                        chainName: 'ZetaChain Mainnet',
                                        nativeCurrency: {
                                            name: 'ZetaChain',
                                            symbol: 'ZETA',
                                            decimals: 18,
                                        },
                                        rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || 'https://zetachain-mainnet.g.alchemy.com/v2/kwgGr9GGk4YyLXuGfEvpITv1jpvn3PgP'],
                                        blockExplorerUrls: ['https://explorer.zetachain.com'],
                                    },
                                ],
                            });

                            console.log('Successfully added and switched to ZetaChain network');
                            return true;
                        } catch (addError) {
                            console.error('Failed to add network:', addError);
                            return false;
                        }
                    }
                    console.error('Failed to switch network:', switchError);
                    return false;
                }
            }
        } catch (error) {
            console.error('Error switching network:', error);
            return false;
        }

        return false;
    };

    // Initialize loading state
    useEffect(() => {
        if (!isConnected) {
            setIsLoading(false);
        }
    }, [isConnected]);

    const contextValue: WalletContextType = {
        isLoading,
        provider,
        address: address || null,
        isConnected,
        isRegistered,
        playerStats,
        connect,
        disconnect,
        checkRegistration,
        refreshPlayerStats,
        retryRegistrationCheck,
        switchToZetaChainNetwork
    };

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
