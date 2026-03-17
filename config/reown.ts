import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, base, polygon } from "@reown/appkit/networks";

export const reownProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";

export const reownNetworks = [mainnet, arbitrum, base, polygon] as const;

export const wagmiAdapter = new WagmiAdapter({
  projectId: reownProjectId,
  networks: [...reownNetworks],
  ssr: true,
});

export const reownMetadata = {
  name: "Balance Tester",
  description: "Crypto balance tester — Reown & Dynamic",
  url: typeof window !== "undefined" ? window.location.origin : "https://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};
