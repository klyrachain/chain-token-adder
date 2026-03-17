"use client";

import { modal as reownModal } from "@reown/appkit/react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

type ConnectModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ConnectModal({ isOpen, onClose }: ConnectModalProps) {
  const { setShowAuthFlow } = useDynamicContext();

  if (!isOpen) return null;

  const handleReown = () => {
    onClose();
    reownModal?.open({ view: "Connect" });
  };

  const handleDynamic = () => {
    onClose();
    setShowAuthFlow(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-modal-title"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-700/50 bg-zinc-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="connect-modal-title"
            className="text-xl font-semibold text-white"
          >
            Connect wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-6 text-sm text-zinc-400">
          Choose a provider — its own modal will open to pick your wallet.
        </p>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleReown}
            className="flex w-full items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4 text-left transition hover:border-indigo-500/50 hover:bg-zinc-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3396FF]/20">
              <svg className="h-7 w-7 text-[#3396FF]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">Reown WalletConnect</div>
              <div className="text-sm text-zinc-400">WalletConnect, Injected, Coinbase</div>
            </div>
            <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleDynamic}
            className="flex w-full items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4 text-left transition hover:border-indigo-500/50 hover:bg-zinc-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20">
              <svg className="h-7 w-7 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">Dynamic</div>
              <div className="text-sm text-zinc-400">All supported wallets</div>
            </div>
            <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
