const AI = require('../src/AI');
const Board = require('../src/Board');

describe('AI Class', () => {
  let ai;
  let board;

  beforeEach(() => {
    // 各テストの前に新しいAIとボードを作成
    ai = new AI('X', 'medium');
    board = new Board(5, 4);
  });

  test('AIが正しく初期化される', () => {
    expect(ai.marker).toBe('X');
    expect(ai.opponentMarker).toBe('O');
    expect(ai.difficulty).toBe('medium');
    expect(ai.maxDepth).toBe(2); // mediumの難易度は深さ2
  });

  test('異なる難易度での最大深さが正しく設定される', () => {
    const easyAI = new AI('X', 'easy');
    const mediumAI = new AI('X', 'medium');
    const hardAI = new AI('X', 'hard');
    const masterAI = new AI('X', 'master');
    
    expect(easyAI.maxDepth).toBe(1);
    expect(mediumAI.maxDepth).toBe(2);
    expect(hardAI.maxDepth).toBe(3);
    expect(masterAI.maxDepth).toBe(4);
  });

  test('ランダムな手が有効な位置に選ばれる', () => {
    const move = ai.makeRandomMove(board);
    
    expect(move).toHaveProperty('row');
    expect(move).toHaveProperty('col');
    expect(move.row).toBeGreaterThanOrEqual(0);
    expect(move.row).toBeLessThan(board.size);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThan(board.size);
    expect(board.board[move.row][move.col]).toBe(' ');
  });

  test('中級AIがブロック手を選択する', () => {
    // X勝利阻止のテスト:
    // O O O .
    board.placeMarker(0, 0, 'O');
    board.placeMarker(0, 1, 'O');
    board.placeMarker(0, 2, 'O');
    
    const aiMove = ai.makeMediumMove(board);
    
    // AIはO勝利をブロックするために(0,3)に打つべき
    expect(aiMove).toEqual({ row: 0, col: 3 });
  });

  test('中級AIが勝利手を選択する', () => {
    // 勝利手のテスト:
    // X X X .
    board.placeMarker(0, 0, 'X');
    board.placeMarker(0, 1, 'X');
    board.placeMarker(0, 2, 'X');
    
    const aiMove = ai.makeMediumMove(board);
    
    // AIは勝つために(0,3)に打つべき
    expect(aiMove).toEqual({ row: 0, col: 3 });
  });

  test('AIが中央を優先して選択する', () => {
    // 空のボードでは中央を選ぶべき
    const aiMove = ai.makeMediumMove(board);
    const center = Math.floor(board.size / 2);
    
    expect(aiMove).toEqual({ row: center, col: center });
  });

  test('中級AIが角を選択する', () => {
    // 中央が埋まっている場合
    const center = Math.floor(board.size / 2);
    board.placeMarker(center, center, 'O');
    
    const aiMove = ai.makeMediumMove(board);
    
    // 角のいずれかを選択するはず
    const corners = [
      { row: 0, col: 0 },
      { row: 0, col: board.size - 1 },
      { row: board.size - 1, col: 0 },
      { row: board.size - 1, col: board.size - 1 }
    ];
    
    expect(corners).toContainEqual(aiMove);
  });

  test('ミニマックスアルゴリズムが動作する', () => {
    // 簡単なボードで勝利手をテスト
    const smallBoard = new Board(3, 3);
    smallBoard.placeMarker(0, 0, 'X');
    smallBoard.placeMarker(0, 1, 'X');
    
    // 難しいAIに切り替え
    const hardAI = new AI('X', 'hard');
    
    const aiMove = hardAI.makeMinimaxMove(smallBoard);
    
    // AIは勝つために(0,2)に打つべき
    expect(aiMove).toEqual({ row: 0, col: 2 });
  });

  test('AIがボードを評価できる', () => {
    // 空のボードの評価
    const emptyScore = ai.evaluateBoard(board);
    
    // 自分有利のボード評価
    board.placeMarker(0, 0, 'X');
    board.placeMarker(0, 1, 'X');
    board.placeMarker(0, 2, 'X');
    
    const favorableScore = ai.evaluateBoard(board);
    
    // 相手有利のボード評価
    board = new Board(5, 4);
    board.placeMarker(0, 0, 'O');
    board.placeMarker(0, 1, 'O');
    board.placeMarker(0, 2, 'O');
    
    const unfavorableScore = ai.evaluateBoard(board);
    
    // 有利な評価は高いスコアになる
    expect(favorableScore).toBeGreaterThan(emptyScore);
    expect(unfavorableScore).toBeLessThan(emptyScore);
  });

  test('AIがdifficultyに応じた手を選ぶ', () => {
    // easyはrandom
    const easyAI = new AI('X', 'easy');
    const randomMoveSpy = jest.spyOn(easyAI, 'makeRandomMove');
    easyAI.makeMove(board);
    expect(randomMoveSpy).toHaveBeenCalled();
    
    // mediumはmedium
    const mediumAI = new AI('X', 'medium');
    const mediumMoveSpy = jest.spyOn(mediumAI, 'makeMediumMove');
    mediumAI.makeMove(board);
    expect(mediumMoveSpy).toHaveBeenCalled();
    
    // hardはminimax
    const hardAI = new AI('X', 'hard');
    const minimaxMoveSpy = jest.spyOn(hardAI, 'makeMinimaxMove');
    hardAI.makeMove(board);
    expect(minimaxMoveSpy).toHaveBeenCalled();
  });
});
