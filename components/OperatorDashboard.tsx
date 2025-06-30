"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    useActiveCampaigns,
    useContractBalance,
    useProtocolClaimableRewards,
    useRegisteredDomains,
    useOperator,
    useMinCampaignBudget,
    useFixedCostPerView,
    formatMocaAmount
} from "@/hooks/useMocaAds";
import { BatchRewardsManager } from "@/components/BatchRewardsManager";
import {
    BarChart3,
    DollarSign,
    Globe,
    Settings,
    TrendingUp,
    Zap,
    FileText
} from "lucide-react";

type TabType = "overview" | "batch-rewards" | "settings";

export function OperatorDashboard() {
    const { address } = useAccount();
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    // Contract data
    const { data: activeCampaigns, isLoading: campaignsLoading } = useActiveCampaigns();
    const { data: contractBalance, isLoading: balanceLoading } = useContractBalance();
    const { data: protocolRewards, isLoading: protocolLoading } = useProtocolClaimableRewards();
    const { data: registeredDomains, isLoading: domainsLoading } = useRegisteredDomains();
    const { data: operatorAddress } = useOperator();
    const { data: minBudget } = useMinCampaignBudget();
    const { data: costPerView } = useFixedCostPerView();

    // Type guards and safe data access
    const safeActiveCampaigns = Array.isArray(activeCampaigns) ? activeCampaigns : [];
    const safeRegisteredDomains = Array.isArray(registeredDomains) ? registeredDomains : [];
    const safeContractBalance = typeof contractBalance === 'bigint' ? contractBalance : undefined;
    const safeProtocolRewards = typeof protocolRewards === 'bigint' ? protocolRewards : undefined;
    const safeMinBudget = typeof minBudget === 'bigint' ? minBudget : undefined;
    const safeCostPerView = typeof costPerView === 'bigint' ? costPerView : undefined;
    const safeOperatorAddress = typeof operatorAddress === 'string' ? operatorAddress : 'Unknown';

    const stats = [
        {
            title: "ACTIVE CAMPAIGNS",
            value: campaignsLoading ? "..." : safeActiveCampaigns.length.toString(),
            icon: <BarChart3 className="h-8 w-8" />,
            color: "bg-blue-100",
            loading: campaignsLoading
        },
        {
            title: "CONTRACT BALANCE",
            value: balanceLoading ? "..." : `${formatMocaAmount(safeContractBalance)} MOCA`,
            icon: <DollarSign className="h-8 w-8" />,
            color: "bg-green-100",
            loading: balanceLoading
        },
        {
            title: "PROTOCOL REWARDS",
            value: protocolLoading ? "..." : `${formatMocaAmount(safeProtocolRewards)} MOCA`,
            icon: <TrendingUp className="h-8 w-8" />,
            color: "bg-yellow-100",
            loading: protocolLoading
        },
        {
            title: "REGISTERED DOMAINS",
            value: domainsLoading ? "..." : safeRegisteredDomains.length.toString(),
            icon: <Globe className="h-8 w-8" />,
            color: "bg-purple-100",
            loading: domainsLoading
        }
    ];

    const tabs = [
        { id: "overview" as TabType, label: "OVERVIEW", icon: <FileText className="h-4 w-4" /> },
        { id: "batch-rewards" as TabType, label: "BATCH REWARDS", icon: <Zap className="h-4 w-4" /> },
        { id: "settings" as TabType, label: "SETTINGS", icon: <Settings className="h-4 w-4" /> }
    ];

    return (
        <div className="space-y-8">
            {/* Operator Info */}
            <div className="bg-blue-50 border-4 border-black p-6 shadow-brutal">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black mb-2">OPERATOR STATUS</h2>
                        <div className="space-y-1">
                            <div className="font-mono text-sm">
                                <span className="font-bold">Connected:</span> {address}
                            </div>
                            <div className="font-mono text-sm">
                                <span className="font-bold">Contract Operator:</span> {safeOperatorAddress}
                            </div>
                        </div>
                    </div>
                    <Badge className="bg-green-500 text-white border-2 border-black font-bold text-lg px-4 py-2">
                        AUTHORIZED
                    </Badge>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className={`${stat.color} border-4 border-black shadow-brutal`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                {stat.icon}
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">
                                {stat.loading ? (
                                    <div className="animate-pulse">...</div>
                                ) : (
                                    stat.value
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <Button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`font-bold border-4 border-black shadow-brutal hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 ${activeTab === tab.id
                            ? "bg-yellow-400 text-black"
                            : "bg-white text-black"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white border-4 border-black shadow-brutal p-6">
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black mb-4">PLATFORM OVERVIEW</h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Campaign Settings */}
                            <div className="space-y-4">
                                <h4 className="text-xl font-black">CAMPAIGN SETTINGS</h4>
                                <div className="bg-gray-50 border-2 border-black p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-bold">Min Campaign Budget:</span>
                                        <span className="font-mono">{formatMocaAmount(safeMinBudget)} MOCA</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold">Cost Per View:</span>
                                        <span className="font-mono">{formatMocaAmount(safeCostPerView)} MOCA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="space-y-4">
                                <h4 className="text-xl font-black">PLATFORM HEALTH</h4>
                                <div className="bg-gray-50 border-2 border-black p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="font-bold">Contract Status: Active</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="font-bold">Operator Access: Enabled</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="font-bold">Ready for Batch Operations</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "batch-rewards" && <BatchRewardsManager />}

                {activeTab === "settings" && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black mb-4">OPERATOR SETTINGS</h3>
                        <div className="bg-yellow-100 border-2 border-black p-4">
                            <p className="font-bold text-lg mb-2">🚧 COMING SOON</p>
                            <p className="text-gray-700">
                                Contract settings management will be available in a future update.
                                This will include updating minimum budgets, cost per view, and other protocol parameters.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 