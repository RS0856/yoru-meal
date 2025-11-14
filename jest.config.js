const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定
  dir: './',
})

// Jestのカスタム設定
const customJestConfig = {
  // テスト環境
  testEnvironment: 'jest-environment-jsdom',
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // モジュールパスの解決（tsconfig.jsonのpathsと一致させる）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // 無視するパス
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/out/',
    '/build/',
  ],
  
  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  
  // モジュールファイル拡張子
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
}

// Next.jsのJest設定とマージ
module.exports = createJestConfig(customJestConfig)

