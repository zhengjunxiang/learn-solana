import {
  Connection,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";

const suppliedToPubkey = process.argv[2] || null;

if (!suppliedToPubkey) {
  console.log(`Please provide a public key to send to`);
  process.exit(1);
}

const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");

console.log(`suppliedToPubkey: ${suppliedToPubkey}`);
console.log(`senderKeypair.publicKey: ${senderKeypair.publicKey}`);

const toPubkey = new PublicKey(suppliedToPubkey);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

console.log(
  `✅ Loaded our own keypair, the destination public key, and connected to Solana`
);

const accountInfo = await connection.getAccountInfo(toPubkey);
if (accountInfo === null) {
  console.log("Recipient account is not initialized, initializing...");
  // Here you can add logic to initialize the recipient's account, typically by transferring SOL to it.
}

const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(0); // For an empty account
console.log(`Rent exemption amount: ${rentExemptionAmount}`);
console.log(`LAMPORTS_PER_SOL: ${LAMPORTS_PER_SOL}`);

const transferInstruction = SystemProgram.transfer({
  fromPubkey: senderKeypair.publicKey,
  toPubkey: toPubkey,
  lamports: rentExemptionAmount, // Ensure the recipient's account has enough SOL to pay for rent
});

const transaction = new Transaction().add(transferInstruction);
const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
console.log(`Funded recipient account with rent exemption amount. Signature: ${signature}`);

// const transaction = new Transaction()

// const LAMPORTS_TO_SEND = 5000;

// const sendSolInstruction = SystemProgram.transfer({
//   fromPubkey: senderKeypair.publicKey,
//   toPubkey,
//   lamports: LAMPORTS_TO_SEND
// })

// transaction.add(sendSolInstruction)

// const signature = await sendAndConfirmTransaction(connection, transaction, [
//   senderKeypair
// ])

// console.log(
//   `💸 Finished! Sent ${LAMPORTS_TO_SEND} to the address ${toPubkey}. `
// );
// console.log(`Transaction signature is ${signature}!`);


