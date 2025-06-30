"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    useBatchUpdateRewards,
    type BatchReward
} from "@/hooks/useMocaAds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Send,
    AlertCircle,
    CheckCircle,
    Loader2,
    FileText,
} from "lucide-react";
import { isAddress } from "viem";

interface BatchRewardEntry {
    id: string;
    user: string;
    website: string;
    views: string;
    campaignId: string;
}

export function BatchRewardsManager() {
    const [entries, setEntries] = useState<BatchRewardEntry[]>([]);
    const [newEntry, setNewEntry] = useState<BatchRewardEntry>({
        id: "",
        user: "",
        website: "",
        views: "",
        campaignId: ""
    });

    const {
        batchUpdateRewards,
        isPending,
        isConfirming,
        isSuccess,
        error,
        hash
    } = useBatchUpdateRewards();

    // Generate new ID for entries
    const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Validation
    const validateNewEntry = () => {
        const errors: string[] = [];

        if (!newEntry.user || !isAddress(newEntry.user)) {
            errors.push("Valid user address required");
        }

        if (!newEntry.website || newEntry.website.trim() === "") {
            errors.push("Website domain required");
        }

        if (!newEntry.views || isNaN(Number(newEntry.views)) || Number(newEntry.views) <= 0) {
            errors.push("Valid view count required (positive number)");
        }

        if (!newEntry.campaignId || isNaN(Number(newEntry.campaignId)) || Number(newEntry.campaignId) <= 0) {
            errors.push("Valid campaign ID required");
        }

        return errors;
    };

    // Add new entry to batch
    const addEntry = () => {
        const errors = validateNewEntry();
        if (errors.length > 0) {
            toast.error(errors.join(", "));
            return;
        }

        // Check for duplicates
        const duplicate = entries.find(
            entry =>
                entry.user.toLowerCase() === newEntry.user.toLowerCase() &&
                entry.website.toLowerCase() === newEntry.website.toLowerCase() &&
                entry.campaignId === newEntry.campaignId
        );

        if (duplicate) {
            toast.error("Duplicate entry: same user, website, and campaign combination already exists");
            return;
        }

        setEntries([...entries, { ...newEntry, id: generateId() }]);
        setNewEntry({
            id: "",
            user: "",
            website: "",
            views: "",
            campaignId: ""
        });
        toast.success("Entry added to batch");
    };

    // Remove entry from batch
    const removeEntry = (id: string) => {
        setEntries(entries.filter(entry => entry.id !== id));
        toast.success("Entry removed from batch");
    };

    // Execute batch update
    const executeBatchUpdate = () => {
        if (entries.length === 0) {
            toast.error("No entries to process");
            return;
        }

        const batchRewards: BatchReward[] = entries.map(entry => ({
            user: entry.user as `0x${string}`,
            website: entry.website,
            views: BigInt(entry.views),
            campaignId: BigInt(entry.campaignId)
        }));

        batchUpdateRewards(batchRewards);
    };

    // Calculate totals
    const totals = useMemo(() => {
        const totalViews = entries.reduce((sum, entry) => sum + Number(entry.views), 0);
        const uniqueUsers = new Set(entries.map(entry => entry.user.toLowerCase())).size;
        const uniqueWebsites = new Set(entries.map(entry => entry.website.toLowerCase())).size;
        const uniqueCampaigns = new Set(entries.map(entry => entry.campaignId)).size;

        return {
            totalViews,
            uniqueUsers,
            uniqueWebsites,
            uniqueCampaigns
        };
    }, [entries]);

    // Success effect
    if (isSuccess && entries.length > 0) {
        setEntries([]);
        toast.success("Batch rewards updated successfully!");
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black">BATCH REWARDS MANAGER</h3>
                <Badge className="bg-blue-500 text-white border-2 border-black font-bold">
                    {entries.length} ENTRIES
                </Badge>
            </div>

            {/* Add New Entry Form */}
            <Card className="border-4 border-black shadow-brutal bg-gray-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        ADD REWARD ENTRY
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="user" className="text-sm font-bold">
                                USER ADDRESS
                            </Label>
                            <Input
                                id="user"
                                type="text"
                                value={newEntry.user}
                                onChange={(e) => setNewEntry({ ...newEntry, user: e.target.value })}
                                placeholder="0x..."
                                className="border-2 border-black font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website" className="text-sm font-bold">
                                WEBSITE DOMAIN
                            </Label>
                            <Input
                                id="website"
                                type="text"
                                value={newEntry.website}
                                onChange={(e) => setNewEntry({ ...newEntry, website: e.target.value })}
                                placeholder="example.com"
                                className="border-2 border-black font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="views" className="text-sm font-bold">
                                VIEW COUNT
                            </Label>
                            <Input
                                id="views"
                                type="number"
                                value={newEntry.views}
                                onChange={(e) => setNewEntry({ ...newEntry, views: e.target.value })}
                                placeholder="100"
                                min="1"
                                className="border-2 border-black font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="campaignId" className="text-sm font-bold">
                                CAMPAIGN ID
                            </Label>
                            <Input
                                id="campaignId"
                                type="number"
                                value={newEntry.campaignId}
                                onChange={(e) => setNewEntry({ ...newEntry, campaignId: e.target.value })}
                                placeholder="1"
                                min="1"
                                className="border-2 border-black font-mono text-sm"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={addEntry}
                        className="bg-green-500 text-white font-bold border-2 border-black shadow-brutal hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        ADD TO BATCH
                    </Button>
                </CardContent>
            </Card>

            {/* Batch Summary */}
            {entries.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-100 border-4 border-black shadow-brutal">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-black">{totals.totalViews}</div>
                            <p className="text-sm font-bold text-gray-600">TOTAL VIEWS</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-green-100 border-4 border-black shadow-brutal">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-black">{totals.uniqueUsers}</div>
                            <p className="text-sm font-bold text-gray-600">UNIQUE USERS</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-100 border-4 border-black shadow-brutal">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-black">{totals.uniqueWebsites}</div>
                            <p className="text-sm font-bold text-gray-600">WEBSITES</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-yellow-100 border-4 border-black shadow-brutal">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-black">{totals.uniqueCampaigns}</div>
                            <p className="text-sm font-bold text-gray-600">CAMPAIGNS</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Batch Entries List */}
            {entries.length > 0 && (
                <Card className="border-4 border-black shadow-brutal">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            BATCH ENTRIES ({entries.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 border-2 border-black"
                                >
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                        <div>
                                            <span className="font-bold">User:</span>
                                            <div className="font-mono text-xs break-all">
                                                {entry.user.slice(0, 10)}...{entry.user.slice(-8)}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-bold">Website:</span>
                                            <div className="font-mono">{entry.website}</div>
                                        </div>
                                        <div>
                                            <span className="font-bold">Views:</span>
                                            <div className="font-mono">{entry.views}</div>
                                        </div>
                                        <div>
                                            <span className="font-bold">Campaign:</span>
                                            <div className="font-mono">#{entry.campaignId}</div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => removeEntry(entry.id)}
                                        size="sm"
                                        className="bg-red-500 text-white border-2 border-black shadow-brutal hover:translate-y-1 hover:shadow-none transition-all ml-4"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Execute Button */}
            {entries.length > 0 && (
                <div className="flex justify-center">
                    <Button
                        onClick={executeBatchUpdate}
                        disabled={isPending || isConfirming}
                        className="bg-yellow-400 text-black font-black text-lg px-8 py-4 border-4 border-black shadow-brutal hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                    >
                        {isPending || isConfirming ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                {isPending ? "PREPARING..." : "CONFIRMING..."}
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                EXECUTE BATCH UPDATE
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Transaction Status */}
            {(hash || error) && (
                <Card className={`border-4 border-black shadow-brutal ${error ? "bg-red-100" : isSuccess ? "bg-green-100" : "bg-blue-100"
                    }`}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            {error ? (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : isSuccess ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            )}
                            <span className="font-bold">
                                {error ? "TRANSACTION FAILED" : isSuccess ? "TRANSACTION SUCCESSFUL" : "TRANSACTION PENDING"}
                            </span>
                        </div>

                        {hash && (
                            <div className="font-mono text-sm break-all">
                                <span className="font-bold">Transaction Hash:</span> {hash}
                            </div>
                        )}

                        {error && (
                            <div className="text-red-700 font-bold mt-2">
                                {error.message || "Transaction failed"}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Help Section */}
            <Card className="border-4 border-black shadow-brutal bg-blue-50">
                <CardContent className="pt-6">
                    <h4 className="font-black mb-2">💡 HOW TO USE</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Add individual reward entries using the form above</li>
                        <li>• Each entry represents views by a user on a website for a specific campaign</li>
                        <li>• Verify all addresses, domains, and campaign IDs before executing</li>
                        <li>• The contract will automatically distribute rewards based on platform percentages</li>
                        <li>• Users: 60%, Websites: 25%, Protocol: 15%</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
} 