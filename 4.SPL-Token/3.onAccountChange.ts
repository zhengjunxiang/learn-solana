const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");

const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
);

// 获取 Token 账户地址
async function getTokenAccount(connection, owner, mint) {
    console.log("🔹 正在查询 Token 账户...");
    const accounts = await connection.getParsedTokenAccountsByOwner(owner, { mint: mint });

    if (accounts.value.length > 0) {
        console.log("✅ 找到 Token 账户:", accounts.value[0].pubkey.toBase58());
        return accounts.value[0].pubkey;
    } else {
        console.log("⚠️ 未找到 Token 账户");
        return null;
    }
}

async function main() {
    console.log("🔹 监听 Token 账户余额变化...");
    
    // 账户公钥和 Token Mint 地址
    const account = new web3.PublicKey("2asHPY75gaEjvXXBDaVKkZQvA44zdhNdBeuBYCtoq5Rj");
    const tokenMint = new web3.PublicKey("3rQBaAAfLxUXddEhqa1dj2gKS53ZdcNKcwYP3Qz3gs7D");

    // 查询 Token 账户
    const tokenAccount = await getTokenAccount(connection, account, tokenMint);

    if (!tokenAccount) {
        console.error("❌ 监听失败: 该账户没有关联的 Token 账户");
        return;
    }

    console.log("🔹 开始监听账户:", tokenAccount.toBase58());

    // 先获取当前的 Token 余额
    let lastBalance = 0;
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    if (accountInfo && accountInfo.data) {
        const decodedData = splToken.AccountLayout.decode(accountInfo.data);
        lastBalance = Number(decodedData.amount) / 1e9; // 转换为 9 位精度
        console.log(`🔹 初始 Token 余额: ${lastBalance} 个（精度 9 位）`);
    }

    // 监听 Token 账户余额变化
    connection.onAccountChange(tokenAccount, async (accountInfo) => {
        // 获取 SPL Token 账户数据并解码
        const parsedData = accountInfo.data;
        if (parsedData && parsedData.length > 0) {
            // 使用 spl-token 的 AccountLayout 解码数据
            const decodedData = splToken.AccountLayout.decode(parsedData);

            const tokenBalance = Number(decodedData.amount) / 1e9; // 转换为 9 位精度

            // 打印余额变化
            if (lastBalance !== 0) {
                const changeInBalance = tokenBalance - lastBalance;
                console.log(`🔄 Token 余额变化: ${changeInBalance} 个（精度 9 位）`);
            }

            // 更新上一次的余额
            lastBalance = tokenBalance;
        } else {
            console.log("⚠️ 无法解析 Token 账户数据");
        }
    });

}

main().catch(console.error);
