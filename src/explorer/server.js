const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

class BlockchainExplorer {
  constructor(blockchain, miners = []) {
    this.blockchain = blockchain;
    this.miners = miners;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(morgan('combined'));
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  setupRoutes() {
    // 首页
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // API路由
    this.app.get('/api/chain/info', (req, res) => {
      res.json({
        success: true,
        data: this.blockchain.getChainInfo()
      });
    });

    this.app.get('/api/chain/full', (req, res) => {
      res.json({
        success: true,
        data: this.blockchain.toJSON()
      });
    });

    this.app.get('/api/blocks', (req, res) => {
      const { page = 1, limit = 10 } = req.query;
      const startIndex = Math.max(0, this.blockchain.chain.length - page * limit);
      const endIndex = this.blockchain.chain.length - (page - 1) * limit;
      
      const blocks = this.blockchain.chain
        .slice(startIndex, endIndex)
        .reverse()
        .map(block => block.toJSON());

      res.json({
        success: true,
        data: {
          blocks,
          total: this.blockchain.chain.length,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    });

    this.app.get('/api/blocks/:identifier', (req, res) => {
      const { identifier } = req.params;
      let block;

      if (identifier.match(/^\d+$/)) {
        // 按索引查找
        block = this.blockchain.getBlockByIndex(parseInt(identifier));
      } else {
        // 按hash查找
        block = this.blockchain.getBlockByHash(identifier);
      }

      if (!block) {
        return res.status(404).json({
          success: false,
          message: '区块未找到'
        });
      }

      res.json({
        success: true,
        data: block.toJSON()
      });
    });

    this.app.get('/api/transactions/:txId', (req, res) => {
      const { txId } = req.params;
      const result = this.blockchain.getTransactionById(txId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: '交易未找到'
        });
      }

      res.json({
        success: true,
        data: result
      });
    });

    this.app.get('/api/balances', (req, res) => {
      res.json({
        success: true,
        data: this.blockchain.getAllBalances()
      });
    });

    this.app.get('/api/balance/:address', (req, res) => {
      const { address } = req.params;
      const balance = this.blockchain.getBalance(address);

      res.json({
        success: true,
        data: {
          address,
          balance
        }
      });
    });

    this.app.get('/api/miners', (req, res) => {
      res.json({
        success: true,
        data: this.miners.map(miner => miner.toJSON())
      });
    });

    this.app.get('/api/pending-transactions', (req, res) => {
      res.json({
        success: true,
        data: this.blockchain.pendingTransactions.map(tx => tx.toJSON ? tx.toJSON() : tx)
      });
    });

    // 验证区块链
    this.app.get('/api/validate', async (req, res) => {
      try {
        const isValid = await this.blockchain.isChainValid();
        res.json({
          success: true,
          data: {
            isValid,
            message: isValid ? '区块链有效' : '区块链无效'
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: '验证区块链时出错',
          error: error.message
        });
      }
    });
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`\n🌐 区块链浏览器已启动`);
      console.log(`📊 访问地址: http://localhost:${port}`);
      console.log(`🔗 API文档: http://localhost:${port}/api/chain/info`);
    });
  }
}

module.exports = BlockchainExplorer;