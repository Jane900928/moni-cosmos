const Block = require('./Block');
const Transaction = require('./Transaction');
const crypto = require('crypto');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // 挖矿难度
    this.pendingTransactions = [];
    this.miningReward = 100; // 挖矿奖励
    this.balances = new Map(); // 地址余额映射
  }

  createGenesisBlock() {
    const genesisBlock = new Block(0, [], '0');
    console.log('创世区块已创建');
    return genesisBlock;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async minePendingTransactions(miningRewardAddress) {
    console.log('\n=== 开始挖矿 ===');
    
    // 添加挖矿奖励交易
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward, 'mining_reward');
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      this.chain.length,
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    // 挖矿
    block.mineBlock(this.difficulty);
    
    console.log('区块已成功挖出并添加到区块链！');
    this.chain.push(block);

    // 更新余额
    this.updateBalances(block);
    
    // 清空待处理交易
    this.pendingTransactions = [];
    
    return block;
  }

  updateBalances(block) {
    for (const tx of block.transactions) {
      if (tx.type === 'mining_reward' || tx.type === 'mint') {
        // 挖矿奖励或铸币
        const currentBalance = this.balances.get(tx.toAddress) || 0;
        this.balances.set(tx.toAddress, currentBalance + tx.amount);
      } else if (tx.type === 'transfer') {
        // 转账
        if (tx.fromAddress) {
          const fromBalance = this.balances.get(tx.fromAddress) || 0;
          this.balances.set(tx.fromAddress, fromBalance - tx.amount);
        }
        
        const toBalance = this.balances.get(tx.toAddress) || 0;
        this.balances.set(tx.toAddress, toBalance + tx.amount);
      } else if (tx.type === 'burn') {
        // 销毁代币
        const fromBalance = this.balances.get(tx.fromAddress) || 0;
        this.balances.set(tx.fromAddress, fromBalance - tx.amount);
      }
    }
  }

  async createTransaction(transaction) {
    // 验证交易
    if (!await transaction.isValid()) {
      throw new Error('无法添加无效交易到链中');
    }

    // 检查余额（除了挖矿奖励和铸币交易）
    if (transaction.type === 'transfer' && transaction.fromAddress) {
      const balance = this.getBalance(transaction.fromAddress);
      if (balance < transaction.amount) {
        throw new Error('余额不足');
      }
    }

    this.pendingTransactions.push(transaction);
    console.log(`交易已添加到待处理列表: ${transaction.amount} 代币从 ${transaction.fromAddress || '系统'} 到 ${transaction.toAddress}`);
  }

  getBalance(address) {
    return this.balances.get(address) || 0;
  }

  getAllBalances() {
    const balances = {};
    for (const [address, balance] of this.balances) {
      balances[address] = balance;
    }
    return balances;
  }

  async isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!await currentBlock.hasValidTransactions()) {
        console.log('发现无效交易');
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log('无效的区块hash');
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log('无效的前一个区块hash');
        return false;
      }
    }

    return true;
  }

  getBlockByIndex(index) {
    return this.chain[index];
  }

  getBlockByHash(hash) {
    return this.chain.find(block => block.hash === hash);
  }

  getTransactionById(txId) {
    for (const block of this.chain) {
      const transaction = block.transactions.find(tx => tx.txId === txId);
      if (transaction) {
        return {
          transaction,
          blockIndex: block.index,
          blockHash: block.hash
        };
      }
    }
    return null;
  }

  getChainInfo() {
    return {
      length: this.chain.length,
      difficulty: this.difficulty,
      pendingTransactions: this.pendingTransactions.length,
      totalSupply: Array.from(this.balances.values()).reduce((sum, balance) => sum + balance, 0),
      latestBlock: this.getLatestBlock().toJSON()
    };
  }

  mintTokens(toAddress, amount) {
    const mintTx = new Transaction(null, toAddress, amount, 'mint');
    this.pendingTransactions.push(mintTx);
    console.log(`铸造 ${amount} 个代币到地址 ${toAddress}`);
    return mintTx;
  }

  toJSON() {
    return {
      chain: this.chain.map(block => block.toJSON()),
      difficulty: this.difficulty,
      pendingTransactions: this.pendingTransactions.map(tx => tx.toJSON ? tx.toJSON() : tx),
      miningReward: this.miningReward,
      balances: this.getAllBalances()
    };
  }
}

module.exports = Blockchain;