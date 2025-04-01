/**
 * AIプレイヤークラス
 */
class AI {
  /**
   * AIプレイヤーを初期化
   * @param {string} marker - AIの駒 ('O' または 'X')
   * @param {string} difficulty - 難易度 ('easy', 'medium', 'hard', 'master')
   */
  constructor(marker, difficulty = 'medium') {
    this.marker = marker;
    this.opponentMarker = marker === 'O' ? 'X' : 'O';
    this.difficulty = difficulty;
    this.maxDepth = this.getMaxDepthForDifficulty();
  }

  /**
   * 難易度に基づいて探索の最大深さを決定
   * @returns {number} 探索の最大深さ
   */
  getMaxDepthForDifficulty() {
    switch (this.difficulty) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      case 'master': return 4;
      default: return 2;
    }
  }

  /**
   * 次の一手を決定する
   * @param {Board} board - 現在のボード状態
   * @returns {Object} 選択された手 {row, col}
   */
  makeMove(board) {
    if (this.difficulty === 'easy') {
      return this.makeRandomMove(board);
    } else if (this.difficulty === 'medium') {
      return this.makeMediumMove(board);
    } else {
      return this.makeMinimaxMove(board);
    }
  }

  /**
   * ランダムな手を選択（簡単難易度）
   * @param {Board} board - 現在のボード状態
   * @returns {Object} 選択された手 {row, col}
   */
  makeRandomMove(board) {
    const emptyCells = board.getEmptyCells();
    if (emptyCells.length === 0) return null;
    
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  /**
   * 中級難易度の手を選択
   * 勝てるところがあれば勝つ、負けそうなら防ぐ、それ以外はランダム
   * @param {Board} board - 現在のボード状態
   * @returns {Object} 選択された手 {row, col}
   */
  makeMediumMove(board) {
    const boardCopy = board.clone();
    const emptyCells = boardCopy.getEmptyCells();
    
    // 勝てる手があれば選択
    for (const cell of emptyCells) {
      boardCopy.placeMarker(cell.row, cell.col, this.marker);
      if (boardCopy.checkWin(this.marker)) {
        return cell;
      }
      boardCopy.undoMove();
    }
    
    // 相手が勝てる手があればブロック
    for (const cell of emptyCells) {
      boardCopy.placeMarker(cell.row, cell.col, this.opponentMarker);
      if (boardCopy.checkWin(this.opponentMarker)) {
        return cell;
      }
      boardCopy.undoMove();
    }
    
    // 中央を優先
    const center = Math.floor(board.size / 2);
    if (board.board[center][center] === ' ') {
      return { row: center, col: center };
    }
    
    // 角を優先
    const corners = [
      { row: 0, col: 0 },
      { row: 0, col: board.size - 1 },
      { row: board.size - 1, col: 0 },
      { row: board.size - 1, col: board.size - 1 }
    ];
    
    for (const corner of corners) {
      if (board.board[corner.row][corner.col] === ' ') {
        return corner;
      }
    }
    
    // それ以外はランダム
    return this.makeRandomMove(board);
  }

  /**
   * ミニマックスアルゴリズムを使用した手を選択（難しい難易度）
   * @param {Board} board - 現在のボード状態
   * @returns {Object} 選択された手 {row, col}
   */
  makeMinimaxMove(board) {
    const boardCopy = board.clone();
    const emptyCells = boardCopy.getEmptyCells();
    
    if (emptyCells.length === 0) return null;
    if (emptyCells.length === 1) return emptyCells[0];
    
    // ボードサイズが大きい場合、最初の数手はランダム（パフォーマンス向上のため）
    if (emptyCells.length > board.size * board.size - 3) {
      return this.makeMediumMove(board);
    }
    
    let bestScore = -Infinity;
    let bestMove = null;
    
    for (const cell of emptyCells) {
      boardCopy.placeMarker(cell.row, cell.col, this.marker);
      
      const score = this.minimax(boardCopy, 0, false, -Infinity, Infinity);
      
      boardCopy.undoMove();
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = cell;
      }
    }
    
    return bestMove;
  }

  /**
   * ミニマックスアルゴリズム（アルファベータ枝刈り法）
   * @param {Board} board - 現在のボード状態
   * @param {number} depth - 現在の探索深さ
   * @param {boolean} isMaximizing - 最大化プレイヤーかどうか
   * @param {number} alpha - アルファ値
   * @param {number} beta - ベータ値
   * @returns {number} 評価スコア
   */
  minimax(board, depth, isMaximizing, alpha, beta) {
    const currentMarker = isMaximizing ? this.marker : this.opponentMarker;
    
    // 終了条件チェック
    if (board.checkWin(this.marker)) {
      return 100 - depth; // 自分の勝ち（浅い探索を優先）
    }
    
    if (board.checkWin(this.opponentMarker)) {
      return -100 + depth; // 相手の勝ち（深い探索を優先）
    }
    
    if (board.checkDraw() || depth >= this.maxDepth) {
      return this.evaluateBoard(board); // 引き分けまたは最大深さに達した
    }
    
    const emptyCells = board.getEmptyCells();
    
    if (isMaximizing) {
      let maxScore = -Infinity;
      
      for (const cell of emptyCells) {
        board.placeMarker(cell.row, cell.col, this.marker);
        const score = this.minimax(board, depth + 1, false, alpha, beta);
        board.undoMove();
        
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        
        if (beta <= alpha) break; // アルファベータ枝刈り
      }
      
      return maxScore;
    } else {
      let minScore = Infinity;
      
      for (const cell of emptyCells) {
        board.placeMarker(cell.row, cell.col, this.opponentMarker);
        const score = this.minimax(board, depth + 1, true, alpha, beta);
        board.undoMove();
        
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        
        if (beta <= alpha) break; // アルファベータ枝刈り
      }
      
      return minScore;
    }
  }

  /**
   * ボードの状態を評価する関数
   * @param {Board} board - 評価するボード
   * @returns {number} 評価スコア
   */
  evaluateBoard(board) {
    // ヒューリスティック評価関数
    let score = 0;
    
    // 行のスコア
    score += this.evaluateLines(board, 'row');
    
    // 列のスコア
    score += this.evaluateLines(board, 'col');
    
    // 対角線のスコア
    score += this.evaluateLines(board, 'diag');
    
    // 逆対角線のスコア
    score += this.evaluateLines(board, 'anti-diag');
    
    return score;
  }

  /**
   * 特定の方向のラインを評価する
   * @param {Board} board - 評価するボード
   * @param {string} direction - 評価する方向 ('row', 'col', 'diag', 'anti-diag')
   * @returns {number} 評価スコア
   */
  evaluateLines(board, direction) {
    let score = 0;
    const winLength = board.winLength;
    
    const evaluateLine = (line) => {
      // 連続した駒の数をカウント
      let myMarkerCount = 0;
      let opponentMarkerCount = 0;
      let emptyCount = 0;
      
      for (const cell of line) {
        if (cell === this.marker) {
          myMarkerCount++;
        } else if (cell === this.opponentMarker) {
          opponentMarkerCount++;
        } else {
          emptyCount++;
        }
      }
      
      // スコア計算（自分の駒が多く、相手の駒が少ないほど高スコア）
      if (opponentMarkerCount === 0 && myMarkerCount > 0) {
        // 自分の駒だけの場合、駒の数に応じて指数関数的にスコア増加
        return Math.pow(10, myMarkerCount);
      } else if (myMarkerCount === 0 && opponentMarkerCount > 0) {
        // 相手の駒だけの場合、阻止するためのマイナススコア
        return -Math.pow(10, opponentMarkerCount);
      }
      
      return 0; // 両方の駒が含まれる場合は価値なし
    };
    
    if (direction === 'row') {
      // 行の評価
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col <= board.size - winLength; col++) {
          const line = [];
          for (let k = 0; k < winLength; k++) {
            line.push(board.board[row][col + k]);
          }
          score += evaluateLine(line);
        }
      }
    } else if (direction === 'col') {
      // 列の評価
      for (let col = 0; col < board.size; col++) {
        for (let row = 0; row <= board.size - winLength; row++) {
          const line = [];
          for (let k = 0; k < winLength; k++) {
            line.push(board.board[row + k][col]);
          }
          score += evaluateLine(line);
        }
      }
    } else if (direction === 'diag') {
      // 対角線の評価（左上から右下）
      for (let row = 0; row <= board.size - winLength; row++) {
        for (let col = 0; col <= board.size - winLength; col++) {
          const line = [];
          for (let k = 0; k < winLength; k++) {
            line.push(board.board[row + k][col + k]);
          }
          score += evaluateLine(line);
        }
      }
    } else if (direction === 'anti-diag') {
      // 逆対角線の評価（右上から左下）
      for (let row = 0; row <= board.size - winLength; row++) {
        for (let col = board.size - 1; col >= winLength - 1; col--) {
          const line = [];
          for (let k = 0; k < winLength; k++) {
            line.push(board.board[row + k][col - k]);
          }
          score += evaluateLine(line);
        }
      }
    }
    
    return score;
  }
}

module.exports = AI;
