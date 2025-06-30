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
import { useUserStats, useClaimUserRewards, formatMocaAmount } from "@/hooks/useMocaAds";
import Link from "next/link";

export default function OnboardPage() {
    const { airService, isLoggedIn } = useAppContext();

    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [verificationStatuses, setVerificationStatuses] = useState<Record<VerifierProgramKey, boolean>>({} as Record<VerifierProgramKey, boolean>);
    const [userVerifications, setUserVerifications] = useState<Record<string, StoredVerification>>({});
    const [loading, setLoading] = useState(true);
    const [activeVerification, setActiveVerification] = useState<VerifierProgramKey | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Contract hooks for user rewards
    const { data: userStats } = useUserStats(userAddress || undefined);
    const { claimUserRewards, isPending: isClaimPending, isSuccess: isClaimSuccess, error: claimError } = useClaimUserRewards();

    // Mock data for fallback
    const mockUserStats = {
        totalEarnings: BigInt("2500000000000000000"), // 2.5 MOCA
        totalViews: BigInt("1250"), // 1,250 views
        claimableRewards: BigInt("750000000000000000"), // 0.75 MOCA
    };

    // Use real data if available, otherwise use mock data
    const displayStats = userStats && (userStats.totalEarnings > 0 || userStats.totalViews > 0)
        ? userStats
        : mockUserStats;

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

    const handleClaimRewards = async () => {
        try {
            await claimUserRewards();
        } catch (error) {
            console.error('Error claiming rewards:', error);
        }
    };

    const getVerificationProgress = () => {
        const completed = Object.values(verificationStatuses).filter(Boolean).length;
        const total = Object.keys(VERIFIER_PROGRAMS).length;
        return { completed, total };
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="bg-white border-8 border-black p-8 shadow-brutal">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mb-4 mx-auto"></div>
                        <div className="text-2xl font-black uppercase">LOADING VERIFICATION DATA...</div>
                    </div>
                </div>
            </div>
        );
    }

    // Not logged in state
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container py-12">
                    <div className="text-center py-24">
                        <h1 className="text-5xl font-black tracking-tighter uppercase mb-8">CONNECT WALLET</h1>
                        <p className="text-xl font-mono mb-8">Connect your wallet to start verifying credentials</p>
                        <LoginButton />
                    </div>
                </main>
            </div>
        );
    }

    const { completed, total } = getVerificationProgress();

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container py-12">
                <div className="space-y-8">
                    {/* Header Section */}
                    <div className="space-y-4 text-center">
                        <h1 className="text-6xl font-black tracking-tighter uppercase">Monetize your credential for MONIES💸🤑</h1>
                        <p className="text-xl font-mono max-w-4xl mx-auto">Verify your credentials with the following programs to unlock personalized ad experiences and get paid for your views</p>
                    </div>

                    {/* How It Works Section */}
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white border-8 border-black p-8 shadow-brutal">
                        <div className="text-center space-y-6">
                            <h2 className="text-4xl font-black uppercase">🚀 How You Earn FREE MONEY 💰</h2>
                            <div className="grid gap-6 md:grid-cols-4">
                                <div className="bg-white text-black border-4 border-black p-4 shadow-brutal">
                                    <div className="text-4xl mb-2">1️⃣</div>
                                    <h3 className="text-xl font-black uppercase mb-2">Connect Wallet</h3>
                                    <p className="text-sm font-mono">Link your web3 wallet to get started</p>
                                </div>
                                <div className="bg-white text-black border-4 border-black p-4 shadow-brutal">
                                    <div className="text-4xl mb-2">2️⃣</div>
                                    <h3 className="text-xl font-black uppercase mb-2">Verify Identity</h3>
                                    <p className="text-sm font-mono">Complete secure verification process</p>
                                </div>
                                <div className="bg-white text-black border-4 border-black p-4 shadow-brutal">
                                    <div className="text-4xl mb-2">3️⃣</div>
                                    <h3 className="text-xl font-black uppercase mb-2">Browse Web</h3>
                                    <p className="text-sm font-mono">See targeted ads while browsing</p>
                                </div>
                                <div className="bg-white text-black border-4 border-black p-4 shadow-brutal">
                                    <div className="text-4xl mb-2">4️⃣</div>
                                    <h3 className="text-xl font-black uppercase mb-2">Earn Rewards</h3>
                                    <p className="text-sm font-mono">Get paid for your attention</p>
                                </div>
                            </div>
                            <div className="bg-yellow-500 text-black border-4 border-black p-6 shadow-brutal mx-auto max-w-3xl">
                                <h3 className="text-2xl font-black uppercase mb-3">🔥 Install Our Chrome Extension 🔥</h3>
                                <p className="text-lg font-mono mb-4">
                                    Once you install our Chrome extension and complete verification, you&apos;ll automatically start earning MOCA tokens just by browsing the web! Every ad you see = FREE MONEY in your wallet! 💸
                                </p>
                                <Link target="_blank" href="https://github.com/fabianferno/moca-ads-extension" className="bg-red-600 text-white border-4 border-black px-8 py-3 font-black text-lg shadow-brutal hover:translate-y-1 hover:shadow-none transition-all uppercase">
                                    INSTALL EXTENSION
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* User Rewards Section */}
                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="bg-green-500 text-white border-8 border-black p-6 shadow-brutal">
                            <div className="space-y-2">
                                <div className="text-3xl font-black">{formatMocaAmount(displayStats.totalEarnings)}</div>
                                <div className="text-sm font-mono uppercase">Total Earned</div>
                            </div>
                        </div>
                        <div className="bg-blue-600 text-white border-8 border-black p-6 shadow-brutal">
                            <div className="space-y-2">
                                <div className="text-3xl font-black">{displayStats.totalViews.toString()}</div>
                                <div className="text-sm font-mono uppercase">Total Ad Views</div>
                            </div>
                        </div>
                        <div className="bg-purple-600 text-white border-8 border-black p-6 shadow-brutal">
                            <div className="space-y-2">
                                <div className="text-3xl font-black">{formatMocaAmount(displayStats.claimableRewards)}</div>
                                <div className="text-sm font-mono uppercase">Claimable Rewards</div>
                            </div>
                        </div>
                        <div className="bg-white border-8 border-black p-6 shadow-brutal">
                            <div className="space-y-4">
                                <div className="text-sm font-mono uppercase text-gray-600 text-center">Actions</div>
                                <button
                                    onClick={handleClaimRewards}
                                    disabled={isClaimPending || displayStats.claimableRewards <= 0}
                                    className={`w-full border-4 border-black px-4 py-2 font-black text-sm shadow-brutal hover:translate-y-1 hover:shadow-none transition-all uppercase ${isClaimPending || displayStats.claimableRewards <= 0
                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                        : 'bg-yellow-500 text-black hover:bg-yellow-600'
                                        }`}
                                >
                                    {isClaimPending ? 'CLAIMING...' : 'CLAIM REWARDS'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="bg-white border-8 border-black p-6 shadow-brutal">
                            <div className="space-y-2">
                                <div className="text-3xl font-black">{completed}</div>
                                <div className="text-sm font-mono uppercase">Verified</div>
                            </div>
                        </div>
                        <div className="bg-blue-600 text-white border-8 border-black p-6 shadow-brutal">
                            <div className="space-y-2">
                                <div className="text-3xl font-black">{total - completed}</div>
                                <div className="text-sm font-mono uppercase">Remaining</div>
                            </div>
                        </div>
                        <div className="bg-yellow-500 border-8 border-black p-6 shadow-brutal">
                            <div className="space-y-2">
                                <div className="text-3xl font-black">{Math.round((completed / total) * 100)}%</div>
                                <div className="text-sm font-mono uppercase">Progress</div>
                            </div>
                        </div>
                    </div>

                    {/* User Address */}
                    {userAddress && (
                        <div className="bg-gray-100 border-8 border-black p-4 shadow-brutal">
                            <div className="text-sm font-mono uppercase text-gray-600">Wallet Address</div>
                            <div className="text-lg font-black font-mono">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</div>
                        </div>
                    )}

                    {/* Success/Error Messages */}
                    {isClaimSuccess && (
                        <div className="bg-green-600 text-white border-8 border-black p-6 shadow-brutal">
                            <div className="text-xl font-black uppercase mb-2">SUCCESS</div>
                            <div className="font-mono">Rewards claimed successfully!</div>
                        </div>
                    )}

                    {(errorMessage || claimError) && (
                        <div className="bg-red-600 text-white border-8 border-black p-6 shadow-brutal">
                            <div className="text-xl font-black uppercase mb-2">ERROR</div>
                            <div className="font-mono">{errorMessage || claimError?.message}</div>
                        </div>
                    )}

                    {/* Verification Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(VERIFIER_PROGRAMS).map(([key, program]) => {
                            const programKey = key as VerifierProgramKey;
                            const isVerified = verificationStatuses[programKey];
                            const isActive = activeVerification === programKey;

                            return (
                                <div
                                    key={programKey}
                                    className={`border-8 border-black p-6 shadow-brutal ${isVerified
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white'
                                        }`}
                                >
                                    <div className="space-y-4">
                                        {/* Icon and Status */}
                                        <div className="text-center">
                                            <div className="text-4xl mb-3">
                                                {isVerified ? '✅' : program.icon}
                                            </div>
                                            <h3 className="text-2xl font-black uppercase mb-2">
                                                {program.displayName}
                                            </h3>
                                            <p className={`font-mono text-sm ${isVerified ? 'text-white/90' : 'text-gray-600'}`}>
                                                {program.description}
                                            </p>
                                        </div>

                                        {/* Verification Status/Button */}
                                        {isVerified ? (
                                            <div className="space-y-2">
                                                <div className="bg-white text-green-600 border-4 border-black px-4 py-2 text-center font-black uppercase">
                                                    VERIFIED
                                                </div>
                                                {userVerifications[programKey] && (
                                                    <div className="text-center">
                                                        <div className="text-xs font-mono text-white/80">
                                                            {new Date(userVerifications[programKey].verificationTime).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <VerifyButton
                                                programId={program.id}
                                                onVerificationComplete={(results) => handleVerificationComplete(programKey, results)}
                                                onError={(error) => handleVerificationError(programKey, error)}
                                                text={isActive ? "VERIFYING..." : "VERIFY NOW"}
                                                className={`w-full border-4 border-black px-4 py-3 font-black text-lg shadow-brutal hover:translate-y-1 hover:shadow-none transition-all uppercase ${isActive
                                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                    : 'bg-red-600 text-white hover:bg-red-700'
                                                    }`}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Coming Soon Card */}
                        <div className="bg-gray-100 border-8 border-black p-6 shadow-brutal">
                            <div className="space-y-4">
                                {/* Icon and Status */}
                                <div className="text-center">
                                    <div className="text-4xl mb-3">🚀</div>
                                    <h3 className="text-2xl font-black uppercase mb-2">
                                        MORE COMING SOON
                                    </h3>
                                    <p className="font-mono text-sm text-gray-600">
                                        Additional credential verification programs will be available soon
                                    </p>
                                </div>

                                {/* Coming Soon Badge */}
                                <div className="space-y-2">
                                    <div className="bg-gray-400 text-gray-700 border-4 border-black px-4 py-2 text-center font-black uppercase">
                                        COMING SOON
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-mono text-gray-500">
                                            Stay tuned for more verification options
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completion Status */}
                    {completed === total && (
                        <div className="bg-green-500 text-white border-8 border-black p-8 shadow-brutal">
                            <div className="text-center space-y-4">
                                <div className="text-6xl">🎉</div>
                                <h3 className="text-3xl font-black uppercase">
                                    ALL CREDENTIALS VERIFIED!
                                </h3>
                                <p className="text-xl font-mono">
                                    You can now access all personalized ad features.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
