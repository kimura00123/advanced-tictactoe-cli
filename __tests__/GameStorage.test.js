const GameStorage = require('../src/GameStorage');
const fs = require('fs');
const path = require('path');
const mockFs = require('mock-fs');

// モック用の一時ファイルシステム構造を設定
beforeEach(() => {
  mockFs({
    'saves': {
      'test-save.json': JSON.stringify({
        board: {
          size: 5,
          winLength: 4,
          board: [
            [' ', ' ', ' ', ' ', ' '],
            [' ', 'O', ' ', ' ', ' '],
            [' ', ' ', 'X', ' ', ' '],
            [' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ']
          ],
          moveHistory: [
            { row: 1, col: 1, player: 'O' },
            { row: 2, col: 2, player: 'X' }
          ],
          currentPlayer: 'O'
        },
        gameMode: 'single',
        difficulty: 'medium',
        playerMarker: 'O',
        aiMarker: 'X',
        currentPlayer: 'O',
        boardSize: 5,
        winLength: 4
      }),
      'another-save.json': JSON.stringify({ testData: 'sample' })
    },
    'stats.json': JSON.stringify({
      oWins: 5,
      xWins: 3,
      draws: 2,
      totalGames: 10
    }),
    'node_modules': mockFs.directory({
      mode: 0o755,
      items: {}
    })
  });
});

// テスト後にモックファイルシステムをリセット
afterEach(() => {
  mockFs.restore();
});

describe('GameStorage Class', () => {
  let storage;

  beforeEach(() => {
    storage = new GameStorage();
  });

  test('GameStorageが正しく初期化される', () => {
    expect(storage.saveDirPath).toBe(path.join(process.cwd(), 'saves'));
    expect(storage.statsFilePath).toBe(path.join(process.cwd(), 'stats.json'));
    
    // savesディレクトリが存在することを確認
    expect(fs.existsSync(storage.saveDirPath)).toBe(true);
  });

  test('ゲームを保存できる', () => {
    const gameState = {
      board: {
        size: 3,
        winLength: 3,
        board: [
          ['X', ' ', ' '],
          [' ', 'O', ' '],
          [' ', ' ', ' ']
        ],
        moveHistory: [
          { row: 0, col: 0, player: 'X' },
          { row: 1, col: 1, player: 'O' }
        ],
        currentPlayer: 'X'
      },
      gameMode: 'multi',
      boardSize: 3,
      winLength: 3
    };
    
    const success = storage.saveGame('new-save', gameState);
    expect(success).toBe(true);
    
    // ファイルが保存されたことを確認
    const savedFile = path.join(storage.saveDirPath, 'new-save.json');
    expect(fs.existsSync(savedFile)).toBe(true);
    
    // 保存した内容を確認
    const savedData = JSON.parse(fs.readFileSync(savedFile, 'utf8'));
    expect(savedData).toEqual(gameState);
  });

  test('保存されたゲームを読み込める', () => {
    const loadedGame = storage.loadGame('test-save');
    
    // 既存のテストセーブが正しく読み込まれることを確認
    expect(loadedGame).toBeDefined();
    expect(loadedGame.board.size).toBe(5);
    expect(loadedGame.board.winLength).toBe(4);
    expect(loadedGame.gameMode).toBe('single');
    expect(loadedGame.difficulty).toBe('medium');
    
    // ボードの内容を確認
    expect(loadedGame.board.board[1][1]).toBe('O');
    expect(loadedGame.board.board[2][2]).toBe('X');
    
    // 存在しないセーブを読み込もうとするとnullが返る
    expect(storage.loadGame('non-existent')).toBeNull();
  });

  test('保存されたゲームの一覧を取得できる', () => {
    const savesList = storage.getSavedGamesList();
    
    // 2つのセーブファイルが一覧に含まれることを確認
    expect(savesList).toContain('test-save');
    expect(savesList).toContain('another-save');
    expect(savesList.length).toBe(2);
  });

  test('統計情報を保存できる', () => {
    const newStats = {
      oWins: 7,
      xWins: 4,
      draws: 3,
      totalGames: 14
    };
    
    const success = storage.saveStats(newStats);
    expect(success).toBe(true);
    
    // 統計ファイルが更新されたことを確認
    const statsData = JSON.parse(fs.readFileSync(storage.statsFilePath, 'utf8'));
    expect(statsData).toEqual(newStats);
  });

  test('統計情報を読み込める', () => {
    const stats = storage.loadStats();
    
    // 既存の統計が正しく読み込まれることを確認
    expect(stats).toEqual({
      oWins: 5,
      xWins: 3,
      draws: 2,
      totalGames: 10
    });
  });

  test('統計ファイルが存在しない場合、デフォルト値を返す', () => {
    // 統計ファイルを削除
    fs.unlinkSync(storage.statsFilePath);
    
    const stats = storage.loadStats();
    
    // デフォルト値が返されることを確認
    expect(stats).toEqual({
      oWins: 0,
      xWins: 0,
      draws: 0,
      totalGames: 0
    });
  });

  test('セーブディレクトリが存在しない場合、作成される', () => {
    // セーブディレクトリを削除
    fs.rmdirSync(storage.saveDirPath);
    expect(fs.existsSync(storage.saveDirPath)).toBe(false);
    
    // 新しいインスタンスを作成すると、ディレクトリが作られるはず
    const newStorage = new GameStorage();
    expect(fs.existsSync(newStorage.saveDirPath)).toBe(true);
  });
});
