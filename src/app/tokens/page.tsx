"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { SuccessModal } from "@/components/success-modal";
import { ConnectModal } from "@/components/connect-modal";
import { generateAvatarUrl } from "@/utils/avatar-generators";

interface Token {
  chainId: string;
  networkName: string;
  chainIconURI: string;
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  logoURI: string;
}

interface Chain {
  chainId: string;
  networkName: string;
  chainIconURI: string;
}

interface TokenWithAvatar extends Token {
  avatarUrl?: string;
}

export default function TokensPage() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testnetMode, setTestnetMode] = useState(false);
  const [addingToken, setAddingToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chainSearchQuery, setChainSearchQuery] = useState("");
  const [showChainDropdown, setShowChainDropdown] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });
  
  const { address: reownAddress, isConnected: reownConnected } = useAppKitAccount();
  const { user: dynamicUser, primaryWallet } = useDynamicContext();

  const isConnected = reownConnected || !!dynamicUser;
  const displayAddress =
    reownAddress ??
    (primaryWallet?.address as string | undefined) ??
    null;

  // Remove duplicate chains based on chainId
  const uniqueChains = chains.filter((chain, index, self) =>
    index === self.findIndex((c) => c.chainId === chain.chainId)
  );

  // Optimized search for chains
  const filteredChains = useMemo(() => {
    if (!chainSearchQuery) return uniqueChains;
    
    const query = chainSearchQuery.toLowerCase();
    return uniqueChains.filter(chain => 
      chain.networkName.toLowerCase().includes(query) ||
      chain.chainId.includes(query)
    );
  }, [uniqueChains, chainSearchQuery]);

  // Optimized search for tokens
  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    
    const query = searchQuery.toLowerCase();
    return tokens.filter((token: Token) => 
      token.name.toLowerCase().includes(query) ||
      token.symbol.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  useEffect(() => {
    fetchChains();
  }, [testnetMode]);

  useEffect(() => {
    if (selectedChain) {
      fetchTokens();
    }
  }, [selectedChain, testnetMode]);

  const fetchChains = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (testnetMode) {
        queryParams.append('testnet', '1');
      } else {
        queryParams.append('all', '1');
      }
      
      const response = await fetch(`/api/chains?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chains: ${response.status}`);
      }
      
      const data = await response.json();
      setChains(data || []);
      
      // Auto-select first chain if available
      if (data && data.length > 0 && !selectedChain) {
        setSelectedChain(data[0].chainId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chains');
      // console.error('Error fetching chains:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedChain) {
        setTokens([]);
        return;
      }

      const queryParams = new URLSearchParams();
      queryParams.append('chainId', selectedChain);
      
      const response = await fetch(`/api/tokens?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tokens: ${response.status}`);
      }
      
      const data = await response.json();
      // console.log('Tokens data from backend:', data);
      
      // Filter tokens to only include those from the selected chain
      const chainTokens = Array.isArray(data) 
        ? data.filter((token: any) => token.chainId === selectedChain)
        : [];
      
      setTokens(chainTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
      // console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      // console.error('Failed to copy address:', err);
    }
  };

  const handleAddToken = async (token: Token) => {
    if (!isConnected) {
      setSuccessModal({
        isOpen: true,
        title: "Wallet Not Connected",
        message: "Please connect your wallet first to add tokens."
      });
      return;
    }

    try {
      setAddingToken(token.address);
      
      // Use native wallet provider (MetaMask, etc.) directly
      if (!window.ethereum) {
        throw new Error('No wallet provider found. Please install MetaMask or another Web3 wallet.');
      }

      const walletClient = window.ethereum;

      // Use wallet_watchAsset RPC method to add token
      const watchAssetParams = {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.logoURI,
        },
      };

      const result = await walletClient.request({
        method: 'wallet_watchAsset',
        params: watchAssetParams as any,
      });

      if (result) {
        setSuccessModal({
          isOpen: true,
          title: "Token Added Successfully!",
          message: `${token.name} (${token.symbol}) has been added to your wallet.`
        });
      } else {
        throw new Error('Failed to add token to wallet');
      }
    } catch (err: any) {
      // console.error('Error adding token:', err);
      setSuccessModal({
        isOpen: true,
        title: "Failed to Add Token",
        message: err.message || 'Unknown error occurred while adding the token.'
      });
    } finally {
      setAddingToken(null);
    }
  };

  const selectedChainData = uniqueChains.find(chain => chain.chainId === selectedChain);

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-100">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">ChainConnect</h1>
            <p className="text-gray-400">Add tokens to your wallet from various chains</p>
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
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Chains
          </a>
          <a
            href="/tokens"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium"
          >
            Tokens
          </a>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Searchable Chain Selector */}
            <div className="relative">
              {/* Chain Selector Input */}
              <div
                onClick={() => setShowChainDropdown(!showChainDropdown)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 cursor-pointer flex items-center justify-between"
              >
                <span className={selectedChain ? "text-white" : "text-gray-400"}>
                  {selectedChainData ? selectedChainData.networkName : "Choose a chain..."}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${showChainDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown */}
              {showChainDropdown && (
                <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-700">
                    <input
                      type="text"
                      placeholder="Search chains..."
                      value={chainSearchQuery}
                      onChange={(e) => setChainSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-sm"
                    />
                  </div>

                  {/* Chain Options */}
                  {filteredChains.map((chain) => (
                    <div
                      key={`${chain.chainId}-${chain.networkName}`}
                      onClick={() => {
                        setSelectedChain(chain.chainId);
                        setChainSearchQuery("");
                        setShowChainDropdown(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      {/* Chain Icon */}
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 shrink-0">
                        {chain.chainIconURI ? (
                          <img
                            src={chain.chainIconURI}
                            alt={chain.networkName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-indigo-600 flex items-center justify-center">
                                    <span class="text-white font-bold text-xs">${chain.networkName.charAt(0).toUpperCase()}</span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {chain.networkName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{chain.networkName}</div>
                        <div className="text-gray-400 text-xs">Chain ID: {chain.chainId}</div>
                      </div>
                    </div>
                  ))}

                  {/* No Results */}
                  {filteredChains.length === 0 && (
                    <div className="px-3 py-2 text-gray-400 text-sm">
                      No chains found matching "{chainSearchQuery}"
                    </div>
                  )}
                </div>
              )}

              {/* Click outside to close */}
              {showChainDropdown && (
                <div
                  className="fixed inset-0 z-0"
                  onClick={() => setShowChainDropdown(false)}
                />
              )}
            </div>

            {/* Testnet Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Testnet:</label>
              <button
                onClick={() => setTestnetMode(!testnetMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  testnetMode ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    testnetMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Selected Chain Info */}
        {selectedChainData && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg flex items-center gap-3">
            {selectedChainData.chainIconURI && (
              <img
                src={selectedChainData.chainIconURI}
                alt={selectedChainData.networkName}
                className="w-6 h-6 rounded-full"
                onError={async (e) => {
                  const target = e.target as HTMLImageElement;
                  const fallbackUrl = await generateAvatarUrl(selectedChainData.networkName, 24);
                  target.src = fallbackUrl;
                }}
              />
            )}
            <div className="text-gray-300">
              Showing tokens for <span className="text-white font-medium">{selectedChainData.networkName}</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <div className="text-gray-400">Loading tokens...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-6">
            <div className="text-red-400 mb-3">{error}</div>
            <button
              onClick={fetchTokens}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && selectedChain && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTokens.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400">
                {searchQuery ? 'No tokens found matching your search.' : 'No tokens available for this chain.'}
              </div>
            ) : (
              filteredTokens.map((token) => (
                <div
                  key={`${token.chainId}-${token.address}`}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 shrink-0">
                      {token.logoURI ? (
                        <img
                          src={token.logoURI}
                          alt={token.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Simple fallback - show initial
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-indigo-600 flex items-center justify-center">
                                  <span class="text-white font-bold text-lg">${(token.name || token.symbol || '?').charAt(0).toUpperCase()}</span>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {(token.name || token.symbol || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{token.name}</h3>
                      <p className="text-gray-400 text-sm">{token.symbol}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Chain Icon */}
                        <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-600 shrink-0">
                          {selectedChainData?.chainIconURI ? (
                            <img
                              src={selectedChainData.chainIconURI}
                              alt={selectedChainData.networkName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full bg-indigo-600 flex items-center justify-center">
                                      <span class="text-white font-bold text-xs">${selectedChainData.networkName.charAt(0).toUpperCase()}</span>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-indigo-600 flex items-center justify-center">
                              <span className="text-white font-bold text-xs">
                                {selectedChainData?.networkName?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs">
                          {selectedChainData?.networkName}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-gray-300 text-xs font-mono mb-2 break-all">
                          {token.address}
                        </p>
                        <button
                          onClick={() => handleCopyAddress(token.address)}
                          className="w-full px-3 py-1 text-xs border border-gray-600 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 hover:text-white transition-colors"
                        >
                          {copiedAddress === token.address ? 'Copied!' : 'Copy Address'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToken(token)}
                    disabled={!isConnected || addingToken === token.address}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      !isConnected
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : addingToken === token.address
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {addingToken === token.address ? 'Adding...' : 'Add Token'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {!selectedChain && !loading && (
          <div className="text-center py-16 text-gray-400">
            Please select a chain to view tokens
          </div>
        )}
      </main>

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: "", message: "" })}
        title={successModal.title}
        message={successModal.message}
      />

      <ConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />
    </div>
  );
}
