declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      // Add other ethereum provider methods as needed
    };
  }
}

export {};
