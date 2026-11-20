import ReactDOM from "react-dom/client";
import React from "react";
import { AdBanner } from "../components/AdBanner";
import { findAdInjectionPoints, getTargetedAds } from "./ads";
import { getUserCredentials } from "./userCredentials";
import type { AdData } from "./ads";
import type { UserCredentials } from "./userCredentials";

interface InjectedAd {
  id: string;
  element: HTMLElement;
  root: ReactDOM.Root;
  adData: AdData;
}

export class AdInjector {
  private injectedAds: Map<string, InjectedAd> = new Map();
  private isInitialized = false;
  private observer: MutationObserver | null = null;
  private currentUserAddress: string | null = null;

  constructor() {
    this.handleAdClick = this.handleAdClick.bind(this);
    this.handleAdClose = this.handleAdClose.bind(this);
  }

  setUserAddress(userAddress: string | null) {
    this.currentUserAddress = userAddress;

    if (userAddress) {
      // User connected - re-inject ads with new user targeting
      if (this.isInitialized) {
        this.reinjectAds();
      }
    } else {
      // User disconnected - clear all ads
      console.log("MOCA Ads: User disconnected, clearing all ads");
      this.clearAllAds();
    }
  }

  init() {
    if (this.isInitialized) return;

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.injectAds());
    } else {
      // DOM is already ready
      setTimeout(() => this.injectAds(), 1000); // Delay to let page load fully
    }

    // Watch for dynamic content changes
    this.setupMutationObserver();

    this.isInitialized = true;
  }

  private setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldReinject = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if significant content was added
          const addedElements = Array.from(mutation.addedNodes).filter(
            (node) => node.nodeType === Node.ELEMENT_NODE
          ) as Element[];

          if (
            addedElements.some(
              (el) =>
                el.tagName &&
                ["ARTICLE", "SECTION", "DIV", "MAIN"].includes(el.tagName) &&
                (el as HTMLElement).offsetHeight > 200
            )
          ) {
            shouldReinject = true;
          }
        }
      });

      if (shouldReinject) {
        // Debounce re-injection
        setTimeout(() => this.injectAds(), 2000);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private injectAds() {
    try {
      // Only inject ads if user is connected
      if (!this.currentUserAddress) {
        console.log("MOCA Ads: No user connected, skipping ad injection");
        return;
      }

      // Skip injection on certain domains/pages
      if (this.shouldSkipInjection()) {
        return;
      }

      const injectionPoints = findAdInjectionPoints();

      // Get user credentials if available
      const userCredentials = this.currentUserAddress
        ? getUserCredentials(this.currentUserAddress)
        : null;

      const relevantAds = getTargetedAds(userCredentials, 5); // Get more ads to choose from

      if (injectionPoints.length === 0 || relevantAds.length === 0) {
        console.log("MOCA Ads: No suitable injection points or ads found");
        return;
      }

      console.log(
        `MOCA Ads: Found ${injectionPoints.length} injection points, ${relevantAds.length} relevant ads`
      );

      // Inject up to 2 DIFFERENT ads per page
      const maxAdsPerPage = 2;
      const adsToInject = Math.min(
        maxAdsPerPage,
        relevantAds.length,
        injectionPoints.length
      );

      // Track which ads we've already injected on this page to prevent duplicates
      const injectedAdIds = new Set<string>();
      let injectedCount = 0;

      for (
        let i = 0;
        i < relevantAds.length && injectedCount < adsToInject;
        i++
      ) {
        const ad = relevantAds[i];

        // Skip if we've already injected this ad on this page
        if (injectedAdIds.has(ad.id)) {
          continue;
        }

        const injectionPoint =
          injectionPoints[Math.min(injectedCount, injectionPoints.length - 1)];

        console.log(
          `MOCA Ads: Injecting ad "${ad.title}" at position ${injectedCount}`
        );
        this.injectAdAtPoint(ad, injectionPoint, injectedCount);

        injectedAdIds.add(ad.id);
        injectedCount++;
      }
    } catch (error) {
      console.error("MOCA Ads: Error injecting ads:", error);
    }
  }

  private shouldSkipInjection(): boolean {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Skip on extension pages, admin pages, checkout pages, etc.
    const skipPatterns = [
      "chrome-extension://",
      "moz-extension://",
      "accounts.google.com",
      "localhost",
      "127.0.0.1",
      "admin",
      "checkout",
      "payment",
      "cart",
      "login",
      "register",
      "auth",
    ];

    return skipPatterns.some(
      (pattern) => hostname.includes(pattern) || pathname.includes(pattern)
    );
  }

  private injectAdAtPoint(ad: AdData, injectionPoint: Element, index: number) {
    const adId = `moca-injected-ad-${ad.id}-${index}`;

    // Check if ad already exists at this point
    if (this.injectedAds.has(adId)) {
      return;
    }

    // Create ad container
    const adContainer = document.createElement("div");
    adContainer.id = adId;
    adContainer.style.cssText = `
      margin: 20px 0;
      z-index: 1000;
      position: relative;
      max-width: 100%;
      box-sizing: border-box;
    `;

    // Determine ad variant based on position and context
    let variant: "banner" | "inline" | "sidebar" = "inline";

    variant = "inline";

    // if (index === 0 && injectionPoint.tagName === "MAIN") {
    //   variant = "banner";
    // } else if (this.isSidebarLocation(injectionPoint)) {
    //   variant = "sidebar";
    // }

    // Insert ad container into the page
    this.insertAdContainer(adContainer, injectionPoint, index);

    // Create React root and render ad
    const root = ReactDOM.createRoot(adContainer);

    const AdComponent = React.createElement(AdBanner, {
      ad,
      variant,
      onClose: () => this.handleAdClose(adId),
      onAdClick: this.handleAdClick,
    });

    root.render(AdComponent);

    // Store reference for cleanup
    this.injectedAds.set(adId, {
      id: adId,
      element: adContainer,
      root,
      adData: ad,
    });

    console.log(
      `MOCA Ads: Injected ${variant} ad "${ad.title}" at position ${index}`
    );
  }

  private insertAdContainer(
    container: HTMLElement,
    injectionPoint: Element,
    index: number
  ) {
    if (injectionPoint.tagName === "BODY") {
      // If injecting into body, find a better location
      const content = document.querySelector(
        "main, article, #content, .content"
      );
      if (content && content.children.length > 0) {
        const midPoint = Math.floor(content.children.length / 2);
        const targetElement = content.children[midPoint];
        targetElement.parentNode?.insertBefore(container, targetElement);
      } else {
        document.body.appendChild(container);
      }
    } else {
      // Insert based on index
      if (index === 0) {
        // First ad goes at the beginning
        injectionPoint.insertBefore(container, injectionPoint.firstChild);
      } else if (index === 1) {
        // Second ad goes in the middle
        const children = Array.from(injectionPoint.children);
        const midPoint = Math.floor(children.length / 2);
        if (midPoint > 0 && children[midPoint]) {
          injectionPoint.insertBefore(container, children[midPoint]);
        } else {
          injectionPoint.appendChild(container);
        }
      } else {
        // Additional ads go at the end
        injectionPoint.appendChild(container);
      }
    }
  }

  private isSidebarLocation(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    // Check if element is narrow (potential sidebar)
    return (
      rect.width < 350 ||
      style.position === "fixed" ||
      element.className.toLowerCase().includes("sidebar") ||
      element.className.toLowerCase().includes("aside")
    );
  }

  private handleAdClick(adId: string) {
    console.log(`MOCA Ads: Ad clicked - ${adId}`);

    // Track ad click (could send to analytics)
    this.trackAdEvent("click", adId);
  }

  private handleAdClose(adId: string) {
    const injectedAd = this.injectedAds.get(adId);
    if (injectedAd) {
      // Unmount React component
      injectedAd.root.unmount();

      // Remove DOM element
      injectedAd.element.remove();

      // Remove from tracking
      this.injectedAds.delete(adId);

      console.log(`MOCA Ads: Ad closed - ${adId}`);
      this.trackAdEvent("close", adId);
    }
  }

  private trackAdEvent(event: string, adId: string) {
    // Placeholder for analytics tracking
    console.log(`MOCA Ads Event: ${event} - ${adId}`);

    // In a real implementation, you would send this to your analytics service
    // fetch('/api/track-ad-event', {
    //   method: 'POST',
    //   body: JSON.stringify({ event, adId, timestamp: Date.now() })
    // });
  }

  public destroy() {
    // Clean up all injected ads
    this.injectedAds.forEach((injectedAd) => {
      injectedAd.root.unmount();
      injectedAd.element.remove();
    });
    this.injectedAds.clear();

    // Stop observing mutations
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.isInitialized = false;
  }

  public getInjectedAdsCount(): number {
    return this.injectedAds.size;
  }

  public reinjectAds() {
    // Clear existing ads first
    this.injectedAds.forEach((injectedAd) => {
      injectedAd.root.unmount();
      injectedAd.element.remove();
    });
    this.injectedAds.clear();

    // Inject fresh ads
    this.injectAds();
  }

  private clearAllAds() {
    // Clean up all injected ads
    this.injectedAds.forEach((injectedAd) => {
      injectedAd.root.unmount();
      injectedAd.element.remove();
    });
    this.injectedAds.clear();
    console.log("MOCA Ads: All ads cleared");
  }
}

// Create singleton instance
export const adInjector = new AdInjector();
