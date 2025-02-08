import { Keypair } from "@solana/web3.js";
import base58 from 'bs58';
import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";

const keypair = Keypair.generate();

console.log(`The is keypair: `, keypair);
console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);
console.log(`The secret key is: `, base58.encode(keypair.secretKey));
console.log(`The secret key is: `, base58.decode(base58.encode(keypair.secretKey)));
console.log(`✅ Finished!`);

const keypair1 = getKeypairFromEnvironment("SECRET_KEY");

console.log(`The secret key is: `, base58.encode(keypair1.secretKey));

const userKeypair2 =  Keypair.fromSecretKey(keypair1.secretKey)

console.log(userKeypair2)
// 转换为Base58编码
console.log(`The public key is:`,userKeypair2.publicKey.toBase58())
// 处理私钥的打印格式
console.log(`The secret key is:`,base58.encode(userKeypair2.secretKey))


console.log(
  `✅ Finished! We've loaded our secret key securely, using an env file!`
);