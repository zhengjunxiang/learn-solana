const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const fs = require("fs");

const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
);

function loadWalletKey(filename) {
    const secretKey = JSON.parse(fs.readFileSync(filename).toString());
    return web3.Keypair.fromSecretKey(new Uint8Array(secretKey));
}

async function main() {
    console.log("🔹 加载本地钱包...");
    const keypair = loadWalletKey("id.json");
    const payer = keypair;
    const mintAuthority = keypair;
    const freezeAuthority = keypair;

    console.log("✅ 钱包已加载:", payer.publicKey.toBase58());

    console.log("\n🔹 正在创建 SPL Token...");
    const tokenMint = await splToken.createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        freezeAuthority.publicKey,
        9
    );
    console.log("创建新SPLToken", tokenMint.toBase58());

    console.log("\n🔹 创建 Token Account...");
    const payerTokenAccount = await splToken.createAssociatedTokenAccount(
        connection,
        payer,
        tokenMint,
        keypair.publicKey
    );

    console.log("✅ Token 账户:", payerTokenAccount.toBase58());

    const mintAmount = 100 * 1e9; // 100 枚代币（9 位小数）
    console.log("\n🔹 铸造代币...");
    await splToken.mintTo(
        connection,
        payer,
        tokenMint,
        payerTokenAccount,
        mintAuthority,
        mintAmount
    );
    console.log(`✅ 成功铸造 ${mintAmount / 1e9} 个代币`);

    console.log("\n🔹 查询 Token 账户余额...");
    const payerTokenAccountInfo = await splToken.getAccount(
        connection,
        payerTokenAccount
    );
    console.log(`✅ Token 余额: ${Number(payerTokenAccountInfo.amount) / 1e9}`);
}

main().catch(console.error);

