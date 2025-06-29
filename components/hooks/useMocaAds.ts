"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { contractAddress, contractABI } from "@/lib/contract";
import { useMemo } from "react";
import { parseEther, formatEther } from "viem";

// Contract configuration
const CONTRACT_CONFIG = {
  address: contractAddress as `0x${string}`,
  abi: contractABI,
};

// Types based on the contract
export type CredentialType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Campaign {
  id: bigint;
  advertiser: string;
  name: string;
  budget: bigint;
  spent: bigint;
  startTime: bigint;
  endTime: bigint;
  active: boolean;
  targetCredentials: CredentialType[];
  adContentHash: string;
  totalViews: bigint;
}

export interface UserStats {
  totalEarnings: bigint;
  totalViews: bigint;
  claimableRewards: bigint;
}

export interface Website {
  owner: string;
  domain: string;
  totalEarnings: bigint;
  totalViews: bigint;
  claimableRewards: bigint;
}

export interface BatchReward {
  user: string;
  website: string;
  views: bigint;
  campaignId: bigint;
}

// Read hooks
export function useActiveCampaigns() {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getActiveCampaigns",
  });
}

export function useCampaign(campaignId: bigint | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getCampaign",
    args: campaignId ? [campaignId] : undefined,
    query: {
      enabled: !!campaignId,
    },
  });
}

export function useUserStats(address: string | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getUserStats",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useUserClaimableRewards(address: string | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getUserClaimableRewards",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useWebsite(domain: string | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getWebsite",
    args: domain ? [domain] : undefined,
    query: {
      enabled: !!domain,
    },
  });
}

export function useWebsiteClaimableRewards(domain: string | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getWebsiteClaimableRewards",
    args: domain ? [domain] : undefined,
    query: {
      enabled: !!domain,
    },
  });
}

export function useOwnerWebsites(address: string | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getOwnerWebsites",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useOwnerTotalClaimableRewards(address: string | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getOwnerTotalClaimableRewards",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useProtocolClaimableRewards() {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getProtocolClaimableRewards",
  });
}

export function useContractBalance() {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getContractBalance",
  });
}

export function useRegisteredDomains() {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getRegisteredDomains",
  });
}

export function useOperator() {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "operator",
  });
}

export function useMinCampaignBudget() {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "minCampaignBudget",
  });
}

export function useFixedCostPerView() {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "fixedCostPerView",
  });
}

// Write hooks
export function useCreateCampaign() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    createCampaign: (
      name: string,
      duration: bigint, // in seconds
      targetCredentials: CredentialType[],
      adContentHash: string,
      budget: string // in ETH
    ) => {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: "createCampaign",
        args: [name, duration, targetCredentials, adContentHash],
        value: parseEther(budget),
      });
    },
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useFundCampaign() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    fundCampaign: (campaignId: bigint, amount: string) => {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: "fundCampaign",
        args: [campaignId],
        value: parseEther(amount),
      });
    },
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useRegisterWebsite() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    registerWebsite: (domain: string) => {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: "registerWebsite",
        args: [domain],
      });
    },
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useClaimUserRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    claimUserRewards: () => {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: "claimUserRewards",
      });
    },
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useClaimWebsiteRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    claimWebsiteRewards: (domain: string) => {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: "claimWebsiteRewards",
        args: [domain],
      });
    },
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useClaimProtocolRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    claimProtocolRewards: () => {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: "claimProtocolRewards",
      });
    },
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useWithdrawCampaignBudget() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    withdrawCampaignBudget: (campaignId: bigint) => {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: "withdrawCampaignBudget",
        args: [campaignId],
      });
    },
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Operator-only functions
export function useBatchUpdateRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    batchUpdateRewards: (rewards: BatchReward[]) => {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: "batchUpdateRewards",
        args: [rewards],
      });
    },
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Utility hooks
export function useIsOperator() {
  const { address } = useAccount();
  const { data: operatorAddress } = useOperator();

  return useMemo(() => {
    return (
      address &&
      operatorAddress &&
      typeof operatorAddress === "string" &&
      address.toLowerCase() === operatorAddress.toLowerCase()
    );
  }, [address, operatorAddress]);
}

// Helper functions
export const formatMocaAmount = (amount: bigint | undefined) => {
  if (!amount) return "0";
  return formatEther(amount);
};

export const credentialTypeNames: Record<CredentialType, string> = {
  0: "Age 18+",
  1: "EU Resident",
  2: "Low Income",
  3: "Mid Income",
  4: "High Income",
  5: "University Graduate",
  6: "Frequent Traveler",
};
