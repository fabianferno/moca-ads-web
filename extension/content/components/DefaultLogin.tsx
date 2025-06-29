"use client";
import { useConnect } from "wagmi";
import { useConfig } from "wagmi";
import { Button } from "./Button";

export const DefaultLogin = () => {
    const { connect, isPending: isConnecting } = useConnect();
    const config = useConfig();
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
                className="px-4 py-2 bg-white text-black font-medium rounded border-2 border-black hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                    "Connect Wallet"
                )}
            </Button>
        </div>
    );
};
