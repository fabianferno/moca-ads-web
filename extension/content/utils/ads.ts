export interface AdTargeting {
  above18?: boolean; // Age requirement
  isUSResident?: boolean; // Geographic targeting
  isMidIncomeBracket?: boolean; // Income targeting
  // TODO: Add more targeting criteria as needed
  // Examples: isGamePlayer?, hasCryptoExperience?, etc.
}

export interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  targetUrl: string;
  category: string;
  sponsor: string;
  targeting: AdTargeting; // New targeting criteria
}

// Hardcoded ads array for testing
export const HARDCODED_ADS: AdData[] = [
  {
    id: "ad-1",
    title: "Join MOCA Network",
    description:
      "The future of decentralized gaming and metaverse. Earn MOCA tokens while playing!",
    imageUrl:
      "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=200&fit=crop",
    ctaText: "Join Now",
    targetUrl: "https://mocachain.org",
    category: "crypto",
    sponsor: "MOCA Network",
    targeting: {
      above18: true, // Gaming/crypto requires adult audience
      isUSResident: true, // US-focused launch
      isMidIncomeBracket: true, // Target middle income for gaming adoption
    },
  },
  {
    id: "ad-2",
    title: "Trade Crypto on DEX",
    description:
      "Experience lightning-fast trades with minimal fees on our decentralized exchange.",
    imageUrl:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop",
    ctaText: "Start Trading",
    targetUrl: "#",
    category: "defi",
    sponsor: "DefiSwap",
    targeting: {
      above18: true, // Financial services require adult audience
      isUSResident: false, // Available globally except US due to regulations
      isMidIncomeBracket: false, // Target higher income for trading
    },
  },
  {
    id: "ad-3",
    title: "NFT Collection Launch",
    description:
      "Discover exclusive NFTs from top artists. Limited time mint available now!",
    imageUrl:
      "https://images.unsplash.com/photo-1644361567977-6b530a51148c?w=400&h=200&fit=crop",
    ctaText: "Mint NFT",
    targetUrl: "#",
    category: "nft",
    sponsor: "CryptoArt",
    targeting: {
      above18: true, // Art collecting typically adult audience
      // No geographic restrictions
      // No income restrictions - NFTs appeal to various income levels
    },
  },
  {
    id: "ad-4",
    title: "Web3 Development Course",
    description:
      "Learn to build dApps from scratch. Complete bootcamp with real projects.",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop",
    ctaText: "Enroll Now",
    targetUrl: "#",
    category: "education",
    sponsor: "Web3Academy",
    targeting: {
      above18: false, // Educational content suitable for all ages
      isUSResident: true, // English-language course
      isMidIncomeBracket: true, // Affordable education pricing
    },
  },
  {
    id: "ad-5",
    title: "Yield Farming Protocol",
    description:
      "Earn up to 12% APY on your crypto holdings. Secure and audited smart contracts.",
    imageUrl:
      "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=200&fit=crop",
    ctaText: "Stake Now",
    targetUrl: "#",
    category: "defi",
    sponsor: "YieldMax",
    targeting: {
      above18: true, // Financial services require adult audience
      isUSResident: false, // Not available in US due to regulations
      isMidIncomeBracket: false, // Target users with substantial holdings
    },
  },
];

// Function to get random ads
export function getRandomAds(count: number = 1): AdData[] {
  const shuffled = [...HARDCODED_ADS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Function to find suitable injection points on a webpage
export function findAdInjectionPoints(): Element[] {
  const selectors = [
    "article",
    "main",
    ".content",
    "#content",
    ".post",
    ".article",
    "section",
    '.container:not([class*="nav"]):not([class*="header"]):not([class*="footer"])',
    'div[class*="content"]',
    'div[class*="main"]',
  ];

  const injectionPoints: Element[] = [];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      // Check if element is visible and has reasonable size
      const rect = element.getBoundingClientRect();
      if (rect.width > 300 && rect.height > 200) {
        injectionPoints.push(element);
      }
    });
  }

  // If no good injection points found, fall back to body
  if (injectionPoints.length === 0) {
    const body = document.body;
    if (body) {
      injectionPoints.push(body);
    }
  }

  return injectionPoints.slice(0, 2); // Allow up to 2 injection points per page
}

// Function to check if an ad should be shown based on page content
export function shouldShowAd(ad: AdData, pageContent: string): boolean {
  const lowerContent = pageContent.toLowerCase();
  const lowerCategory = ad.category.toLowerCase();

  // Simple content matching logic
  switch (lowerCategory) {
    case "crypto":
      return (
        lowerContent.includes("crypto") ||
        lowerContent.includes("bitcoin") ||
        lowerContent.includes("ethereum") ||
        lowerContent.includes("blockchain")
      );
    case "defi":
      return (
        lowerContent.includes("defi") ||
        lowerContent.includes("trading") ||
        lowerContent.includes("finance") ||
        lowerContent.includes("yield")
      );
    case "nft":
      return (
        lowerContent.includes("nft") ||
        lowerContent.includes("art") ||
        lowerContent.includes("collectible") ||
        lowerContent.includes("mint")
      );
    case "education":
      return (
        lowerContent.includes("learn") ||
        lowerContent.includes("course") ||
        lowerContent.includes("tutorial") ||
        lowerContent.includes("education")
      );
    default:
      return true; // Show by default
  }
}

/**
 * Check if an ad matches user credentials
 * TODO: Expand this logic as more targeting criteria are added
 */
export function matchesUserCredentials(
  ad: AdData,
  userCredentials: any
): boolean {
  const { targeting } = ad;

  // If no targeting criteria, show to everyone
  if (!targeting) return true;

  // Check age requirement
  if (targeting.above18 !== undefined) {
    if (targeting.above18 && !userCredentials.above18) {
      return false; // Ad requires 18+ but user is not
    }
    if (!targeting.above18 && userCredentials.above18 === undefined) {
      return true; // Ad allows all ages and we don't have age info
    }
  }

  // Check US residency requirement
  if (targeting.isUSResident !== undefined) {
    if (targeting.isUSResident && userCredentials.isUSResident === false) {
      return false; // Ad requires US resident but user is not
    }
    if (!targeting.isUSResident && userCredentials.isUSResident === true) {
      return false; // Ad excludes US residents but user is US resident
    }
  }

  // Check income bracket requirement
  if (targeting.isMidIncomeBracket !== undefined) {
    if (
      targeting.isMidIncomeBracket &&
      userCredentials.isMidIncomeBracket === false
    ) {
      return false; // Ad targets mid income but user is not
    }
    if (
      !targeting.isMidIncomeBracket &&
      userCredentials.isMidIncomeBracket === true
    ) {
      return false; // Ad targets high income but user is mid income
    }
  }

  return true;
}

/**
 * Get ads targeted to user credentials
 * Falls back to page content matching if no credentials available
 */
export function getTargetedAds(
  userCredentials: any | null,
  maxCount: number = 2
): AdData[] {
  let filteredAds: AdData[];

  if (userCredentials) {
    // Filter ads based on user credentials
    filteredAds = HARDCODED_ADS.filter((ad) =>
      matchesUserCredentials(ad, userCredentials)
    );

    console.log(
      `MOCA Ads: Found ${filteredAds.length} ads matching user credentials`
    );
  } else {
    // Fallback to page content matching when no credentials
    const pageContent = document.body.textContent || "";
    filteredAds = HARDCODED_ADS.filter((ad) => shouldShowAd(ad, pageContent));

    console.log(
      `MOCA Ads: No user credentials, using page content matching. Found ${filteredAds.length} relevant ads`
    );
  }

  if (filteredAds.length === 0) {
    console.log("MOCA Ads: No targeted ads found, returning random selection");
    return getRandomAds(maxCount);
  }

  return filteredAds.slice(0, maxCount);
}

// Function to get relevant ads for current page (legacy - kept for compatibility)
export function getRelevantAds(maxCount: number = 1): AdData[] {
  return getTargetedAds(null, maxCount);
}
