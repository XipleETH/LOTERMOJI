import { useAccount, useChainId, useDisconnect, useConnect } from 'wagmi';
import { lensTestnet } from '../config/chains/lens';

export function useWallet() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { connectAsync, isPending } = useConnect();

  const isCorrectNetwork = chainId === lensTestnet.id;

  return {
    address,
    isConnected,
    isConnecting: isPending,
    isCorrectNetwork,
    disconnect: disconnectAsync,
    connect: connectAsync
  };
}