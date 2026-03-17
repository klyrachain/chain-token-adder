"use client";

import { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ConnectModal } from "@/components/connect-modal";
import { ChainAdder } from "@/components/chain-adder";

export default function Home() {
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const { address: reownAddress, isConnected: reownConnected } = useAppKitAccount();
  const { user: dynamicUser, primaryWallet } = useDynamicContext();

  const isConnected = reownConnected || !!dynamicUser;
  const displayAddress =
    reownAddress ??
    (primaryWallet?.address as string | undefined) ??
    null;

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-zinc-100">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              ChainConnect
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Chain & Token Management
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConnectModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {isConnected && displayAddress ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {displayAddress.slice(0, 6)}…{displayAddress.slice(-4)}
              </>
            ) : (
              "Connect"
            )}
          </button>
        </header>

        {/* Navigation */}
        <div className="mb-8 flex gap-4">
          <a
            href="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium"
          >
            Chains
          </a>
          <a
            href="/tokens"
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Tokens
          </a>
        </div>

        {/* Chain Adder Component */}
        <ChainAdder />
      </main>

      <ConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />
    </div>
  );
}

