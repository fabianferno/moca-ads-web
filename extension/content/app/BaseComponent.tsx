'use client'

import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectWallet } from '../components/ConnectWallet'
import { getUserCredentials, hasVerifiedCredentials, getMockUsers } from '../utils/userCredentials'
import { adInjector } from '../utils/adInjector'
import type { UserCredentials } from '../utils/userCredentials'

interface BaseComponentProps {
    setIsDialogOpen: (isOpen: boolean) => void
    adsEnabled: boolean
    injectedAdsCount: number
    onToggleAds: () => void
    onReinjectAds: () => void
}

export const BaseComponent = ({
    setIsDialogOpen,
    adsEnabled,
    injectedAdsCount,
    onToggleAds,
    onReinjectAds
}: BaseComponentProps) => {
    const [userCredentials, setUserCredentials] = useState<UserCredentials | null>(null);
    const [showDemoSelector, setShowDemoSelector] = useState(false);

    const {
        address,
        chainId,
        isConnected,
        isReconnecting,
        isConnecting: isAccountConnecting,
    } = useAccount();

    const { disconnect } = useDisconnect();

    // Check for user credentials when wallet connects
    useEffect(() => {
        if (address) {
            console.log('MOCA Ads: Checking credentials for connected wallet:', address);

            // TODO: In production, this should check actual cookies
            // For now, using mock implementation
            const credentials = getUserCredentials(address);

            if (credentials) {
                setUserCredentials(credentials);
                // Update ad injector with user address for targeted ads
                adInjector.setUserAddress(address);
                console.log('MOCA Ads: Found verified credentials for user:', credentials);
            } else {
                console.log('MOCA Ads: No verified credentials found for user');
                setUserCredentials(null);
                adInjector.setUserAddress(null);
            }
        } else {
            setUserCredentials(null);
            adInjector.setUserAddress(null);
        }
    }, [address]);

    // Demo function to test different user credentials
    const selectDemoUser = (demoAddress: string) => {
        const credentials = getUserCredentials(demoAddress);
        if (credentials) {
            setUserCredentials(credentials);
            adInjector.setUserAddress(demoAddress);
            console.log('MOCA Ads: Selected demo user:', credentials);
        }
        setShowDemoSelector(false);
    };

    return (
        <div className="h-screen flex flex-col relative">
            {/* Close Button */}
            <button
                onClick={() => setIsDialogOpen(false)}
                className="cursor-pointer absolute top-4 right-4 z-50 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-black transition-colors duration-200"
                title="Close Extension"
            >
                ✕
            </button>

            <div className="flex-1 p-8 overflow-y-auto">
                {isConnected && userCredentials ? (
                    // User is connected and has verified credentials
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8">
                        <div style={{ border: '4px solid black', borderRadius: '10px', padding: '30px', maxWidth: '1000px' }}>
                            <div className="text-start mb-8">
                                <h1 className="text-4xl font-black text-black leading-tight mb-2">
                                    WELCOME BACK!
                                </h1>
                                <p className="text-lg text-green-700 font-medium mb-6">
                                    ✓ Wallet Connected & Credentials Verified
                                </p>
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    Your wallet is connected and we've found your verified credentials.
                                    MOCA Ads is now showing you personalized, targeted advertisements across the web.
                                </p>
                            </div>

                            {/* User Credentials Display */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-8">
                                <h3 className="text-xl font-bold text-black mb-4">Your Profile</h3>
                                <div className="grid grid-cols-2 gap-4 text-base">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium">Wallet:</span>
                                        <span className="font-mono text-black">
                                            {userCredentials.userAddress.slice(0, 6)}...{userCredentials.userAddress.slice(-4)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium">Age 18+:</span>
                                        <span className={`font-bold ${userCredentials.above18 ? 'text-green-600' : 'text-red-600'}`}>
                                            {userCredentials.above18 ? '✓ Yes' : '✗ No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium">US Resident:</span>
                                        <span className={`font-bold ${userCredentials.isUSResident ? 'text-blue-600' : 'text-gray-600'}`}>
                                            {userCredentials.isUSResident ? '✓ Yes' : '✗ No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium">Mid Income:</span>
                                        <span className={`font-bold ${userCredentials.isMidIncomeBracket ? 'text-purple-600' : 'text-gray-600'}`}>
                                            {userCredentials.isMidIncomeBracket ? '✓ Yes' : '✗ No'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Ad Management Controls */}
                            <div className="mt-8 bg-black rounded-2xl p-8 text-white">
                                <h3 className="text-2xl font-bold mb-6 text-center">Ad Management</h3>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{injectedAdsCount}</div>
                                        <div className="text-sm text-gray-600">Active Ads</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className={`text-2xl font-bold ${adsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                            {adsEnabled ? 'ON' : 'OFF'}
                                        </div>
                                        <div className="text-sm text-gray-600">Status</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-purple-600">2</div>
                                        <div className="text-sm text-gray-600">Max Per Page</div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={onToggleAds}
                                        className={`flex-1 py-3 px-6 font-bold rounded-lg transition-colors duration-200 ${adsEnabled
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                            }`}
                                    >
                                        {adsEnabled ? 'DISABLE ADS' : 'ENABLE ADS'}
                                    </button>
                                    <button
                                        onClick={onReinjectAds}
                                        disabled={!adsEnabled}
                                        className="flex-1 py-3 px-6 font-bold rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        REFRESH ADS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isConnected ? (
                    // User is connected but no credentials found
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8">
                        <div style={{ border: '4px solid black', borderRadius: '10px', padding: '30px', maxWidth: '1000px' }}>
                            <div className="text-start mb-8">
                                <h1 className="text-4xl font-black text-black leading-tight mb-2">
                                    WALLET CONNECTED
                                </h1>
                                <p className="text-lg text-yellow-700 font-medium mb-6">
                                    ⚠ No Credentials Found
                                </p>
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    Your wallet is connected, but we couldn't find verified credentials for targeted advertising.
                                    Complete the verification process to enable personalized ads.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 mb-8">
                                <h3 className="text-xl font-bold text-black mb-3">Connected Wallet</h3>
                                <div className="flex items-center justify-between">
                                    <p className="font-mono text-gray-600 text-lg">
                                        {address?.slice(0, 6)}...{address?.slice(-4)}
                                    </p>
                                    <button
                                        onClick={() => disconnect()}
                                        className="bg-red-500 text-black cursor-pointer border-4 hover:bg-red-300 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 bg-black rounded-2xl p-8 text-white">
                                <h3 className="text-2xl font-bold mb-6 text-center">Demo Mode (Development Only)</h3>
                                <p className="text-center text-gray-300 mb-6">Try different user profiles to see targeted ads:</p>
                                <div className="space-y-3">
                                    {getMockUsers().map((demoAddress) => {
                                        const demoCredentials = getUserCredentials(demoAddress);
                                        return (
                                            <button
                                                key={demoAddress}
                                                onClick={() => selectDemoUser(demoAddress)}
                                                className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                            >
                                                {demoCredentials?.above18 ? 'Adult' : 'Teen'} •
                                                {demoCredentials?.isUSResident ? ' US' : ' Non-US'} •
                                                {demoCredentials?.isMidIncomeBracket ? ' Mid Income' : ' High Income'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Landing page for non-connected users
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8">
                        <div style={{ border: '4px solid black', borderRadius: '10px', padding: '30px', maxWidth: '1000px' }}>
                            <div className="text-start mb-12">

                                <div className='flex items-center justify-between'>
                                    <h1 className="text-5xl font-black text-black leading-tight">
                                        MOCA ADS
                                        <p className="text-sm text-gray-700">Open Ads Protocol, pro privacy</p>
                                    </h1>
                                    <ConnectWallet />
                                </div>

                                <p className="text-xl text-gray-700 mb-8 leading-relaxed text-left mt-5">
                                    Experience web3 advertising that respects your privacy while rewarding you for your attention.
                                    Connect your wallet to get started with personalized, relevant ads.
                                </p>
                            </div>


                            <div className="mt-12 bg-black rounded-2xl p-8 text-white">
                                <h3 className="text-2xl font-bold mb-6 text-center">How It Works</h3>
                                <div className="grid md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                                        <h4 className="font-bold mb-2">Connect Wallet</h4>
                                        <p className="text-sm text-gray-300">Link your web3 wallet to get started</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                                        <h4 className="font-bold mb-2">Verify Identity</h4>
                                        <p className="text-sm text-gray-300">Complete secure verification process</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                                        <h4 className="font-bold mb-2">Browse Web</h4>
                                        <p className="text-sm text-gray-300">See targeted ads while browsing</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                                        <h4 className="font-bold mb-2">Earn Rewards</h4>
                                        <p className="text-sm text-gray-300">Get paid for your attention</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}