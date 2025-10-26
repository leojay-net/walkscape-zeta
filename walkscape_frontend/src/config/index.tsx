import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain } from 'viem'

// Define ZetaChain Mainnet
export const zetachainMainnet = defineChain({
    id: 7000,
    name: 'ZetaChain Mainnet',
    nativeCurrency: {
        name: 'ZetaChain',
        symbol: 'ZETA',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://zetachain-mainnet.g.alchemy.com/v2/kwgGr9GGk4YyLXuGfEvpITv1jpvn3PgP'],
        },
    },
    blockExplorers: {
        default: {
            name: 'ZetaChain Explorer',
            url: 'https://explorer.zetachain.com',
        },
    },
})

// Get projectId from environment variable
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not defined')
}

export const networks = [zetachainMainnet]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: true,
    projectId,
    networks
})

export const config = wagmiAdapter.wagmiConfig
