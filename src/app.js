const Blockchain = require('./blockchain/Blockchain');
const Transaction = require('./blockchain/Transaction');
const Wallet = require('./wallet/Wallet');
const Miner = require('./mining/Miner');
const BlockchainExplorer = require('./explorer/server');

class MonicosmosCLI {
  constructor() {
    this.blockchain = new Blockchain();
    this.wallets = new Map();
    this.miners = [];
    this.explorer = null;
  }

  async initialize() {
    console.log('🚀 Moni-Cosmos 区块链系统启动中...');
    console.log('=====================================');
    
    // 创建初始钱包
    await this.createUser('Alice');
    await this.createUser('Bob');
    await this.createUser('Charlie');
    
    // 创建矿工
    await this.createMiner('Miner1');
    await this.createMiner('Miner2');
    
    // 铸造一些初始代币给Alice
    console.log('\n💰 铸造初始代币...');
    const aliceWallet = this.wallets.get('Alice');
    this.blockchain.mintTokens(aliceWallet.address, 1000);
    
    // 启动第一个矿工
    console.log('\n⛏️  启动矿工...');
    this.miners[0].startMining(10000); // 10秒挖一次
    
    // 等待一段时间让矿工挖出第一个区块
    setTimeout(async () => {
      await this.demonstrateTransactions();
      this.showMenu();
    }, 15000);
    
    // 启动区块链浏览器
    setTimeout(() => {
      this.startExplorer();
    }, 5000);
  }

  async createUser(name) {
    if (this.wallets.has(name)) {
      console.log(`用户 ${name} 已存在`);
      return this.wallets.get(name);
    }

    console.log(`\n👤 创建用户: ${name}`);
    const wallet = new Wallet(name);
    
    // 等待钱包初始化完成
    await new Promise(resolve => {
      const checkWallet = () => {
        if (wallet.address) {
          resolve();
        } else {
          setTimeout(checkWallet, 100);
        }
      };
      checkWallet();
    });
    
    this.wallets.set(name, wallet);
    console.log(`✅ 用户 ${name} 创建成功`);
    console.log(`   地址: ${wallet.address}`);
    
    return wallet;
  }

  async createMiner(name) {
    console.log(`\n⛏️  创建矿工: ${name}`);
    const miner = new Miner(name, this.blockchain);
    await miner.initialize();
    this.miners.push(miner);
    console.log(`✅ 矿工 ${name} 创建成功`);
    return miner;
  }

  async transferTokens(fromUserName, toUserName, amount) {
    const fromWallet = this.wallets.get(fromUserName);
    const toWallet = this.wallets.get(toUserName);
    
    if (!fromWallet || !toWallet) {
      console.log('❌ 发送方或接收方用户不存在');
      return;
    }

    try {
      console.log(`\n💸 转账: ${amount} 代币从 ${fromUserName} 到 ${toUserName}`);
      
      const transaction = new Transaction(
        fromWallet.address,
        toWallet.address,
        amount
      );
      
      await transaction.signTransaction(fromWallet.getPrivateKeyHex());
      await this.blockchain.createTransaction(transaction);
      
      console.log('✅ 转账交易已添加到待处理列表');
      console.log(`   交易ID: ${transaction.txId}`);
      
    } catch (error) {
      console.log('❌ 转账失败:', error.message);
    }
  }

  async demonstrateTransactions() {
    console.log('\n🎯 演示转账交易...');
    
    // Alice 转账给 Bob
    await this.transferTokens('Alice', 'Bob', 150);
    
    // Alice 转账给 Charlie
    await this.transferTokens('Alice', 'Charlie', 200);
    
    // 等待交易被挖出
    console.log('⏳ 等待交易被矿工确认...');
  }

  showBalances() {
    console.log('\n💰 当前余额:');
    console.log('====================');
    
    for (const [name, wallet] of this.wallets) {
      const balance = this.blockchain.getBalance(wallet.address);
      console.log(`${name.padEnd(10)}: ${balance} 代币`);
    }
    
    // 显示矿工余额
    console.log('\n⛏️  矿工余额:');
    for (const miner of this.miners) {
      const balance = this.blockchain.getBalance(miner.wallet.address);
      console.log(`${miner.name.padEnd(10)}: ${balance} 代币`);
    }
  }

  showChainInfo() {
    const info = this.blockchain.getChainInfo();
    console.log('\n⛓️  区块链信息:');
    console.log('========================');
    console.log(`区块数量: ${info.length}`);
    console.log(`挖矿难度: ${info.difficulty}`);
    console.log(`待处理交易: ${info.pendingTransactions}`);
    console.log(`代币总供应量: ${info.totalSupply}`);
    console.log(`最新区块Hash: ${info.latestBlock.hash}`);
  }

  showMinerStatus() {
    console.log('\n⛏️  矿工状态:');
    console.log('==================');
    
    for (const miner of this.miners) {
      const stats = miner.getStats();
      console.log(`${stats.name}:`);
      console.log(`  状态: ${stats.isActive ? '🟢 活跃' : '🔴 离线'}`);
      console.log(`  挖出区块: ${stats.blocksMinedCount}`);
      console.log(`  总奖励: ${stats.totalRewards}`);
      console.log(`  当前余额: ${stats.currentBalance}`);
      console.log('');
    }
  }

  startExplorer() {
    if (!this.explorer) {
      console.log('\n🌐 启动区块链浏览器...');
      this.explorer = new BlockchainExplorer(this.blockchain, this.miners);
      this.explorer.start(3000);
    }
  }

  showMenu() {
    console.log('\n🎮 Moni-Cosmos 操作菜单:');
    console.log('===========================');
    console.log('1. 查看余额');
    console.log('2. 转账');
    console.log('3. 查看区块链信息');
    console.log('4. 查看矿工状态');
    console.log('5. 创建新用户');
    console.log('6. 启动/停止矿工');
    console.log('7. 铸造代币');
    console.log('8. 验证区块链');
    console.log('9. 启动区块链浏览器');
    console.log('0. 退出');
    console.log('');
    
    // 简化演示，这里不实现交互式菜单
    // 在实际应用中可以使用 readline 或其他库来处理用户输入
    
    // 演示一些操作
    setTimeout(() => {
      this.showBalances();
    }, 2000);
    
    setTimeout(() => {
      this.showChainInfo();
    }, 4000);
    
    setTimeout(() => {
      this.showMinerStatus();
    }, 6000);
  }

  async validateChain() {
    console.log('\n🔍 验证区块链...');
    try {
      const isValid = await this.blockchain.isChainValid();
      console.log(isValid ? '✅ 区块链有效' : '❌ 区块链无效');
    } catch (error) {
      console.log('❌ 验证失败:', error.message);
    }
  }
}

// 启动应用
if (require.main === module) {
  const app = new MonicosmosCLI();
  
  app.initialize().catch(error => {
    console.error('启动失败:', error);
    process.exit(1);
  });
  
  // 优雅退出
  process.on('SIGINT', () => {
    console.log('\n👋 正在安全关闭系统...');
    
    // 停止所有矿工
    app.miners.forEach(miner => {
      if (miner.isActive) {
        miner.stopMining();
      }
    });
    
    console.log('✅ 系统已安全关闭');
    process.exit(0);
  });
}

module.exports = MonicosmosCLI;