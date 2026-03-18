"use client";

import { useState, useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { SuccessModal } from "@/components/success-modal";

interface Chain {
  chainId: string;
  networkName: string;
  chainIconURI: string;
  rpcs?: string[];
  rpc?: string;
  explorer?: {
    name: string;
    url: string;
  };
  // We'll fetch native currency from tokens API
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export function ChainAdder() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testnetMode, setTestnetMode] = useState(false);
  const [addingChain, setAddingChain] = useState<string | null>(null);
  
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });
  const [searchQuery, setSearchQuery] = useState("");
  
  const { isConnected } = useAppKitAccount();

  useEffect(() => {
    fetchChains();
  }, [testnetMode]);

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
      console.log('Chains data from backend:', data);
      
      // Log a sample chain to see the structure
      if (data && data.length > 0) {
        console.log('Sample chain structure:', data[0]);
      }
      
      setChains(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chains');
      console.error('Error fetching chains:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChain = async (chain: Chain) => {
    if (!isConnected) {
      setSuccessModal({
        isOpen: true,
        title: "Wallet Not Connected",
        message: "Please connect your wallet first to add chains."
      });
      return;
    }

    try {
      setAddingChain(chain.chainId);
      
      // Use native wallet provider (MetaMask, etc.) directly
      if (!window.ethereum) {
        throw new Error('No wallet provider found. Please install MetaMask or another Web3 wallet.');
      }

      const walletClient = window.ethereum;

      // Get RPC URLs from the chain data
      let rpcUrls: string[] = [];
      if (chain.rpcs && Array.isArray(chain.rpcs)) {
        rpcUrls = chain.rpcs.filter(url => url && url.startsWith('https://'));
      } else if (chain.rpc && chain.rpc.startsWith('https://')) {
        rpcUrls = [chain.rpc];
      }
      
      // If no valid RPC URLs, add a default one based on the chain
      if (rpcUrls.length === 0) {
        // Common RPC endpoints for major chains
        const defaultRPCs: Record<string, string> = {
          '1': 'https://eth.llamarpc.com',
          '137': 'https://polygon.llamarpc.com',
          '56': 'https://bsc-dataseed.binance.org',
          '43114': 'https://avax.public-rpc.com',
          '42161': 'https://arbitrum.llamarpc.com',
          '10': 'https://optimism.llamarpc.com',
          '8453': 'https://base.llamarpc.com',
          '146': 'https://rpc.soniclabs.com', // Sonic
          '143': 'https://rpc.monad.xyz', // Monad
        };
        
        const defaultRPC = defaultRPCs[chain.chainId];
        if (defaultRPC) {
          rpcUrls = [defaultRPC];
        } else {
          // Generic fallback
          rpcUrls = [`https://chain-${chain.chainId}.llamarpc.com`];
        }
      }

      // Get block explorer URLs
      let blockExplorerUrls: string[] = [];
      if (chain.explorer && chain.explorer.url && chain.explorer.url.startsWith('https://')) {
        blockExplorerUrls = [chain.explorer.url];
      }

      // Fetch native currency from tokens API
      let nativeCurrency = {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      };

      try {
        const tokensResponse = await fetch(`/api/tokens?chainId=${chain.chainId}`);
        if (tokensResponse.ok) {
          const tokens = await tokensResponse.json();
          // Find the native token (address with all e's)
          const nativeToken = tokens.find((token: any) => 
            token.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
          );
          if (nativeToken) {
            nativeCurrency = {
              name: nativeToken.name || chain.networkName,
              symbol: nativeToken.symbol || 'ETH',
              decimals: nativeToken.decimals || 18,
            };
          }
        }
      } catch (tokenError) {
        console.warn('Could not fetch native token info:', tokenError);
        // Continue with default ETH values
      }

      console.log('Using RPC URLs:', rpcUrls);
      console.log('Using native currency:', nativeCurrency);

      // First try to switch to the chain
      try {
        await walletClient.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${parseInt(chain.chainId).toString(16)}` }],
        });
        
        setSuccessModal({
          isOpen: true,
          title: "Chain Switched Successfully!",
          message: `Successfully switched to ${chain.networkName}.`
        });
      } catch (switchError: any) {
        // If switching fails (error 4902), try to add the chain
        if (switchError.code === 4902) {
          await walletClient.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${parseInt(chain.chainId).toString(16)}`,
              chainName: chain.networkName,
              rpcUrls: rpcUrls,
              blockExplorerUrls: blockExplorerUrls,
              nativeCurrency: nativeCurrency,
            }],
          });
          
          setSuccessModal({
            isOpen: true,
            title: "Chain Added Successfully!",
            message: `${chain.networkName} has been added to your wallet.`
          });
        } else {
          throw switchError;
        }
      }
    } catch (err: any) {
      console.error('Error adding chain:', err);
      setSuccessModal({
        isOpen: true,
        title: "Failed to Add Chain",
        message: err.message || 'Unknown error occurred while adding the chain.'
      });
    } finally {
      setAddingChain(null);
    }
  };

  // Filter chains based on search query
  const filteredChains = chains.filter(chain =>
    chain.networkName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chain.chainId.includes(searchQuery) ||
    (chain.nativeCurrency?.symbol?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-100">
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Chainlist</h1>
            <p className="text-gray-400 mt-1">Add chains to your wallet</p>
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
        </header>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search chains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
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

        {loading && (
          <div className="text-center py-16">
            <div className="text-gray-400">Loading chains...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-6">
            <div className="text-red-400 mb-3">{error}</div>
            <button
              onClick={fetchChains}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChains.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400">
                {searchQuery ? 'No chains found matching your search.' : 'No chains available.'}
              </div>
            ) : (
              filteredChains.map((chain, index) => (
                <div
                  key={`${chain.chainId}-${index}`}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 shrink-0">
                      {chain.chainIconURI ? (
                        <img
                          src={chain.chainIconURI}
                          alt={chain.networkName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Simple fallback - show initial
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-indigo-600 flex items-center justify-center">
                                  <span class="text-white font-bold text-lg">${chain.networkName.charAt(0).toUpperCase()}</span>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {chain.networkName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{chain.networkName}</h3>
                      <p className="text-gray-400 text-sm">Chain ID: {chain.chainId}</p>
                      {chain.nativeCurrency && (
                        <p className="text-gray-500 text-sm">
                          Currency: {chain.nativeCurrency.symbol}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddChain(chain)}
                    disabled={!isConnected || addingChain === chain.chainId}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      !isConnected
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : addingChain === chain.chainId
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {addingChain === chain.chainId ? 'Adding...' : 'Add Chain'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: "", message: "" })}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
}
