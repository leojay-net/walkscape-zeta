import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from '@/contexts/WalletContext';
import AppLayout from '@/components/AppLayout';
import AppKitProvider from '@/contexts/AppKitProvider';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: "WalkScape - Explore, Collect, Grow",
  description: "A mobile-first social exploration game where you collect real-world locations and grow digital biomes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen">
        <AppKitProvider cookies={cookies}>
          <WalletProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </WalletProvider>
        </AppKitProvider>
      </body>
    </html>
  );
}
