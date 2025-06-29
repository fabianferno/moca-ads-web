import { useState, useRef, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { DefaultLogin } from "./DefaultLogin";

interface NavbarProps {
    onShowOnboarding?: () => void;
    userEmail?: string;
}

export const Navbar = ({ onShowOnboarding, userEmail }: NavbarProps) => {
    const { address, isConnected, isConnecting } = useAccount();
    const { disconnect, isPending: isDisconnecting } = useDisconnect();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Format address to show first 4 and last 3 characters
    const formatAddress = (addr: string) => {
        if (!addr) return "";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex items-center space-x-2">
            {isConnected && address ? (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 px-3 py-2 bg-white text-black font-medium rounded border-2 border-black hover:bg-gray-100 transition-colors duration-200 text-sm"
                    >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-mono">
                            {formatAddress(address)}
                        </span>
                        <svg
                            className={`w-3 h-3 text-black transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white border-2 border-black rounded shadow-xl py-2 z-50">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="text-xs text-gray-600 font-medium">Wallet Connected</p>
                                <p className="text-xs font-mono text-black break-all mt-1">
                                    {address}
                                </p>
                            </div>

                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        onShowOnboarding?.();
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs text-black hover:bg-gray-100 transition-colors duration-200"
                                >
                                    Complete Profile
                                </button>
                                <button className="w-full px-4 py-2 text-left text-xs text-black hover:bg-gray-100 transition-colors duration-200">
                                    Settings
                                </button>
                                <hr className="my-1 border-gray-200" />
                                <button
                                    onClick={() => {
                                        disconnect();
                                        setIsDropdownOpen(false);
                                    }}
                                    disabled={isDisconnecting}
                                    className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDisconnecting ? "Disconnecting..." : "Disconnect Wallet"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-fit">
                    <DefaultLogin />
                </div>
            )}
        </div>
    );
};
