const Board = require('./Board');
const AI = require('./AI');
const UI = require('./UI');
const GameStorage = require('./GameStorage');
const readlineSync = require('readline-sync');

/**
 * ゲーム全体を管理するクラス
 */
class Game {
  /**
   * ゲームクラスを初期化
   */
  constructor() {
    this.ui = new UI();
    this.storage = new GameStorage();
    this.stats = this.storage.loadStats();
    this.resetGame();
  }

  /**
   * ゲームの状態をリセット
   */
  resetGame() {
    this.board = new Board(this.ui.boardSize, this.ui.winLength);
    this.gameMode = null;
    this.difficulty = null;
    this.gameOver = false;
    this.winner = null;
    this.ai = null;
    this.playerMarker = 'O';
    this.aiMarker = 'X';
  }

  /**
   * メインメニューを表示し、選択に基づいて処理
   */
  showMainMenu() {
    const choice = this.ui.showMainMenu();
    
    switch (choice) {
      case 0: // ゲーム開始
        this.setupGame();
        this.startGame();
        break;
      case 1: // 設定
        const settings = this.ui.showSettingsMenu();
        this.updateSettings(settings);
        this.showMainMenu();
        break;
      case 2: // 統計情報
        this.ui.showStats(this.stats);
        this.showMainMenu();
        break;
      case 3: // ゲームのロード
        this.loadGame();
        break;
      case 4: // ゲーム終了
        this.exitGame();
        break;
    }
  }

  /**
   * 設定を更新
   * @param {Object} settings - 更新する設定
   */
  updateSettings(settings) {
    this.ui.boardSize = settings.boardSize;
    this.ui.winLength = settings.winLength;
  }

  /**
   * ゲームの初期設定
   */
  setupGame() {
    this.resetGame();
    
    const gameMode = this.ui.selectGameMode();
    this.gameMode = gameMode.mode;
    this.difficulty = gameMode.difficulty;
    
    this.board = new Board(this.ui.boardSize, this.ui.winLength);
    
    if (this.gameMode === 'single') {
      this.playerMarker = gameMode.startingPlayer;
      this.aiMarker = this.playerMarker === 'O' ? 'X' : 'O';
      this.ai = new AI(this.aiMarker, this.difficulty);
      
      // プレイヤーが後攻の場合、AIが先に打つ
      if (this.playerMarker === 'X') {
        this.handleAiTurn();
      }
    }
  }

  /**
   * ゲームを開始
   */
  startGame() {
    while (!this.gameOver) {
      this.ui.renderBoard(this.board, this.board.currentPlayer);
      
      if (this.gameMode === 'single') {
        if (this.board.currentPlayer === this.playerMarker) {
          this.handlePlayerTurn();
        } else {
          this.handleAiTurn();
        }
      } else { // 2人プレイの場合
        this.handlePlayerTurn();
      }
      
      if (this.gameOver) break;
      
      // 次のプレイヤーへ
      this.board.switchPlayer();
    }
    
    // ゲーム終了時の処理
    this.ui.renderBoard(this.board, this.board.currentPlayer);
    this.ui.showGameResult(this.winner);
    
    // 統計情報を更新
    this.updateStats();
    
    // もう一度プレイするか
    if (this.ui.confirm('もう一度プレイしますか？')) {
      this.setupGame();
      this.startGame();
    } else {
      this.showMainMenu();
    }
  }

  /**
   * プレイヤーのターンを処理
   */
  handlePlayerTurn() {
    const move = this.ui.getPlayerMove(this.board);
    
    // コマンド処理
    if (typeof move === 'string') {
      switch (move) {
        case 'save':
          this.saveGame();
          return;
        case 'load':
          if (this.loadGame()) {
            return;
          }
          break;
        case 'hint':
          this.showHint();
          return;
        case 'stats':
          this.ui.showStats(this.stats);
          return;
        case 'quit':
          if (this.ui.confirm('ゲームを終了してメインメニューに戻りますか？')) {
            this.gameOver = true;
            this.showMainMenu();
          }
          return;
      }
    }
    
    // 駒を配置
    this.board.placeMarker(move.row, move.col, this.board.currentPlayer);
    
    // 勝敗チェック
    this.checkGameStatus();
  }

  /**
   * AIのターンを処理
   */
  handleAiTurn() {
    const spinner = this.ui.showAIThinking(this.difficulty);
    
    // AIの思考時間をシミュレート
    setTimeout(() => {
      spinner.success({ text: `AIが手を打ちました` });
      
      const aiMove = this.ai.makeMove(this.board);
      this.board.placeMarker(aiMove.row, aiMove.col, this.aiMarker);
      
      // 勝敗チェック
      this.checkGameStatus();
    }, 1000); // 1秒の遅延
  }

  /**
   * ゲームの状態をチェック（勝敗判定）
   */
  checkGameStatus() {
    if (this.board.checkWin(this.board.currentPlayer)) {
      this.gameOver = true;
      this.winner = this.board.currentPlayer;
    } else if (this.board.checkDraw()) {
      this.gameOver = true;
      this.winner = null; // 引き分け
    }
  }

  /**
   * 統計情報を更新
   */
  updateStats() {
    if (!this.gameOver) return;
    
    this.stats.totalGames++;
    
    if (this.winner === 'O') {
      this.stats.oWins++;
    } else if (this.winner === 'X') {
      this.stats.xWins++;
    } else {
      this.stats.draws++;
    }
    
    this.storage.saveStats(this.stats);
  }

  /**
   * ゲームの状態を保存
   */
  saveGame() {
    const saveName = readlineSync.question('保存名を入力してください: ');
    
    if (!saveName.trim()) {
      console.log('保存名が入力されていません。');
      return;
    }
    
    const gameState = {
      board: this.board.serialize(),
      gameMode: this.gameMode,
      difficulty: this.difficulty,
      playerMarker: this.playerMarker,
      aiMarker: this.aiMarker,
      currentPlayer: this.board.currentPlayer,
      boardSize: this.ui.boardSize,
      winLength: this.ui.winLength
    };
    
    if (this.storage.saveGame(saveName, gameState)) {
      console.log(`ゲームを "${saveName}" として保存しました。`);
    } else {
      console.log('ゲームの保存に失敗しました。');
    }
  }

  /**
   * ゲームの状態を読み込む
   * @returns {boolean} 読み込みが成功したかどうか
   */
  loadGame() {
    const saveFiles = this.storage.getSavedGamesList();
    
    if (saveFiles.length === 0) {
      console.log('保存されたゲームがありません。');
      return false;
    }
    
    const index = readlineSync.keyInSelect(saveFiles, '読み込むセーブデータを選択してください:');
    
    if (index === -1) {
      return false;
    }
    
    const gameState = this.storage.loadGame(saveFiles[index]);
    
    if (!gameState) {
      console.log('ゲームの読み込みに失敗しました。');
      return false;
    }
    
    // ゲーム状態の復元
    this.gameMode = gameState.gameMode;
    this.difficulty = gameState.difficulty;
    this.playerMarker = gameState.playerMarker;
    this.aiMarker = gameState.aiMarker;
    
    // UIと盤面の設定を復元
    this.ui.boardSize = gameState.boardSize;
    this.ui.winLength = gameState.winLength;
    
    // ボードの復元
    this.board = new Board(this.ui.boardSize, this.ui.winLength);
    this.board.deserialize(gameState.board);
    
    // AIの再初期化
    if (this.gameMode === 'single') {
      this.ai = new AI(this.aiMarker, this.difficulty);
    }
    
    console.log(`"${saveFiles[index]}" を読み込みました。`);
    
    // ゲームを再開
    this.gameOver = false;
    this.winner = null;
    this.startGame();
    
    return true;
  }

  /**
   * ヒントを表示
   */
  showHint() {
    let hintMove;
    
    if (this.gameMode === 'single' && this.ai) {
      // AIのロジックを使用してヒントを生成
      hintMove = this.ai.makeMove(this.board);
    } else {
      // 簡易的なヒント生成ロジック
      const tempAI = new AI(this.board.currentPlayer, 'medium');
      hintMove = tempAI.makeMove(this.board);
    }
    
    this.ui.showHint(hintMove);
  }

  /**
   * ゲームを終了
   */
  exitGame() {
    if (this.ui.confirm('ゲームを終了しますか？')) {
      console.log('お疲れ様でした！またのプレイをお待ちしています。');
      process.exit();
    } else {
      this.showMainMenu();
    }
  }

  /**
   * ゲームを開始
   */
  start() {
    this.showMainMenu();
  }
}

module.exports = Game;
