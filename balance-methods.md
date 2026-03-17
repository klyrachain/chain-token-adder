watchAsset
Action for requesting user tracks the token in their wallet. Returns a boolean indicating if the token was successfully added.

Import

import { watchAsset } from '@wagmi/core'
Usage

index.ts

config.ts

import { watchAsset } from '@wagmi/core'
import { config } from './config'

await watchAsset(config, {
  type: 'ERC20',
  options: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'WAGMI',
    decimals: 18,
  },
})
Parameters

import { type WatchAssetParameters } from '@wagmi/core'
connector
Connector | undefined

Connector to sign message with.

import { createConfig, http } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})


index.ts

config.ts

import { getConnection, watchAsset } from '@wagmi/core'
import { config } from './config'

const { connector } = getConnection(config)
const result = await watchAsset(config, {
  connector, 
  options: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'WAGMI',
    decimals: 18,
  },
  type: 'ERC20',
})
options
{ address: string; symbol: string; decimals: number; image?: string | undefined; }

Asset options.


index.ts

config.ts

import { watchAsset } from '@wagmi/core'
import { config } from './config'

const result = await watchAsset(config, {
  options: { 
    address: '0x0000000000000000000000000000000000000000', 
    symbol: 'WAGMI', 
    decimals: 18, 
  }, 
  type: 'ERC20',
})
type
'ERC20'

Type of asset.


index.ts

config.ts

import { watchAsset } from '@wagmi/core'
import { config } from './config'

const result = await watchAsset(config, {
  options: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'WAGMI',
    decimals: 18,
  },
  type: 'ERC20', 
})
Return Type

import { type WatchAssetReturnType } from '@wagmi/core'
boolean

Returns a boolean indicating if the token was successfully added.

Error

import { type WatchAssetErrorType } from '@wagmi/core'
TanStack Query

import {
  type WatchAssetData,
  type WatchAssetVariables,
  type WatchAssetMutate,
  type WatchAssetMutateAsync,
  watchAssetMutationOptions,
} from '@wagmi/core/query'


watchAsset
Requests that the user tracks the token in their wallet. Returns a boolean indicating if the token was successfully added.

Usage
example.ts
client.ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
 
export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
})



import { walletClient } from './client'
 
const success = await walletClient.watchAsset({ 
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    symbol: 'WETH',
  },
})

Returns
boolean

Boolean indicating if the token was successfully added.

Parameters
type
Type: string
Token type.

import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
 
export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
})
// ---cut--
const success = await walletClient.watchAsset({
  type: 'ERC20', 
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    symbol: 'WETH',
  },
});

options.address
Type: Address
The address of the token contract.

const success = await walletClient.watchAsset({
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 
    decimals: 18,
    symbol: 'WETH',
  },
});

options.decimals
Type: number
The number of token decimals.

const success = await walletClient.watchAsset({
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18, 
    symbol: 'WETH',
  },
});

options.symbol
Type: string
A ticker symbol or shorthand, up to 11 characters.

const success = await walletClient.watchAsset({
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    symbol: 'WETH', 
  }
})

options.image
Type: string
A string url of the token logo.

const success = await walletClient.watchAsset({
  type: 'ERC20',
  options: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    symbol: 'WETH',
    image: 'https://weth.com/icon.png', 
  }
})


useWatchAsset
Hook for requesting user tracks the token in their wallet. Returns a boolean indicating if the token was successfully added.

Import

import { useWatchAsset } from 'wagmi'
Usage

index.tsx

config.ts

import { useWatchAsset } from 'wagmi'

function App() {
  const { watchAsset } = useWatchAsset()

  return (
    <button
      onClick={() => watchAsset({
        type: 'ERC20',
        options: {
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'WAGMI',
          decimals: 18,
        },
      })}
    >
      Watch asset
    </button>
  )
}
Parameters

import { type UseWatchAssetParameters } from 'wagmi'
config
Config | undefined

Config to use instead of retrieving from the nearest WagmiProvider.


index.tsx

config.ts

import { useWatchAsset } from 'wagmi'
import { config } from './config'

function App() {
  const result = useWatchAsset({
    config,
  })
}

mutation
TanStack Query parameters. See the TanStack Query mutation docs for more info.

Wagmi does not support passing all TanStack Query parameters

TanStack Query parameters, like mutationFn and mutationKey, are used internally to make Wagmi work and you cannot override them. Check out the source to see what parameters are not supported. All parameters listed below are supported.

gcTime
number | Infinity | undefined

The time in milliseconds that unused/inactive cache data remains in memory. When a mutation's cache becomes unused or inactive, that cache data will be garbage collected after this duration. When different cache times are specified, the longest one will be used.
If set to Infinity, will disable garbage collection
meta
Record<string, unknown> | undefined

If set, stores additional information on the mutation cache entry that can be used as needed. It will be accessible wherever watchAsset is available (e.g. onError, onSuccess functions).

networkMode
'online' | 'always' | 'offlineFirst' | undefined

defaults to 'online'
see Network Mode for more information.
onError
((error: WatchAssetErrorType, variables: WatchAssetVariables, context?: context | undefined) => Promise<unknown> | unknown) | undefined

This function will fire if the mutation encounters an error and will be passed the error.

onMutate
((variables: WatchAssetVariables) => Promise<context | void> | context | void) | undefined

This function will fire before the mutation function is fired and is passed the same variables the mutation function would receive
Useful to perform optimistic updates to a resource in hopes that the mutation succeeds
The value returned from this function will be passed to both the onError and onSettled functions in the event of a mutation failure and can be useful for rolling back optimistic updates.
onSuccess
((data: WatchAssetData, variables: WatchAssetVariables, context?: context | undefined) => Promise<unknown> | unknown) | undefined

This function will fire when the mutation is successful and will be passed the mutation's result.

onSettled
((data: WatchAssetData, error: WatchAssetErrorType, variables: WatchAssetVariables, context?: context | undefined) => Promise<unknown> | unknown) | undefined

This function will fire when the mutation is either successfully fetched or encounters an error and be passed either the data or error

queryClient
QueryClient

Use this to use a custom QueryClient. Otherwise, the one from the nearest context will be used.

retry
boolean | number | ((failureCount: number, error: WatchAssetErrorType) => boolean) | undefined

Defaults to 0.
If false, failed mutations will not retry.
If true, failed mutations will retry infinitely.
If set to an number, e.g. 3, failed mutations will retry until the failed mutations count meets that number.
retryDelay
number | ((retryAttempt: number, error: WatchAssetErrorType) => number) | undefined

This function receives a retryAttempt integer and the actual Error and returns the delay to apply before the next attempt in milliseconds.
A function like attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000) applies exponential backoff.
A function like attempt => attempt * 1000 applies linear backoff.
Return Type

import { type UseWatchAssetReturnType } from 'wagmi'

TanStack Query mutation docs

mutate
(variables: WatchAssetVariables, { onSuccess, onSettled, onError }) => void

The mutation function you can call with variables to trigger the mutation and optionally hooks on additional callback options.

variables
WatchAssetVariables

The variables object to pass to the watchAsset action.

onSuccess
(data: WatchAssetData, variables: WatchAssetVariables, context: TContext) => void

This function will fire when the mutation is successful and will be passed the mutation's result.

onError
(error: WatchAssetErrorType, variables: WatchAssetVariables, context: TContext | undefined) => void

This function will fire if the mutation encounters an error and will be passed the error.

onSettled
(data: WatchAssetData | undefined, error: WatchAssetErrorType | null, variables: WatchAssetVariables, context: TContext | undefined) => void

This function will fire when the mutation is either successfully fetched or encounters an error and be passed either the data or error
If you make multiple requests, onSuccess will fire only after the latest call you've made.
mutateAsync
(variables: WatchAssetVariables, { onSuccess, onSettled, onError }) => Promise<WatchAssetData>

Similar to mutate but returns a promise which can be awaited.

data
WatchAssetData | undefined

watchAsset return type
Defaults to undefined
The last successfully resolved data for the mutation.
error
WatchAssetErrorType | null

The error object for the mutation, if an error was encountered.

failureCount
number

The failure count for the mutation.
Incremented every time the mutation fails.
Reset to 0 when the mutation succeeds.
failureReason
WatchAssetErrorType | null

The failure reason for the mutation retry.
Reset to null when the mutation succeeds.
isError / isIdle / isPending / isSuccess
boolean

Boolean variables derived from status.

isPaused
boolean

will be true if the mutation has been paused.
see Network Mode for more information.
reset
() => void

A function to clean the mutation internal state (e.g. it resets the mutation to its initial state).

status
'idle' | 'pending' | 'error' | 'success'

'idle' initial status prior to the mutation function executing.
'pending' if the mutation is currently executing.
'error' if the last mutation attempt resulted in an error.
'success' if the last mutation attempt was successful.
submittedAt
number

The timestamp for when the mutation was submitted.
Defaults to 0.
variables
WatchAssetVariables | undefined

The variables object passed to mutate.
Defaults to undefined.
TanStack Query

import {
  type WatchAssetData,
  type WatchAssetVariables,
  type WatchAssetMutate,
  type WatchAssetMutateAsync,
  watchAssetMutationOptions,
} from 'wagmi/query'
Action
watchAsset



Introduction
Fetching token balances for one or more addresses (at a specific point in time) is a super common task, regardless of what it is that you’re building.

Despite being such a common task, when I first started working with Ethereum data I found it surprisingly difficult to figure out how to do this. It isn’t exactly obvious from just scrolling through the list of available JSON-RPC endpoints (https://ethereum.org/en/developers/docs/apis/json-rpc/).

Once you do figure it out, the other issue (even less obvious) is figuring out how to do this for multiple addresses across different time periods in a reasonable amount of time that won’t burn through all your API credits.

In this article I am going to save you the pain I had to go through figuring out the best way to fetch token balances. I’ll go over the different methods available (and their issues), starting with the “naive approach” and ending with the best approach.

Overview:
The naive approach
Batching JSON-RPC requests
Using a multicall contract
Final remarks (link to code)
The naive approach
The naive approach is to make a single HTTP request using the “eth_call” JSON-RPC endpoint. Here’s the code:

def fetch_token_balance_naive(wallet_address, token_address, block_number, node_provider_url, api_key):
    balanceof_function = "balanceOf(address)(uint256)"
    balanceof_signature = Signature(balanceof_function)
    block_number_hex = Web3.toHex(primitive=block_number)
    data = balanceof_signature.encode_data([wallet_address]).hex()
    payload = {
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [
            {
                "to": token_address,
                "data": "0x" + data,
            },
            block_number_hex,
        ],
        "id": 1,
    }
    headers = {"Content-Type": "application/json", "Accept-Encoding": "gzip"}
    url = f"{node_provider_url}/{api_key}"
    res = requests.post(url, headers=headers, json=payload)
    res_data = res.json()
    balance_encoded_hex = res_data["result"]
    balance_encoded_bytes = Web3.toBytes(hexstr=balance_encoded_hex)
    balance_decoded = Call.decode_output(balance_encoded_bytes, balanceof_signature, returns=None)
    return balance_decoded
There are a few things that are not so obvious if this is your first time using “eth_call” so let’s quickly go over these things.

“eth_call” is the JSON-RPC endpoint used to call smart contract functions.
“balanceOf” is a function that all ERC20 tokens have. You can call this function to return how much an address holds of the token in question.
To use “eth_call” you need to specify two parameters: “to” and “data”. The “to” parameter is the address of the smart contract you want to call a function from. In the “data” parameter you specify the function you want to call and its inputs.
Not super use-friendly: But to “data” requires you to encode the function name and inputs into a hexadecimal string.
Similarly, the output of our call has to be decoded. To make life easier, I use the Call and Signature classes of the multicall package (see https://github.com/banteg/multicall.py) to help me with encoding and decoding.
The problem with the naive approach is that that it’s super slow and expensive (in terms of API credits) if you need to fetch balances for multiple addresses, blocks and/or tokens. For each block, address and token you need to perform a separate request.

Batching requests
Batching requests alleviates some of the problems of the naive approach if you need to fetch balances for multiple blocks, addresses and/or tokens.

Get Martin Kirov | Syve’s stories in your inbox
Join Medium for free to get updates from this writer.

Enter your email
Subscribe
In particular, it helps speed things up significantly. Instead of making multiple separate requests — batching enables you to do it in a single request. The code for batching “eth_call” requests is as follows:

def fetch_token_balance_batch(wallet_addresses, token_addresses, block_numbers, node_provider_url, api_key):
    balanceof_function = "balanceOf(address)(uint256)"
    balanceof_signature = Signature(balanceof_function)
    payload_list = []
    for i, (wallet_address, token_address, block_number) in enumerate(
        zip(
            wallet_addresses,
            token_addresses,
            block_numbers,
        )
    ):
        block_number_hex = Web3.toHex(primitive=block_number)
        data = balanceof_signature.encode_data([wallet_address]).hex()
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_call",
            "params": [
                {
                    "to": token_address,
                    "data": "0x" + data,
                },
                block_number_hex,
            ],
            "id": i + 1,
        }
        payload_list.append(payload)
    headers = {"Content-Type": "application/json", "Accept-Encoding": "gzip"}
    url = f"{node_provider_url}/{api_key}"
    res = requests.post(url, headers=headers, json=payload_list)
    res_data_list = res.json()
    balances = []
    for res_data in res_data_list:
        balance_encoded_hex = res_data["result"]
        balance_encoded_bytes = Web3.toBytes(hexstr=balance_encoded_hex)
        balance_decoded = Call.decode_output(balance_encoded_bytes, balanceof_signature, returns=None)
        balances.append(balance_decoded)
    return balances
Some things to keep in mind:

You can’t batch an unlimited number of requests. You’re limited by the maximum response size, and maximum number of requests per second allowed by your plan. (This depends on the node provider you use.)
Despite being much faster than the naive approach, the problem with batching is that you will still end up using the same amount of API credits. Depending on your use-case this can be cost prohibitive.
Using a multicall contract
Multicall contracts are smart contracts that allow multiple function calls to be bundled together and be executed as a single function call.

Similar to batching requests, using a multicall significantly speeds up bulk fetching balances. The other benefit: It’s a lot more cost efficient. Instead of being charged for each separate “eth_call” request, you’ll only be charged for a single request.

The code that uses the multicall contract is a bit long. To make it more readable I have broken the code up into two functions: the main function fetch_token_balance_multicall and the inner function create_multicall_payload_list .

def fetch_token_balance_multicall(wallet_addresses, token_addresses, block_numbers, node_provider_url, api_key):
    block_map = defaultdict(lambda: [])
    for block_number, token_address, wallet_address in zip(block_numbers, token_addresses, wallet_addresses):
        block_map[block_number].append((token_address, wallet_address))
    aggregate_function = "tryBlockAndAggregate(bool,(address,bytes)[])(uint256,uint256,(bool,bytes)[])"
    aggregate_signature = Signature(aggregate_function)
    balanceof_function = "balanceOf(address)(uint256)"
    balanceof_signature = Signature(balanceof_function)
    payload_list = create_multicall_payload_list(block_map, aggregate_signature, balanceof_signature)
    headers = {"Content-Type": "application/json", "Accept-Encoding": "gzip"}
    url = f"{node_provider_url}/{api_key}"
    res = requests.post(url, headers=headers, json=payload_list)
    res_data_list = res.json()
    balances = []
    for res_data in res_data_list:
        output_hex = res_data["result"]
        output_bytes = Web3.toBytes(hexstr=output_hex)
        returns = None
        decoded_output = Call.decode_output(
            output_bytes,
            aggregate_signature,
            returns,
        )
        output_pairs = decoded_output[2]
        for flag, balance_encoded in output_pairs:
            balance_decoded = Call.decode_output(balance_encoded, balanceof_signature, returns)
            balances.append(balance_decoded)
    return balances
The fetch_token_balance_multicall logic is very similar to what we have already seen in the previous sections. All the interesting logic is contained in create_multicall_payload_list . That being said, there is still one thing worth mentioning:

fetch_token_balance_multicall combines both request batching and the use of a multicall contract. The request batching was implemented to enable us to fetch historical balances across multiple blocks in a single call.
Now the interesting code:

def create_multicall_payload_list(block_map, balanceof_signature, aggregate_signature):
    multicall3_address = "0xcA11bde05977b3631167028862bE2a173976CA11"
    state_override_code = load_state_override_code()
    require_success = False
    gas_limit = 50000000
    payload_list = []
    for i, block_number in enumerate(block_map.keys()):
        block_number_hex = Web3.toHex(primitive=block_number)
        call_params_list = []
        for token_address, wallet_address in block_map[block_number]:
            call_params_list.append(
                {
                    "to": token_address,
                    "data": balanceof_signature.encode_data([wallet_address]),
                },
            )
        multicall_params = [
            {
                "to": multicall3_address,
                "data": Web3.toHex(
                    aggregate_signature.encode_data(
                        [
                            require_success,
                            [[c["to"], c["data"]] for c in call_params_list],
                        ]
                    )
                ),
            },
            block_number_hex,
        ]
        if gas_limit:
            multicall_params[0]["gas"] = Web3.toHex(primitive=gas_limit)
        if state_override_code:
            multicall_params.append({multicall3_address: {"code": state_override_code}})
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_call",
            "params": multicall_params,
            "id": i + 1,
        }
        payload_list.append(payload)
The create_multicall_payload_list function creates the payload_list for a batch JSON-RPC request. For each block we create a separate payload and append it to the list.

Each payload is an “eth_call” request. The call we are making is to the tryBlockAndAggregate(bool, (address,bytes)[])(uint256, uint256,(bool,bytes)[]) function, which requires us provide it with the list of calls we want to aggregate into a single call.

Things to note:

If the number of balances you’re fetching is large you should set a high value for “gas_limit”. The value of 50000000 will almost always work.
“state_override_code” is a long hexadecimal string that needs to be provided in order for us to be able to fetch historical balances.
The multicall contract I am using can be found here: https://etherscan.io/address/0xcA11bde05977b3631167028862bE2a173976CA11. But it’s also possible to use other multicall contracts.
Final remarks
All code and test cases can be found on my Github here: https://github.com/martkir/get-erc20-balance.

If you have any questions or want to give feedback on anything I have written you can let me know on Twitter @martkiro.

If you’re working with onchain data you might also be interested in checking out https://www.syve.ai where we are indexing the Ethereum blockchain



# Multicall

## Multicall3

[Multicall3](https://www.multicall3.com/) is a powerful tool that offers batch contract calls to smart contracts on the Filecoin Virtual Machine (FVM).

Multicall3 is deployed on over 100 chains at `0xcA11bde05977b3631167028862bE2a173976CA11`. A sortable, searchable list of all chains it's deployed on can be found [here](https://multicall3.com/deployments).

The [multicall3 ABI](https://multicall3.com/abi) can be downloaded or copied to the clipboard in various formats, including:

* Solidity interface.
* JSON ABI, prettified.
* JSON ABI, minified.
* [ethers.js](https://docs.ethers.org/v5/) human readable ABI.
* [viem](https://viem.sh/) human readable ABI.

Alternatively, you can:

* Download the ABI from the [releases](https://github.com/mds1/multicall/releases) page.
* Copy the ABI from [Etherscan](https://etherscan.io/address/0xcA11bde05977b3631167028862bE2a173976CA11#code).
* Install [Foundry](https://github.com/gakonst/foundry/) and run `cast interface 0xcA11bde05977b3631167028862bE2a173976CA11`.

### Contract address

Multicall has the same, precomputed address for all of the networks it is deployed on.

| Name                                                                                                             | Address                                      | Mainnet | Calibration |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------- | ----------- |
| [Multicall - Mainnet](https://filfox.info/en/address/0xcA11bde05977b3631167028862bE2a173976CA11?t=3)             | `0xcA11bde05977b3631167028862bE2a173976CA11` | ✔️      | ❌           |
| [Multicall - Calibration](https://calibration.filscan.io/en/address/0xcA11bde05977b3631167028862bE2a173976CA11/) | `0xcA11bde05977b3631167028862bE2a173976CA11` | ❌       | ✔️          |

### Usage

To use Multicall3 to send batch contract read/write to your smart contract, you will need to:

1. Obtain the Multicall3 contract address for the network you're using (Filecoin mainnet or Calibration testnet).
2. Get the Multicall3 ABI, which can be downloaded or copied from various sources mentioned above.
3. Create an instance of the Multicall3 contract using a web3 library like ethers.js or viem.
4. Prepare your batch calls, including the target contract addresses, function selectors, and input data.
5. Use the appropriate Multicall3 method (e.g., `aggregate3` for multiple calls) to execute your batch operations.
6. Process the returned data from the Multicall3 contract.

The steps above differ slightly for integrations using smart contracts, where steps 2 and 3 are replaced with:

2. Import the Multicall3 interface in your smart contract.
3. Create a function that interacts with the Multicall3 contract using the imported interface.

Many libraries and tools such as [ethers-rs](https://docs.rs/ethers/latest/ethers/), [viem](https://viem.sh/), and [ape](https://apeworx.io/) have native Multicall3 integration which can be used in your projects directly. To learn how to use Multicall3 with these tools, check out [Multicall3 examples folder](https://github.com/mds1/multicall/blob/main/examples)

#### Batching Contract Reads

Batching contract reads, one of the most common use cases, allows a single `eth_call` JSON RPC request to return the results of multiple contract function calls. It has many benefits:

1. **Reduced JSON RPC Requests**: Multicall reduces the number of separate JSON RPC requests that need to be sent. This is particularly useful when using remote nodes, such as GLIF. By aggregating multiple contract reads into a single JSON-RPC request, Multicall (1) reduces RPC usage and therefore costs, and (2) reduces the number of round trips between the client and the node, which can significantly improve performance
2. **Consistent Data from the Same Block**: Multicall guarantees that all values returned are from the same block. This ensures data consistency and reliability, as all the read operations are performed on the same state of the blockchain.
3. **Detection of Stale Data**: Multicall enables the block number or timestamp to be returned with the read data. This feature helps in detecting stale data, as developers can compare the block number or timestamp with the current state of the blockchain to ensure the data is up-to-date.

When directly interacting with the Multicall3 contract to batch calls, you'll typically use the `aggregate3` method. This method allows you to execute multiple contract calls in a single transaction. Here's an explanation of how it works, along with examples:

1. Solidity Implementation: The `aggregate3` method is implemented in the Multicall3 contract like this:

   ```solidity
   function aggregate3(Call3[] calldata calls) public payable returns (Result[] memory returnData) {
       uint256 length = calls.length;
       returnData = new Result[](length);
       for (uint256 i = 0; i < length;) {
           (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
           if (calls[i].allowFailure) {
               returnData[i] = Result(success, ret);
           } else {
               require(success, "Multicall3: call failed");
               returnData[i] = Result(true, ret);
           }
           unchecked { ++i; }
       }
   }
   ```
2. Example of sending multicalls to this smart contract: Here's an example using ethers.js to interact with the Multicall3 contract:

   ```javascript
   const { ethers } = require("ethers");

   const provider = new ethers.providers.JsonRpcProvider("https://api.node.glif.io/rpc/v1");
   const multicallAddress = "0xcA11bde05977b3631167028862bE2a173976CA11";
   const multicallAbi = [/* Multicall3 ABI */];
   const multicall = new ethers.Contract(multicallAddress, multicallAbi, provider);

   // Example: Batch balance checks for multiple addresses
   async function batchBalanceChecks(addresses) {
     const calls = addresses.map(address => ({
       target: "0x...", // ERC20 token address
       allowFailure: false,
       callData: ethers.utils.id("balanceOf(address)").slice(0, 10) + 
                 ethers.utils.defaultAbiCoder.encode(["address"], [address]).slice(2)
     }));

     const results = await multicall.aggregate3(calls);
     return results.map(result => ethers.utils.defaultAbiCoder.decode(["uint256"], result.returnData)[0]);
   }

   batchBalanceChecks(["0x123...", "0x456...", "0x789..."]).then(console.log);
   ```

This example demonstrates how to use Multicall3 to batch multiple `balanceOf` calls for an ERC20 token in a single transaction, significantly reducing the number of separate RPC calls needed.

#### Batch Contract Writes

> :warning: Multicall3, while unaudited, can be safely used for batching on-chain writes when used correctly. As a stateless contract, it should never hold funds after a transaction ends, and users should never approve it to spend tokens.

When using Multicall3, it's crucial to understand two key aspects: the behavior of `msg.sender` in calls versus delegatecalls, and the risks associated with `msg.value` in multicalls.

In FVM, there are two types of accounts: Externally Owned Accounts (EOAs) controlled by private keys, and Contract Accounts controlled by code. The `msg.sender` value during contract execution depends on whether a CALL or DELEGATECALL opcode is used. CALL changes the execution context, while DELEGATECALL preserves it.

For EOAs, which can only use CALL, Multicall3's address becomes the `msg.sender` for subsequent calls. This limits its usefulness from EOAs to scenarios where **`msg.sender` is irrelevant**. However, contract wallets or other contracts can use either CALL or DELEGATECALL, with the latter preserving the original `msg.sender`.

The handling of `msg.value` in multicalls requires caution. Since `msg.value` doesn't change with delegatecalls, relying on it within a multicall can lead to security vulnerabilities. To learn more about this, see [here](https://github.com/runtimeverification/verified-smart-contracts/wiki/List-of-Security-Vulnerabilities#payable-multicall) and [here](https://samczsun.com/two-rights-might-make-a-wrong/).

## Hints

Lotus FEVM RPC supports Ethereum batch transactions. The key difference between `multicall` and batch transactions is that `multicall` aggregates multiple RPC requests into a single call, while batch transactions are simply an array of transactions executed sequentially but sent in one request. For more details, please refer to the [Ethereum documentation](https://geth.ethereum.org/docs/interacting-with-geth/rpc/batch).

[Was this page helpful?](https://airtable.com/apppq4inOe4gmSSlk/pagoZHC2i1iqgphgl/form?prefill_Page+URL=https://docs.filecoin.io/smart-contracts/advanced/multicall)


Use getAllBalances (or getEvmBalances / getCosmosBalances) from the Squid SDK.

Squid exposes wallet balance helpers that return balances for supported tokens across chains. You initialize the SDK, then call the balance method you need with the wallet address and chain IDs. See the full examples in getAllBalances.


Copy
const squid = new Squid({
  baseUrl: "https://v2.api.squidrouter.com",
  integratorId: "squid-test"
});
await squid.init();

// EVM-only balances
const evmBalances = await squid.getEvmBalances({
  userAddress: "0x344b63c2BcB4B61765083735e8F49Bb203415a33",
  chains: [1, 43114, 8453]
});

// All balances (EVM + Cosmos)
const allBalances = await squid.getAllBalances({
  chainIds: ["osmosis-1", 43114, 8453],
  evmAddress: "0x344b63c2BcB4B61765083735e8F49Bb203415a33",
  cosmosAddresses: [
    { address: "cosmos1...", chainId: "cosmoshub-4", coinType: 118 }
  ]
});



# getAllBalances

Squid's SDK provides a function to get the balance of every token we support by providing an address for each environment.

```typescript
const squid = new Squid({
  baseUrl: "https://v2.api.squidrouter.com",
  integratorId: "squid-test"
});

await squid.init();

const allBalances = await squid.getAllBalances({
  chainIds: ["osmosis-1", 43114, 8453],
  evmAddress: "0x344b63c2BcB4B61765083735e8F49Bb203415a33",
  cosmosAddresses: [
    {
        address: "cosmos1awrua7e2kj69d7vn5qt5tccrhavmj9xajl58pw",
        chainId: "cosmoshub-4",
        coinType: 118
     }
  ]
})
// result:
// {
//   cosmos: [
//     {
//       balance: "676727870",
//       denom:
//         "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1",
//       chainId: "osmosis-1",
//       decimals: 6
//     },
//     {
//       balance: "5987424",
//       denom: "uosmo",
//       chainId: "osmosis-1",
//       decimals: 6
//     }
//   ],
//   evm: [
//     {
//       balance: "2981435909446986",
//       symbol: "ETH",
//       address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
//       decimals: 18,
//       chainId: "8453"
//     },
//     {
//       balance: "788395441854562446",
//       symbol: "AVAX",
//       address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
//       decimals: 18,
//       chainId: "43114"
//     }
//   ]
// }

const evmBalances = await squid.getEvmBalances({
  userAddress: "0x344b63c2BcB4B61765083735e8F49Bb203415a33",
  chains: [1, 43114, 8453]
})

// result:
// [
//     {
//       balance: "41345097216001030",
//       symbol: "ETH",
//       address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
//       decimals: 18,
//       chainId: "1"
//     }, {
//       balance: "9424225",
//       symbol: "USDC",
//       address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
//       decimals: 6,
//       chainId: "1"
//     }, {
//       balance: "81435909446986",
//       symbol: "ETH",
//       address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
//       decimals: 18,
//       chainId: "8453"
//     }, {
//       balance: "788395441854562446",
//       symbol: "AVAX",
//       address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
//       decimals: 18,
//       chainId: "43114"
//     }
//   ]

const cosmos = await squid.getCosmosBalances({
  addresses: [
    {
      chainId: "cosmoshub",
      address: "cosmos1awrua7e2kj69d7vn5qt5tccrhavmj9xajl58pw",
      coinType: 118
    }
  ]
})
// result:
//  [
//    {
//       balance: "1804685",
//       denom: "uatom",
//       chainId: "cosmoshub-4",
//       decimals: 6
//     }
//   ]

```
