const MonicosmosCLI = require('../src/app');
const Wallet = require('../src/wallet/Wallet');
const Transaction = require('../src/blockchain/Transaction');

/**
 * 基本使用示例
 * 演示如何使用 Moni-Cosmos 区块链系统的各项功能
 */

async function basicUsageExample() {
  console.log('🚀 Moni-Cosmos 基本使用示例');
  console.log('==============================\n');

  // 1. 初始化系统
  console.log('1️⃣ 初始化区块链系统...');
  const app = new MonicosmosCLI();
  
  // 手动创建一些用户（不使用自动初始化）
  console.log('\n2️⃣ 创建用户钱包...');
  const alice = await app.createUser('Alice');
  const bob = await app.createUser('Bob');
  const charlie = await app.createUser('Charlie');
  
  console.log(`✅ Alice 地址: ${alice.address}`);
  console.log(`✅ Bob 地址: ${bob.address}`);
  console.log(`✅ Charlie 地址: ${charlie.address}`);
  
  // 2. 铸造初始代币
  console.log('\n3️⃣ 铸造初始代币...');
  app.blockchain.mintTokens(alice.address, 1000);
  app.blockchain.mintTokens(bob.address, 500);
  
  // 3. 创建和启动矿工
  console.log('\n4️⃣ 创建矿工...');
  const miner1 = await app.createMiner('PowerMiner');
  const miner2 = await app.createMiner('SpeedMiner');
  
  // 4. 开始挖矿以确认铸造交易
  console.log('\n5️⃣ 开始挖矿确认交易...');
  miner1.startMining(5000); // 5秒挖一次
  
  // 等待第一个区块被挖出
  await new Promise(resolve => setTimeout(resolve, 6000));
  
  // 5. 查看初始余额
  console.log('\n6️⃣ 查看初始余额:');
  console.log(`Alice: ${app.blockchain.getBalance(alice.address)} 代币`);
  console.log(`Bob: ${app.blockchain.getBalance(bob.address)} 代币`);
  console.log(`Charlie: ${app.blockchain.getBalance(charlie.address)} 代币`);
  console.log(`PowerMiner: ${app.blockchain.getBalance(miner1.wallet.address)} 代币`);
  
  // 6. 执行转账交易
  console.log('\n7️⃣ 执行转账交易...');
  
  // Alice 转账给 Charlie
  await app.transferTokens('Alice', 'Charlie', 200);
  
  // Bob 转账给 Charlie
  await app.transferTokens('Bob', 'Charlie', 150);
  
  // Alice 转账给 Bob
  await app.transferTokens('Alice', 'Bob', 100);
  
  console.log('✅ 转账交易已提交到交易池');
  
  // 7. 等待交易被确认
  console.log('\n8️⃣ 等待交易被挖矿确认...');
  await new Promise(resolve => setTimeout(resolve, 12000));
  
  // 8. 查看最终余额
  console.log('\n9️⃣ 查看最终余额:');
  console.log(`Alice: ${app.blockchain.getBalance(alice.address)} 代币`);
  console.log(`Bob: ${app.blockchain.getBalance(bob.address)} 代币`);
  console.log(`Charlie: ${app.blockchain.getBalance(charlie.address)} 代币`);
  console.log(`PowerMiner: ${app.blockchain.getBalance(miner1.wallet.address)} 代币`);
  
  // 9. 显示区块链信息
  console.log('\n🔟 区块链统计信息:');
  const chainInfo = app.blockchain.getChainInfo();
  console.log(`总区块数: ${chainInfo.length}`);
  console.log(`挖矿难度: ${chainInfo.difficulty}`);
  console.log(`代币总供应量: ${chainInfo.totalSupply}`);
  console.log(`待处理交易: ${chainInfo.pendingTransactions}`);
  
  // 10. 显示矿工统计
  console.log('\n⛏️ 矿工统计:');
  const miner1Stats = miner1.getStats();
  console.log(`${miner1Stats.name}:`);
  console.log(`  挖出区块: ${miner1Stats.blocksMinedCount}`);
  console.log(`  总奖励: ${miner1Stats.totalRewards}`);
  console.log(`  当前余额: ${miner1Stats.currentBalance}`);
  
  // 11. 验证区块链
  console.log('\n🔍 验证区块链完整性...');
  const isValid = await app.blockchain.isChainValid();
  console.log(`区块链有效性: ${isValid ? '✅ 有效' : '❌ 无效'}`);
  
  // 12. 显示最新区块信息
  console.log('\n📦 最新区块信息:');
  const latestBlock = app.blockchain.getLatestBlock();
  console.log(`区块索引: ${latestBlock.index}`);
  console.log(`交易数量: ${latestBlock.transactions.length}`);
  console.log(`区块哈希: ${latestBlock.hash}`);
  console.log(`前一区块哈希: ${latestBlock.previousHash}`);
  console.log(`挖矿时间: ${new Date(latestBlock.timestamp).toLocaleString()}`);
  
  // 13. 启动第二个矿工来演示竞争挖矿
  console.log('\n⚡ 启动第二个矿工进行竞争挖矿...');
  miner2.startMining(4000); // 4秒挖一次，更频繁
  
  // 继续产生一些交易
  console.log('\n💸 产生更多交易...');
  await app.transferTokens('Charlie', 'Alice', 50);
  await app.transferTokens('Bob', 'Alice', 25);
  
  // 等待更多区块被挖出
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // 14. 最终统计
  console.log('\n📊 最终统计:');
  console.log('=================');
  
  const finalChainInfo = app.blockchain.getChainInfo();
  console.log(`总区块数: ${finalChainInfo.length}`);
  console.log(`代币总供应量: ${finalChainInfo.totalSupply}`);
  
  console.log('\n💰 最终余额分布:');
  const allBalances = app.blockchain.getAllBalances();
  const sortedBalances = Object.entries(allBalances)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5); // 显示前5名
    
  sortedBalances.forEach(([address, balance], index) => {
    const name = getAddressName(address, app);
    console.log(`${index + 1}. ${name}: ${balance} 代币`);
  });
  
  console.log('\n⛏️ 矿工最终统计:');
  [miner1, miner2].forEach(miner => {
    const stats = miner.getStats();
    console.log(`${stats.name}:`);
    console.log(`  挖出区块: ${stats.blocksMinedCount}`);
    console.log(`  总奖励: ${stats.totalRewards}`);
    console.log(`  效率: ${(stats.totalRewards / (Date.now() - startTime) * 60000).toFixed(2)} 代币/分钟`);
  });
  
  // 15. 清理：停止矿工
  console.log('\n🛑 停止所有矿工...');
  miner1.stopMining();
  miner2.stopMining();
  
  console.log('\n🎉 基本使用示例完成！');
  console.log('可以运行 `npm run explorer` 来启动区块链浏览器查看详细信息');
}

// 辅助函数：根据地址获取名称
function getAddressName(address, app) {
  // 检查是否是用户地址
  for (const [name, wallet] of app.wallets) {
    if (wallet.address === address) {
      return name;
    }
  }
  
  // 检查是否是矿工地址
  for (const miner of app.miners) {
    if (miner.wallet.address === address) {
      return miner.name;
    }
  }
  
  // 返回截断的地址
  return address.substring(0, 8) + '...';
}

// 记录开始时间
const startTime = Date.now();

// 运行示例
if (require.main === module) {
  basicUsageExample().catch(error => {
    console.error('❌ 示例执行失败:', error);
    process.exit(1);
  });
}

module.exports = basicUsageExample;