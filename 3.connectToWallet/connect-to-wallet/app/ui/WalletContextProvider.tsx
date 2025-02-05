import { useMemo, ReactNode } from 'react'
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import * as web3 from "@solana/web3.js"
import * as walletAdapterWallets from "@solana/wallet-adapter-wallets"
import "@solana/wallet-adapter-react-ui/styles.css"

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const endpoint = useMemo(() => web3.clusterApiUrl("devnet"), []);

  const wallets = useMemo(
    () => [
      new walletAdapterWallets.PhantomWalletAdapter(),
      new walletAdapterWallets.SolflareWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
