import { type Chain, defineChain } from "viem";
import { BUILD_ENV as AIRKIT_BUILD_ENV } from "@mocanetwork/airkit";

export const PARTNER_ID = "8c8cd8b3-e234-429c-90ba-c41357561e1b";
export const VERIFIER_DID =
  "did:key:81eGhRRY6eo564z6fyjZhfVb5sYjr8ELd5gxmchYiWgSJgETX57ZUKQYF7JBQYmaGnRxqvovZtCRTwbBiuJBDbh8LR";
export const VERIFIER_API_KEY = "REDACTED";

export const mocaTestnet: Chain & {
  contracts: { multicall3: { address: `0x${string}`; blockCreated: number } };
} = defineChain({
  id: 5151,
  name: "Moca Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Moca Network",
    symbol: "MOCA",
  },
  rpcUrls: {
    default: {
      http: ["https://devnet-rpc.mocachain.org"],
      webSocket: ["wss://devnet-rpc.mocachain.org"],
    },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://devnet-scan.mocachain.org" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3837540,
    },
  },
} as const);

export const BUILD_ENV = AIRKIT_BUILD_ENV.SANDBOX;
export const DEFAULT_CHAIN = mocaTestnet;

export const SERVICE_COST = 0.001;

export const VERIFIER_PROGRAMS = {
  AGE: {
    id: "c21hh030fqlkd00t59230V",
    schemaId: "c21hh060fllt30253781sX",
    name: "Age Credential #2",
    description: "Above 1",
    credentialDay: "c21hh0g0fnr710208705Jz",
    displayName: "Age Verification",
    icon: "🎂",
    color: "#3B82F6",
  },
  US_RESIDENT: {
    id: "c21hi0318awx40185923UV",
    schemaId: "c21hi061886u402j3781x3",
    name: "US Resident Credential #2",
    description: "Is US Resident",
    credentialDay: "c21hi0g189aoj02l4129F5",
    displayName: "US Residency",
    icon: "🇺🇸",
    color: "#EF4444",
  },
  INCOME: {
    id: "c21hi03198ita01c5923Ea",
    schemaId: "c21hi061954fm02o3781x6",
    name: "Income Credential",
    description: "Is mid income bracket",
    credentialDay: "c21hi0g1966re02q7770ur",
    displayName: "Income Verification",
    icon: "💰",
    color: "#10B981",
  },
} as const;

export type VerifierProgramKey = keyof typeof VERIFIER_PROGRAMS;

// Cookie settings for verification storage
export const VERIFICATION_COOKIE_NAME = "moca_ads_verifications";
export const VERIFICATION_COOKIE_EXPIRY_DAYS = 7; // 7 days
