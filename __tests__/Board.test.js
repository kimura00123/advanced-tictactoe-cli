const Board = require('../src/Board');

describe('Board Class', () => {
  let board;

  beforeEach(() => {
    // 各テストの前に新しいボードを作成
    board = new Board(5, 4);
  });

  test('ボードが正しく初期化されている', () => {
    expect(board.size).toBe(5);
    expect(board.winLength).toBe(4);
    expect(board.board.length).toBe(5);
    expect(board.board[0].length).toBe(5);
    
    // すべてのセルが空であることを確認
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        expect(board.board[row][col]).toBe(' ');
      }
    }
    
    expect(board.moveHistory).toEqual([]);
    expect(board.currentPlayer).toBe('O');
  });

  test('駒が正しく配置される', () => {
    expect(board.placeMarker(1, 1, 'O')).toBe(true);
    expect(board.board[1][1]).toBe('O');
    expect(board.moveHistory).toEqual([{ row: 1, col: 1, player: 'O' }]);
    
    expect(board.placeMarker(2, 2, 'X')).toBe(true);
    expect(board.board[2][2]).toBe('X');
    expect(board.moveHistory).toEqual([
      { row: 1, col: 1, player: 'O' },
      { row: 2, col: 2, player: 'X' }
    ]);
  });

  test('すでに駒がある場所には配置できない', () => {
    board.placeMarker(1, 1, 'O');
    expect(board.placeMarker(1, 1, 'X')).toBe(false);
    expect(board.board[1][1]).toBe('O'); // 変化していないことを確認
  });

  test('プレイヤーの切り替えが正しく動作する', () => {
    expect(board.currentPlayer).toBe('O');
    board.switchPlayer();
    expect(board.currentPlayer).toBe('X');
    board.switchPlayer();
    expect(board.currentPlayer).toBe('O');
  });

  test('最後の手を取り消すことができる', () => {
    board.placeMarker(1, 1, 'O');
    board.placeMarker(2, 2, 'X');
    
    const lastMove = board.undoMove();
    expect(lastMove).toEqual({ row: 2, col: 2, player: 'X' });
    expect(board.board[2][2]).toBe(' ');
    expect(board.moveHistory.length).toBe(1);
    
    const secondLastMove = board.undoMove();
    expect(secondLastMove).toEqual({ row: 1, col: 1, player: 'O' });
    expect(board.board[1][1]).toBe(' ');
    expect(board.moveHistory.length).toBe(0);
    
    // 全て取り消した後は null を返す
    expect(board.undoMove()).toBe(null);
  });

  test('水平方向の勝利条件をチェックできる', () => {
    // O O O O
    // . . . .
    // . . . .
    board.placeMarker(0, 0, 'O');
    board.placeMarker(0, 1, 'O');
    board.placeMarker(0, 2, 'O');
    
    expect(board.checkWin('O')).toBe(false);
    
    board.placeMarker(0, 3, 'O');
    expect(board.checkWin('O')).toBe(true);
    expect(board.checkWin('X')).toBe(false);
  });

  test('垂直方向の勝利条件をチェックできる', () => {
    // O . . .
    // O . . .
    // O . . .
    // O . . .
    board.placeMarker(0, 0, 'O');
    board.placeMarker(1, 0, 'O');
    board.placeMarker(2, 0, 'O');
    
    expect(board.checkWin('O')).toBe(false);
    
    board.placeMarker(3, 0, 'O');
    expect(board.checkWin('O')).toBe(true);
    expect(board.checkWin('X')).toBe(false);
  });

  test('対角線方向の勝利条件をチェックできる', () => {
    // O . . .
    // . O . .
    // . . O .
    // . . . O
    board.placeMarker(0, 0, 'O');
    board.placeMarker(1, 1, 'O');
    board.placeMarker(2, 2, 'O');
    
    expect(board.checkWin('O')).toBe(false);
    
    board.placeMarker(3, 3, 'O');
    expect(board.checkWin('O')).toBe(true);
    expect(board.checkWin('X')).toBe(false);
  });

  test('逆対角線方向の勝利条件をチェックできる', () => {
    // . . . O
    // . . O .
    // . O . .
    // O . . .
    board.placeMarker(0, 3, 'O');
    board.placeMarker(1, 2, 'O');
    board.placeMarker(2, 1, 'O');
    
    expect(board.checkWin('O')).toBe(false);
    
    board.placeMarker(3, 0, 'O');
    expect(board.checkWin('O')).toBe(true);
    expect(board.checkWin('X')).toBe(false);
  });

  test('引き分け状態を正しくチェックできる', () => {
    // OXO
    // XOX
    // OXO
    const smallBoard = new Board(3, 3);
    
    // 1行目
    smallBoard.placeMarker(0, 0, 'O');
    smallBoard.placeMarker(0, 1, 'X');
    smallBoard.placeMarker(0, 2, 'O');
    
    // 2行目
    smallBoard.placeMarker(1, 0, 'X');
    smallBoard.placeMarker(1, 1, 'O');
    smallBoard.placeMarker(1, 2, 'X');
    
    // 3行目
    smallBoard.placeMarker(2, 0, 'O');
    smallBoard.placeMarker(2, 1, 'X');
    
    expect(smallBoard.checkDraw()).toBe(false);
    
    smallBoard.placeMarker(2, 2, 'O');
    expect(smallBoard.checkDraw()).toBe(true);
  });

  test('シリアライズと復元が正しく動作する', () => {
    board.placeMarker(0, 0, 'O');
    board.placeMarker(1, 1, 'X');
    board.switchPlayer();
    
    const serialized = board.serialize();
    
    const newBoard = new Board();
    newBoard.deserialize(serialized);
    
    expect(newBoard.size).toBe(board.size);
    expect(newBoard.winLength).toBe(board.winLength);
    expect(newBoard.board).toEqual(board.board);
    expect(newBoard.moveHistory).toEqual(board.moveHistory);
    expect(newBoard.currentPlayer).toBe(board.currentPlayer);
  });

  test('空のセルのリストを取得できる', () => {
    // 一部のセルに駒を配置
    board.placeMarker(0, 0, 'O');
    board.placeMarker(1, 1, 'X');
    board.placeMarker(2, 2, 'O');
    
    const emptyCells = board.getEmptyCells();
    
    // 3つのセルを使用したので、5x5 - 3 = 22個の空きセルがあるはず
    expect(emptyCells.length).toBe(22);
    
    // 使用したセルが含まれていないことを確認
    expect(emptyCells.some(cell => cell.row === 0 && cell.col === 0)).toBe(false);
    expect(emptyCells.some(cell => cell.row === 1 && cell.col === 1)).toBe(false);
    expect(emptyCells.some(cell => cell.row === 2 && cell.col === 2)).toBe(false);
  });

  test('ボードをクローンできる', () => {
    board.placeMarker(0, 0, 'O');
    board.placeMarker(1, 1, 'X');
    
    const clonedBoard = board.clone();
    
    // クローンは元のボードと同じ状態を持つ
    expect(clonedBoard.size).toBe(board.size);
    expect(clonedBoard.winLength).toBe(board.winLength);
    expect(clonedBoard.board).toEqual(board.board);
    expect(clonedBoard.moveHistory).toEqual(board.moveHistory);
    expect(clonedBoard.currentPlayer).toBe(board.currentPlayer);
    
    // クローンは独立しているので、一方を変更しても他方に影響しない
    clonedBoard.placeMarker(2, 2, 'O');
    expect(board.board[2][2]).toBe(' ');
    expect(clonedBoard.board[2][2]).toBe('O');
  });
});
