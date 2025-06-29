import type { AirConnector } from "@mocanetwork/airkit-connector";
import { useRef } from "react";
import { useConfig, useConnect, type Config } from "wagmi";
import type { ConnectVariables } from "wagmi/query";
import { useLogging } from "@/components/hooks/useLogging";
import { usePartner } from "@/components/hooks/usePartner";
import { generateAuthToken } from "@/components/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const CustomAuth = () => {
    const { connect } = useConnect();
    const config = useConfig();
    const { setLog } = useLogging();
    const { partnerId } = usePartner();
    const privateKeyRef = useRef<HTMLTextAreaElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const partnerUserIdRef = useRef<HTMLInputElement>(null);

    const handleConnect = async () => {
        if (!privateKeyRef.current) {
            setLog("Please enter private key");
            return;
        }

        const airConnector = config.connectors.find(
            (connector) => connector?.isMocaNetwork
        );

        const authToken = await generateAuthToken({
            privateKey: privateKeyRef.current.value,
            email: emailRef.current?.value,
            partnerUserId: partnerUserIdRef.current?.value,
            partnerId,
        });

        connect({
            connector: airConnector!,
            authToken,
        } as unknown as ConnectVariables<Config, AirConnector>);
    };

    return (
        <div className="mx-auto p-6 bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Custom Authentication
            </h2>
            <div className="max-w-lg mx-auto">
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="privateKey">Private Key</label>
                        <Textarea
                            ref={privateKeyRef}
                            placeholder="Enter your private key"
                            className="w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email">Email</label>
                        <Input
                            ref={emailRef}
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="partnerUserId">Partner User ID</label>
                        <Input
                            ref={partnerUserIdRef}
                            placeholder="Enter partner user ID"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleConnect}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                            disabled={!privateKeyRef.current?.value || !emailRef.current?.value || !partnerUserIdRef.current?.value}
                        >
                            Connect Wallet
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
