"use client";

import { useState, useEffect, useMemo } from "react";
import {
  createWalletClient,
  custom,
  parseEther,
  formatEther,
  createPublicClient,
  http,
} from "viem";
import { contractAddress, contractABI } from "@/lib/contract";
import { useAppContext } from "@/contexts/AppContext";
import { mocaTestnet } from "@/utils/constants";

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

// Create a public client for read operations
const publicClient = createPublicClient({
  chain: mocaTestnet,
  transport: http(),
});

// Helper function to serialize args including BigInt values
const serializeArgs = (args?: readonly unknown[]): string => {
  if (!args) return "undefined";

  return JSON.stringify(args, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  });
};

// Custom hook for read operations
function useContractRead<T>(functionName: string, args?: readonly unknown[]) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await publicClient.readContract({
          ...CONTRACT_CONFIG,
          functionName,
          args: args || [],
        });

        setData(result as T);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [functionName, serializeArgs(args)]);

  return { data, isLoading, error };
}

// Read hooks
export function useActiveCampaigns() {
  return useContractRead<Campaign[]>("getActiveCampaigns");
}

export function useCampaign(campaignId: bigint | undefined) {
  const args = campaignId ? [campaignId] : undefined;
  const { data, isLoading, error } = useContractRead<Campaign>(
    "getCampaign",
    args
  );

  return {
    data,
    isLoading,
    error,
    isEnabled: !!campaignId,
  };
}

export function useUserStats(address: string | undefined) {
  const args = address ? [address as `0x${string}`] : undefined;
  return useContractRead<UserStats>("getUserStats", args);
}

export function useUserClaimableRewards(address: string | undefined) {
  const args = address ? [address as `0x${string}`] : undefined;
  return useContractRead<bigint>("getUserClaimableRewards", args);
}

export function useWebsite(domain: string | undefined) {
  const args = domain ? [domain] : undefined;
  return useContractRead<Website>("getWebsite", args);
}

export function useWebsiteClaimableRewards(domain: string | undefined) {
  const args = domain ? [domain] : undefined;
  return useContractRead<bigint>("getWebsiteClaimableRewards", args);
}

export function useOwnerWebsites(address: string | undefined) {
  const args = address ? [address as `0x${string}`] : undefined;
  return useContractRead<string[]>("getOwnerWebsites", args);
}

export function useOwnerTotalClaimableRewards(address: string | undefined) {
  const args = address ? [address as `0x${string}`] : undefined;
  return useContractRead<bigint>("getOwnerTotalClaimableRewards", args);
}

export function useProtocolClaimableRewards() {
  return useContractRead<bigint>("getProtocolClaimableRewards");
}

export function useContractBalance() {
  return useContractRead<bigint>("getContractBalance");
}

export function useRegisteredDomains() {
  return useContractRead<string[]>("getRegisteredDomains");
}

export function useOperator() {
  return useContractRead<string>("operator");
}

export function useMinCampaignBudget() {
  return useContractRead<bigint>("minCampaignBudget");
}

export function useFixedCostPerView() {
  return useContractRead<bigint>("fixedCostPerView");
}

// Custom hook for write operations
function useContractWrite() {
  const { airService, isLoggedIn } = useAppContext();
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const writeContract = async (params: {
    functionName: string;
    args?: readonly unknown[];
    value?: bigint;
  }) => {
    if (!airService || !isLoggedIn) {
      setError(
        new Error(
          "Please ensure you are logged in and have a valid configuration"
        )
      );
      return;
    }

    setIsPending(true);
    setIsConfirming(false);
    setIsSuccess(false);
    setError(null);
    setHash(null);

    try {
      console.log(
        "Executing contract function:",
        params.functionName,
        "with args:",
        params.args
      );

      const airProvider = await airService.getProvider();
      const walletClient = createWalletClient({
        transport: custom(airProvider),
        chain: mocaTestnet,
      });

      const [aaAccount] = await walletClient.getAddresses();

      const contractCallParams: {
        address: `0x${string}`;
        abi: typeof contractABI;
        functionName: string;
        account: `0x${string}`;
        args?: readonly unknown[];
        value?: bigint;
      } = {
        ...CONTRACT_CONFIG,
        functionName: params.functionName,
        account: aaAccount,
      };

      if (params.args && params.args.length > 0) {
        contractCallParams.args = params.args;
      }

      if (params.value) {
        contractCallParams.value = params.value;
      }

      console.log("Making contract call with params:", contractCallParams);

      const txHash = await walletClient.writeContract(contractCallParams);

      console.log("Transaction successful! Hash:", txHash);
      setHash(txHash);
      setIsPending(false);
      setIsConfirming(true);

      // In a real app, you might want to wait for confirmation
      // For now, we'll just mark as success after a short delay
      setTimeout(() => {
        setIsConfirming(false);
        setIsSuccess(true);
      }, 2000);
    } catch (error) {
      console.error("Contract execution error:", error);
      setError(
        error instanceof Error ? error : new Error("Contract execution failed")
      );
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  return {
    writeContract,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Write hooks
export function useCreateCampaign() {
  const { writeContract, hash, isPending, isConfirming, isSuccess, error } =
    useContractWrite();

  return {
    createCampaign: (
      name: string,
      duration: bigint, // in seconds
      targetCredentials: CredentialType[],
      adContentHash: string,
      budget: string // in ETH
    ) => {
      writeContract({
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
  const { writeContract, hash, isPending, isConfirming, isSuccess, error } =
    useContractWrite();

  return {
    fundCampaign: (campaignId: bigint, amount: string) => {
      writeContract({
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
  const { writeContract, hash, isPending, isConfirming, isSuccess, error } =
    useContractWrite();

  return {
    registerWebsite: (domain: string) => {
      writeContract({
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
  const { writeContract, hash, isPending, isConfirming, isSuccess, error } =
    useContractWrite();

  return {
    claimUserRewards: () => {
      writeContract({
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
  const { writeContract, hash, isPending, isConfirming, isSuccess, error } =
    useContractWrite();

  return {
    claimWebsiteRewards: (domain: string) => {
      writeContract({
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
  const { writeContract, hash, isPending, isConfirming, isSuccess, error } =
    useContractWrite();

  return {
    claimProtocolRewards: () => {
      writeContract({
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
  const { writeContract, hash, isPending, isConfirming, isSuccess, error } =
    useContractWrite();

  return {
    withdrawCampaignBudget: (campaignId: bigint) => {
      writeContract({
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
  const { writeContract, hash, isPending, isConfirming, isSuccess, error } =
    useContractWrite();

  return {
    batchUpdateRewards: (rewards: BatchReward[]) => {
      writeContract({
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
  const { airService, isLoggedIn } = useAppContext();
  const { data: operatorAddress } = useOperator();
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    const getUserAddress = async () => {
      if (!airService || !isLoggedIn) {
        setUserAddress(null);
        return;
      }

      try {
        const airProvider = await airService.getProvider();
        const walletClient = createWalletClient({
          transport: custom(airProvider),
          chain: mocaTestnet,
        });

        const [aaAccount] = await walletClient.getAddresses();
        setUserAddress(aaAccount);
      } catch (error) {
        console.error("Error getting user address:", error);
        setUserAddress(null);
      }
    };

    getUserAddress();
  }, [airService, isLoggedIn]);

  return useMemo(() => {
    return (
      userAddress &&
      operatorAddress &&
      typeof operatorAddress === "string" &&
      userAddress.toLowerCase() === operatorAddress.toLowerCase()
    );
  }, [userAddress, operatorAddress]);
}

// Hook to get current user address
export function useUserAddress() {
  const { airService, isLoggedIn } = useAppContext();
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserAddress = async () => {
      if (!airService || !isLoggedIn) {
        setAddress(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const airProvider = await airService.getProvider();
        const walletClient = createWalletClient({
          transport: custom(airProvider),
          chain: mocaTestnet,
        });

        const [aaAccount] = await walletClient.getAddresses();
        setAddress(aaAccount);
      } catch (error) {
        console.error("Error getting user address:", error);
        setAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUserAddress();
  }, [airService, isLoggedIn]);

  return { address, isLoading, isConnected: !!address };
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
