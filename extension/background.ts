// Background script for MOCA Ads Extension with Verification Support

console.log("MOCA Ads: Background script loaded");

// Verification cookie monitoring
const VERIFICATION_COOKIE_NAME = "moca_ads_verifications";
const MOCA_ADS_DOMAIN = "moca-ads.com"; // Update with your actual domain

/**
 * Monitor verification cookie changes and notify content scripts
 */
if (typeof chrome !== "undefined" && chrome.cookies) {
  // Listen for cookie changes
  chrome.cookies.onChanged.addListener((changeInfo) => {
    if (changeInfo.cookie.name === VERIFICATION_COOKIE_NAME) {
      console.log("MOCA Ads: Verification cookie changed");
      handleVerificationUpdate(changeInfo.cookie);
    }
  });

  /**
   * Handle verification cookie updates
   */
  async function handleVerificationUpdate(cookie: chrome.cookies.Cookie) {
    try {
      if (!cookie.value) {
        console.log("MOCA Ads: Verification cookie deleted");
        return;
      }

      const verifications = JSON.parse(decodeURIComponent(cookie.value));
      console.log(
        "MOCA Ads: Processing verification update for",
        Object.keys(verifications).length,
        "users"
      );

      // Store in extension storage for quick access
      await chrome.storage.local.set({
        mocaAdsVerifications: verifications,
        lastVerificationUpdate: Date.now(),
      });

      // Notify all tabs about the update
      const tabs = await chrome.tabs.query({});
      const updatePromises = tabs.map(async (tab) => {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: "VERIFICATION_UPDATE",
              data: verifications,
            });
          } catch (error) {
            // Tab may not have content script injected - this is normal
            console.debug("Could not send verification update to tab", tab.id);
          }
        }
      });

      await Promise.allSettled(updatePromises);
      console.log("MOCA Ads: Verification update broadcast complete");
    } catch (error) {
      console.error("MOCA Ads: Error processing verification update:", error);
    }
  }

  /**
   * Get verification data from cookies on demand
   */
  async function getVerificationsFromCookie(domain = MOCA_ADS_DOMAIN) {
    try {
      const cookie = await chrome.cookies.get({
        url: `https://${domain}`,
        name: VERIFICATION_COOKIE_NAME,
      });

      if (!cookie) {
        console.log("MOCA Ads: No verification cookie found");
        return {};
      }

      const verifications = JSON.parse(decodeURIComponent(cookie.value));
      console.log(
        "MOCA Ads: Retrieved verifications for",
        Object.keys(verifications).length,
        "users"
      );
      return verifications;
    } catch (error) {
      console.error("MOCA Ads: Error reading verification cookie:", error);
      return {};
    }
  }

  /**
   * Handle messages from content scripts
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_VERIFICATIONS") {
      // Content script requesting verification data
      getVerificationsFromCookie()
        .then((verifications) => {
          sendResponse({ success: true, data: verifications });
        })
        .catch((error) => {
          console.error("MOCA Ads: Error getting verifications:", error);
          sendResponse({ success: false, error: error.message });
        });

      // Return true to indicate we'll send a response asynchronously
      return true;
    }

    if (message.type === "REFRESH_VERIFICATIONS") {
      // Force refresh verification data
      getVerificationsFromCookie()
        .then((verifications) => {
          return chrome.storage.local.set({
            mocaAdsVerifications: verifications,
            lastVerificationUpdate: Date.now(),
          });
        })
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error("MOCA Ads: Error refreshing verifications:", error);
          sendResponse({ success: false, error: error.message });
        });

      return true;
    }
  });

  // Initialize verification data on startup
  getVerificationsFromCookie()
    .then((verifications) => {
      return chrome.storage.local.set({
        mocaAdsVerifications: verifications,
        lastVerificationUpdate: Date.now(),
      });
    })
    .then(() => {
      console.log("MOCA Ads: Initial verification data loaded");
    })
    .catch((error) => {
      console.error(
        "MOCA Ads: Error loading initial verification data:",
        error
      );
    });
} else {
  console.log(
    "MOCA Ads: Chrome cookies API not available - verification monitoring disabled"
  );
}
