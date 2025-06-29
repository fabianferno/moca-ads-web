# MocaAds Operator Guide

## Overview

The MocaAds Operator Dashboard provides authorized operators with the tools to manage the advertising platform's core operations. The primary function is batch updating rewards for users and websites based on ad views.

## Setup

### 1. Environment Configuration

Set the operator wallet address in your environment variables:

```bash
NEXT_PUBLIC_OPERATOR_WALLET=0x...your_operator_address_here
```

### 2. Smart Contract Configuration

The operator address is also set in the smart contract during deployment. The dashboard will check both:
- Environment variable `NEXT_PUBLIC_OPERATOR_WALLET`
- Contract's `operator()` function

## Access Control

The operator dashboard implements dual-layer access control:

1. **Environment Check**: Compares connected wallet with `NEXT_PUBLIC_OPERATOR_WALLET`
2. **Contract Check**: Uses the `useIsOperator()` hook to verify against contract's operator address

Only wallets that match either check can access the operator dashboard.

## Features

### 1. Platform Overview

- **Active Campaigns**: Total number of currently running campaigns
- **Contract Balance**: Total MOCA held in the contract
- **Protocol Rewards**: Claimable rewards for the protocol (15% of all transactions)
- **Registered Domains**: Number of websites registered on the platform

### 2. Batch Rewards Management

The core operator functionality for processing ad view rewards.

#### How It Works

1. **Add Entries**: Input individual reward entries with:
   - User wallet address (who viewed the ad)
   - Website domain (where the ad was shown)
   - View count (number of ad views)
   - Campaign ID (which campaign the views are for)

2. **Validation**: Each entry is validated for:
   - Valid Ethereum address format
   - Positive view count
   - Valid campaign ID
   - Website domain format
   - No duplicate entries

3. **Batch Processing**: Execute all entries in a single transaction to:
   - Update user claimable rewards (60% of revenue)
   - Update website claimable rewards (25% of revenue)
   - Update protocol claimable rewards (15% of revenue)
   - Update campaign spent amounts and view counts

#### Revenue Distribution

For each view processed:
- **Cost per view**: 0.001 MOCA (configurable)
- **User gets**: 60% (0.0006 MOCA per view)
- **Website owner gets**: 25% (0.00025 MOCA per view)  
- **Protocol gets**: 15% (0.00015 MOCA per view)

### 3. Batch Entry Management

- **Add Multiple Entries**: Build up a batch of reward entries before execution
- **View Summary**: See totals for views, users, websites, and campaigns
- **Entry List**: Review all entries before processing
- **Remove Entries**: Delete individual entries from the batch
- **Duplicate Prevention**: System prevents duplicate user+website+campaign combinations

### 4. Transaction Management

- **Real-time Status**: Shows transaction pending, confirming, success, or error states
- **Transaction Hash**: Displays hash for verification on blockchain explorer
- **Error Handling**: Clear error messages for failed transactions
- **Success Feedback**: Confirmation when batch is processed successfully

## Usage Workflow

### Daily Operations

1. **Collect View Data**: Backend systems track ad views across registered websites
2. **Prepare Batch**: Aggregate view data by user, website, and campaign
3. **Access Dashboard**: Connect operator wallet and navigate to `/operator`
4. **Add Entries**: Input each user's view data using the batch form
5. **Review Batch**: Check totals and entry details for accuracy
6. **Execute**: Process the entire batch in one transaction
7. **Verify**: Confirm transaction success and check updated balances

### Best Practices

1. **Batch Size**: Process reasonable batch sizes to avoid gas limit issues
2. **Verification**: Always verify user addresses and campaign IDs before processing
3. **Timing**: Process batches during low network congestion for better gas prices
4. **Monitoring**: Check contract balance regularly to ensure sufficient funds
5. **Backup**: Keep records of processed batches for auditing

## Security Features

- **Operator-Only Access**: Only authorized operator wallet can execute batch updates
- **Input Validation**: Comprehensive validation prevents invalid data processing
- **Duplicate Prevention**: System blocks duplicate reward entries
- **Transaction Confirmation**: Requires wallet confirmation for all operations
- **Error Handling**: Safe failure modes with clear error reporting

## Navigation

The operator dashboard includes a red "OPERATOR" button in the main navigation that only appears for authorized operators. This provides quick access to all operator functions.

## Platform Health Monitoring

The dashboard shows real-time platform health indicators:
- ✅ Contract Status: Active
- ✅ Operator Access: Enabled  
- 🔵 Ready for Batch Operations

## Future Enhancements

The "Settings" tab is prepared for future operator configuration options:
- Update minimum campaign budgets
- Modify cost per view rates
- Adjust revenue distribution percentages
- Platform pause/unpause controls

## Support

For technical issues or questions about operator functionality, refer to the smart contract documentation and ensure your wallet has the proper operator permissions set in the contract. 