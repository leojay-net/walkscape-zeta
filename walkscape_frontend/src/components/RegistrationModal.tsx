
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@/contexts/WalletContext';
import { getAddress, isAddress } from 'ethers';
import { getContract } from '@/lib/web3';
import {
    X,
    User,
    Loader2,
    CheckCircle,
    AlertCircle,
    UserPlus,
    Shield,
    Coins,
    Activity
} from 'lucide-react';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
    const { provider, address, checkRegistration, isRegistered } = useWallet();
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationResult, setRegistrationResult] = useState<{ success: boolean; message: string } | null>(null);

    // If user is already registered, close the modal
    useEffect(() => {
        if (isRegistered) {
            console.log('User is already registered, closing modal');
            onClose();
        }
    }, [isRegistered, onClose]);

    const handleRegisterPlayer = async () => {
        if (!provider || !address) {
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

            // Verify mainnet
            const network = await provider.getNetwork();
            if (network.chainId !== BigInt(7000)) {
                setRegistrationResult({ success: false, message: 'Please switch to ZetaChain Mainnet (7000) and try again.' });
                setIsRegistering(false);
                return;
            }

            if (!address || address === '0x0' || !isAddress(address)) {
                throw new Error('Invalid address: ' + address);
            }
            const checksumAddress = getAddress(address);

            const signer = await provider.getSigner();
            const contract = getContract(provider);
            const contractWithSigner = contract.connect(signer);

            const contractTyped = contractWithSigner as unknown as { registerPlayer: () => Promise<{ hash: string; wait: () => Promise<{ status: number }> }> };
            const tx = await contractTyped.registerPlayer();

            await tx.wait();

            setRegistrationResult({
                success: true,
                message: 'Welcome to WalkScape! Your adventure begins now.'
            });

            setTimeout(() => {
                checkRegistration();
                setIsRegistering(false);
                onClose();
            }, 3000);

        } catch (error: unknown) {
            const err = error as Error;
            console.error('Registration error:', err);
            let errorMessage = 'Failed to register. Please try again.';

            if (err.message?.includes('ENS') || err.message?.includes('UNSUPPORTED_OPERATION')) {
                errorMessage = 'This network does not support ENS. Please ensure the contract address is correct.';
            } else if (err.message?.includes('Contract not found')) {
                errorMessage = 'Contract not found. Please check your network connection.';
            } else if (err.message?.includes('user rejected')) {
                errorMessage = 'Transaction was rejected by user.';
            } else if (err.message?.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds to complete registration.';
            }

            setRegistrationResult({
                success: false,
                message: errorMessage
            });
            setIsRegistering(false);
        }
    };

    // Mount state for portal (avoids SSR mismatch) + body scroll lock
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => document.body.classList.remove('overflow-hidden');
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md">
                <div className="card-forest max-h-[85vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Join WalkScape</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User size={32} className="text-white" />
                        </div>

                        <p className="text-slate-300 text-sm mb-2">
                            Complete your registration to start exploring and collecting!
                        </p>
                        <p className="text-xs text-slate-400 mb-6">
                            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>

                        {/* Features */}
                        <div className="grid grid-cols-1 gap-3 mb-6 text-left">
                            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                                <Activity className="text-green-400 flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-white">Track Your Journey</p>
                                    <p className="text-xs text-slate-400">Build XP streaks and health scores</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                                <Shield className="text-blue-400 flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-white">Collect Artifacts</p>
                                    <p className="text-xs text-slate-400">Discover rare items at real locations</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                                <Coins className="text-yellow-400 flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-white">Grow & Stake</p>
                                    <p className="text-xs text-slate-400">Nurture pets and earn rewards</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleRegisterPlayer}
                            disabled={isRegistering}
                            className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
                        >
                            {isRegistering ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    Register Player
                                </>
                            )}
                        </button>

                        {registrationResult && (
                            <div className={`p-3 rounded-lg border ${registrationResult.success ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    {registrationResult.success ? (
                                        <CheckCircle size={16} className="text-green-400" />
                                    ) : (
                                        <AlertCircle size={16} className="text-red-400" />
                                    )}
                                    <span className={`font-medium ${registrationResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                        {registrationResult.success ? 'Success!' : 'Error'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300">
                                    {registrationResult.message}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 text-xs text-slate-400 space-y-1">
                            <p>• Registration is a one-time blockchain transaction</p>
                            <p>• This will initialize your player stats and biome</p>
                            <p>• Small gas fee required for transaction</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
