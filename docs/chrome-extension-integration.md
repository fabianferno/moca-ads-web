# Chrome Extension Integration - Verification Data Query

This document explains how to query Moca Ads verification data from a Chrome extension.

## Cookie Structure

The verification data is stored in a cookie named `moca_ads_verifications` with the following structure:

```json
{
  "0x1234...abcd": {
    "AGE": {
      "programKey": "AGE",
      "programId": "c21hh030fqlkd00t59230V",
      "isValid": true,
      "verificationTime": 1734567890123,
      "results": { /* VerificationResults object */ },
      "userAddress": "0x1234...abcd"
    },
    "US_RESIDENT": {
      "programKey": "US_RESIDENT", 
      "programId": "c21hi0318awx40185923UV",
      "isValid": true,
      "verificationTime": 1734567890456,
      "results": { /* VerificationResults object */ },
      "userAddress": "0x1234...abcd"
    },
    "INCOME": {
      "programKey": "INCOME",
      "programId": "c21hi03198ita01c5923Ea", 
      "isValid": false,
      "verificationTime": 1734567890789,
      "results": { /* VerificationResults object */ },
      "userAddress": "0x1234...abcd"
    }
  }
}
```

## Manifest.json Permissions

Add these permissions to your Chrome extension's `manifest.json`:

```json
{
  "permissions": [
    "cookies",
    "storage"
  ],
  "host_permissions": [
    "https://your-moca-ads-domain.com/*"
  ]
}
```

## Content Script Integration

### 1. Basic Cookie Reading

```javascript
// content-script.js
function getMocaAdsVerifications() {
  try {
    const cookies = document.cookie.split('; ');
    const verificationCookie = cookies.find(row => row.startsWith('moca_ads_verifications='));
    
    if (!verificationCookie) {
      return {};
    }
    
    const value = decodeURIComponent(verificationCookie.split('=')[1]);
    return JSON.parse(value);
  } catch (error) {
    console.error('Error reading Moca Ads verifications:', error);
    return {};
  }
}

// Get verifications for a specific user
function getUserVerifications(userAddress) {
  const allVerifications = getMocaAdsVerifications();
  return allVerifications[userAddress] || {};
}

// Check if user has specific verification
function hasVerification(userAddress, programKey) {
  const userVerifications = getUserVerifications(userAddress);
  const verification = userVerifications[programKey];
  
  if (!verification) return false;
  
  // Check expiry (7 days)
  const EXPIRY_DAYS = 7;
  const isExpired = Date.now() - verification.verificationTime > (EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  return verification.isValid && !isExpired;
}
```

### 2. Background Script Integration (Manifest V3)

```javascript
// background.js (Service Worker for Manifest V3)
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.cookie.name === 'moca_ads_verifications') {
    // Cookie changed, notify content scripts or update extension state
    handleVerificationUpdate(changeInfo.cookie);
  }
});

async function getVerificationsFromCookie(domain = 'your-moca-ads-domain.com') {
  try {
    const cookie = await chrome.cookies.get({
      url: `https://${domain}`,
      name: 'moca_ads_verifications'
    });
    
    if (!cookie) return {};
    
    return JSON.parse(decodeURIComponent(cookie.value));
  } catch (error) {
    console.error('Error reading verification cookie:', error);
    return {};
  }
}

function handleVerificationUpdate(cookie) {
  try {
    const verifications = JSON.parse(decodeURIComponent(cookie.value));
    
    // Store in extension storage for quick access
    chrome.storage.local.set({ 
      mocaAdsVerifications: verifications 
    });
    
    // Notify all tabs about the update
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'VERIFICATION_UPDATE',
          data: verifications
        }).catch(() => {
          // Tab may not have content script injected
        });
      });
    });
  } catch (error) {
    console.error('Error processing verification update:', error);
  }
}
```

### 3. Real-time Verification Status

```javascript
// verification-helper.js
class MocaAdsVerificationHelper {
  constructor() {
    this.verificationData = {};
    this.listeners = [];
    this.init();
  }
  
  async init() {
    // Load initial data
    await this.loadVerifications();
    
    // Listen for updates from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'VERIFICATION_UPDATE') {
        this.verificationData = message.data;
        this.notifyListeners();
      }
    });
    
    // Poll for changes (fallback)
    setInterval(() => this.checkForUpdates(), 30000); // Every 30 seconds
  }
  
  async loadVerifications() {
    try {
      // Try to get from extension storage first
      const result = await chrome.storage.local.get(['mocaAdsVerifications']);
      if (result.mocaAdsVerifications) {
        this.verificationData = result.mocaAdsVerifications;
        return;
      }
      
      // Fallback to cookie reading
      this.verificationData = getMocaAdsVerifications();
    } catch (error) {
      console.error('Error loading verifications:', error);
    }
  }
  
  async checkForUpdates() {
    const currentData = getMocaAdsVerifications();
    const currentString = JSON.stringify(currentData);
    const oldString = JSON.stringify(this.verificationData);
    
    if (currentString !== oldString) {
      this.verificationData = currentData;
      this.notifyListeners();
    }
  }
  
  // Get verification status for a user
  getVerificationStatus(userAddress) {
    const userVerifications = this.verificationData[userAddress] || {};
    const status = {};
    
    const PROGRAM_KEYS = ['AGE', 'US_RESIDENT', 'INCOME'];
    PROGRAM_KEYS.forEach(key => {
      status[key] = this.hasVerification(userAddress, key);
    });
    
    return status;
  }
  
  hasVerification(userAddress, programKey) {
    const userVerifications = this.verificationData[userAddress] || {};
    const verification = userVerifications[programKey];
    
    if (!verification) return false;
    
    // Check expiry
    const EXPIRY_DAYS = 7;
    const isExpired = Date.now() - verification.verificationTime > (EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    
    return verification.isValid && !isExpired;
  }
  
  // Add listener for verification updates
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.verificationData);
      } catch (error) {
        console.error('Error in verification listener:', error);
      }
    });
  }
}

// Usage example
const verificationHelper = new MocaAdsVerificationHelper();

// Listen for verification updates
verificationHelper.addListener((verifications) => {
  console.log('Verifications updated:', verifications);
  updateUIBasedOnVerifications(verifications);
});

// Check specific user's verification status
function updateUIBasedOnVerifications(verifications) {
  const userAddress = getCurrentUserAddress(); // Your method to get current user
  if (!userAddress) return;
  
  const status = verificationHelper.getVerificationStatus(userAddress);
  
  console.log('User verification status:', status);
  // status = { AGE: true, US_RESIDENT: false, INCOME: true }
  
  // Update your extension UI based on verification status
  updateAdTargeting(status);
}
```

## Example Usage Scenarios

### 1. Ad Targeting in Extension

```javascript
function getAdTargetingCriteria(userAddress) {
  const verificationHelper = new MocaAdsVerificationHelper();
  const status = verificationHelper.getVerificationStatus(userAddress);
  
  const criteria = {
    ageVerified: status.AGE,
    isUSResident: status.US_RESIDENT,
    incomeVerified: status.INCOME,
    verificationScore: Object.values(status).filter(Boolean).length
  };
  
  return criteria;
}
```

### 2. Verification Badge Display

```javascript
function createVerificationBadges(userAddress) {
  const verificationHelper = new MocaAdsVerificationHelper();
  const userVerifications = verificationHelper.verificationData[userAddress] || {};
  
  const badges = [];
  
  Object.entries(userVerifications).forEach(([key, verification]) => {
    if (verification.isValid) {
      badges.push({
        type: key,
        verified: true,
        timestamp: verification.verificationTime
      });
    }
  });
  
  return badges;
}
```

## Error Handling

```javascript
// Robust error handling for cookie access
function safeGetVerifications() {
  try {
    const verifications = getMocaAdsVerifications();
    return verifications;
  } catch (error) {
    console.warn('Could not access Moca Ads verifications:', error.message);
    
    // Return empty object as fallback
    return {};
  }
}

// Handle permission errors
function checkCookiePermissions() {
  if (typeof chrome === 'undefined' || !chrome.cookies) {
    console.error('Chrome cookies API not available');
    return false;
  }
  
  return true;
}
```

## Security Considerations

1. **Cookie Domain**: Ensure your extension only accesses cookies from trusted Moca Ads domains
2. **Data Validation**: Always validate cookie data structure before using
3. **Expiry Checks**: Respect the 7-day expiry period for verifications
4. **Error Handling**: Gracefully handle cases where cookies are not available
5. **Privacy**: Only access verification data when necessary for functionality

## Testing

```javascript
// Test helper for development
function testVerificationAccess() {
  console.log('Testing Moca Ads verification access...');
  
  const verifications = getMocaAdsVerifications();
  console.log('All verifications:', verifications);
  
  const testAddress = '0x742d35Cc6861C4C687b78C31b82bB6A070123456';
  const userVerifications = getUserVerifications(testAddress);
  console.log('User verifications:', userVerifications);
  
  const hasAge = hasVerification(testAddress, 'AGE');
  console.log('Has age verification:', hasAge);
}
``` 