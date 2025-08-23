// Jest 测试设置文件

// 全局测试设置
beforeAll(() => {
  // 抑制控制台输出以简化测试输出
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  console.log = jest.fn();
  console.error = jest.fn();
  
  // 在某些情况下你可能需要看到真实的输出，可以取消注释
  // console.log = originalConsoleLog;
  // console.error = originalConsoleError;
});

// 每个测试后清理
afterEach(() => {
  // 清理定时器
  jest.clearAllTimers();
});

// 所有测试后清理
afterAll(() => {
  // 恢复原始的 console 方法
  jest.restoreAllMocks();
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});