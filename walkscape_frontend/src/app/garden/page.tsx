'use client';

import { useWallet } from '@/contexts/WalletContext';
import Garden from '@/components/Garden';
import RegistrationModal from '@/components/RegistrationModal';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GardenPage() {
    const { isConnected, isRegistered, isLoading } = useWallet();
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const router = useRouter();

    // Redirect to home if not connected
    useEffect(() => {
        if (!isLoading && !isConnected) {
            router.push('/');
        }
    }, [isConnected, isLoading, router]);

    // Show registration modal when connected but not registered
    useEffect(() => {
        if (!isLoading && isConnected && !isRegistered) {
            setShowRegistrationModal(true);
        } else {
            setShowRegistrationModal(false);
        }
    }, [isConnected, isRegistered, isLoading]);

    // Show loading state while checking connection/registration
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-slate-400 mt-4 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    // If not connected, show loading while redirecting
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-slate-400 mt-4 text-lg">Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Registration Modal */}
            {showRegistrationModal && (
                <RegistrationModal
                    isOpen={showRegistrationModal}
                    onClose={() => setShowRegistrationModal(false)}
                />
            )}

            <Garden />
        </>
    );
}
