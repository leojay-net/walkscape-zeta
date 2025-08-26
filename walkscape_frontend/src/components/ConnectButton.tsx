'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';

interface ConnectButtonProps {
    children?: React.ReactNode;
    className?: string;
}

export default function ConnectButton({ children, className }: ConnectButtonProps) {
    const [isClient, setIsClient] = useState(false);
    const { connect, isLoading } = useWallet();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleClick = () => {
        connect();
    };

    return (
        <button
            onClick={handleClick}
            className={className || "btn-primary"}
            disabled={!isClient || isLoading}
        >
            {isLoading ? 'Connecting...' : (children || 'Launch App')}
        </button>
    );
}
