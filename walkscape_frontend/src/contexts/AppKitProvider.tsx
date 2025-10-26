'use client'

import { wagmiAdapter, projectId, zetachainMainnet } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
    name: 'WalkScape',
    description: 'A mobile-first social exploration game where you collect real-world locations and grow digital biomes',
    url: 'https://walkscape.app', // Update with your actual domain
    icons: ['https://walkscape.app/icon.png']
}

// Create the modal
const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [zetachainMainnet],
    defaultNetwork: zetachainMainnet,
    metadata: metadata,
    features: {
        analytics: true // Optional - defaults to your Cloud configuration
    }
})

interface AppKitProviderProps {
    children: ReactNode;
    cookies: string | null;
}

function AppKitProvider({ children, cookies }: AppKitProviderProps) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}

export default AppKitProvider
