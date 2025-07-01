// Real verification system based on Moca Ads cookie specifications

export interface VerificationData {
  programKey: string;
  programId: string;
  isValid: boolean;
  verificationTime: number;
  results: any; // VerificationResults object
  userAddress: string;
}

export interface UserVerifications {
  [programKey: string]: VerificationData;
}

export interface AllVerifications {
  [userAddress: string]: UserVerifications;
}

// Backward compatibility interface for existing ad targeting code
export interface UserCredentials {
  userAddress: string;
  above18: boolean;
  isUSResident: boolean;
  isMidIncomeBracket: boolean;
}

// Verification cookie and expiry constants
const VERIFICATION_COOKIE_NAME = "moca_ads_verifications";
const EXPIRY_DAYS = 7;
const MOCA_ADS_DOMAIN = "moca-ads.com"; // Update with your actual domain

/**
 * Get all Moca Ads verifications from cookies
 */
function getMocaAdsVerifications(): AllVerifications {
  try {
    const cookies = document.cookie.split("; ");
    const verificationCookie = cookies.find((row) =>
      row.startsWith(`${VERIFICATION_COOKIE_NAME}=`)
    );

    if (!verificationCookie) {
      console.log("No Moca Ads verification cookie found");
      return {};
    }

    const value = decodeURIComponent(verificationCookie.split("=")[1]);
    const verifications = JSON.parse(value);

    console.log(
      "Loaded Moca Ads verifications from cookie:",
      Object.keys(verifications).length,
      "users"
    );
    return verifications;
  } catch (error) {
    console.error("Error reading Moca Ads verifications cookie:", error);
    return {};
  }
}

/**
 * Get verifications for a specific user
 */
export function getUserVerifications(userAddress: string): UserVerifications {
  if (!userAddress) return {};

  const allVerifications = getMocaAdsVerifications();
  return allVerifications[userAddress] || {};
}

/**
 * Check if user has a specific verification that's still valid
 */
export function hasVerification(
  userAddress: string,
  programKey: string
): boolean {
  const userVerifications = getUserVerifications(userAddress);
  const verification = userVerifications[programKey];

  if (!verification) {
    console.log(`No ${programKey} verification found for user ${userAddress}`);
    return false;
  }

  // Check if verification is valid
  if (!verification.isValid) {
    console.log(
      `${programKey} verification is invalid for user ${userAddress}`
    );
    return false;
  }

  // Check expiry (7 days)
  const isExpired =
    Date.now() - verification.verificationTime >
    EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  if (isExpired) {
    console.log(
      `${programKey} verification has expired for user ${userAddress}`
    );
    return false;
  }

  console.log(`${programKey} verification is valid for user ${userAddress}`);
  return true;
}

/**
 * Get verification status for a user (all program keys)
 */
export function getVerificationStatus(
  userAddress: string
): Record<string, boolean> {
  const status: Record<string, boolean> = {};
  const PROGRAM_KEYS = ["AGE", "US_RESIDENT", "INCOME"];

  PROGRAM_KEYS.forEach((key) => {
    status[key] = hasVerification(userAddress, key);
  });

  return status;
}

/**
 * Convert new verification system to old UserCredentials format for backward compatibility
 */
export function getUserCredentials(
  userAddress: string
): UserCredentials | null {
  if (!userAddress) {
    console.log("No user address provided");
    return null;
  }

  try {
    const verificationStatus = getVerificationStatus(userAddress);

    // Check if user has any verifications at all
    const hasAnyVerifications = Object.values(verificationStatus).some(Boolean);
    if (!hasAnyVerifications) {
      console.log(`No valid verifications found for user ${userAddress}`);

      // Fallback to mock data for development/testing
      return getMockCredentials(userAddress);
    }

    // Map new verification system to old credential format
    const credentials: UserCredentials = {
      userAddress,
      above18: verificationStatus.AGE || false,
      isUSResident: verificationStatus.US_RESIDENT || false,
      isMidIncomeBracket: verificationStatus.INCOME || false,
    };

    console.log(
      `Real credentials loaded for user ${userAddress}:`,
      credentials
    );
    return credentials;
  } catch (error) {
    console.error("Error getting user credentials:", error);

    // Fallback to mock data on error
    return getMockCredentials(userAddress);
  }
}

/**
 * Check if user has verified credentials (either real or mock)
 */
export function hasVerifiedCredentials(userAddress: string): boolean {
  const credentials = getUserCredentials(userAddress);
  return credentials !== null;
}

/**
 * Store user credentials - placeholder for future implementation
 * Note: Real verification happens through Moca Ads verification service
 */
export function storeUserCredentials(credentials: UserCredentials): boolean {
  console.warn(
    "storeUserCredentials: Real verification should happen through Moca Ads verification service"
  );
  return false;
}

/**
 * Clear user credentials - placeholder for future implementation
 */
export function clearUserCredentials(): void {
  console.log(
    "clearUserCredentials: Real verification data is managed by Moca Ads service"
  );
}

// ============================================================================
// MOCK DATA FOR DEVELOPMENT/TESTING
// ============================================================================

/**
 * Mock credentials for development when no real verifications exist
 */
const MOCK_CREDENTIALS: Record<string, UserCredentials> = {
  // Mock user 1 - US adult with mid income (all verifications)
  "0x1234567890123456789012345678901234567890": {
    userAddress: "0x1234567890123456789012345678901234567890",
    above18: true,
    isUSResident: true,
    isMidIncomeBracket: true,
  },
  // Mock user 2 - Non-US adult with high income
  "0x2345678901234567890123456789012345678901": {
    userAddress: "0x2345678901234567890123456789012345678901",
    above18: true,
    isUSResident: false,
    isMidIncomeBracket: false,
  },
  // Mock user 3 - US minor (limited verifications)
  "0x3456789012345678901234567890123456789012": {
    userAddress: "0x3456789012345678901234567890123456789012",
    above18: false,
    isUSResident: true,
    isMidIncomeBracket: true,
  },
};

/**
 * Get mock credentials for development/testing
 */
function getMockCredentials(userAddress: string): UserCredentials | null {
  const mockData = MOCK_CREDENTIALS[userAddress];
  if (mockData) {
    console.log(`MOCK: Using mock credentials for user ${userAddress}`);
    return mockData;
  }
  return null;
}

/**
 * Get available mock users for testing
 */
export function getMockUsers(): string[] {
  return Object.keys(MOCK_CREDENTIALS);
}

// ============================================================================
// VERIFICATION HELPER CLASS
// ============================================================================

/**
 * Real-time verification helper for managing Moca Ads verification data
 */
export class MocaAdsVerificationHelper {
  private verificationData: AllVerifications = {};
  private listeners: Array<(verifications: AllVerifications) => void> = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  async init() {
    if (this.initialized) return;

    try {
      // Load initial data
      await this.loadVerifications();

      // Listen for updates from background script (if available)
      if (typeof chrome !== "undefined" && chrome.runtime) {
        chrome.runtime.onMessage.addListener(
          (message, sender, sendResponse) => {
            if (message.type === "VERIFICATION_UPDATE") {
              this.verificationData = message.data;
              this.notifyListeners();
            }
          }
        );
      }

      // Poll for changes (fallback)
      setInterval(() => this.checkForUpdates(), 30000); // Every 30 seconds

      this.initialized = true;
      console.log("MocaAdsVerificationHelper initialized");
    } catch (error) {
      console.error("Error initializing MocaAdsVerificationHelper:", error);
    }
  }

  async loadVerifications() {
    try {
      // Try to get from extension storage first (if available)
      if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get(["mocaAdsVerifications"]);
        if (result.mocaAdsVerifications) {
          this.verificationData = result.mocaAdsVerifications;
          return;
        }
      }

      // Fallback to cookie reading
      this.verificationData = getMocaAdsVerifications();
    } catch (error) {
      console.error("Error loading verifications:", error);
    }
  }

  async checkForUpdates() {
    try {
      const currentData = getMocaAdsVerifications();
      const currentString = JSON.stringify(currentData);
      const oldString = JSON.stringify(this.verificationData);

      if (currentString !== oldString) {
        this.verificationData = currentData;
        this.notifyListeners();
        console.log("Verification data updated from cookies");
      }
    } catch (error) {
      console.error("Error checking for verification updates:", error);
    }
  }

  /**
   * Get verification status for a user
   */
  getVerificationStatus(userAddress: string): Record<string, boolean> {
    const userVerifications = this.verificationData[userAddress] || {};
    const status: Record<string, boolean> = {};

    const PROGRAM_KEYS = ["AGE", "US_RESIDENT", "INCOME"];
    PROGRAM_KEYS.forEach((key) => {
      const verification = userVerifications[key];
      if (!verification) {
        status[key] = false;
        return;
      }

      // Check validity and expiry
      const isExpired =
        Date.now() - verification.verificationTime >
        EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      status[key] = verification.isValid && !isExpired;
    });

    return status;
  }

  /**
   * Check if user has specific verification
   */
  hasVerification(userAddress: string, programKey: string): boolean {
    const userVerifications = this.verificationData[userAddress] || {};
    const verification = userVerifications[programKey];

    if (!verification) return false;

    // Check expiry
    const isExpired =
      Date.now() - verification.verificationTime >
      EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    return verification.isValid && !isExpired;
  }

  /**
   * Add listener for verification updates
   */
  addListener(callback: (verifications: AllVerifications) => void) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback: (verifications: AllVerifications) => void) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  /**
   * Notify all listeners of verification updates
   */
  private notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.verificationData);
      } catch (error) {
        console.error("Error in verification listener:", error);
      }
    });
  }

  /**
   * Get all verification data
   */
  getAllVerifications(): AllVerifications {
    return this.verificationData;
  }
}

// Global instance for use throughout the extension
export const verificationHelper = new MocaAdsVerificationHelper();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safe wrapper for getting verifications with error handling
 */
export function safeGetVerifications(): AllVerifications {
  try {
    return getMocaAdsVerifications();
  } catch (error) {
    console.warn("Could not access Moca Ads verifications:", error.message);
    return {};
  }
}

/**
 * Check if cookie permissions are available
 */
export function checkCookiePermissions(): boolean {
  if (typeof chrome === "undefined" || !chrome.cookies) {
    console.warn(
      "Chrome cookies API not available - running in development mode"
    );
    return false;
  }

  return true;
}

/**
 * Create verification badges for UI display
 */
export function createVerificationBadges(
  userAddress: string
): Array<{ type: string; verified: boolean; timestamp: number }> {
  const userVerifications = getUserVerifications(userAddress);
  const badges: Array<{ type: string; verified: boolean; timestamp: number }> =
    [];

  Object.entries(userVerifications).forEach(([key, verification]) => {
    const isExpired =
      Date.now() - verification.verificationTime >
      EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    badges.push({
      type: key,
      verified: verification.isValid && !isExpired,
      timestamp: verification.verificationTime,
    });
  });

  return badges;
}

/**
 * Test helper for development
 */
export function testVerificationAccess() {
  console.log("=== Testing Moca Ads verification access ===");

  const verifications = getMocaAdsVerifications();
  console.log("All verifications:", verifications);

  const testAddress = "0x1234567890123456789012345678901234567890";
  const userVerifications = getUserVerifications(testAddress);
  console.log("User verifications:", userVerifications);

  const hasAge = hasVerification(testAddress, "AGE");
  console.log("Has age verification:", hasAge);

  const status = getVerificationStatus(testAddress);
  console.log("Verification status:", status);

  const credentials = getUserCredentials(testAddress);
  console.log("Backward-compatible credentials:", credentials);

  console.log("=== Test complete ===");
}
