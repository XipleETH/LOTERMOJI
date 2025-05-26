import { useNetwork as useWagmiNetwork, useSwitchNetwork } from 'wagmi';
import { lensTestnet } from '../config/chains/lens';

export function useNetwork() {
  const { chain, chains } = useWagmiNetwork();
  const { switchNetwork, isLoading: isSwitching } = useSwitchNetwork();

  const isCorrectNetwork = chain?.id === lensTestnet.id;

  const switchToLens = async () => {
    if (!isCorrectNetwork && switchNetwork) {
      await switchNetwork(lensTestnet.id);
    }
  };

  return {
    chain,
    chains,
    isCorrectNetwork,
    switchToLens,
    isSwitching
  };
}