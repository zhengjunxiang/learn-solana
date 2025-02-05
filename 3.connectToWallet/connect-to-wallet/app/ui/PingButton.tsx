import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import * as web3 from '@solana/web3.js'
import { FC } from 'react'

const PingButton: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const onClick = () => {
    if (!connection || !publicKey) {
      return;
    }

    const programId = new web3.PublicKey('ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa');
    const programDataAccount = new web3.PublicKey('Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod');
    const transaction = new web3.Transaction();

    const instruction = new web3.TransactionInstruction({
      keys: [
        {
          pubkey: programDataAccount,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId,
    });

    transaction.add(instruction);
    sendTransaction(transaction, connection).then((sig) => {
      console.log(sig);
    });
  }

  return (
    <div className="" onClick={onClick}>
      <button className="">Ping!</button>
    </div>
  )
}

export default PingButton