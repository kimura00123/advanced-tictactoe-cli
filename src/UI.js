const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const gradient = require('gradient-string');
const readlineSync = require('readline-sync');
const boxen = require('boxen');
const { createSpinner } = require('nanospinner');
const Table = require('cli-table3');

/**
 * ゲームのUI管理クラス
 */
class UI {
  /**
   * UIクラスを初期化
   */
  constructor() {
    this.boardSize = 5;
    this.winLength = 4;
    this.title = '〇×ゲーム';
    this.subtitle = '5×5 高度バージョン';
  }

  /**
   * ゲームのメインタイトルを表示
   */
  showTitle() {
    clear();
    console.log(
      gradient.rainbow(
        figlet.textSync(this.title, {
          font: 'ANSI Shadow',
          horizontalLayout: 'full'
        })
      )
    );
    console.log(chalk.blueBright(this.subtitle));
    console.log(chalk.yellow('========================================'));
    console.log(chalk.green('勝利条件: ') + chalk.white(`${this.winLength}つの駒を一列に並べる`));
    console.log(chalk.yellow('========================================'));
    console.log('');
  }

  /**
   * メインメニューを表示し、選択を取得
   * @returns {number} 選択されたメニュー項目のインデックス
   */
  showMainMenu() {
    this.showTitle();
    const options = [
      'ゲーム開始',
      '設定',
      '統計情報',
      'ゲームのロード',
      'ゲーム終了'
    ];
    
    const index = readlineSync.keyInSelect(options, 'メニューを選択してください:', { cancel: false });
    return index;
  }

  /**
   * ゲームモードの選択メニューを表示
   * @returns {Object} 選択されたゲームモード {mode, difficulty, startingPlayer}
   */
  selectGameMode() {
    this.showTitle();
    console.log(chalk.cyanBright('【ゲームモード選択】'));
    
    const modeOptions = ['1人プレイ（対CPU）', '2人プレイ'];
    const modeIndex = readlineSync.keyInSelect(modeOptions, 'プレイモードを選択してください:', { cancel: false });
    
    let difficulty = null;
    let startingPlayer = 'O';
    
    if (modeIndex === 0) { // 1人プレイの場合
      clear();
      this.showTitle();
      console.log(chalk.cyanBright('【難易度選択】'));
      
      const difficultyOptions = ['初級（簡単）', '中級（普通）', '上級（難しい）', '達人（最強）'];
      const difficultyIndex = readlineSync.keyInSelect(difficultyOptions, '難易度を選択してください:', { cancel: false });
      
      switch (difficultyIndex) {
        case 0: difficulty = 'easy'; break;
        case 1: difficulty = 'medium'; break;
        case 2: difficulty = 'hard'; break;
        case 3: difficulty = 'master'; break;
      }
      
      clear();
      this.showTitle();
      console.log(chalk.cyanBright('【先攻・後攻選択】'));
      
      const playerOptions = ['先攻（O）', '後攻（X）'];
      const playerIndex = readlineSync.keyInSelect(playerOptions, '先攻・後攻を選択してください:', { cancel: false });
      
      startingPlayer = playerIndex === 0 ? 'O' : 'X';
    }
    
    return {
      mode: modeIndex === 0 ? 'single' : 'multi',
      difficulty,
      startingPlayer
    };
  }

  /**
   * 設定メニューを表示
   * @returns {Object} 更新された設定
   */
  showSettingsMenu() {
    this.showTitle();
    console.log(chalk.cyanBright('【設定】'));
    
    const options = [
      `ボードサイズ: ${this.boardSize}x${this.boardSize}`,
      `勝利条件: ${this.winLength}連続`,
      '色設定',
      '戻る'
    ];
    
    const index = readlineSync.keyInSelect(options, '設定を選択してください:', { cancel: false });
    
    switch (index) {
      case 0: // ボードサイズ変更
        const sizeOptions = ['3x3', '4x4', '5x5', '6x6', '7x7'];
        const sizeIndex = readlineSync.keyInSelect(sizeOptions, 'ボードサイズを選択してください:', { cancel: false });
        this.boardSize = sizeIndex + 3; // 3, 4, 5, 6, 7
        this.winLength = Math.min(this.winLength, this.boardSize); // ボードサイズより大きい値にはならないように
        break;
        
      case 1: // 勝利条件変更
        const maxWinLength = this.boardSize;
        const winOptions = [];
        for (let i = 3; i <= maxWinLength; i++) {
          winOptions.push(`${i}連続`);
        }
        const winIndex = readlineSync.keyInSelect(winOptions, '勝利条件を選択してください:', { cancel: false });
        this.winLength = winIndex + 3; // 3, 4, ... maxWinLength
        break;
    }
    
    return {
      boardSize: this.boardSize,
      winLength: this.winLength
    };
  }

  /**
   * ボードを描画
   * @param {Board} board - 描画するボード
   * @param {string} currentPlayer - 現在のプレイヤー
   */
  renderBoard(board, currentPlayer) {
    clear();
    this.showTitle();
    
    console.log(chalk.cyanBright(`現在のプレイヤー: ${currentPlayer === 'O' ? chalk.green('O') : chalk.red('X')}`));
    console.log('');
    
    // ボード上部の座標表示
    let headerRow = '   ';
    for (let col = 0; col < board.size; col++) {
      headerRow += ` ${col}  `;
    }
    console.log(chalk.yellow(headerRow));
    
    // 区切り線
    const dividerLine = '  ' + '+' + '---+'.repeat(board.size);
    console.log(chalk.yellow(dividerLine));
    
    // ボードの各行を描画
    for (let row = 0; row < board.size; row++) {
      let rowText = chalk.yellow(`${row} |`);
      
      for (let col = 0; col < board.size; col++) {
        const cell = board.board[row][col];
        if (cell === 'O') {
          rowText += ` ${chalk.green('O')} ${chalk.yellow('|')}`;
        } else if (cell === 'X') {
          rowText += ` ${chalk.red('X')} ${chalk.yellow('|')}`;
        } else {
          rowText += `   ${chalk.yellow('|')}`;
        }
      }
      
      console.log(rowText);
      console.log(chalk.yellow(dividerLine));
    }
    
    console.log('');
    console.log(chalk.cyanBright('コマンド: save (保存), load (読込), hint (ヒント), stats (統計), quit (終了)'));
    console.log('');
  }

  /**
   * プレイヤーの手の入力を取得
   * @param {Board} board - 現在のボード
   * @returns {Object|string} 選択された手 {row, col} またはコマンド文字列
   */
  getPlayerMove(board) {
    while (true) {
      const input = readlineSync.question('手を入力 (行,列) または コマンド: ');
      
      // コマンドチェック
      if (input === 'save' || input === 'load' || input === 'hint' || input === 'stats' || input === 'quit') {
        return input;
      }
      
      // 入力フォーマットチェック
      const coordinates = input.split(',').map(c => c.trim());
      
      if (coordinates.length !== 2) {
        console.log(chalk.red('無効な入力です。行と列をカンマで区切って入力するか、コマンドを入力してください。'));
        continue;
      }
      
      const row = parseInt(coordinates[0]);
      const col = parseInt(coordinates[1]);
      
      // 範囲チェック
      if (isNaN(row) || isNaN(col) || row < 0 || row >= board.size || col < 0 || col >= board.size) {
        console.log(chalk.red(`無効な位置です。行と列は0から${board.size - 1}の範囲で入力してください。`));
        continue;
      }
      
      // 空きマスチェック
      if (board.board[row][col] !== ' ') {
        console.log(chalk.red('その位置にはすでに駒が置かれています。'));
        continue;
      }
      
      return { row, col };
    }
  }

  /**
   * AIの思考中表示
   * @param {string} difficulty - AIの難易度
   * @returns {Object} スピナーオブジェクト
   */
  showAIThinking(difficulty) {
    let message;
    switch (difficulty) {
      case 'easy': message = 'AIが考え中（簡単）'; break;
      case 'medium': message = 'AIが考え中（普通）'; break;
      case 'hard': message = 'AIが考え中（難しい）'; break;
      case 'master': message = 'AIが考え中（達人）'; break;
      default: message = 'AIが考え中'; break;
    }
    
    const spinner = createSpinner(chalk.cyan(message)).start();
    return spinner;
  }

  /**
   * ゲーム結果の表示
   * @param {string|null} winner - 勝者 ('O', 'X', または引き分けの場合はnull)
   */
  showGameResult(winner) {
    console.log('');
    
    if (winner) {
      const winnerBox = boxen(
        chalk.bold(`${winner === 'O' ? chalk.green('O') : chalk.red('X')} の勝利!`),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: winner === 'O' ? 'green' : 'red'
        }
      );
      console.log(winnerBox);
    } else {
      const drawBox = boxen(
        chalk.yellow.bold('引き分け!'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: 'yellow'
        }
      );
      console.log(drawBox);
    }
    
    console.log('');
  }

  /**
   * 統計情報の表示
   * @param {Object} stats - 統計情報
   */
  showStats(stats) {
    clear();
    this.showTitle();
    console.log(chalk.cyanBright('【統計情報】'));
    
    const table = new Table({
      head: [chalk.white('項目'), chalk.white('回数')],
      colWidths: [20, 10]
    });
    
    table.push(
      [chalk.green('Oの勝利'), stats.oWins],
      [chalk.red('Xの勝利'), stats.xWins],
      [chalk.yellow('引き分け'), stats.draws],
      [chalk.blue('総ゲーム数'), stats.totalGames]
    );
    
    console.log(table.toString());
    console.log('');
    
    readlineSync.keyInPause('続けるにはキーを押してください...');
  }

  /**
   * ヒントの表示
   * @param {Object} move - 推奨される手 {row, col}
   */
  showHint(move) {
    console.log(chalk.magenta(`ヒント: 行=${move.row}, 列=${move.col} が良い手かもしれません。`));
  }

  /**
   * 確認メッセージの表示
   * @param {string} message - 確認メッセージ
   * @returns {boolean} ユーザーの応答（はい/いいえ）
   */
  confirm(message) {
    return readlineSync.keyInYN(message);
  }
}

module.exports = UI;
