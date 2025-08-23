const { Secp256k1, Secp256k1Signature } = require('@cosmjs/crypto');
const { toHex, fromHex } = require('@cosmjs/encoding');
const crypto = require('crypto');

class Wallet {
  constructor(name) {
    this.name = name;
    this.generateKeyPair();
  }

  async generateKeyPair() {
    try {
      // 生成私钥
      this.privateKey = crypto.randomBytes(32);
      
      // 从私钥生成公钥
      this.publicKey = await Secp256k1.makeKeypair(this.privateKey);
      
      // 生成地址（使用公钥的hex表示）
      this.address = toHex(this.publicKey.pubkey);
      
      console.log(`钱包 '${this.name}' 已创建`);
      console.log(`地址: ${this.address}`);
    } catch (error) {
      console.error('生成密钥对时出错:', error);
      throw error;
    }
  }

  getPrivateKeyHex() {
    return toHex(this.privateKey);
  }

  getPublicKeyHex() {
    return toHex(this.publicKey.pubkey);
  }

  getAddress() {
    return this.address;
  }

  async signMessage(message) {
    try {
      // 对消息进行哈希处理，确保得到正好32字节的哈希
      const messageHashBuffer = crypto
        .createHash('sha256')
        .update(message, 'utf-8')
        .digest(); // 直接返回Buffer，不转换为hex
      
      console.log(`签名消息，哈希长度: ${messageHashBuffer.length} 字节`);
      
      const signature = await Secp256k1.createSignature(messageHashBuffer, this.privateKey);
      return toHex(signature.toFixedLength());
    } catch (error) {
      console.error('签名消息时出错:', error);
      throw error;
    }
  }

  static async verifySignature(message, signature, publicKey) {
    try {
      // 对消息进行哈希处理
      const messageHashBuffer = crypto
        .createHash('sha256')
        .update(message, 'utf-8')
        .digest(); // 直接返回Buffer，不转换为hex
        
      const signatureBytes = fromHex(signature);
      const publicKeyBytes = fromHex(publicKey);
      
      return await Secp256k1.verifySignature(
        Secp256k1Signature.fromFixedLength(signatureBytes),
        messageHashBuffer,
        publicKeyBytes
      );
    } catch (error) {
      console.error('验证签名时出错:', error);
      return false;
    }
  }

  toJSON() {
    return {
      name: this.name,
      address: this.address,
      publicKey: this.getPublicKeyHex()
      // 注意：出于安全考虑，不导出私钥
    };
  }

  // 从已有的私钥恢复钱包
  static async fromPrivateKey(privateKeyHex, name = 'Imported Wallet') {
    const wallet = new Wallet(name);
    wallet.privateKey = fromHex(privateKeyHex);
    wallet.publicKey = await Secp256k1.makeKeypair(wallet.privateKey);
    wallet.address = toHex(wallet.publicKey.pubkey);
    return wallet;
  }
}

module.exports = Wallet;