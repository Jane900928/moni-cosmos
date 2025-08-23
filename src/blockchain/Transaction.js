const crypto = require('crypto');
const { Secp256k1 } = require('@cosmjs/crypto');
const { toHex, fromHex } = require('@cosmjs/encoding');

class Transaction {
  constructor(fromAddress, toAddress, amount, type = 'transfer') {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.type = type; // 'transfer', 'mint', 'burn', 'mining_reward'
    this.timestamp = Date.now();
    this.signature = null;
    this.txId = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        (this.fromAddress || '') +
        (this.toAddress || '') +
        this.amount +
        this.type +
        this.timestamp
      )
      .digest('hex');
  }

  async signTransaction(privateKey) {
    if (this.fromAddress === null) return; // 系统交易（如挖矿奖励）
    
    try {
      // 计算消息哈希并转换为字节
      const messageHash = this.calculateHash();
      const msgHashBytes = Buffer.from(messageHash, 'hex');
      
      // 确保私钥是字节格式
      const privateKeyBytes = typeof privateKey === 'string' ? fromHex(privateKey) : privateKey;
      
      // 创建签名
      const signature = await Secp256k1.createSignature(msgHashBytes, privateKeyBytes);
      this.signature = toHex(signature.toFixedLength());
    } catch (error) {
      console.error('签名交易时出错:', error);
      throw error;
    }
  }

  async isValid() {
    if (this.fromAddress === null) return true; // 系统交易
    
    if (!this.signature || this.signature.length === 0) {
      throw new Error('此交易没有签名');
    }

    try {
      // 计算消息哈希
      const messageHash = this.calculateHash();
      const msgHashBytes = Buffer.from(messageHash, 'hex');
      
      // 解析签名和公钥
      const signatureBytes = fromHex(this.signature);
      const publicKeyBytes = fromHex(this.fromAddress);
      
      // 验证签名
      return await Secp256k1.verifySignature(
        Secp256k1.createSignature(signatureBytes),
        msgHashBytes,
        publicKeyBytes
      );
    } catch (error) {
      console.error('验证交易签名时出错:', error);
      return false;
    }
  }

  toJSON() {
    return {
      txId: this.txId,
      fromAddress: this.fromAddress,
      toAddress: this.toAddress,
      amount: this.amount,
      type: this.type,
      timestamp: this.timestamp,
      signature: this.signature
    };
  }
}

module.exports = Transaction;