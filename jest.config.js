/**
 * Jestの設定ファイル
 */
module.exports = {
  // テスト環境
  testEnvironment: 'node',
  
  // テストファイルのパターン
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  
  // カバレッジの収集
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // タイムアウト設定（ミリ秒）
  testTimeout: 10000,
  
  // 詳細な出力
  verbose: true
};
