'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { AlertCircle } from 'lucide-react';

export default function NetworkSwitcher() {
    const { provider, switchToZetaChainNetwork } = useWallet();
    const [isWrongNetwork, setIsWrongNetwork] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);

    useEffect(() => {
        const checkNetwork = async () => {
            if (!provider) return;

            try {
                const network = await provider.getNetwork();
                setIsWrongNetwork(network.chainId !== BigInt(7000));
            } catch (error) {
                console.error('Error checking network:', error);
                setIsWrongNetwork(true);
            }
        };

        checkNetwork();
    }, [provider]);

    const handleSwitchNetwork = async () => {
        setIsSwitching(true);
        try {
            const success = await switchToZetaChainNetwork();
            if (success) {
                setIsWrongNetwork(false);
            }
        } catch (error) {
            console.error('Failed to switch network:', error);
        } finally {
            setIsSwitching(false);
        }
    };

    if (!isWrongNetwork) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>
                Connected to wrong network. Please switch to ZetaChain Mainnet.
            </span>
            <button
                onClick={handleSwitchNetwork}
                disabled={isSwitching}
                className="ml-4 bg-white text-red-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
            >
                {isSwitching ? 'Switching...' : 'Switch Network'}
            </button>
        </div>
    );
}
