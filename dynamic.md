# Add Dynamic to NextJS

**Purpose:** Enforce only the **current** and **correct** instructions for integrating [Dynamic](https://dynamic.xyz/) into a NextJS application.
**Scope:** All AI-generated advice or code related to Dynamic must follow these guardrails.

## **1. OFFICIAL DYNAMIC + NEXTJS SETUP**

1. Create a NextJS project with App Router.
2. Install the Dynamic React SDK with `npm install @dynamic-labs/sdk-react-core@latest` (or yarn/pnpm/bun).

pnpm add viem @dynamic-labs/wagmi-connector wagmi @tanstack/react-query @dynamic-labs/sdk-react-core @dynamic-labs/algorand @dynamic-labs/bitcoin @dynamic-labs/cosmos @dynamic-labs/ethereum @dynamic-labs/flow @dynamic-labs/solana @dynamic-labs/spark @dynamic-labs/starknet @dynamic-labs/sui @dynamic-labs/tron

import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";

import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import {
  createConfig,
  WagmiProvider,
} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { mainnet } from 'viem/chains';
import { AlgorandWalletConnectors } from "@dynamic-labs/algorand";
import { BitcoinWalletConnectors } from "@dynamic-labs/bitcoin";
import { CosmosWalletConnectors } from "@dynamic-labs/cosmos";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { SparkWalletConnectors } from "@dynamic-labs/spark";
import { StarknetWalletConnectors } from "@dynamic-labs/starknet";
import { SuiWalletConnectors } from "@dynamic-labs/sui";
import { TronWalletConnectors } from "@dynamic-labs/tron";

const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "id",
        walletConnectors: [AlgorandWalletConnectors,BitcoinWalletConnectors,CosmosWalletConnectors,EthereumWalletConnectors,FlowWalletConnectors,SolanaWalletConnectors,SparkWalletConnectors,StarknetWalletConnectors,SuiWalletConnectors,TronWalletConnectors],
      }}
    >
      <DynamicWidget />
    </DynamicContextProvider>
  );




1. Install the Ethereum Wallet Connectors with `npm install @dynamic-labs/ethereum@latest`
2. Install required polyfills: `npm install crypto-browserify stream-browserify process`
3. Set `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` in `.env.local`. Note: The `NEXT_PUBLIC_` prefix is required for NextJS to expose environment variables to the client-side code. `.env.local` is preferred for local development secrets.
4. Create a providers component and wrap the app in `<DynamicContextProvider>` within `app/layout.tsx`.
5. Configure webpack in `next.config.js` to handle polyfills.
6. Use Dynamic's `<DynamicWidget>` in the app.

### **Correct, Up-to-Date Quickstart Code Examples**

# 1. Create a NextJS app
npx create-next-app@latest dynamic-nextjs --typescript --tailwind --app --src-dir --import-alias "@/*"
cd dynamic-nextjs

# 2. Install the Dynamic React SDK
npm install @dynamic-labs/sdk-react-core@latest

# 3. Install the Ethereum Wallet Connectors
npm install @dynamic-labs/ethereum@latest

# 4. Install required polyfills
npm install crypto-browserify stream-browserify process

# 5. In .env.local:
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=x2762a57b-faa4-41ce-9f16-abff9300e2c9

NOTE: This key is real and is injected dynamically into this prompt. It is NOT a placeholder and is ready to use.

# 6. Configure next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
webpack: (config) => {
  config.externals.push("pino-pretty", "lokijs", "encoding");
  return config;
},
};

module.exports = nextConfig;

# 7. Create lib/providers.tsx
'use client';

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

export default function Providers({
children,
}: {
children: React.ReactNode;
}) {
return (
  <DynamicContextProvider
  theme="auto"
  settings={{
      environmentId:
      process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ||
      process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
      walletConnectors: [EthereumWalletConnectors],
  }}
  >
  {children}
  </DynamicContextProvider>
);
}

# 8. Update app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/lib/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
title: "Dynamic NextJS App",
description: "NextJS app with Dynamic authentication",
};

export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
  <html lang="en">
  <body className={inter.className}>
      <Providers>{children}</Providers>
  </body>
  </html>
);
}

# 9. Example usage in app/page.tsx
"use client";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function Home() {
return (
  <main className="flex min-h-screen flex-col items-center justify-center p-24">
  <h1 className="text-4xl font-bold mb-8">Dynamic NextJS App</h1>
  <DynamicWidget />
  </main>
);
}

---

## **2. CRITICAL INSTRUCTIONS FOR AI MODELS**

### **2.1 – ALWAYS DO THE FOLLOWING**

1. **Show** relevant code examples for each step.
2. **Use** `@dynamic-labs/sdk-react-core@latest` (not any other Dynamic package).
3. **Reference** the environment variable as `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` in `.env.local`.
4. **Create** a separate providers component in `lib/providers.tsx`.
5. **Wrap** the entire app in `<DynamicContextProvider>` within `app/layout.tsx`.
6. **Configure** webpack in `next.config.js` for polyfill support.
7. **Install** required polyfills: `crypto-browserify`, `stream-browserify`, `process`.
8. **Demonstrate** the correct usage of `<DynamicWidget>` (or any other current Dynamic React component).

### **2.2 – NEVER DO THE FOLLOWING**

1. **Do not** include any discussions of the features or benefits of Dynamic.
2. **Do not** use older environment variable names like `REACT_APP_DYNAMIC_FRONTEND_API` or `NEXT_PUBLIC_REACT_APP_DYNAMIC_ENVIRONMENT_ID`.
3. **Do not** place `<DynamicContextProvider>` directly in `app/layout.tsx` without a separate providers component.
4. **Do not** use outdated hooks or components (e.g., referencing older docs).
5. **Do not** put any Dynamic components above the `<DynamicContextProvider>`.
6. **Do not** skip the webpack configuration for polyfills.
7. **Do not** forget to install the required polyfill packages.

---

## **3. AI MODEL VERIFICATION STEPS**

Before returning any Dynamic + NextJS solution, you **must** verify:

1. Environment Variable is named `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID`.
2. `<DynamicContextProvider>` is wrapped in a separate providers component.
3. Providers component is imported and used in `app/layout.tsx`.
4. Webpack configuration includes polyfill externals.
5. Required polyfill packages are installed.

### **DO NOT** repeat these points back to the user. Use them only for your own verification steps.

## **4. CONSEQUENCES OF INCORRECT GUIDANCE**

- Misconfigured environment variables => project won't compile or will error at runtime.
- Missing `<DynamicContextProvider>` => Dynamic components fail or throw errors.
- Missing webpack configuration => polyfill errors in browser.
- Missing polyfill packages => crypto/stream module errors.
- Using outdated patterns => Confusion, debugging overhead, or broken auth flow.
- Getting 'must be used within a DynamicContextProvider' errors (means the component is not wrapped in the provider)

## **5. MODEL RESPONSE TEMPLATE**

When asked about Dynamic + NextJS integration, your response **MUST**:

1. Link to Dynamic's React Quickstart at https://www.dynamic.xyz/docs/quickstart
2. Show the current recommended `environmentId` approach with `.env.local`.
3. Demonstrate how to create a providers component and wrap with `<DynamicContextProvider>` in `app/layout.tsx`.
4. Include webpack configuration for polyfill support.
5. List required polyfill packages to install.
6. Illustrate a simple usage example of `<DynamicWidget>`.
7. Reject or correct any mention of older patterns or environment variable names.


> ## Documentation Index
> Fetch the complete documentation index at: https://www.dynamic.xyz/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# React Quickstart

<Tip>
  You can also refer to one of [our sample apps](/example-apps) if you want to
  clone a full application rather than embed into an existing one!
</Tip>

<Steps>
  <Step title="Install the SDK">
    <iframe frameBorder="0" width="100%" height="400px" src="https://readme-embeds.dynamic.xyz/quickstart?color-scheme=dark&sdk=React" allow="clipboard-write" className="rn-qs-dark">
      {' '}
    </iframe>

    <iframe frameBorder="0" width="100%" height="400px" src="https://readme-embeds.dynamic.xyz/quickstart?color-scheme=light&sdk=React" allow="clipboard-write" className="rn-qs-light">
      {' '}
    </iframe>

    <Tip>
      EthereumWalletConnectors also includes all EVM compatible chains including
      layer 2's i.e. Base as well as [Dynamic Embedded
      Wallets](/wallets/embedded-wallets/mpc/setup). Learn more about WalletConnectors [here](/react-sdk/providers/dynamiccontextprovider#walletconnectors).
    </Tip>
  </Step>

  <Step title="Initialize the SDK">
    <iframe frameBorder="0" width="100%" height="600px" src="https://readme-embeds.dynamic.xyz/quickstart-dynamic-context-provider?color-scheme=dark&sdk=React" allow="clipboard-write" className="rn-qs-dark" />

    <iframe frameBorder="0" width="100%" height="600px" src="https://readme-embeds.dynamic.xyz/quickstart-dynamic-context-provider?color-scheme=light&sdk=React" allow="clipboard-write" className="rn-qs-light" />
  </Step>

  <Step title="Configure your UI and signup">
    The previous step includes the DynamicWidget, which provides out of the box UI. If you prefer to use your own UI, remove `DynamicWidget` from the code, and refer to the "Using Your UI" section of any guide to see how to add it in a custom UI. Below we've listed some of the common signup options for you to configure in your own Dynamic environment.

    <CardGroup>
      <Card href="/authentication-methods/email">
        Add email signup
      </Card>

      <Card href="/authentication-methods/sms">
        Add sms signup
      </Card>

      <Card href="/authentication-methods/social">
        Add social signup
      </Card>

      <Card href="/authentication-methods/passkey">
        Add passkey signup
      </Card>

      <Card href="/authentication-methods/external-wallets">
        Add external wallet signup
      </Card>
    </CardGroup>
  </Step>
</Steps>

<Note>
  If you are using Wagmi, make sure to read our [full Wagmi
  guide](/react-sdk/using-wagmi) for more setup instructions.
</Note>

<Tip>
  If you're using Vite, you'll need to check out [the polyfills guide](/troubleshooting/react/vitejs-polyfills-necessary-for-dynamic-sdk).

  If you see any other errors, it's worth checking out [Dynamic Doctor](/troubleshooting/dynamic-doctor) for quick debugging tips!
</Tip>

<Tip>
  To quickly test the login flow, you can enable [Test
  Accounts](/developer-dashboard/test-accounts) in Sandbox mode.
</Tip>



> ## Documentation Index
> Fetch the complete documentation index at: https://www.dynamic.xyz/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# React Quickstart

<Tip>
  You can also refer to one of [our sample apps](/example-apps) if you want to
  clone a full application rather than embed into an existing one!
</Tip>

<Steps>
  <Step title="Install the SDK">
    <iframe frameBorder="0" width="100%" height="400px" src="https://readme-embeds.dynamic.xyz/quickstart?color-scheme=dark&sdk=React" allow="clipboard-write" className="rn-qs-dark">
      {' '}
    </iframe>

    <iframe frameBorder="0" width="100%" height="400px" src="https://readme-embeds.dynamic.xyz/quickstart?color-scheme=light&sdk=React" allow="clipboard-write" className="rn-qs-light">
      {' '}
    </iframe>

    <Tip>
      EthereumWalletConnectors also includes all EVM compatible chains including
      layer 2's i.e. Base as well as [Dynamic Embedded
      Wallets](/wallets/embedded-wallets/mpc/setup). Learn more about WalletConnectors [here](/react-sdk/providers/dynamiccontextprovider#walletconnectors).
    </Tip>
  </Step>

  <Step title="Initialize the SDK">
    <iframe frameBorder="0" width="100%" height="600px" src="https://readme-embeds.dynamic.xyz/quickstart-dynamic-context-provider?color-scheme=dark&sdk=React" allow="clipboard-write" className="rn-qs-dark" />

    <iframe frameBorder="0" width="100%" height="600px" src="https://readme-embeds.dynamic.xyz/quickstart-dynamic-context-provider?color-scheme=light&sdk=React" allow="clipboard-write" className="rn-qs-light" />
  </Step>

  <Step title="Configure your UI and signup">
    The previous step includes the DynamicWidget, which provides out of the box UI. If you prefer to use your own UI, remove `DynamicWidget` from the code, and refer to the "Using Your UI" section of any guide to see how to add it in a custom UI. Below we've listed some of the common signup options for you to configure in your own Dynamic environment.

    <CardGroup>
      <Card href="/authentication-methods/email">
        Add email signup
      </Card>

      <Card href="/authentication-methods/sms">
        Add sms signup
      </Card>

      <Card href="/authentication-methods/social">
        Add social signup
      </Card>

      <Card href="/authentication-methods/passkey">
        Add passkey signup
      </Card>

      <Card href="/authentication-methods/external-wallets">
        Add external wallet signup
      </Card>
    </CardGroup>
  </Step>
</Steps>

<Note>
  If you are using Wagmi, make sure to read our [full Wagmi
  guide](/react-sdk/using-wagmi) for more setup instructions.
</Note>

<Tip>
  If you're using Vite, you'll need to check out [the polyfills guide](/troubleshooting/react/vitejs-polyfills-necessary-for-dynamic-sdk).

  If you see any other errors, it's worth checking out [Dynamic Doctor](/troubleshooting/dynamic-doctor) for quick debugging tips!
</Tip>

<Tip>
  To quickly test the login flow, you can enable [Test
  Accounts](/developer-dashboard/test-accounts) in Sandbox mode.
</Tip>


> ## Documentation Index
> Fetch the complete documentation index at: https://www.dynamic.xyz/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# React Quickstart

<Tip>
  You can also refer to one of [our sample apps](/example-apps) if you want to
  clone a full application rather than embed into an existing one!
</Tip>

<Steps>
  <Step title="Install the SDK">
    <iframe frameBorder="0" width="100%" height="400px" src="https://readme-embeds.dynamic.xyz/quickstart?color-scheme=dark&sdk=React" allow="clipboard-write" className="rn-qs-dark">
      {' '}
    </iframe>

    <iframe frameBorder="0" width="100%" height="400px" src="https://readme-embeds.dynamic.xyz/quickstart?color-scheme=light&sdk=React" allow="clipboard-write" className="rn-qs-light">
      {' '}
    </iframe>

    <Tip>
      EthereumWalletConnectors also includes all EVM compatible chains including
      layer 2's i.e. Base as well as [Dynamic Embedded
      Wallets](/wallets/embedded-wallets/mpc/setup). Learn more about WalletConnectors [here](/react-sdk/providers/dynamiccontextprovider#walletconnectors).
    </Tip>
  </Step>

  <Step title="Initialize the SDK">
    <iframe frameBorder="0" width="100%" height="600px" src="https://readme-embeds.dynamic.xyz/quickstart-dynamic-context-provider?color-scheme=dark&sdk=React" allow="clipboard-write" className="rn-qs-dark" />

    <iframe frameBorder="0" width="100%" height="600px" src="https://readme-embeds.dynamic.xyz/quickstart-dynamic-context-provider?color-scheme=light&sdk=React" allow="clipboard-write" className="rn-qs-light" />
  </Step>

  <Step title="Configure your UI and signup">
    The previous step includes the DynamicWidget, which provides out of the box UI. If you prefer to use your own UI, remove `DynamicWidget` from the code, and refer to the "Using Your UI" section of any guide to see how to add it in a custom UI. Below we've listed some of the common signup options for you to configure in your own Dynamic environment.

    <CardGroup>
      <Card href="/authentication-methods/email">
        Add email signup
      </Card>

      <Card href="/authentication-methods/sms">
        Add sms signup
      </Card>

      <Card href="/authentication-methods/social">
        Add social signup
      </Card>

      <Card href="/authentication-methods/passkey">
        Add passkey signup
      </Card>

      <Card href="/authentication-methods/external-wallets">
        Add external wallet signup
      </Card>
    </CardGroup>
  </Step>
</Steps>

<Note>
  If you are using Wagmi, make sure to read our [full Wagmi
  guide](/react-sdk/using-wagmi) for more setup instructions.
</Note>

<Tip>
  If you're using Vite, you'll need to check out [the polyfills guide](/troubleshooting/react/vitejs-polyfills-necessary-for-dynamic-sdk).

  If you see any other errors, it's worth checking out [Dynamic Doctor](/troubleshooting/dynamic-doctor) for quick debugging tips!
</Tip>

<Tip>
  To quickly test the login flow, you can enable [Test
  Accounts](/developer-dashboard/test-accounts) in Sandbox mode.
</Tip>



> ## Documentation Index
> Fetch the complete documentation index at: https://www.dynamic.xyz/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Authenticate with External Wallets

## Enable Branded Wallet Signup/Login

<Steps>
  <Step title="Enable Chains & Add Connectors">
    The first step is to enable the appropriate chains that you'd like to support and add the appropriate connectors to your app. The following [chains and networks configuration guide](/chains/enabling-chains) will show you how to do both.

    We support Ethereum, all EVM-compatible networks, Solana, Eclipse, Flow, Bitcoin, Algorand, Starknet, Cosmos Hub, Axelar, Noble, Osmosis, Sei and Sui.
  </Step>

  <Step title="Configure RPC">
    You can use the default RPC URLs that we provide for each chain/network, but if you'd like to configure your own, please follow [this RPC guide](/chains/rpc-urls).
  </Step>

  <Step title="Enable Web3 Wallet Signup">
    In [the Log in & User Profile section of the dashboard](https://app.dynamic.xyz/dashboard/log-in-user-profile), toggle on Wallet Log in under "External Wallets" and you're good to go!
  </Step>
</Steps>

## Multi-Wallet

In the dashboard, under External Wallets, you can toggle on Multi-Wallet. This option, when toggled on, allows your end users to have more than one connected wallet to their account and change between them. In this way users don't have to sign out and back in again if they want to use a different wallet, they simply switch between them. You can learn more about Multi-Wallet on [the overview page](/wallets/external-wallets/multi-wallet).

## Using our UI

Once enabled, external wallet login is available by default in the Dynamic UI components i.e. DynamicWidget.

## Using your UI

#### Fetch available wallets

<Tabs>
  <Tab title="React">
    You can find the list of available wallets in the `walletOptions` prop returned by the [useWalletOptions hook](/react-sdk/hooks/wallets/usewalletoptions).

    <Tip>
      When browsing wallets in the Dynamic Widget, you might see labels beside them like "Last Used", "Multichain" or "Recommended".

      Last used comes from the "dynamic\_last\_used\_wallet" value in localstorage.
      "Multichain" comes from the `chainGroup` node in each wallet (Remember to also add [the WalletConnectors](/chains/enabling-chains#enabling-a-chain-network) for each chain).
      "Recommended" from [the Recommended Wallets feature](/wallets/external-wallets/recommend-wallets).
    </Tip>

    ### Implementation

    ```tsx React theme={"system"}
    import { useWalletOptions } from '@dynamic-labs/sdk-react-core';

    const WalletList = () => {
      const { walletOptions } = useWalletOptions();
      
      return (
        <div>
          {walletOptions.map((wallet) => (
            <div key={wallet.key}>
              <span>{wallet.name}</span>
              <span>{wallet.description}</span>
            </div>
          ))}
        </div>
      );
    };
    ```
  </Tab>

  <Tab title="React Native">
    Coming soon.
  </Tab>

  <Tab title="Swift">
    Coming soon.
  </Tab>

  <Tab title="Flutter">
    Coming soon.
  </Tab>
</Tabs>

#### Display a wallet icon

<Tabs>
  <Tab title="React">
    Use the `@dynamic-labs/wallet-book` library to display a wallet icon using the exported `WalletIcon` component. This component takes a `walletKey` prop, which is the key of the wallet you want to display.

    ```tsx React theme={"system"}
    import { WalletIcon } from '@dynamic-labs/wallet-book'

    const WalletIconComponent = () => {
      return <WalletIcon walletKey="metamask" />
    }
    ```
  </Tab>

  <Tab title="React Native">
    Coming soon.
  </Tab>

  <Tab title="Swift">
    Coming soon.
  </Tab>

  <Tab title="Flutter">
    Coming soon.
  </Tab>
</Tabs>

#### Connect to a wallet

<Tabs>
  <Tab title="React">
    ### useWalletOptions

    [useWalletOptions](/react-sdk/hooks/wallets/usewalletoptions) allows you to prompt the user to connect using a specific wallet (by passing in the key).

    You can see how to find the available wallet keys in [Fetch & Display Wallets to Connect](/wallets/using-wallets/general/fetch-display-wallets#wallet-keys-when-you-need-them).

    ```tsx  theme={"system"}
    import { useWalletOptions } from "@dynamic-labs/sdk-react-core";

    // component setup etc.

    const { selectWalletOption } = useWalletOptions();

    const connectWithWallet = async (walletKey) => {
      return await selectWalletOption(walletKey)
    }
    ```

    ### Further Configuration

    When you enabled External Wallets, by default you will be in what's called "connect-and-sign" mode. It's worth reading about the implications of this in [the overview of authentication modes](/wallets/external-wallets/connected-vs-authenticated) to decide what's right for your use case.

    There's a bunch of further customizations you can do for the Branded Wallet experience including things like [sorting and filtering wallets](/wallets/external-wallets/sort-and-filter-wallets), so it's worth reviewing [the advanced wallets section of the docs](/wallets/external-wallets) in depth when you're ready.
  </Tab>

  <Tab title="React Native">
    Coming soon.
  </Tab>

  <Tab title="Javascript">
    The JS SDK exposes three connection paths. Use them based on when you want verification to occur.

    ### Prerequisites

    * Initialize the Dynamic Client and add relevant chain extensions (see [create client](/javascript-sdk/client/create-dynamic-client), [EVM extensions](/javascript-sdk/evm/adding-evm-extensions), [Solana extensions](/javascript-sdk/solana/adding-solana-extensions)).

    ### 1) Connect and verify in one step

    Account is added only after a successful verification signature.

    ```ts  theme={"system"}
    import { connectAndVerifyWithWalletProvider } from '@dynamic-labs-sdk/client';

    export async function connectAndVerify(walletProviderKey) {
      return connectAndVerifyWithWalletProvider({ walletProviderKey });
    }
    ```

    ### 2) Connect without verifying

    Account is stored in the local session (not yet associated to a Dynamic user). Use this to defer verification.

    ```ts  theme={"system"}
    import { connectWithWalletProvider } from '@dynamic-labs-sdk/client';

    export async function connectOnly(walletProviderKey) {
      return connectWithWalletProvider({ walletProviderKey });
    }
    ```

    ### 3) Verify a previously connected account

    Upgrades a session-only account to verified and assigns `verifiedCredentialId`.

    ```ts  theme={"system"}
    import { verifyWalletAccount } from '@dynamic-labs-sdk/client';

    export async function verifyLater(walletAccount) {
      return verifyWalletAccount({ walletAccount });
    }
    ```

    Error handling: failed verification leaves the account unassociated; connection failures do not add a new account. Expect separate provider entries per chain (e.g., `metamaskevm`, `metamasksol`).
  </Tab>

  <Tab title="Swift">
    Coming soon.
  </Tab>

  <Tab title="Flutter">
    Coming soon.
  </Tab>
</Tabs>



> ## Documentation Index
> Fetch the complete documentation index at: https://www.dynamic.xyz/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Authenticate with External Wallets

## Enable Branded Wallet Signup/Login

<Steps>
  <Step title="Enable Chains & Add Connectors">
    The first step is to enable the appropriate chains that you'd like to support and add the appropriate connectors to your app. The following [chains and networks configuration guide](/chains/enabling-chains) will show you how to do both.

    We support Ethereum, all EVM-compatible networks, Solana, Eclipse, Flow, Bitcoin, Algorand, Starknet, Cosmos Hub, Axelar, Noble, Osmosis, Sei and Sui.
  </Step>

  <Step title="Configure RPC">
    You can use the default RPC URLs that we provide for each chain/network, but if you'd like to configure your own, please follow [this RPC guide](/chains/rpc-urls).
  </Step>

  <Step title="Enable Web3 Wallet Signup">
    In [the Log in & User Profile section of the dashboard](https://app.dynamic.xyz/dashboard/log-in-user-profile), toggle on Wallet Log in under "External Wallets" and you're good to go!
  </Step>
</Steps>

## Multi-Wallet

In the dashboard, under External Wallets, you can toggle on Multi-Wallet. This option, when toggled on, allows your end users to have more than one connected wallet to their account and change between them. In this way users don't have to sign out and back in again if they want to use a different wallet, they simply switch between them. You can learn more about Multi-Wallet on [the overview page](/wallets/external-wallets/multi-wallet).

## Using our UI

Once enabled, external wallet login is available by default in the Dynamic UI components i.e. DynamicWidget.

## Using your UI

#### Fetch available wallets

<Tabs>
  <Tab title="React">
    You can find the list of available wallets in the `walletOptions` prop returned by the [useWalletOptions hook](/react-sdk/hooks/wallets/usewalletoptions).

    <Tip>
      When browsing wallets in the Dynamic Widget, you might see labels beside them like "Last Used", "Multichain" or "Recommended".

      Last used comes from the "dynamic\_last\_used\_wallet" value in localstorage.
      "Multichain" comes from the `chainGroup` node in each wallet (Remember to also add [the WalletConnectors](/chains/enabling-chains#enabling-a-chain-network) for each chain).
      "Recommended" from [the Recommended Wallets feature](/wallets/external-wallets/recommend-wallets).
    </Tip>

    ### Implementation

    ```tsx React theme={"system"}
    import { useWalletOptions } from '@dynamic-labs/sdk-react-core';

    const WalletList = () => {
      const { walletOptions } = useWalletOptions();
      
      return (
        <div>
          {walletOptions.map((wallet) => (
            <div key={wallet.key}>
              <span>{wallet.name}</span>
              <span>{wallet.description}</span>
            </div>
          ))}
        </div>
      );
    };
    ```
  </Tab>

  <Tab title="React Native">
    Coming soon.
  </Tab>

  <Tab title="Swift">
    Coming soon.
  </Tab>

  <Tab title="Flutter">
    Coming soon.
  </Tab>
</Tabs>

#### Display a wallet icon

<Tabs>
  <Tab title="React">
    Use the `@dynamic-labs/wallet-book` library to display a wallet icon using the exported `WalletIcon` component. This component takes a `walletKey` prop, which is the key of the wallet you want to display.

    ```tsx React theme={"system"}
    import { WalletIcon } from '@dynamic-labs/wallet-book'

    const WalletIconComponent = () => {
      return <WalletIcon walletKey="metamask" />
    }
    ```
  </Tab>

  <Tab title="React Native">
    Coming soon.
  </Tab>

  <Tab title="Swift">
    Coming soon.
  </Tab>

  <Tab title="Flutter">
    Coming soon.
  </Tab>
</Tabs>

#### Connect to a wallet

<Tabs>
  <Tab title="React">
    ### useWalletOptions

    [useWalletOptions](/react-sdk/hooks/wallets/usewalletoptions) allows you to prompt the user to connect using a specific wallet (by passing in the key).

    You can see how to find the available wallet keys in [Fetch & Display Wallets to Connect](/wallets/using-wallets/general/fetch-display-wallets#wallet-keys-when-you-need-them).

    ```tsx  theme={"system"}
    import { useWalletOptions } from "@dynamic-labs/sdk-react-core";

    // component setup etc.

    const { selectWalletOption } = useWalletOptions();

    const connectWithWallet = async (walletKey) => {
      return await selectWalletOption(walletKey)
    }
    ```

    ### Further Configuration

    When you enabled External Wallets, by default you will be in what's called "connect-and-sign" mode. It's worth reading about the implications of this in [the overview of authentication modes](/wallets/external-wallets/connected-vs-authenticated) to decide what's right for your use case.

    There's a bunch of further customizations you can do for the Branded Wallet experience including things like [sorting and filtering wallets](/wallets/external-wallets/sort-and-filter-wallets), so it's worth reviewing [the advanced wallets section of the docs](/wallets/external-wallets) in depth when you're ready.
  </Tab>

  <Tab title="React Native">
    Coming soon.
  </Tab>

  <Tab title="Javascript">
    The JS SDK exposes three connection paths. Use them based on when you want verification to occur.

    ### Prerequisites

    * Initialize the Dynamic Client and add relevant chain extensions (see [create client](/javascript-sdk/client/create-dynamic-client), [EVM extensions](/javascript-sdk/evm/adding-evm-extensions), [Solana extensions](/javascript-sdk/solana/adding-solana-extensions)).

    ### 1) Connect and verify in one step

    Account is added only after a successful verification signature.

    ```ts  theme={"system"}
    import { connectAndVerifyWithWalletProvider } from '@dynamic-labs-sdk/client';

    export async function connectAndVerify(walletProviderKey) {
      return connectAndVerifyWithWalletProvider({ walletProviderKey });
    }
    ```

    ### 2) Connect without verifying

    Account is stored in the local session (not yet associated to a Dynamic user). Use this to defer verification.

    ```ts  theme={"system"}
    import { connectWithWalletProvider } from '@dynamic-labs-sdk/client';

    export async function connectOnly(walletProviderKey) {
      return connectWithWalletProvider({ walletProviderKey });
    }
    ```

    ### 3) Verify a previously connected account

    Upgrades a session-only account to verified and assigns `verifiedCredentialId`.

    ```ts  theme={"system"}
    import { verifyWalletAccount } from '@dynamic-labs-sdk/client';

    export async function verifyLater(walletAccount) {
      return verifyWalletAccount({ walletAccount });
    }
    ```

    Error handling: failed verification leaves the account unassociated; connection failures do not add a new account. Expect separate provider entries per chain (e.g., `metamaskevm`, `metamasksol`).
  </Tab>

  <Tab title="Swift">
    Coming soon.
  </Tab>

  <Tab title="Flutter">
    Coming soon.
  </Tab>
</Tabs>


> ## Documentation Index
> Fetch the complete documentation index at: https://www.dynamic.xyz/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# useTokenBalances

### Summary

Used to fetch the token balances of an account on a specified network. The default behavior is to return the token balances of the primary account on the current network, but optionally the account, network, includeFiat and includeNativeBalance can be specified.

Chain support includes 66 EVM networks, Solana Mainnet and Devnet, Eclipse Mainnet and Bitcoin Ruins. You can checkout the full list [here](/react-sdk/token-balances#supported-chains)

<Note>
  This will return all tokens with at least 10,000 USD in liquidity unless using `filterSpamTokens: false` in the hook parameters. This applies to total token liquidity.
</Note>

### Usage

```jsx  theme={"system"}
import { useTokenBalances } from "@dynamic-labs/sdk-react-core";

const { tokenBalances, isLoading, isError, error } = useTokenBalances();
```

```json  theme={"system"}
// tokenBalances
[
  {
    "networkId": 1,
    "address": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    "name": "Polygon",
    "symbol": "MATIC",
    "decimals": 18,
    "logoURI": "https://assets.coingecko.com/coins/images/4713/thumb/polygon.png?1698233745",
    "balance": 0.7851804304793578,
    "rawBalance": 785180430479357800,
    "price": 0.703229,
    "marketValue": 0.5521616489455683
  },
  {
    "networkId": 1,
    "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "name": "USDC",
    "symbol": "USDC",
    "decimals": 6,
    "logoURI": "https://assets.coingecko.com/coins/images/6319/thumb/usdc.png?1696506694",
    "balance": 50,
    "rawBalance": 50000000,
    "price": 1,
    "marketValue": 50
  }
]
```

#### With arguments

| Parameter            | Type      | Description                                           |
| :------------------- | :-------- | :---------------------------------------------------- |
| networkId            | Number    | The network ID                                        |
| chainName            | ChainEnum | The chain used                                        |
| tokenAddresses       | String\[] | The token addresses                                   |
| includeFiat          | Boolean   | Should include Fiat prices                            |
| includeNativeBalance | Boolean   | Should include native balance                         |
| forceRefresh         | Boolean   | Refreshes the cached balances                         |
| filterSpamTokens     | Boolean   | Defaults to true to filter spam tokens out            |
| whitelistedContracts | String\[] | Return these contracts, even when originally filtered |

Optionally, you can pass an object with the account address and network id specified. Additionally, you can pass an array of token addresses to filter the results.

```jsx  theme={"system"}
import { useTokenBalances } from "@dynamic-labs/sdk-react-core";

const { tokenBalances, isLoading, isError, error } = useTokenBalances({
  networkId: 1,
  accountAddress: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
  includeFiat: true,
  includeNativeBalance: true,
});

return (
  <ul>
    {tokenBalances?.map((tokenBalance) => (
      <li key={tokenBalance.address}>
        {tokenBalance.name} {tokenBalance.balance} {tokenBalance.symbol} ($
        {tokenBalance.price}) | ${tokenBalance.marketValue}
      </li>
    ))}
  </ul>
);
```

Refresh token balances after a transaction

```jsx  theme={"system"}
import { useTokenBalances } from "@dynamic-labs/sdk-react-core";
import { ChainEnum } from "@dynamic-labs/sdk-api-core";

const { fetchAccountBalances, tokenBalances, isLoading, isError, error } = useTokenBalances({
  chainName: ChainEnum.Evm,
  accountAddress: address,
  includeFiat: true,
  includeNativeBalance: true,
});

// send transaction
const txHash = await sendTransaction({...});
// wait for transaction receipt
await publicClient.waitForTransactionReceipt(txHash);
// refresh token balances once the transaction receipt has resolved
fetchAccountBalances(true);
```

```jsx  theme={"system"}
// with token addresses filter
import { useTokenBalances } from "@dynamic-labs/sdk-react-core";

const { tokenBalances, isLoading, isError, error } = useTokenBalances({
  networkId: 1,
  accountAddress: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
  tokenAddresses: ["0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"],
});
```

Solana support with Fiat prices (with SDK version 2.2.9)

```jsx  theme={"system"}
import { useTokenBalances } from "@dynamic-labs/sdk-react-core";
import { ChainEnum } from "@dynamic-labs/sdk-api";

const { tokenBalances, isLoading, isError, error } = useTokenBalances({
  chainName: ChainEnum.Sol,
  accountAddress: address,
  includeFiat: true,
  includeNativeBalance: true,
});
```

> ## Documentation Index
> Fetch the complete documentation index at: https://www.dynamic.xyz/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# useMultichainTokenBalances

### Summary

Used to fetch multichain token balances across wallets linked to the user.

<Tip>
  You must be on SDK version 4.25.3 or higher
</Tip>

### Restrictions

* There is a rate limit of 20 requests per IP per hour as this queries more data
* You can only have a maximum of 5 addresses per request you can retrieve
* You can only make requests for linked wallet addresses
* You can only make requests for enabled chains and networks
* There currently needs to be at least 10,000 USD in liquidity for the token to be returned. This applies to total token liquidity.
* Chain support includes 66 EVM networks, Solana Mainnet and testnet, Eclipse Mainnet and Bitcoin Ruins. You can checkout the full list [here](/react-sdk/token-balances#supported-chains)

### Usage

```jsx  theme={"system"}
import { useMultichainTokenBalances } from "@dynamic-labs/sdk-react-core";

const { multichainTokenBalances, isLoading, isError, error } = useMultichainTokenBalances(
    filterSpamTokens: false, // this is true by default and removes suspected spam tokens from the response. Setting to false removes this filtering
    requests: [
        {
            "chain": ChainEnum.Evm,
            "address": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
            "networkIds": [1] // network IDs for enabled EVM networks,
            "whitelistedContracts": [0x...] // contract addresses that should not be filtered out due to our spam criteria defined above
        },
        {
            "chain": ChainEnum.Sol, // use this for SVM networks (including eclipse)
            "address": "CKEAuq1E7hUcrjDcu1xP6nax3YBvEhhq7qaCzDUkPNer",
            "networkIds": [101]
        },
        {
            "chain": ChainEnum.Btc,
            "address": "bc1pynfpvf0lghwu9l3u07fwhsu5093jwyjrlqax0r53z8mqe8ed4q5qfcs9t7",
            "networkIds": [1] // we only support balances on BTC mainnet so please use 1 for the network ID
        }
    ]
);
```

```jsx  theme={"system"}
Response structure:

[
    {
        "chain": "EVM",
        "networks": [
            {
                "networkId": 1,
                "balances": [
                    {
                        "address": "0x9de16c805a3227b9b92e39a446f9d56cf59fe640",
                        "balance": 7877386.999999999,
                        "decimals": 18,
                        "id": null,
                        "isNative": false,
                        "liquidityPoolSizeUsd": 35339.2792275625,
                        "logoURI": "https://api.dune.com/api/echo/beta/token/logo/8453/0x9de16c805a3227b9b92e39a446f9d56cf59fe640",
                        "marketValue": 0.053820792951712056,
                        "name": "Bento",
                        "networkId": 8453,
                        "price": 6.832315455837331e-9,
                        "rawBalance": 7.877387e+24,
                        "symbol": "BENTO"
                    },
                    ...
                ]
            }
        ],
        "walletAddress": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"
    }
]
```




javascrpt:
pnpm add @dynamic-labs-sdk/client @dynamic-labs-sdk/evm @dynamic-labs-sdk/solana viem

import { createDynamicClient } from "@dynamic-labs-sdk/client";

import { addEvmExtension } from "@dynamic-labs-sdk/evm";
import { addSvmExtension } from "@dynamic-labs-sdk/solana";

const client = createDynamicClient({
  environmentId: "",
  metadata: {
    name: "[YOUR_APP_NAME]",
    url: "[YOUR_APP_URL]",
  },
});

// Add extensions based on your chain configuration
addEvmExtension(client);
addSvmExtension(client);



Node:
pnpm add @dynamic-labs-wallet/node-evm
pnpm add @dynamic-labs-wallet/node-svm

// Import statements
import { DynamicEvmWalletClient } from '@dynamic-labs-wallet/node-evm';
import { ThresholdSignatureScheme } from '@dynamic-labs-wallet/core';
import { DynamicSvmWalletClient } from '@dynamic-labs-wallet/node-svm';
import { ThresholdSignatureScheme } from '@dynamic-labs-wallet/core';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { baseSepolia } from 'viem/chains';
import { parseEther } from 'viem/utils';

// Initialize EVM client
export const authenticatedEvmClient = async ({
  authToken,
  environmentId,
}: {
  authToken: string;
  environmentId: string;
}) => {
  const client = new DynamicEvmWalletClient({
    environmentId,
    enableMPCAccelerator: true, // Optional: enables the MPC accelerator for faster MPC operations
  });

  await client.authenticateApiToken(authToken);
  return client;
};
// Initialize SVM client
export const authenticatedSvmClient = async () => {
  const client = new DynamicSvmWalletClient({
    authToken: process.env.DYNAMIC_AUTH_TOKEN!,
    environmentId: '903885a4-159d-42d1-8bc3-19fe12fec2de',
  });
  await client.authenticateApiToken(process.env.DYNAMIC_AUTH_TOKEN!);
  return client;
};

// Example usage
async function main() {
  try {
    // Initialize the EVM client
    const evmClient = await authenticatedEvmClient({
      authToken: process.env.DYNAMIC_AUTH_TOKEN!,
      environmentId: '903885a4-159d-42d1-8bc3-19fe12fec2de',
    });

    // Create a new EVM wallet
    const evmWallet = await evmClient.createWalletAccount({
      thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
      password: "your-secure-password", // Optional: Password for wallet encryption
      onError: (error: Error) => {
        console.error("EVM wallet creation error:", error);
      },
      backUpToClientShareService: true,
    });

    console.log("EVM wallet created:", evmWallet.accountAddress);

    const address = evmWallet.accountAddress;

    // Sign an EVM transaction
    const chain = baseSepolia;
    const publicClient = evmClient.createViemPublicClient({
      chain: baseSepolia,
      rpcUrl: "https://sepolia.base.org",
    });

    const transactionRequest = {
      to: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      value: parseEther("0.0001"),
    };

    const tx = await publicClient?.prepareTransactionRequest({
      ...transactionRequest,
      chain,
      account: address as `0x${string}`,
    });

    const signedTx = await evmClient.signTransaction({
      senderAddress: address,
      transaction: tx,
      password: "your-secure-password", // Optional
    });

    console.log("EVM transaction signed:", signedTx);
    // Initialize the SVM client
    const svmClient = await authenticatedSvmClient();

    // Create a new SVM wallet
    const svmWallet = await svmClient.createWalletAccount({
      thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
      password: "your-secure-password", // Optional: Password for wallet encryption
      onError: (error: Error) => {
        console.error("SVM wallet creation error:", error);
      },
      backUpToClientShareService: true,
    });

    console.log("SVM wallet created:", svmWallet.accountAddress);

    // Connect to Solana devnet
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );

    const amountInSol = 0.01;
    const recipientAddress = "Eu...";

    // Use the Dynamic wallet address as sender
    const address = svmWallet.accountAddress;
    const senderPublicKey = new PublicKey(address);

    // Convert SOL to lamports
    const amountInLamports = amountInSol * LAMPORTS_PER_SOL;

    // Create recipient public key
    const recipientPublicKey = new PublicKey(recipientAddress);

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: recipientPublicKey,
        lamports: amountInLamports,
      })
    );

    // Get latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;

    // Sign the transaction with your Dynamic wallet
    const signedSvmTx = await svmClient.signTransaction({
      senderAddress: address,
      transaction,
      password: "your-secure-password", // Optional
    });

    console.log("SVM transaction signed:", signedSvmTx);

    // Send the signed transaction
    const signature = await connection.sendRawTransaction(
      signedSvmTx.serialize()
    );
    await connection.confirmTransaction(signature);

    console.log("Transaction sent and confirmed:", signature);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main();