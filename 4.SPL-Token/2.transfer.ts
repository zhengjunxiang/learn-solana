const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const fs = require("fs");

const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
);

function loadWalletKey(filename) {
    const secretKey = JSON.parse(fs.readFileSync(filename, "utf8"));
    return web3.Keypair.fromSecretKey(new Uint8Array(secretKey));
}

async function main() {
    console.log("🔹 加载钱包...");
    const from = loadWalletKey("id.json");
    console.log("✅ 发送者地址:", from.publicKey.toBase58());

    const to = new web3.PublicKey("2asHPY75gaEjvXXBDaVKkZQvA44zdhNdBeuBYCtoq5Rj");
    const tokenMint = new web3.PublicKey("3rQBaAAfLxUXddEhqa1dj2gKS53ZdcNKcwYP3Qz3gs7D");

    console.log("🔹 获取或创建发送者的 Token 账户...");
    const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection,
        from,
        tokenMint,
        from.publicKey
    );
    console.log("✅ 发送者 Token 账户:", fromTokenAccount.address.toBase58());

    console.log("🔹 获取或创建接收者的 Token 账户...");
    const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection,
        from,
        tokenMint,
        to
    );
    console.log("✅ 接收者 Token 账户:", toTokenAccount.address.toBase58());

    const amount = 1 * 1e9; // 1 代币（假设有 9 位小数）

    console.log("🔹 构建转账交易...");
    let transferInstruction = splToken.createTransferInstruction(
        fromTokenAccount.address, // 发送者的 token 账户
        toTokenAccount.address,   // 接收者的 token 账户
        from.publicKey,           // 发送者的公钥
        amount,                   // 发送数量
        [],
        splToken.TOKEN_PROGRAM_ID
    );

    let transaction = new web3.Transaction().add(transferInstruction);

    console.log("🔹 发送交易...");
    let signature = await web3.sendAndConfirmTransaction(connection, transaction, [from]);
    console.log("✅ 交易成功，签名:", signature);

}

main().catch(console.error);
