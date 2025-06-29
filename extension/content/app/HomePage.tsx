import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Navbar } from '../components/Navbar'
import { CredentialsForm } from '../components/CredentialsForm'

interface HomePageProps {
    setIsDialogOpen: (isOpen: boolean) => void
}

interface UserProfile {
    credentials?: any;
    hasCompletedOnboarding?: boolean;
}

export const HomePage = ({ setIsDialogOpen }: HomePageProps) => {
    const [userProfile, setUserProfile] = useState<UserProfile>({ hasCompletedOnboarding: false });
    const [showOnboarding, setShowOnboarding] = useState(false);

    const {
        address,
        chainId,
        isConnected,
        isReconnecting,
        isConnecting: isAccountConnecting,
    } = useAccount();

    const handleOnboardingSubmit = (credentialsData: any) => {
        setUserProfile({
            credentials: credentialsData,
            hasCompletedOnboarding: true
        });
        setShowOnboarding(false);
    };

    // Show onboarding form if connected but hasn't completed onboarding
    if (isConnected && (showOnboarding || !userProfile.hasCompletedOnboarding)) {
        return (
            <div className="h-screen flex flex-col bg-white relative">
                {/* Close Button */}
                <button
                    onClick={() => setIsDialogOpen(false)}
                    className="absolute cursor-pointer top-4 right-4 z-50 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-black transition-colors duration-200"
                    title="Close Extension"
                >
                    ✕
                </button>

                <div className="flex-1">
                    <Navbar
                        onShowOnboarding={() => setShowOnboarding(true)}
                    />
                    <CredentialsForm
                        onSubmit={handleOnboardingSubmit}
                        onCancel={() => setShowOnboarding(false)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-white relative">
            {/* Close Button */}
            <button
                onClick={() => setIsDialogOpen(false)}
                className="absolute top-4 right-4 z-50 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-black transition-colors duration-200"
                title="Close Extension"
            >
                ✕
            </button>

            <Navbar
                onShowOnboarding={() => setShowOnboarding(true)}
            />

            <div className="flex-1 p-8 overflow-y-auto">
                {isConnected && userProfile.hasCompletedOnboarding ? (
                    // Dashboard view for connected users with completed onboarding
                    <div className="grid lg:grid-cols-2 gap-8 h-full">
                        {/* Left Side - Main Content */}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-6xl font-black text-black leading-tight mb-6">
                                DECENTRALIZED
                                <br />
                                <span className="text-blue-600">ADVERTISING</span>
                                <br />
                                PROTOCOL
                            </h1>

                            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                                Your profile is complete! Track your personalized ads and earnings.
                            </p>

                            <div className="flex gap-4">
                                <button className="px-8 py-4 bg-red-500 text-white font-bold rounded hover:bg-red-600 transition-colors duration-200 border-2 border-black">
                                    VIEW MY ADS →
                                </button>
                                <button
                                    onClick={() => setShowOnboarding(true)}
                                    className="px-8 py-4 bg-white text-black font-bold rounded border-2 border-black hover:bg-gray-100 transition-colors duration-200"
                                >
                                    EDIT PROFILE
                                </button>
                            </div>
                        </div>

                        {/* Right Side - Live Stats */}
                        <div className="bg-black rounded-2xl p-6">
                            <div className="bg-yellow-400 text-black font-black text-center py-3 mb-6 rounded">
                                LIVE STATS
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-500 text-white p-6 rounded text-center">
                                    <div className="text-3xl font-black">5</div>
                                    <div className="text-sm font-medium">YOUR ADS</div>
                                </div>

                                <div className="bg-red-500 text-white p-6 rounded text-center">
                                    <div className="text-3xl font-black">12</div>
                                    <div className="text-sm font-medium">VIEWS TODAY</div>
                                </div>

                                <div className="bg-cyan-400 text-black p-6 rounded text-center">
                                    <div className="text-3xl font-black">$24</div>
                                    <div className="text-sm font-medium">EARNINGS</div>
                                </div>

                                <div className="bg-purple-500 text-white p-6 rounded text-center">
                                    <div className="text-3xl font-black">100%</div>
                                    <div className="text-sm font-medium">ACTIVE</div>
                                </div>
                            </div>

                            {/* Profile Summary */}
                            <div className="mt-6 bg-gray-800 rounded p-4">
                                <h3 className="text-yellow-400 font-bold mb-3">PROFILE DATA</h3>
                                <div className="space-y-2 text-sm text-white">
                                    <div className="flex justify-between">
                                        <span>Region:</span>
                                        <span>{userProfile.credentials?.region || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Budget:</span>
                                        <span>${userProfile.credentials?.budgetAmount || '0'}/month</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Crypto User:</span>
                                        <span>{userProfile.credentials?.isCryptoUser ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Wallet Status */}
                            <div className="mt-4 bg-green-800 rounded p-4">
                                <h3 className="text-green-300 font-bold mb-2 flex items-center">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                    WALLET CONNECTED
                                </h3>
                                <div className="text-xs text-green-200">
                                    <div className="flex justify-between mb-1">
                                        <span>Address:</span>
                                        <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Chain:</span>
                                        <span>{chainId}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Landing view for non-connected users
                    <div className="grid lg:grid-cols-2 gap-8 h-full">
                        {/* Left Side - Main Content */}
                        <div className="flex flex-col justify-center">
                            <h1 className="text-6xl font-black text-black leading-tight mb-6">
                                DECENTRALIZED
                                <br />
                                <span className="text-blue-600">ADVERTISING</span>
                                <br />
                                PROTOCOL
                            </h1>

                            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                                Connect advertisers directly with publishers. No middlemen. Pure web3.
                            </p>

                            <div className="flex gap-4">
                                <button className="px-8 py-4 bg-red-500 text-white font-bold rounded hover:bg-red-600 transition-colors duration-200 border-2 border-black">
                                    START ADVERTISING →
                                </button>
                                <button className="px-8 py-4 bg-white text-black font-bold rounded border-2 border-black hover:bg-gray-100 transition-colors duration-200">
                                    REGISTER PROPERTY
                                </button>
                            </div>
                        </div>

                        {/* Right Side - Live Stats */}
                        <div className="bg-black rounded-2xl p-6">
                            <div className="bg-yellow-400 text-black font-black text-center py-3 mb-6 rounded">
                                LIVE STATS
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-500 text-white p-6 rounded text-center">
                                    <div className="text-3xl font-black">1,247</div>
                                    <div className="text-sm font-medium">ACTIVE ADS</div>
                                </div>

                                <div className="bg-red-500 text-white p-6 rounded text-center">
                                    <div className="text-3xl font-black">892</div>
                                    <div className="text-sm font-medium">PUBLISHERS</div>
                                </div>

                                <div className="bg-cyan-400 text-black p-6 rounded text-center">
                                    <div className="text-3xl font-black">$2.4M</div>
                                    <div className="text-sm font-medium">TOTAL REWARDS</div>
                                </div>

                                <div className="bg-purple-500 text-white p-6 rounded text-center">
                                    <div className="text-3xl font-black">99.9%</div>
                                    <div className="text-sm font-medium">UPTIME</div>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-gray-400 text-sm mb-4">
                                    Connect your wallet to get started
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}