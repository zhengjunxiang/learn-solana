const {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} = require("@solana/web3.js");

// 连接到 Solana 开发网
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// 1. 初始化新钱包
function createWallet() {
  // 生成随机密钥对
  const keypair = Keypair.generate();

  console.log("新钱包地址:", keypair.publicKey.toString());
  console.log("私钥（Base58）:", keypair.secretKey); // 保存此私钥！
  return keypair;
}

// 2. 转账 SOL
async function sendSol(senderKeypair, receiverAddress, amountSOL) {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: senderKeypair.publicKey,
      toPubkey: receiverAddress,
      lamports: amountSOL * LAMPORTS_PER_SOL // 转换 SOL 为 lamports
    })
  );

  // 发送并确认交易
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [senderKeypair] // 签名者列表
  );

  console.log("\n✅ 转账成功！交易哈希:", signature);
  return signature;
}

// 3. 获取测试网 SOL（空投）
async function airdropSol(publicKey, amountSOL = 1) {
  const airdropSignature = await connection.requestAirdrop(
    publicKey,
    amountSOL * LAMPORTS_PER_SOL
  );

  await connection.confirmTransaction(airdropSignature);
  console.log("\n🪂 空投成功！获得", amountSOL, "SOL");
}

// 示例用法
(async () => {
  // 创建两个钱包
  const walletA = createWallet();
  const walletB = createWallet();

  // 给钱包A空投 1 SOL（测试网专用）
  await airdropSol(walletA.publicKey, 1);

  // 从钱包A向钱包B转账 0.5 SOL
  await sendSol(walletA, walletB.publicKey, 0.5);
})();