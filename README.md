# MOCA Ads

**Ads targeted by verifiable credentials instead of personal data.**

🏆 Winner, Moca Network Identity House hackathon, Cannes, France.

Live: [moca-ads-web.vercel.app](https://moca-ads-web.vercel.app)

MOCA Ads is an ad network on Moca Chain. Advertisers fund campaigns on-chain and choose which credentials to target ("18+", "EU resident", "high income", "university grad"). Users prove those traits with Moca AIR credentials, without handing over the underlying data. Every paid view splits the advertiser's budget between the viewer, the website showing the ad and the protocol.

![image](https://github.com/user-attachments/assets/5bfaf6d3-ee22-42a6-bc40-d978854f82e0)

![image](https://github.com/user-attachments/assets/3fde0f17-50b0-4ecd-92e5-453f6c125c68)

![image](https://github.com/user-attachments/assets/4e15c058-824d-4b89-9377-1e12d21953c7)

## How it works

```
 Advertiser                  Publisher                     User
 /create                     /register                     /onboard  (+ Chrome extension)
   │ createCampaign()          │ registerWebsite(domain)     │ verify credentials with
   │ + MOCA budget (escrow)    │                             │ Moca AIR credential widget
   ▼                           ▼                             ▼
 ┌──────────────────────────── MocaAds.sol (Moca testnet, chain 5151) ───────────────────────────┐
 │ campaigns (target credentials, IPFS ad hash, budget/spent) · websites · per-user stats         │
 │ batchUpdateRewards(user, website, views, campaign)  ← called by the operator (/operator)       │
 │   cost = views × 0.001 MOCA  →  60% user · 25% website · 15% protocol                          │
 │ claimUserRewards · claimWebsiteRewards · claimProtocolRewards · withdrawCampaignBudget         │
 └────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Advertisers** create a campaign on `/create`. They pay the budget in native MOCA (minimum 0.01), pick target credentials and a duration, and attach the ad content's IPFS hash. `/my-ads` shows their campaigns and lets them withdraw unspent budget.
2. **Publishers** register a domain on `/register`, which calls `registerWebsite`. The UI walks them through adding a DNS TXT record.
3. **Users** sign in with Moca AIR Kit on `/onboard` and verify credentials through the AIR credential widget. The configured programs are age, US residency and income. Results are saved per wallet in the `moca_ads_verifications` cookie.
4. The **Chrome extension** (`extension/`) reads the same verification data. It injects ad banners into the pages the user browses and only shows ads whose targeting matches the user's verified credentials (18+, US resident, mid-income bracket).
5. The **operator** (`/operator`, gated by `isOperator`) records views in batches with `batchUpdateRewards`. That charges the campaign and credits the user, website and protocol balances, which each party then claims.

![image](https://github.com/user-attachments/assets/0697a163-82c6-49f9-9096-4316d6ba603e)

![image](https://github.com/user-attachments/assets/91c49a15-3323-4733-a12b-b28b8ba5964b)

![image](https://github.com/user-attachments/assets/2023e181-aa25-4a7d-be69-634aaf5fe4b4)

![image](https://github.com/user-attachments/assets/8642badf-8e27-4229-8fc4-40f3e3b24c91)

![image](https://github.com/user-attachments/assets/ed2f4ebb-85f0-42b7-ad9d-7d4ba43777b0)

## Smart contract

`lib/MocaAds.sol`: Solidity, OpenZeppelin `Ownable`, `ReentrancyGuard` and `Pausable`.

- Deployed on Moca testnet (chain ID 5151) at `0x4a31Ce110F74D134DD7C948D6E8197341d0FE361` ([explorer](https://devnet-scan.mocachain.org/address/0x4a31Ce110F74D134DD7C948D6E8197341d0FE361))
- Targeting credentials: `AGE_18_PLUS`, `EU_RESIDENT`, `INCOME_LOW` / `INCOME_MID` / `INCOME_HIGH`, `UNIVERSITY_GRAD`, `FREQUENT_TRAVELER`
- Revenue split: `USER_SHARE = 6000`, `WEBSITE_SHARE = 2500`, `PROTOCOL_SHARE = 1500` (basis points)
- Owner controls: change the operator, protocol wallet, minimum budget and cost per view; pause and unpause; emergency withdraw while paused

`contracts/Payment.sol` and `contracts/DiscountCoupon.sol` are commented-out drafts and aren't used.

## Stack

- **Web:** Next.js 15 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Identity:** Moca AIR Kit (`@mocanetwork/airkit`, `airkit-connector`), AIR credential SDK (`@mocanetwork/air-credential-sdk`)
- **Chain:** wagmi and viem on Moca testnet
- **Extension:** Extension.js, React 18, Tailwind CSS 4 (see [`extension/`](extension/))

## Repo structure

```
app/            Next.js routes: / , ads, create, my-ads, onboard, operator, register
components/     UI (shadcn/ui) and shared components
contexts/       app state and logging providers
hooks/          useMocaAds.ts: every contract read and write
lib/            MocaAds.sol, contract address, utils
utils/          chain + credential program config, verification cookie storage
docs/           chrome-extension-integration.md
extension/      the Chrome extension (moved in from moca-ads-extension)
contracts/      unused drafts
```

## Running locally

```bash
yarn install
echo "NEXT_PUBLIC_MOCA_VERIFIER_API_KEY=your-verifier-api-key" > .env.local
yarn dev        # http://localhost:3000
```

You need a wallet with Moca testnet MOCA. The partner ID, verifier DID and credential program IDs are in `utils/constants.ts`. For the extension, see [`extension/README.md`](extension/README.md).

## Status

This is a hackathon build. The contract and the campaign, registration, claim and withdraw flows are real, on Moca testnet. Simplifications:

- **DNS check:** domain verification is simulated in the UI. The DNS TXT record isn't actually checked before `registerWebsite`.
- **Trusted operator:** views are reported off-chain by an operator account through `batchUpdateRewards`, so the operator has to be trusted.
- **Targeting:** credential matching happens client-side. The contract stores a campaign's targets but doesn't check them.
- **Extension ads:** the extension serves a small hardcoded set of test ads instead of the on-chain campaigns.
