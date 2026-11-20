import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, type FC, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { LogProvider } from "../contexts/LogProvider";
import { PartnerContext } from "../contexts/PartnerContext";
import { getConfig } from "../utils/wagmi";
import { PARTNER_ID } from "../utils/constants";

const queryClient = new QueryClient();

export const Providers: FC<{
    children: ReactNode;

}> = ({ children }) => {
    const config = useMemo(() => {
        return getConfig(PARTNER_ID);
    }, []);
    return (
        <PartnerContext.Provider value={{ partnerId: PARTNER_ID }}>
            <LogProvider>
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                </WagmiProvider>
            </LogProvider>
        </PartnerContext.Provider>
    );
};