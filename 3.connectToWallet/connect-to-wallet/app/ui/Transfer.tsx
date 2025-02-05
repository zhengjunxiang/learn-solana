
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey, Connection } from '@solana/web3.js'
import { useState, useEffect, useCallback } from 'react'

export default function TransferComponent() {
  // Solana 相关钩子
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  // 状态管理
  const [balance, setBalance] = useState<number>(0)
  const [amount, setAmount] = useState<string>('')
  const [recipient, setRecipient] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  interface BalanceCheckParams {
    publicKey: PublicKey;
    connection: Connection;
  }

  const getBalance = useCallback(({ publicKey, connection }: BalanceCheckParams): void => {
    connection.getBalance(publicKey).then((balance: number) => {
      setBalance(balance / LAMPORTS_PER_SOL)
    }).catch((error: Error) => {
      console.error('error:', error)
    })
  }, [])

  // 查询余额
  useEffect(() => {
    if (!publicKey) return
    getBalance({ publicKey, connection })
  }, [publicKey, connection, getBalance])

  // 执行转账
  const handleTransfer = async () => {
    if (!publicKey || !recipient || !amount) {
      setStatus('请填写完整信息')
      return
    }

    try {
      setStatus('处理中...')
      // 创建交易
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL // 转换为 lamports
        })
      )

      // 发送并确认交易
      const signature = await sendTransaction(transaction, connection)
      const latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash
      })

      setStatus(`转账成功！交易哈希: ${signature}`)
    } catch (error) {
      console.error(error)
      setStatus(`转账失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      getBalance({ publicKey, connection })
    }
  }

  return (
    <div className="solana-wallet-container">
      {/* 显示钱包信息 */}
      {publicKey && (
        <div className="wallet-info">
          <p>钱包地址: {publicKey.toBase58()}</p>
          <p>余额: {balance} SOL</p>
        </div>
      )}

      {/* 转账表单 */}
      <div className="transfer-form">
        <input
          type="text"
          placeholder="接收地址"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="number"
          placeholder="金额 (SOL)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          onClick={handleTransfer}
          disabled={!publicKey || !amount || !recipient}
        >
          转账
        </button>
      </div>

      {/* 状态显示 */}
      {status && <div className="status">{status}</div>}
    </div>
  )
}
