'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import LandingPage from '@/components/LandingPage';
import RegistrationModal from '@/components/RegistrationModal';

export default function Home() {
  const { isConnected, isLoading, isRegistered } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Only redirect to dashboard from the root page if connected and registered
  useEffect(() => {
    // Only redirect if we're on the root path and conditions are met
    if (pathname === '/' && isConnected && isRegistered && !isLoading) {
      router.push('/dashboard');
    }
  }, [pathname, isConnected, isRegistered, isLoading, router]);

  // Show registration modal when connected but not registered
  useEffect(() => {
    if (!isLoading && isConnected && !isRegistered) {
      setShowRegistrationModal(true);
    } else {
      setShowRegistrationModal(false);
    }
  }, [isConnected, isRegistered, isLoading]);

  // Show loading state while checking connection
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

  // Show landing page if not connected
  if (!isConnected) {
    return <LandingPage />;
  }

  // If connected but not registered, show a simple loading until modal appears
  if (!isRegistered && !showRegistrationModal) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-400 mt-4 text-lg">Checking registration...</p>
        </div>
      </div>
    );
  }

  // Show registration modal if connected but not registered
  if (isConnected && !isRegistered && showRegistrationModal) {
    return (
      <>
        <LandingPage />
        <RegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
        />
      </>
    );
  }

  // Show loading while redirecting to dashboard
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="text-slate-400 mt-4 text-lg">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
