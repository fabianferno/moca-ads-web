#  MOCA Ads - Monetize Your Credentials

A revolutionary Web3 advertising platform built on the MOCA blockchain that connects advertisers directly with publishers using privacy-preserving credential-based targeting.

![image](https://github.com/user-attachments/assets/5bfaf6d3-ee22-42a6-bc40-d978854f82e0)

![image](https://github.com/user-attachments/assets/3fde0f17-50b0-4ecd-92e5-453f6c125c68)

![image](https://github.com/user-attachments/assets/4e15c058-824d-4b89-9377-1e12d21953c7)


##  Features

### **Privacy-First Advertising**
- **Credential-based targeting** instead of personal data collection
- **Zero-knowledge proofs** for user verification
- **GDPR-compliant** advertising without cookies or tracking

### **Direct Monetization**
- **No middlemen** - advertisers pay publishers directly
- **Smart contract escrow** ensures guaranteed payments
- **Real-time payouts** in MOCA tokens
- **Transparent revenue sharing**: 60% users, 25% publishers, 15% protocol

### **Blockchain Security**
- **Smart contract automation** for campaign management
- **DNS verification** for domain ownership
- **Fraud-proof** impression tracking
- **Immutable** payment records

### **Multi-Platform Integration**
- **Chrome extension** support for verification data
- **Cross-domain** ad serving
- **RESTful APIs** for external integrations
- **Mobile-responsive** dashboard


![image](https://github.com/user-attachments/assets/0697a163-82c6-49f9-9096-4316d6ba603e)

![image](https://github.com/user-attachments/assets/91c49a15-3323-4733-a12b-b28b8ba5964b)

![image](https://github.com/user-attachments/assets/2023e181-aa25-4a7d-be69-634aaf5fe4b4)

![image](https://github.com/user-attachments/assets/8642badf-8e27-4229-8fc4-40f3e3b24c91)

![image](https://github.com/user-attachments/assets/ed2f4ebb-85f0-42b7-ad9d-7d4ba43777b0)


##  Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Advertisers   │    │   Publishers    │    │      Users      │
│                 │    │                 │    │                 │
│ • Create Ads    │    │ • Register      │    │ • View Ads      │
│ • Fund Campaigns│    │ • Domain Verify │    │ • Earn Rewards  │
│ • Monitor Stats │    │ • Earn Revenue  │    │ • Claim Tokens  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  MOCA Ads Smart │
                    │    Contracts    │
                    │                 │
                    │ • Campaign Mgmt │
                    │ • Payment Logic │
                    │ • Verification  │
                    │ • Reward Dist.  │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  MOCA Blockchain│
                    │   & Network     │
                    └─────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Blockchain**: Solidity smart contracts, Viem, Wagmi
- **Network**: MOCA Testnet integration
- **Authentication**: MOCA Air SDK wallet connection
- **Database**: MongoDB (for off-chain data)
- **Build Tool**: Turbopack for fast development

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- MOCA wallet with testnet tokens

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/moca-ads-web-new.git
   cd moca-ads-web-new
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # MOCA Network Configuration
   NEXT_PUBLIC_MOCA_RPC_URL=https://moca-testnet.rpc.url
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   
   # MongoDB (optional for analytics)
   MONGODB_URI=mongodb://localhost:27017/moca-ads
   
   # Chrome Extension Integration
   NEXT_PUBLIC_EXTENSION_ID=your-extension-id
   ```

4. **Start development server**
   ```bash
   yarn dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📖 Usage Guide

### For Advertisers

1. **Connect Wallet**: Use MOCA Air wallet to connect
2. **Create Campaign**: 
   - Set campaign title and description
   - Upload creative assets
   - Define budget (minimum 0.01 MOCA)
   - Select targeting credentials
   - Set campaign duration
3. **Fund Campaign**: Smart contract holds funds in escrow
4. **Monitor Performance**: Real-time stats and analytics

### For Publishers

1. **Register Domain**:
   - Enter your website URL
   - Add DNS TXT record for verification
   - Confirm ownership on-chain
2. **Integrate Ads**:
   - Install Chrome extension (optional)
   - Implement verification system
   - Display targeted ads to verified users
3. **Earn Revenue**: Automatic payouts based on impressions

### For Users

1. **Verify Credentials**: Use MOCA Air for privacy-preserving verification
2. **View Relevant Ads**: See ads matching your verified credentials
3. **Earn Rewards**: Get MOCA tokens for engagement
4. **Claim Tokens**: Self-service claiming from smart contract

## 🎯 Credential Targeting System

The platform supports privacy-preserving targeting based on verified credentials:

- **AGE_18_PLUS**: Age verification without revealing exact age
- **EU_RESIDENT**: Regional targeting for compliance
- **INCOME_LOW/MID/HIGH**: Economic targeting brackets
- **UNIVERSITY_GRAD**: Educational background
- **FREQUENT_TRAVELER**: Travel behavior patterns

## 💡 Smart Contract Features

### Campaign Management
- **Escrow System**: Funds locked until campaign completion
- **Automatic Payouts**: Based on verified impressions
- **Budget Controls**: Prevent overspending
- **Performance Tracking**: On-chain metrics

### Revenue Distribution
```solidity
// Fixed per-impression costs
uint256 public constant USER_SHARE = 6000;     // 60%
uint256 public constant WEBSITE_SHARE = 2500;  // 25% 
uint256 public constant PROTOCOL_SHARE = 1500; // 15%
```

### Security Features
- **Reentrancy Protection**: Safe external calls
- **Pausable Contracts**: Emergency stops
- **Access Controls**: Role-based permissions
- **Upgrade Patterns**: Future-proof architecture

## 🔧 Development

### Project Structure

```
moca-ads-web-new/
├── app/                    # Next.js app router pages
│   ├── ads/               # Ad browsing interface
│   ├── create/            # Campaign creation
│   ├── my-ads/            # Advertiser dashboard
│   ├── onboard/           # User onboarding
│   ├── operator/          # Admin dashboard
│   └── register/          # Publisher registration
├── components/            # Reusable UI components
│   ├── common/            # Base components
│   └── ui/                # shadcn/ui components
├── contracts/             # Solidity smart contracts
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── contexts/              # React context providers
└── utils/                 # Helper functions
```

### Key Files

- **`hooks/useMocaAds.ts`**: Main contract interaction hook
- **`lib/MocaAds.sol`**: Core smart contract
- **`components/Header.tsx`**: Navigation component
- **`app/page.tsx`**: Landing page with live stats

### Available Scripts

```bash
# Development
yarn dev          # Start development server with Turbopack
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint

# Testing
yarn test         # Run test suite (when configured)
yarn test:watch   # Watch mode testing
```

## 🌐 Chrome Extension Integration

The platform supports Chrome extension integration for enhanced verification:

```javascript
// Query verification data
function getMocaAdsVerifications() {
  const cookies = document.cookie.split('; ');
  const verificationCookie = cookies.find(row => 
    row.startsWith('moca_ads_verifications=')
  );
  return JSON.parse(decodeURIComponent(verificationCookie.split('=')[1]));
}
```

See [`docs/chrome-extension-integration.md`](docs/chrome-extension-integration.md) for complete integration guide.

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Configure environment variables**
3. **Deploy automatically** on push to main

### Manual Deployment

```bash
# Build the application
yarn build

# Start production server
yarn start
```

### Smart Contract Deployment

```bash
# Deploy to MOCA testnet
npx hardhat deploy --network moca-testnet

# Verify contracts
npx hardhat verify --network moca-testnet CONTRACT_ADDRESS
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow TypeScript strict mode
- Use Prettier for code formatting
- Write tests for new features
- Update documentation
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **MOCA Network**: [https://moca.network](https://moca.network)
- **Documentation**: [https://docs.moca-ads.com](https://docs.moca-ads.com)
- **Chrome Extension**: [Chrome Web Store Link](#)
- **Discord**: [Join our community](#)
- **Twitter**: [@MocaAds](#)

## ⚡ Live Stats

- **Active Campaigns**: Real-time campaign count
- **Registered Publishers**: Verified domain count  
- **Total Rewards Pool**: Current MOCA token rewards
- **Network Uptime**: 99.9% reliability

---

**Built with ❤️ on the MOCA blockchain** | **Privacy-first advertising for Web3**
