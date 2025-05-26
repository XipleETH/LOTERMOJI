import { Chain } from 'wagmi';

export const lensTestnet = {
  id: 37111,
  name: 'Lens Network Sepolia Testnet',
  network: 'lens-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'GRASS',
    symbol: 'GRASS',
  },
  rpcUrls: {
    default: { 
      http: ['https://rpc.testnet.lens.dev']
    },
    public: {
      http: ['https://rpc.testnet.lens.dev']
    }
  },
  blockExplorers: {
    default: {
      name: 'Lens Block Explorer',
      url: 'https://block-explorer.testnet.lens.dev'
    }
  },
  testnet: true
} as const satisfies Chain;