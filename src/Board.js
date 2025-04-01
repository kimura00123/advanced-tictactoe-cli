/**
 * ゲームボードを管理するクラス
 */
class Board {
  /**
   * ボードのサイズを指定してボードを初期化
   * @param {number} size - ボードのサイズ（5x5の場合は5）
   * @param {number} winLength - 勝利条件の長さ（4つ並べるなら4）
   */
  constructor(size = 5, winLength = 4) {
    this.size = size;
    this.winLength = winLength;
    this.resetBoard();
  }

  /**
   * ボードをリセットする
   */
  resetBoard() {
    this.board = Array(this.size).fill().map(() => Array(this.size).fill(' '));
    this.moveHistory = [];
    this.currentPlayer = 'O';
  }

  /**
   * 指定された位置にプレイヤーの駒を配置
   * @param {number} row - 行インデックス
   * @param {number} col - 列インデックス
   * @param {string} player - プレイヤー ('O' または 'X')
   * @returns {boolean} 配置が成功したかどうか
   */
  placeMarker(row, col, player) {
    // 範囲外チェック
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return false;
    }

    // すでに駒が置かれているかチェック
    if (this.board[row][col] !== ' ') {
      return false;
    }

    // 駒を配置
    this.board[row][col] = player;
    this.moveHistory.push({ row, col, player });
    return true;
  }

  /**
   * 最後に配置された駒を取り消す
   * @returns {Object|null} 取り消された駒の情報、履歴がない場合はnull
   */
  undoMove() {
    if (this.moveHistory.length === 0) {
      return null;
    }

    const lastMove = this.moveHistory.pop();
    this.board[lastMove.row][lastMove.col] = ' ';
    return lastMove;
  }

  /**
   * 現在のプレイヤーを切り替える
   */
  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'O' ? 'X' : 'O';
  }

  /**
   * 特定のプレイヤーが勝利したかチェック
   * @param {string} player - チェックするプレイヤー ('O' または 'X')
   * @returns {boolean} プレイヤーが勝利したかどうか
   */
  checkWin(player) {
    // 水平方向チェック
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col <= this.size - this.winLength; col++) {
        let win = true;
        for (let k = 0; k < this.winLength; k++) {
          if (this.board[row][col + k] !== player) {
            win = false;
            break;
          }
        }
        if (win) return true;
      }
    }

    // 垂直方向チェック
    for (let col = 0; col < this.size; col++) {
      for (let row = 0; row <= this.size - this.winLength; row++) {
        let win = true;
        for (let k = 0; k < this.winLength; k++) {
          if (this.board[row + k][col] !== player) {
            win = false;
            break;
          }
        }
        if (win) return true;
      }
    }

    // 対角線チェック（左上から右下）
    for (let row = 0; row <= this.size - this.winLength; row++) {
      for (let col = 0; col <= this.size - this.winLength; col++) {
        let win = true;
        for (let k = 0; k < this.winLength; k++) {
          if (this.board[row + k][col + k] !== player) {
            win = false;
            break;
          }
        }
        if (win) return true;
      }
    }

    // 対角線チェック（右上から左下）
    for (let row = 0; row <= this.size - this.winLength; row++) {
      for (let col = this.size - 1; col >= this.winLength - 1; col--) {
        let win = true;
        for (let k = 0; k < this.winLength; k++) {
          if (this.board[row + k][col - k] !== player) {
            win = false;
            break;
          }
        }
        if (win) return true;
      }
    }

    return false;
  }

  /**
   * ゲームが引き分けかどうかをチェック
   * @returns {boolean} ゲームが引き分けかどうか
   */
  checkDraw() {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] === ' ') {
          return false; // 空のセルがある場合は引き分けではない
        }
      }
    }
    return true; // すべてのセルが埋まっている場合は引き分け
  }

  /**
   * ゲームの状態をシリアライズする
   * @returns {Object} シリアライズされたゲームの状態
   */
  serialize() {
    return {
      size: this.size,
      winLength: this.winLength,
      board: this.board,
      moveHistory: this.moveHistory,
      currentPlayer: this.currentPlayer
    };
  }

  /**
   * シリアライズされたゲームの状態からボードを復元する
   * @param {Object} data - シリアライズされたゲームの状態
   */
  deserialize(data) {
    this.size = data.size;
    this.winLength = data.winLength;
    this.board = data.board;
    this.moveHistory = data.moveHistory;
    this.currentPlayer = data.currentPlayer;
  }

  /**
   * 空のセル（有効な手）のリストを取得する
   * @returns {Array} 有効な手のリスト [{row, col}]
   */
  getEmptyCells() {
    const emptyCells = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] === ' ') {
          emptyCells.push({ row, col });
        }
      }
    }
    return emptyCells;
  }

  /**
   * ボードの状態をコピーする
   * @returns {Board} コピーされたボードオブジェクト
   */
  clone() {
    const newBoard = new Board(this.size, this.winLength);
    newBoard.board = this.board.map(row => [...row]);
    newBoard.moveHistory = [...this.moveHistory];
    newBoard.currentPlayer = this.currentPlayer;
    return newBoard;
  }
}

module.exports = Board;
