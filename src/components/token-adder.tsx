"use client";

import { useState, useEffect } from "react";
import { useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";

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

export function TokenAdder() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testnetMode, setTestnetMode] = useState(false);
  const [addingToken, setAddingToken] = useState<string | null>(null);
  
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

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
      
      if (data && data.length > 0 && !selectedChain) {
        setSelectedChain(data[0].chainId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chains');
    } finally {
      setLoading(false);
    }
  };

  const fetchTokens = async () => {
    if (!selectedChain) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (testnetMode) {
        queryParams.append('testnet', '1');
      } else {
        queryParams.append('all', '1');
      }
      queryParams.append('chainId', selectedChain);
      
      const response = await fetch(`/api/tokens?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tokens: ${response.status}`);
      }
      
      const data = await response.json();
      setTokens(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = async (token: Token) => {
    if (!isConnected || !window.ethereum) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setAddingToken(token.address);
      
      // Use wallet_watchAsset RPC method to add token
      const watchAssetParams: any = {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.logoURI,
        },
      };

      // Add chainId if different from current chain
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (token.chainId !== currentChainId) {
        watchAssetParams.options.chainId = parseInt(token.chainId);
      }

      const result = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: watchAssetParams,
      });

      if (result) {
        alert(`Successfully added ${token.name} (${token.symbol}) to your wallet!`);
      } else {
        throw new Error('Failed to add token to wallet');
      }
    } catch (err: any) {
      console.error('Error adding token:', err);
      alert(`Failed to add token: ${err.message || 'Unknown error'}`);
    } finally {
      setAddingToken(null);
    }
  };

  const selectedChainData = chains.find(chain => chain.chainId === selectedChain);

  return (
    <div className="bg-zinc-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Token Adder</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Testnet:</label>
          <button
            onClick={() => setTestnetMode(!testnetMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              testnetMode ? 'bg-indigo-600' : 'bg-zinc-700'
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

      {/* Chain Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Select Chain
        </label>
        <div className="relative">
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
            disabled={loading}
          >
            <option value="">Choose a chain...</option>
            {chains.map((chain) => (
              <option key={chain.chainId} value={chain.chainId}>
                {chain.networkName} (ID: {chain.chainId})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Selected Chain Info */}
      {selectedChainData && (
        <div className="mb-4 p-3 bg-zinc-800 rounded-lg flex items-center gap-3">
          {selectedChainData.chainIconURI && (
            <img
              src={selectedChainData.chainIconURI}
              alt={selectedChainData.networkName}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="text-sm text-zinc-300">
            Showing tokens for <span className="text-white font-medium">{selectedChainData.networkName}</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="text-zinc-400">Loading tokens...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
          <div className="text-red-400 text-sm">{error}</div>
          <button
            onClick={fetchTokens}
            className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && selectedChain && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tokens.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              No tokens available for this chain
            </div>
          ) : (
            tokens.map((token) => (
              <div
                key={`${token.chainId}-${token.address}`}
                className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {token.logoURI && (
                    <img
                      src={token.logoURI}
                      alt={token.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <div className="text-white font-medium">{token.name}</div>
                    <div className="text-zinc-400 text-sm">{token.symbol}</div>
                    <div className="text-zinc-500 text-xs">
                      {token.address.slice(0, 6)}...{token.address.slice(-4)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToken(token)}
                  disabled={!isConnected || addingToken === token.address}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !isConnected
                      ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                      : addingToken === token.address
                      ? 'bg-zinc-700 text-zinc-400'
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

      {!isConnected && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
          <div className="text-yellow-400 text-sm">
            Please connect your wallet to add tokens
          </div>
        </div>
      )}

      {!selectedChain && !loading && (
        <div className="text-center py-8 text-zinc-400">
          Please select a chain to view tokens
        </div>
      )}
    </div>
  );
}
