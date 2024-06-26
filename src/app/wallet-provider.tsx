'use client';

import { ReactNode } from 'react';

import { getDefaultConfig, RainbowKitProvider, darkTheme} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  arbitrum,
  arbitrumNova,
  avalanche,
  base,
  bsc,
  celo,
  coreDao,
  fantom,
  gnosis,
  linea,
  mantle,
  optimism,
  polygon,
  polygonZkEvm,
  scroll,
  zkSync,
  zora,
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'GetMint',
  projectId: 'GetMint',
  chains: [
    base,
    arbitrumNova,
    arbitrum,
    linea,
    optimism,
    avalanche,
    zora,
    scroll,
    polygon,
    polygonZkEvm,
    mantle,
    zkSync,
    bsc,
    celo,
    gnosis,
    fantom,
    coreDao
  ],
  ssr: true,
});

const queryClient = new QueryClient();

interface WalletProviderProps {
  children: ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
