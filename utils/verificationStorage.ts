import {
  VERIFICATION_COOKIE_NAME,
  VERIFICATION_COOKIE_EXPIRY_DAYS,
  VERIFIER_PROGRAMS,
  type VerifierProgramKey,
} from "./constants";
import type { VerificationResults } from "@mocanetwork/air-credential-sdk";

export interface StoredVerification {
  programKey: VerifierProgramKey;
  programId: string;
  isValid: boolean;
  verificationTime: number;
  results: VerificationResults;
  userAddress: string;
}

export interface UserVerifications {
  [userAddress: string]: {
    [programKey: string]: StoredVerification;
  };
}

// Get all verifications from cookie
export function getAllVerifications(): UserVerifications {
  if (typeof document === "undefined") return {};

  try {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${VERIFICATION_COOKIE_NAME}=`));

    if (!cookie) return {};

    const value = decodeURIComponent(cookie.split("=")[1]);
    return JSON.parse(value);
  } catch (error) {
    console.error("Error reading verification cookie:", error);
    return {};
  }
}

// Get verifications for a specific user address
export function getUserVerifications(
  userAddress: string
): Record<string, StoredVerification> {
  const allVerifications = getAllVerifications();
  return allVerifications[userAddress] || {};
}

// Store verification result for a user
export function storeVerification(
  userAddress: string,
  programKey: VerifierProgramKey,
  results: VerificationResults,
  isValid: boolean = true
): void {
  if (typeof document === "undefined") return;

  try {
    const allVerifications = getAllVerifications();

    if (!allVerifications[userAddress]) {
      allVerifications[userAddress] = {};
    }

    const verification: StoredVerification = {
      programKey,
      programId: VERIFIER_PROGRAMS[programKey].id,
      isValid,
      verificationTime: Date.now(),
      results,
      userAddress,
    };

    allVerifications[userAddress][programKey] = verification;

    // Set cookie with expiry
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + VERIFICATION_COOKIE_EXPIRY_DAYS);

    document.cookie = `${VERIFICATION_COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify(allVerifications)
    )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

    console.log(
      `Stored verification for ${userAddress} - ${programKey}:`,
      verification
    );
  } catch (error) {
    console.error("Error storing verification:", error);
  }
}

// Check if a user has a specific verification
export function hasVerification(
  userAddress: string,
  programKey: VerifierProgramKey
): boolean {
  const userVerifications = getUserVerifications(userAddress);
  const verification = userVerifications[programKey];

  if (!verification) return false;

  // Check if verification is still valid (not expired)
  const isExpired =
    Date.now() - verification.verificationTime >
    VERIFICATION_COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  return verification.isValid && !isExpired;
}

// Get verification status for all programs for a user
export function getVerificationStatus(
  userAddress: string
): Record<VerifierProgramKey, boolean> {
  const status: Record<string, boolean> = {};

  Object.keys(VERIFIER_PROGRAMS).forEach((key) => {
    const programKey = key as VerifierProgramKey;
    status[programKey] = hasVerification(userAddress, programKey);
  });

  return status as Record<VerifierProgramKey, boolean>;
}

// Clear verifications for a user
export function clearUserVerifications(userAddress: string): void {
  if (typeof document === "undefined") return;

  try {
    const allVerifications = getAllVerifications();
    delete allVerifications[userAddress];

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + VERIFICATION_COOKIE_EXPIRY_DAYS);

    document.cookie = `${VERIFICATION_COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify(allVerifications)
    )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error("Error clearing user verifications:", error);
  }
}

// Clear all verifications
export function clearAllVerifications(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${VERIFICATION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
