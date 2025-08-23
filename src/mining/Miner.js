const Wallet = require('../wallet/Wallet');

class Miner {
  constructor(name, blockchain) {
    this.name = name;
    this.blockchain = blockchain;
    this.wallet = new Wallet(`Miner-${name}`);
    this.isActive = false;
    this.miningInterval = null;
    this.blocksMinedCount = 0;
    this.totalRewards = 0;
  }

  async initialize() {
    // 确保钱包密钥对生成完成
    if (!this.wallet.address) {
      await new Promise(resolve => {
        const checkWallet = () => {
          if (this.wallet.address) {
            resolve();
          } else {
            setTimeout(checkWallet, 100);
          }
        };
        checkWallet();
      });
    }
    
    console.log(`矿工 ${this.name} 初始化完成`);
    console.log(`矿工地址: ${this.wallet.address}`);
  }

  startMining(intervalMs = 30000) { // 默认30秒挖一次
    if (this.isActive) {
      console.log(`矿工 ${this.name} 已在挖矿中`);
      return;
    }

    this.isActive = true;
    console.log(`\n矿工 ${this.name} 开始挖矿...`);
    console.log(`挖矿间隔: ${intervalMs / 1000} 秒`);

    this.miningInterval = setInterval(async () => {
      await this.mineBlock();
    }, intervalMs);

    // 立即挖第一个块
    setTimeout(() => this.mineBlock(), 1000);
  }

  stopMining() {
    if (!this.isActive) {
      console.log(`矿工 ${this.name} 当前未在挖矿`);
      return;
    }

    this.isActive = false;
    if (this.miningInterval) {
      clearInterval(this.miningInterval);
      this.miningInterval = null;
    }

    console.log(`矿工 ${this.name} 已停止挖矿`);
    console.log(`总共挖出 ${this.blocksMinedCount} 个区块，获得 ${this.totalRewards} 代币奖励`);
  }

  async mineBlock() {
    try {
      if (this.blockchain.pendingTransactions.length === 0) {
        console.log(`矿工 ${this.name}: 没有待处理的交易，跳过本次挖矿`);
        return;
      }

      console.log(`\n矿工 ${this.name} 正在挖矿...`);
      console.log(`待处理交易数量: ${this.blockchain.pendingTransactions.length}`);
      
      const block = await this.blockchain.minePendingTransactions(this.wallet.address);
      
      this.blocksMinedCount++;
      this.totalRewards += this.blockchain.miningReward;
      
      console.log(`✅ 矿工 ${this.name} 成功挖出区块 #${block.index}`);
      console.log(`获得奖励: ${this.blockchain.miningReward} 代币`);
      console.log(`当前余额: ${this.blockchain.getBalance(this.wallet.address)} 代币`);
      console.log(`累计挖出区块: ${this.blocksMinedCount}`);
      
    } catch (error) {
      console.error(`矿工 ${this.name} 挖矿时出错:`, error.message);
    }
  }

  getStats() {
    return {
      name: this.name,
      address: this.wallet.address,
      isActive: this.isActive,
      blocksMinedCount: this.blocksMinedCount,
      totalRewards: this.totalRewards,
      currentBalance: this.blockchain.getBalance(this.wallet.address)
    };
  }

  getWallet() {
    return this.wallet;
  }

  toJSON() {
    return {
      name: this.name,
      wallet: this.wallet.toJSON(),
      isActive: this.isActive,
      blocksMinedCount: this.blocksMinedCount,
      totalRewards: this.totalRewards,
      currentBalance: this.blockchain.getBalance(this.wallet.address)
    };
  }
}

module.exports = Miner;