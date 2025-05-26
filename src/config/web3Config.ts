import { createConfig, http } from 'wagmi';
import { getDefaultConfig } from 'connectkit';
import { WALLET_CONNECT_PROJECT_ID, APP_CONFIG } from './constants';
import { lensTestnet } from './chains/lens';

const chains = [lensTestnet];

export const config = createConfig(
  getDefaultConfig({
    chains,
    transports: {
      [lensTestnet.id]: http(),
    },
    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,
    appName: APP_CONFIG.name,
    appDescription: APP_CONFIG.description,
    appUrl: APP_CONFIG.url,
    appIcon: APP_CONFIG.icon,
  }),
);