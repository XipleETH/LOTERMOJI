import { useContractWrite, useContractRead, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import LottoMojiABI from '../contracts/LottoMoji.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export function useContract() {
  const { data: writeData, write: buyTicket } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: LottoMojiABI,
    functionName: 'buyTicket',
  });

  const { data: winningNumbers } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: LottoMojiABI,
    functionName: 'getWinningNumbers',
    args: [currentGameId],
    watch: true,
  });

  const { isLoading: isTransactionPending } = useWaitForTransaction({
    hash: writeData?.hash,
  });

  const purchaseTicket = async (numbers: number[]) => {
    try {
      await buyTicket({ args: [numbers] });
    } catch (error) {
      console.error('Error buying ticket:', error);
      throw error;
    }
  };

  return {
    purchaseTicket,
    winningNumbers,
    isTransactionPending,
  };
}