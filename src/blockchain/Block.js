const crypto = require('crypto');

class Block {
  constructor(index, transactions, previousHash, nonce = 0) {
    this.index = index;
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.previousHash +
        this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    
    console.log(`开始挖矿区块 ${this.index}...`);
    const startTime = Date.now();
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    
    const endTime = Date.now();
    console.log(`区块 ${this.index} 挖矿完成！耗时: ${endTime - startTime}ms`);
    console.log(`Hash: ${this.hash}`);
    console.log(`Nonce: ${this.nonce}`);
  }

  async hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!await tx.isValid()) {
        return false;
      }
    }
    return true;
  }

  toJSON() {
    return {
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions.map(tx => tx.toJSON ? tx.toJSON() : tx),
      previousHash: this.previousHash,
      hash: this.hash,
      nonce: this.nonce
    };
  }
}

module.exports = Block;