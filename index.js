#!/usr/bin/env node

/**
 * 高度な〇×ゲーム（五目並べ）エントリーポイント
 * 5×5ボードと難しいAI対戦を備えたコマンドラインゲーム
 */

const Game = require('./src/Game');

try {
  // ゲームインスタンスを作成して開始
  const game = new Game();
  game.start();
} catch (error) {
  console.error('エラーが発生しました:', error);
  process.exit(1);
}
