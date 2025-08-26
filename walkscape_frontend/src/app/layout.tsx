import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from '@/contexts/WalletContext';
import AppLayout from '@/components/AppLayout';
import PrivyWrapper from '@/contexts/PrivyWrapper';

export const metadata: Metadata = {
  title: "WalkScape - Explore, Collect, Grow",
  description: "A mobile-first social exploration game where you collect real-world locations and grow digital biomes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen">
        <PrivyWrapper>
          <WalletProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </WalletProvider>
        </PrivyWrapper>
      </body>
    </html>
  );
}
