"use client";

import { VerifyButton } from "@/components/VerifyButton";
import { useAppContext } from "@/contexts/AppContext";
import { useState, useEffect } from "react";
import type { VerificationResults } from "@mocanetwork/air-credential-sdk";
import { LoginButton } from "@/components/common/LoginButton";
import { VERIFIER_PROGRAMS, type VerifierProgramKey } from "@/utils/constants";
import {
    storeVerification,
    getVerificationStatus,
    getUserVerifications,
    type StoredVerification
} from "@/utils/verificationStorage";
import { Header } from "@/components/Header";

export default function OnboardPage() {
    const { airService, isLoggedIn } = useAppContext();

    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [verificationStatuses, setVerificationStatuses] = useState<Record<VerifierProgramKey, boolean>>({} as Record<VerifierProgramKey, boolean>);
    const [userVerifications, setUserVerifications] = useState<Record<string, StoredVerification>>({});
    const [loading, setLoading] = useState(true);
    const [activeVerification, setActiveVerification] = useState<VerifierProgramKey | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Load user address and verification status on mount
    useEffect(() => {
        const loadUserData = async () => {
            if (!isLoggedIn || !airService) {
                setLoading(false);
                return;
            }

            try {
                // Get user address from wallet
                const provider = await airService.getProvider();
                const accounts = await provider.request({
                    method: 'eth_accounts',
                    params: []
                }) as string[];

                if (accounts && accounts.length > 0) {
                    const address = accounts[0];
                    setUserAddress(address);

                    // Load verification statuses from cookies
                    const statuses = getVerificationStatus(address);
                    setVerificationStatuses(statuses);

                    // Load full verification data
                    const verifications = getUserVerifications(address);
                    setUserVerifications(verifications);
                }
            } catch (err) {
                console.error("Error loading user data:", err);
                setErrorMessage("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [isLoggedIn, airService]);

    const handleVerificationComplete = (programKey: VerifierProgramKey, results: VerificationResults) => {
        if (!userAddress) {
            setErrorMessage("User address not available");
            return;
        }

        console.log(`Verification completed for ${programKey}:`, results);

        // Store verification in cookie
        storeVerification(userAddress, programKey, results, true);

        // Update local state
        setVerificationStatuses(prev => ({
            ...prev,
            [programKey]: true
        }));

        setUserVerifications(prev => ({
            ...prev,
            [programKey]: {
                programKey,
                programId: VERIFIER_PROGRAMS[programKey].id,
                isValid: true,
                verificationTime: Date.now(),
                results,
                userAddress
            }
        }));

        setActiveVerification(null);
        setErrorMessage(null);
    };

    const handleVerificationError = (programKey: VerifierProgramKey, error: string) => {
        console.error(`Verification error for ${programKey}:`, error);
        setErrorMessage(`${VERIFIER_PROGRAMS[programKey].displayName}: ${error}`);
        setActiveVerification(null);
    };



    const getVerificationProgress = () => {
        const completed = Object.values(verificationStatuses).filter(Boolean).length;
        const total = Object.keys(VERIFIER_PROGRAMS).length;
        return { completed, total };
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
                    <p>Loading verification data...</p>
                </div>
            </div>
        );
    }

    // Not logged in state
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-white text-center max-w-md">
                    <h1 className="text-3xl font-bold mb-4 font-cinzel">
                        Welcome to Moca Ads
                    </h1>
                    <p className="text-white/70 mb-6">
                        Please login to start verifying your credentials and unlock personalized ad experiences.
                    </p>
                    <LoginButton />
                </div>
            </div>
        );
    }

    const { completed, total } = getVerificationProgress();

    return (
        <div className="min-h-screen bg-black">
            <Header />
            <div className="max-w-4xl mt-24 mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4 font-cinzel">
                        Credential Verification
                    </h1>
                    <p className="text-white/70 text-lg mb-6">
                        Verify your credentials to unlock personalized ad experiences
                    </p>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto mb-6">
                        <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                            <span>Progress</span>
                            <span>{completed}/{total} completed</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(completed / total) * 100}%` }}
                            />
                        </div>
                    </div>

                    {userAddress && (
                        <p className="text-white/50 text-sm font-mono">
                            Address: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                        </p>
                    )}
                </div>

                {/* Error Display */}
                {errorMessage && (
                    <div className="max-w-2xl mx-auto mb-6">
                        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg">
                            <p>❌ {errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* Verification Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {Object.entries(VERIFIER_PROGRAMS).map(([key, program]) => {
                        const programKey = key as VerifierProgramKey;
                        const isVerified = verificationStatuses[programKey];
                        const isActive = activeVerification === programKey;

                        return (
                            <div
                                key={programKey}
                                className={`p-6 rounded-xl border-2 transition-all duration-300 ${isVerified
                                    ? 'bg-green-500/10 border-green-400/50'
                                    : isActive
                                        ? 'bg-blue-500/10 border-blue-400/50'
                                        : 'bg-white/5 border-white/20 hover:border-white/40'
                                    }`}
                            >
                                <div className="text-center">
                                    {/* Icon and Status */}
                                    <div className="text-4xl mb-3">
                                        {isVerified ? '✅' : program.icon}
                                    </div>

                                    <h3 className="text-white font-bold text-lg mb-2 font-cinzel">
                                        {program.displayName}
                                    </h3>

                                    <p className="text-white/70 text-sm mb-4">
                                        {program.description}
                                    </p>

                                    {/* Verification Button */}
                                    {isVerified ? (
                                        <div className="space-y-2">
                                            <div className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium">
                                                ✓ Verified
                                            </div>
                                            {userVerifications[programKey] && (
                                                <p className="text-white/50 text-xs">
                                                    {new Date(userVerifications[programKey].verificationTime).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <VerifyButton
                                            programId={program.id}
                                            onVerificationComplete={(results) => handleVerificationComplete(programKey, results)}
                                            onError={(error) => handleVerificationError(programKey, error)}
                                            text={isActive ? "Verifying..." : "Verify Now"}
                                            className={`w-full px-4 py-3 rounded-lg font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg font-cinzel ${isActive
                                                ? 'bg-blue-600/50 cursor-not-allowed'
                                                : 'hover:opacity-90'
                                                }`}
                                            style={{
                                                backgroundColor: isActive ? undefined : program.color,
                                                opacity: isActive ? 0.6 : 1
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Completion Status */}
                {completed === total && (
                    <div className="text-center">
                        <div className="max-w-md mx-auto p-6 bg-green-500/10 border border-green-400/30 rounded-xl">
                            <div className="text-4xl mb-4">🎉</div>
                            <h3 className="text-green-300 font-bold text-xl mb-2 font-cinzel">
                                All Credentials Verified!
                            </h3>
                            <p className="text-green-300/70">
                                You can now access all personalized ad features.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
