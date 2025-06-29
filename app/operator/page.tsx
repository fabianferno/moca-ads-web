"use client";

import { useAccount } from "wagmi";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { OperatorDashboard } from "@/components/OperatorDashboard";
import { useIsOperator } from "@/components/hooks/useMocaAds";

export default function OperatorPage() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const isOperator = useIsOperator();

    // Check if user is authorized operator
    const isAuthorizedOperator = useMemo(() => {
        const operatorWallet = process.env.NEXT_PUBLIC_OPERATOR_WALLET;
        return (
            isConnected &&
            address &&
            operatorWallet &&
            address.toLowerCase() === operatorWallet.toLowerCase()
        ) || isOperator;
    }, [address, isConnected, isOperator]);

    // Redirect if not authorized
    useEffect(() => {
        if (!isConnected) {
            router.push("/?error=wallet-not-connected");
        } else if (isConnected && !isAuthorizedOperator) {
            router.push("/?error=unauthorized");
        }
    }, [isConnected, isAuthorizedOperator, router]);

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container py-12">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-yellow-100 border-4 border-black p-8 shadow-brutal">
                            <h1 className="text-3xl font-black mb-4">WALLET NOT CONNECTED</h1>
                            <p className="text-lg font-bold">
                                Please connect your wallet to access the operator dashboard.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!isAuthorizedOperator) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container py-12">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-red-100 border-4 border-black p-8 shadow-brutal">
                            <h1 className="text-3xl font-black mb-4">UNAUTHORIZED ACCESS</h1>
                            <p className="text-lg font-bold mb-4">
                                Only the authorized operator can access this dashboard.
                            </p>
                            <div className="font-mono text-sm text-gray-600 break-all">
                                Your wallet: {address}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container py-8">
                <div className="mb-8">
                    <h1 className="text-5xl font-black mb-4 text-center">
                        OPERATOR DASHBOARD
                    </h1>
                    <p className="text-center text-lg font-bold text-gray-600">
                        Manage MocaAds platform operations
                    </p>
                </div>
                <OperatorDashboard />
            </main>
        </div>
    );
} 