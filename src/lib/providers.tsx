"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import {
  wagmiAdapter,
  reownProjectId,
  reownNetworks,
  reownMetadata,
} from "../../config/reown";

const queryClient = new QueryClient();

if (reownProjectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId: reownProjectId,
    networks: [...reownNetworks],
    metadata: reownMetadata,
    themeMode: "dark",
    themeVariables: {
      "--apkt-color-mix": "#6366f1",
      "--apkt-color-mix-strength": 40,
      "--apkt-border-radius-master": "12px",
    },
    features: {
      analytics: false,
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const dynamicEnvId =
    process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ||
    process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  return (
    <DynamicContextProvider
      theme="dark"
      settings={{
        environmentId: dynamicEnvId ?? "",
        walletConnectors: [EthereumWalletConnectors] as never,
      }}
    >
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
