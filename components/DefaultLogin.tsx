"use client";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { useConfig } from "wagmi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { Copy, LogOut, Wallet } from "lucide-react";

export const DefaultLogin = () => {
    const { connect, isPending: isConnecting } = useConnect();
    const config = useConfig();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { data: balance, isLoading: balanceLoading } = useBalance({
        address: address,
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            toast.success("Address copied to clipboard");
        }
        setDropdownOpen(false);
    };

    const handleDisconnect = () => {
        disconnect();
        setDropdownOpen(false);
        toast.success("Wallet disconnected");
    };

    if (isConnected) {
        return (
            <div className="relative w-fit" ref={dropdownRef}>
                <Button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="bg-white text-2xl py-5 font-black text-black border-4 border-black px-4 shadow-brutal hover:translate-y-1 hover:shadow-none transition-all uppercase"
                >
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                </Button>

                {dropdownOpen && (
                    <div className="absolute top-full mt-2 right-0 w-64 bg-white border-4 border-black shadow-brutal z-50">
                        <div className="p-4 space-y-3">
                            {/* Balance display */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold uppercase text-gray-600">
                                    WALLET BALANCE
                                </div>
                                <div className="bg-green-100 p-3 border-2 border-black flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-green-600" />
                                    <div className="font-bold text-lg">
                                        {balanceLoading ? (
                                            <span className="animate-pulse">Loading...</span>
                                        ) : (
                                            <span className="font-mono">
                                                {balance ?
                                                    `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                                                    : '0.0000 MOCA'
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Full address display */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold uppercase text-gray-600">
                                    WALLET ADDRESS
                                </div>
                                <div className="font-mono text-sm break-all bg-gray-100 p-2 border-2 border-black">
                                    {address}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="space-y-2">
                                <Button
                                    onClick={handleCopyAddress}
                                    className="w-full bg-blue-500 text-white font-bold border-2 border-black shadow-brutal hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    <Copy className="h-4 w-4" />
                                    COPY ADDRESS
                                </Button>

                                <Button
                                    onClick={handleDisconnect}
                                    className="w-full bg-red-500 text-white font-bold border-2 border-black shadow-brutal hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    DISCONNECT
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-fit">
            <Button
                onClick={() => {
                    const airConnector = config.connectors.find(
                        (connector) => connector?.isMocaNetwork
                    );
                    connect({
                        connector: airConnector!,
                    });
                }}
                disabled={isConnecting}
                className="bg-white text-2xl py-5 font-black text-black border-4 border-black px-4 shadow-brutal hover:translate-y-1 hover:shadow-none transition-all uppercase"
            >
                {isConnecting ? (
                    <div className="flex items-center justify-center">
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Connecting...
                    </div>
                ) : (
                    "LOG IN"
                )}
            </Button>
        </div>
    );
};
