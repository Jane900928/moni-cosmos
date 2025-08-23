const Wallet = require('../src/wallet/Wallet');

describe('Wallet', () => {
  let wallet;

  beforeEach(async () => {
    wallet = new Wallet('TestWallet');
    
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
  });

  test('应该创建有效的钱包', () => {
    expect(wallet.name).toBe('TestWallet');
    expect(wallet.address).toBeDefined();
    expect(wallet.privateKey).toBeDefined();
    expect(wallet.publicKey).toBeDefined();
  });

  test('应该生成唯一的地址', async () => {
    const wallet2 = new Wallet('TestWallet2');
    
    await new Promise(resolve => {
      const checkWallet = () => {
        if (wallet2.address) {
          resolve();
        } else {
          setTimeout(checkWallet, 100);
        }
      };
      checkWallet();
    });
    
    expect(wallet.address).not.toBe(wallet2.address);
  });

  test('应该能够签名消息', async () => {
    const message = 'Hello, Blockchain!';
    const signature = await wallet.signMessage(message);
    
    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);
  });

  test('应该能够验证签名', async () => {
    const message = 'Hello, Blockchain!';
    const signature = await wallet.signMessage(message);
    
    const isValid = await Wallet.verifySignature(message, signature, wallet.getPublicKeyHex());
    expect(isValid).toBe(true);
  });

  test('应该拒绝错误的签名', async () => {
    const message = 'Hello, Blockchain!';
    const wrongMessage = 'Wrong message';
    const signature = await wallet.signMessage(message);
    
    const isValid = await Wallet.verifySignature(wrongMessage, signature, wallet.getPublicKeyHex());
    expect(isValid).toBe(false);
  });

  test('应该能够从私钥恢复钱包', async () => {
    const privateKeyHex = wallet.getPrivateKeyHex();
    const recoveredWallet = await Wallet.fromPrivateKey(privateKeyHex, 'RecoveredWallet');
    
    expect(recoveredWallet.address).toBe(wallet.address);
    expect(recoveredWallet.getPublicKeyHex()).toBe(wallet.getPublicKeyHex());
  });

  test('应该正确序列化为JSON', () => {
    const json = wallet.toJSON();
    
    expect(json.name).toBe('TestWallet');
    expect(json.address).toBe(wallet.address);
    expect(json.publicKey).toBe(wallet.getPublicKeyHex());
    expect(json.privateKey).toBeUndefined(); // 私钥不应该被序列化
  });
});