'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { getContract } from '@/lib/web3';
import {
    Wallet,
    Loader2,
    CheckCircle,
    AlertCircle,
    UserPlus,
    Flower2
} from 'lucide-react';

interface WalletConnectionProps {
    showRegistration?: boolean;
}

export default function WalletConnection({ showRegistration = false }: WalletConnectionProps) {
    const { provider, isConnected, checkRegistration, address, isRegistered, isLoading, connect } = useWallet();
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationResult, setRegistrationResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleConnect = async () => {
        try {
            await connect();
        } catch (error) {
            console.error('Failed to open wallet modal:', error);
        }
    };

    const handleRegisterPlayer = async () => {
        if (!provider || !address) {
            console.error('No provider or address available');
            setRegistrationResult({
                success: false,
                message: 'Wallet not properly connected. Please reconnect.'
            });
            return;
        }

        setIsRegistering(true);
        setRegistrationResult(null);

        try {
            console.log('Starting registration with address:', address);

            const signer = await provider.getSigner();
            const contract = getContract(provider);
            const contractWithSigner = contract.connect(signer);

            console.log('Contract address:', await contract.getAddress());
            console.log('Signer address:', await signer.getAddress());

            // Check if already registered
            const contractTyped = contract as unknown as { registeredPlayers: (address: string) => Promise<boolean> };
            const alreadyRegistered = await contractTyped.registeredPlayers(address);
            if (alreadyRegistered) {
                setRegistrationResult({
                    success: false,
                    message: 'Player is already registered!'
                });
                setIsRegistering(false);
                return;
            }

            // Call register function
            console.log('Calling registerPlayer...');
            const contractWithSignerTyped = contractWithSigner as unknown as { registerPlayer: () => Promise<{ hash: string; wait: () => Promise<{ status: number }> }> };
            const tx = await contractWithSignerTyped.registerPlayer();
            console.log('Transaction sent:', tx.hash);

            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            if (receipt.status === 1) {
                setRegistrationResult({
                    success: true,
                    message: 'Successfully registered as a WalkScape player!'
                });

                // Wait a moment then check registration
                setTimeout(async () => {
                    await checkRegistration();
                }, 2000);
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error: unknown) {
            const err = error as Error;
            console.error('Registration failed:', err);

            let errorMessage = 'Registration failed. ';

            if (err && typeof err === 'object' && 'reason' in err && typeof err.reason === 'string') {
                errorMessage += err.reason;
            } else if (err.message) {
                if (err.message.includes('user rejected')) {
                    errorMessage = 'Transaction was rejected by user.';
                } else if (err.message.includes('insufficient funds')) {
                    errorMessage = 'Insufficient funds for gas fees.';
                } else {
                    errorMessage += err.message;
                }
            } else {
                errorMessage += 'Please try again.';
            }

            setRegistrationResult({
                success: false,
                message: errorMessage
            });
        } finally {
            setIsRegistering(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400">Loading wallet...</p>
            </div>
        );
    }

    // Not connected state
    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-6">
                    <Wallet className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
                    <p className="text-gray-400 max-w-md">
                        Connect your wallet to start exploring, collecting artifacts, and growing your digital garden.
                    </p>
                </div>

                <button
                    onClick={handleConnect}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Wallet className="h-5 w-5" />
                    Connect Wallet
                </button>

                <div className="mt-8 text-sm text-gray-500">
                    <p>Supported wallets: MetaMask, WalletConnect, and more</p>
                </div>
            </div>
        );
    }

    // Connected but checking registration
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400">Checking registration status...</p>
                <p className="text-sm text-gray-500 mt-2">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
            </div>
        );
    }

    // Connected and registered
    if (isRegistered) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-6">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome, Explorer!</h2>
                    <p className="text-gray-400">
                        Your wallet is connected and you&apos;re registered to play WalkScape.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                </div>

                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 max-w-md">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                        <Flower2 className="h-4 w-4" />
                        <span>Ready to explore!</span>
                    </div>
                </div>
            </div>
        );
    }

    // Connected but not registered - show registration
    if (showRegistration) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-6">
                    <UserPlus className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Complete Registration</h2>
                    <p className="text-gray-400 max-w-md">
                        One more step! Register on the blockchain to start your WalkScape adventure.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                </div>

                {!isRegistering && !registrationResult && (
                    <button
                        onClick={handleRegisterPlayer}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <UserPlus className="h-5 w-5" />
                        Register Player
                    </button>
                )}

                {isRegistering && (
                    <div className="flex items-center gap-2 text-blue-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Registering on blockchain...</span>
                    </div>
                )}

                {registrationResult && (
                    <div className={`max-w-md p-4 rounded-lg border ${registrationResult.success
                        ? 'bg-green-900/20 border-green-800 text-green-400'
                        : 'bg-red-900/20 border-red-800 text-red-400'
                        }`}>
                        <div className="flex items-start gap-2">
                            {registrationResult.success ? (
                                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            )}
                            <p className="text-sm">{registrationResult.message}</p>
                        </div>

                        {!registrationResult.success && (
                            <button
                                onClick={handleRegisterPlayer}
                                className="mt-3 text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                )}

                <div className="mt-8 text-sm text-gray-500 max-w-md">
                    <p>Registration requires a small gas fee to store your player data on the blockchain.</p>
                </div>
            </div>
        );
    }

    // Connected but not registered - brief version
    return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4 max-w-md">
                <div className="flex items-center gap-2 text-orange-400 text-sm mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Registration Required</span>
                </div>
                <p className="text-gray-400 text-sm">
                    Complete your registration to start playing WalkScape.
                </p>
            </div>
        </div>
    );
}
