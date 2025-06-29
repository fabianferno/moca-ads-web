"use client"

import Link from "next/link"
import { useAccount } from "wagmi"
import { useMemo } from "react"
import { DefaultLogin } from "@/components/DefaultLogin"
import { useIsOperator } from "@/components/hooks/useMocaAds"
import { Settings } from "lucide-react"

export const Header = () => {
    const { address, isConnected } = useAccount()
    const isOperator = useIsOperator()

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

    return (
        <header className="sticky top-0 z-40 w-full border-b-8 border-black bg-primary">
            <div className="container flex h-20 items-center justify-between">
                <Link href="/" className="flex items-center gap-6">
                    <div className="flex items-center">
                        <div className="h-12 w-12 bg-yellow-500 border-4 border-black rotate-12"></div>
                        <div className="h-12 w-12 bg-blue-600 border-4 border-black -ml-6 -rotate-12"></div>
                        <span className="font-black text-2xl tracking-tighter ml-4 text-white">MOCA ADS</span>
                    </div>
                </Link>
                <nav className="flex items-center gap-4">
                    <DefaultLogin />
                    <Link
                        href="/ads"
                        className="bg-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        ALL ADS
                    </Link>
                    <Link
                        href="/my-ads"
                        className="bg-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        MY ADS
                    </Link>
                    <Link
                        href="/issue"
                        className="bg-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        ISSUE
                    </Link>
                    {isAuthorizedOperator ? (
                        <Link
                            href="/operator"
                            className="bg-red-500 text-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
                        >
                            <Settings className="h-4 w-4" />
                            OPERATOR
                        </Link>
                    ) : null}
                    <Link
                        href="/create"
                        className="bg-yellow-500 border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        CREATE AD
                    </Link>
                </nav>
            </div>
        </header>
    )
}