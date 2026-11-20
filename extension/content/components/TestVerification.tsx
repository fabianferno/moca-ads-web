import { ConnectWallet } from "./ConnectWallet";
import { useState, useEffect, useRef } from "react";
import { AirCredentialWidget, type QueryRequest, type VerificationResults } from "@mocanetwork/air-credential-sdk";
import "@mocanetwork/air-credential-sdk/dist/style.css";
import { getEnvironmentConfig } from "../config/environment";
import { VERIFIER_DID, VERIFIER_API_KEY, BUILD_ENV, PARTNER_ID } from '../utils/constants';
import { getVerifierAuthToken } from "../utils/getVerifierAuthToken";
import NavBarLogin from "./NavBarLogin";
import { useAirkit } from "../hooks/useAirkit";

export const TestVerification = () => {
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState<VerificationResults | null>(null);
    const [error, setError] = useState<string | null>(null);
    const widgetRef = useRef<AirCredentialWidget | null>(null);
    const environmentConfig = getEnvironmentConfig(BUILD_ENV);

    // Use the cleaner useAirkit hook
    const { airService, isMocaNetwork } = useAirkit();
    const isLoggedIn = airService?.isLoggedIn || false;
    const isInitialized = isMocaNetwork;

    // Configuration - these would typically come from environment variables or API
    const [config, setConfig] = useState({
        programId: "c21hh030fqlkd00t59230V",
    });

    console.log("AirService in CredentialVerification:", airService);

    // Update user address when login status changes
    useEffect(() => {
        const updateUserAddress = async () => {
            if (airService?.isLoggedIn && airService.loginResult) {
                const result = airService.loginResult;
                if (result.abstractAccountAddress) {
                    setUserAddress(result.abstractAccountAddress);
                } else {
                    try {
                        const accounts = await airService.provider.request({ method: "eth_accounts", params: [] });
                        setUserAddress(Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null);
                    } catch (err) {
                        console.error("Failed to get accounts:", err);
                        setUserAddress(null);
                    }
                }
            } else {
                setUserAddress(null);
            }
        };

        updateUserAddress();
    }, [airService?.isLoggedIn, airService?.loginResult]);

    const handleConfigChange = (field: string, value: string) => {
        setConfig((prev) => ({ ...prev, [field]: value }));
    };

    const generateWidget = async () => {
        try {
            // Step 1: Fetch the verifier auth token using the API key
            const fetchedVerifierAuthToken = await getVerifierAuthToken(VERIFIER_DID, VERIFIER_API_KEY, environmentConfig.apiUrl);

            if (!fetchedVerifierAuthToken) {
                setError("Failed to fetch verifier authentication token. Please check your API Key.");
                setIsLoading(false);
                return;
            }

            // Create the query request with the fetched token
            const queryRequest: QueryRequest = {
                process: "Verify",
                verifierAuth: fetchedVerifierAuthToken,
                programId: config.programId,
            };

            const rp = await airService?.goToPartner(environmentConfig.widgetUrl).catch((err) => {
                console.error("Error getting URL with token:", err);
            });

            console.log("rp", rp);

            if (!rp?.urlWithToken) {
                console.warn("Failed to get URL with token. Please check your partner ID.");
                setError("Failed to get URL with token. Please check your partner ID.");
                setIsLoading(false);
                return;
            }
            // Create and configure the widget with proper options
            widgetRef.current = new AirCredentialWidget(queryRequest, PARTNER_ID, {
                endpoint: rp?.urlWithToken,
                airKitBuildEnv: BUILD_ENV,
                theme: "light", // currently only have light theme
                locale: "en",
                redirectUrlForIssuer: "https://air-credential-example.netlify.app/issue",
            });

            // Set up event listeners
            widgetRef.current.on("verifyCompleted", (results: VerificationResults) => {
                setVerificationResult(results);
                setIsLoading(false);
                console.log("Verification completed:", results);
            });

            widgetRef.current.on("close", () => {
                setIsLoading(false);
                console.log("Widget closed");
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create widget");
            setIsLoading(false);
        }
    };

    const handleVerifyCredential = async () => {
        setIsLoading(true);
        setError(null);
        setVerificationResult(null);

        try {
            // Generate widget if not already created
            if (!widgetRef.current) {
                await generateWidget();
            }

            // Start the widget
            if (widgetRef.current) {
                widgetRef.current.launch();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setVerificationResult(null);
        setError(null);
        if (widgetRef.current) {
            widgetRef.current.destroy();
            widgetRef.current = null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Compliant":
                return "text-green-800 bg-green-50 border-green-200";
            case "Non-Compliant":
                return "text-red-800 bg-red-50 border-red-200";
            case "Pending":
                return "text-yellow-800 bg-yellow-50 border-yellow-200";
            case "Revoking":
            case "Revoked":
                return "text-orange-800 bg-orange-50 border-orange-200";
            case "Expired":
                return "text-gray-800 bg-gray-50 border-gray-200";
            case "NotFound":
                return "text-purple-800 bg-purple-50 border-purple-200";
            default:
                return "text-gray-800 bg-gray-50 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Compliant":
                return "✅";
            case "Non-Compliant":
                return "❌";
            case "Pending":
                return "⏳";
            case "Revoking":
                return "🔄";
            case "Revoked":
                return "🚫";
            case "Expired":
                return "⏰";
            case "NotFound":
                return "🔍";
            default:
                return "❓";
        }
    };

    const getStatusDescription = (status: string) => {
        switch (status) {
            case "Compliant":
                return "The credential is valid and meets all verification requirements.";
            case "Non-Compliant":
                return "The credential does not meet the verification requirements.";
            case "Pending":
                return "The credential is waiting for confirmation on the blockchain.";
            case "Revoking":
                return "The credential is currently being revoked.";
            case "Revoked":
                return "The credential has been revoked and is no longer valid.";
            case "Expired":
                return "The credential has expired and is no longer valid.";
            case "NotFound":
                return "No credential was found matching the verification criteria.";
            default:
                return "Unknown verification status.";
        }
    };

    useEffect(() => {
        return () => {
            if (widgetRef.current) {
                widgetRef.current.destroy();
            }
        };
    }, []);


    const handleLogin = async () => {
        if (!airService) return;
        setIsLoading(true);
        try {
            const loginResult = await airService.login();

            if (loginResult.abstractAccountAddress) {
                setUserAddress(loginResult.abstractAccountAddress || null);
            } else {
                const accounts = await airService?.provider.request({ method: "eth_accounts", params: [] });
                setUserAddress(Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null);
            }
        } catch (err) {
            console.error("Login failed:", err);

            // Handle CSP/iframe errors
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (errorMessage.includes('frame') || errorMessage.includes('CSP') || errorMessage.includes('ancestor')) {
                setError("Authentication blocked by browser security policy. Please try refreshing the page or contact support.");
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        if (!airService) return;
        try {
            await airService.logout();
            setUserAddress(null);
        } catch (err) {
            console.error("Logout error:", err);
        }
    };


    return <div className="h-[calc(100vh-100px)] rounded-2xl bg-white overflow-y-auto border-2 border-black p-10 shadow-xl">
        <div className="max-w-2xl mx-auto">
            <div className="">
                <div className="flex justify-between mb-6">
                    <h2 className="text-3xl font-black max-w-md text-black mb-2">
                        Verify your creds to be eligible for moca ads rewards
                    </h2>
                    {/* <ConnectWallet /> */}
                    <NavBarLogin
                        isLoading={isLoading}
                        isInitialized={isInitialized}
                        isLoggedIn={isLoggedIn}
                        userAddress={userAddress}
                        onLogin={handleLogin}
                        onLogout={handleLogout}
                    />
                </div>

                <main>
                    <div className="flex-1">
                        <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
                            <div className="mb-4 sm:mb-6 lg:mb-8">
                                <h2 className="text-2xl sm:text-3xl font-bold text-verify-700 mb-2 sm:mb-4">Credential Verification</h2>
                                <p className="text-gray-600 text-sm sm:text-base">
                                    Verify digital credentials using the AIR Credential SDK. Configure the verification parameters below and Start the widget to begin the
                                    verification process.
                                </p>
                            </div>

                            {/* Configuration Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Program ID</label>
                                    <input
                                        type="text"
                                        value={config.programId}
                                        onChange={(e) => handleConfigChange("programId", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        placeholder="program-123"
                                    />
                                </div>
                            </div>
                            {/* Environment Info */}
                            <div className="mb-6 mt-3 sm:mb-8 p-2 sm:p-4 bg-gray-50 border border-gray-200 rounded-md">
                                <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Environment Configuration:</h4>
                                <div className="text-xs text-gray-700 space-y-1">
                                    <p>
                                        <strong>Widget URL:</strong> {environmentConfig.widgetUrl}
                                    </p>
                                    <p>
                                        <strong>API URL:</strong> {environmentConfig.apiUrl}
                                    </p>
                                </div>
                            </div>

                            {/* Status Messages */}
                            {error && (
                                <div className="mb-4 sm:mb-6 p-2 sm:p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-800 text-xs sm:text-base">{error}</p>
                                </div>
                            )}

                            {/* Verification Results */}
                            {verificationResult && (
                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">Verification Results</h3>
                                    <div className="p-2 sm:p-4 border rounded-md">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Verification Result</h4>
                                            <span
                                                className={`mt-2 sm:mt-0 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                                                    verificationResult.status
                                                )}`}
                                            >
                                                {getStatusIcon(verificationResult.status)} {verificationResult.status}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{getStatusDescription(verificationResult.status)}</p>
                                        <pre className="text-xs text-gray-500 bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(verificationResult, null, 2)}</pre>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                <button
                                    onClick={handleVerifyCredential}
                                    disabled={isLoading || !isLoggedIn}
                                    className="w-full cursor-pointer sm:flex-1 bg-black text-white px-4 sm:px-6 py-3 rounded-md font-medium hover:bg-verify-700 focus:outline-none focus:ring-2 focus:ring-verify-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Launching Widget...
                                        </span>
                                    ) : (
                                        "Start Credential Verification Widget"
                                    )}
                                </button>

                                {verificationResult && (
                                    <button
                                        onClick={handleReset}
                                        className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-verify-300 text-verify-700 rounded-md font-medium hover:bg-verify-50 focus:outline-none focus:ring-2 focus:ring-verify-500 focus:ring-offset-2 transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>
};
