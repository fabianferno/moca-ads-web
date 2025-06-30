"use client";

import { useAccount } from "wagmi";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { OperatorDashboard } from "@/components/OperatorDashboard";
import { useIsOperator } from "@/hooks/useMocaAds";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
                {/* Navigation */}
                <header className="sticky top-0 z-40 w-full border-b-8 border-black bg-primary">
                    <div className="container flex h-20 items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center">
                                <div className="h-12 w-12 bg-yellow-500 border-4 border-black rotate-12"></div>
                                <div className="h-12 w-12 bg-blue-600 border-4 border-black -ml-6 -rotate-12"></div>
                                <span className="font-black text-2xl tracking-tighter ml-4 text-white">MOCA ADS</span>
                            </Link>
                        </div>
                        <nav className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="bg-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                BACK
                            </Link>
                        </nav>
                    </div>
                </header>
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
                {/* Navigation */}
                <header className="sticky top-0 z-40 w-full border-b-8 border-black bg-primary">
                    <div className="container flex h-20 items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center">
                                <div className="h-12 w-12 bg-yellow-500 border-4 border-black rotate-12"></div>
                                <div className="h-12 w-12 bg-blue-600 border-4 border-black -ml-6 -rotate-12"></div>
                                <span className="font-black text-2xl tracking-tighter ml-4 text-white">MOCA ADS</span>
                            </Link>
                        </div>
                        <nav className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="bg-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                BACK
                            </Link>
                        </nav>
                    </div>
                </header>
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
            {/* Navigation */}
            <header className="sticky top-0 z-40 w-full border-b-8 border-black bg-primary">
                <div className="container flex h-20 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center">
                            <div className="h-12 w-12 bg-yellow-500 border-4 border-black rotate-12"></div>
                            <div className="h-12 w-12 bg-blue-600 border-4 border-black -ml-6 -rotate-12"></div>
                            <span className="font-black text-2xl tracking-tighter ml-4 text-white">MOCA ADS</span>
                        </Link>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="bg-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            BACK
                        </Link>
                    </nav>
                </div>
            </header>
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