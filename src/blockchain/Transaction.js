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
      // 创建要签名的消息内容
      const messageContent = (this.fromAddress || '') +
                            (this.toAddress || '') +
                            this.amount +
                            this.type +
                            this.timestamp;
      
      // 对消息内容进行SHA-256哈希，得到32字节的哈希值
      const messageHashBuffer = crypto
        .createHash('sha256')
        .update(messageContent)
        .digest(); // 直接返回Buffer，不转换为hex
      
      // 确保私钥是字节格式
      const privateKeyBytes = typeof privateKey === 'string' ? fromHex(privateKey) : privateKey;
      
      // 创建签名 - 现在messageHashBuffer正好是32字节
      const signature = await Secp256k1.createSignature(messageHashBuffer, privateKeyBytes);
      this.signature = toHex(signature.toFixedLength());
      
      console.log(`交易签名成功，消息哈希长度: ${messageHashBuffer.length} 字节`);
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
      // 重新创建签名时使用的消息内容
      const messageContent = (this.fromAddress || '') +
                            (this.toAddress || '') +
                            this.amount +
                            this.type +
                            this.timestamp;
      
      // 对消息内容进行SHA-256哈希，得到32字节的哈希值
      const messageHashBuffer = crypto
        .createHash('sha256')
        .update(messageContent)
        .digest(); // 直接返回Buffer，不转换为hex
      
      // 解析签名和公钥
      const signatureBytes = fromHex(this.signature);
      const publicKeyBytes = fromHex(this.fromAddress);
      
      // 验证签名
      return await Secp256k1.verifySignature(
        Secp256k1.createSignature(signatureBytes),
        messageHashBuffer,
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