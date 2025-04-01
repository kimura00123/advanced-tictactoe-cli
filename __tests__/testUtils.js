/**
 * テスト用ユーティリティ関数とモック
 */

// UIコンポーネントのモック
const mockUI = () => {
  // UIクラスのメソッドをモック
  return {
    showTitle: jest.fn(),
    showMainMenu: jest.fn().mockReturnValue(0),
    selectGameMode: jest.fn().mockReturnValue({
      mode: 'single',
      difficulty: 'medium',
      startingPlayer: 'O'
    }),
    showSettingsMenu: jest.fn().mockReturnValue({
      boardSize: 5,
      winLength: 4
    }),
    renderBoard: jest.fn(),
    getPlayerMove: jest.fn().mockReturnValue({ row: 0, col: 0 }),
    showAIThinking: jest.fn().mockReturnValue({
      success: jest.fn()
    }),
    showGameResult: jest.fn(),
    showStats: jest.fn(),
    showHint: jest.fn(),
    confirm: jest.fn().mockReturnValue(true),
    boardSize: 5,
    winLength: 4
  };
};

// GameStorageコンポーネントのモック
const mockGameStorage = () => {
  return {
    saveGame: jest.fn().mockReturnValue(true),
    loadGame: jest.fn().mockReturnValue({
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
    getSavedGamesList: jest.fn().mockReturnValue(['save1', 'save2']),
    saveStats: jest.fn().mockReturnValue(true),
    loadStats: jest.fn().mockReturnValue({
      oWins: 5,
      xWins: 3,
      draws: 2,
      totalGames: 10
    }),
    ensureSaveDirectory: jest.fn()
  };
};

// AIコンポーネントのモック
const mockAI = () => {
  return {
    marker: 'X',
    opponentMarker: 'O',
    difficulty: 'medium',
    maxDepth: 2,
    makeMove: jest.fn().mockReturnValue({ row: 1, col: 1 }),
    makeRandomMove: jest.fn().mockReturnValue({ row: 1, col: 1 }),
    makeMediumMove: jest.fn().mockReturnValue({ row: 1, col: 1 }),
    makeMinimaxMove: jest.fn().mockReturnValue({ row: 1, col: 1 }),
    minimax: jest.fn().mockReturnValue(0),
    evaluateBoard: jest.fn().mockReturnValue(0),
    evaluateLines: jest.fn().mockReturnValue(0),
    getMaxDepthForDifficulty: jest.fn().mockReturnValue(2)
  };
};

// コンソール出力のモック
const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    global.console = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      // 他のメソッドは元のまま
      ...Object.keys(console)
        .filter(key => !['log', 'error', 'warn', 'info', 'debug'].includes(key))
        .reduce((obj, key) => {
          obj[key] = originalConsole[key];
          return obj;
        }, {})
    };
  });
  
  afterEach(() => {
    global.console = originalConsole;
  });
};

// プロセス終了のモック
const mockProcessExit = () => {
  const originalExit = process.exit;
  
  beforeEach(() => {
    process.exit = jest.fn();
  });
  
  afterEach(() => {
    process.exit = originalExit;
  });
};

// setTimeoutのモック
const mockSetTimeout = () => {
  jest.useFakeTimers();
  
  const executeSetTimeoutInstantly = () => {
    jest.runAllTimers();
  };
  
  return { executeSetTimeoutInstantly };
};

module.exports = {
  mockUI,
  mockGameStorage,
  mockAI,
  mockConsole,
  mockProcessExit,
  mockSetTimeout
};
