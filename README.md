# Moni-Cosmos

一个基于 CosmJS 和 Node.js 的区块链模拟系统，具备完整的区块链功能包括代币生产、用户管理、转账、挖矿和区块链浏览器。

## 🌟 功能特性

### 1. 代币生产 💰
- 支持代币铸造 (Mint)
- 挖矿奖励机制
- 代币总供应量管理
- 代币销毁功能

### 2. 用户管理 👥
- 创建新用户钱包
- 基于 Secp256k1 的密钥对生成
- 地址管理系统
- 钱包余额查询

### 3. 代币转账 💸
- 安全的点对点转账
- 数字签名验证
- 交易费用机制
- 余额充足性检查

### 4. 挖矿系统 ⛏️
- 工作量证明 (PoW) 算法
- 可调节的挖矿难度
- 矿工奖励机制
- 多矿工并行挖矿
- 矿工状态监控

### 5. 区块链浏览器 🌐
- 实时区块信息展示
- 交易历史查询
- 地址余额查看
- 矿工状态监控
- 响应式 Web 界面
- RESTful API 接口

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动区块链系统

```bash
npm start
```

### 启动开发模式

```bash
npm run dev
```

### 启动区块链浏览器

```bash
npm run explorer
```

访问 http://localhost:3000 查看区块链浏览器

## 📁 项目结构

```
moni-cosmos/
├── src/
│   ├── blockchain/          # 区块链核心
│   │   ├── Block.js         # 区块类
│   │   ├── Blockchain.js    # 区块链类
│   │   └── Transaction.js   # 交易类
│   ├── wallet/              # 钱包系统
│   │   └── Wallet.js        # 钱包类
│   ├── mining/              # 挖矿系统
│   │   └── Miner.js         # 矿工类
│   ├── explorer/            # 区块链浏览器
│   │   ├── server.js        # 后端服务
│   │   └── public/          # 前端界面
│   │       └── index.html   # 浏览器页面
│   └── app.js              # 主应用
├── test/                   # 测试文件
├── examples/               # 使用示例
├── docs/                   # 文档
├── package.json
└── README.md
```

## 🔧 核心组件

### 区块 (Block)
- 区块索引和时间戳
- 交易列表
- 前一区块哈希
- 工作量证明 (Nonce)
- SHA-256 哈希计算

### 交易 (Transaction)
- 发送方和接收方地址
- 转账金额
- 交易类型 (转账/铸造/销毁/挖矿奖励)
- 数字签名验证
- 交易唯一ID

### 钱包 (Wallet)
- Secp256k1 密钥对生成
- 地址派生
- 消息签名
- 私钥安全管理

### 矿工 (Miner)
- 自动挖矿
- 区块验证
- 奖励分配
- 挖矿统计

### 区块链 (Blockchain)
- 链式存储
- 交易池管理
- 余额计算
- 链有效性验证

## 🌐 API 接口

### 区块链信息
```
GET /api/chain/info          # 获取区块链基本信息
GET /api/chain/full          # 获取完整区块链数据
GET /api/validate            # 验证区块链有效性
```

### 区块相关
```
GET /api/blocks              # 获取区块列表
GET /api/blocks/:identifier  # 获取特定区块（按索引或哈希）
```

### 交易相关
```
GET /api/transactions/:txId  # 获取特定交易
GET /api/pending-transactions # 获取待处理交易
```

### 余额查询
```
GET /api/balances            # 获取所有地址余额
GET /api/balance/:address    # 获取特定地址余额
```

### 矿工信息
```
GET /api/miners              # 获取矿工状态
```

## 💡 使用示例

### 1. 创建用户和转账

```javascript
const app = new MonicosmosCLI();
await app.initialize();

// 创建用户
const alice = await app.createUser('Alice');
const bob = await app.createUser('Bob');

// 铸造代币给 Alice
app.blockchain.mintTokens(alice.address, 1000);

// Alice 转账给 Bob
await app.transferTokens('Alice', 'Bob', 100);
```

### 2. 启动挖矿

```javascript
// 创建矿工
const miner = await app.createMiner('Miner1');

// 开始挖矿（每10秒挖一次）
miner.startMining(10000);

// 停止挖矿
miner.stopMining();
```

### 3. 查询信息

```javascript
// 查看余额
app.showBalances();

// 查看区块链信息
app.showChainInfo();

// 查看矿工状态
app.showMinerStatus();
```

## 🔒 安全特性

- **密码学安全**: 使用 Secp256k1 椭圆曲线数字签名
- **交易验证**: 每笔交易都需要有效的数字签名
- **余额检查**: 防止双重支付和余额不足
- **区块验证**: 每个区块都经过工作量证明验证
- **链完整性**: 定期验证整个区块链的完整性

## 🧪 测试

```bash
npm test
```

## 📈 性能特点

- **可调节难度**: 根据需要调整挖矿难度
- **高效存储**: 使用内存映射优化数据存储
- **并发挖矿**: 支持多个矿工同时挖矿
- **实时更新**: 区块链浏览器实时显示最新状态

## 🛠️ 技术栈

- **Node.js**: 运行时环境
- **CosmJS**: 密码学和签名库
- **Express.js**: Web 服务器框架
- **Tailwind CSS**: 前端样式框架
- **Font Awesome**: 图标库
- **Crypto**: Node.js 内置加密模块

## 📋 系统要求

- Node.js >= 14.0.0
- npm >= 6.0.0
- 内存 >= 512MB
- 硬盘空间 >= 100MB

## 🚧 开发路线图

- [ ] 添加交易费用机制
- [ ] 实现智能合约功能
- [ ] 添加网络节点发现
- [ ] 实现数据持久化
- [ ] 添加更多共识算法
- [ ] 实现跨链交互
- [ ] 添加移动端支持

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目主页: [https://github.com/Jane900928/moni-cosmos](https://github.com/Jane900928/moni-cosmos)
- 问题反馈: [Issues](https://github.com/Jane900928/moni-cosmos/issues)

## 🙏 致谢

- [CosmJS](https://github.com/cosmos/cosmjs) - 提供密码学工具
- [Node.js](https://nodejs.org/) - JavaScript 运行时
- [Express.js](https://expressjs.com/) - Web 应用框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

**Moni-Cosmos** - 让区块链技术变得简单易懂！ 🚀