import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { computeBestChessMove, getChessStatus, getCapturedPieces } from './chessEngine';
import {
  createInitialCheckersState,
  getLegalCheckersMoves,
  applyCheckersMove,
  undoCheckersMove,
  computeBestCheckersMove,
} from './checkersEngine';

test('Chess: Fool’s Mate checkmate detection and status', () => {
  const game = new Chess();
  game.move('f3');
  game.move('e5');
  game.move('g4');
  game.move('Qh4#');
  const status = getChessStatus(game);
  assert.equal(status.isCheckmate, true);
  assert.equal(status.isGameOver, true);
  assert.equal(status.winner, 'b');
  assert.equal(status.reason, 'checkmate');
});

test('Chess: En passant, castling, and pawn promotion work cleanly', () => {
  // En passant
  const epGame = new Chess('rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3');
  const epMove = epGame.move({ from: 'e5', to: 'd6' });
  assert.equal(epMove.isEnPassant(), true);

  // Kingside castling
  const castleGame = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  const castleMove = castleGame.move({ from: 'e1', to: 'g1' });
  assert.equal(castleMove.isKingsideCastle(), true);

  // Pawn promotion
  const promoGame = new Chess('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
  const promoMove = promoGame.move({ from: 'a7', to: 'a8', promotion: 'q' });
  assert.equal(promoMove.isPromotion(), true);
  assert.equal(promoGame.get('a8')?.type, 'q');
});

test('Chess: Stalemate and insufficient material detection', () => {
  const stalemate = new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
  const stStatus = getChessStatus(stalemate);
  assert.equal(stStatus.isStalemate, true);
  assert.equal(stStatus.winner, 'draw');

  const insuff = new Chess('4k3/8/8/8/8/8/8/4K2N w - - 0 1');
  const inStatus = getChessStatus(insuff);
  assert.equal(inStatus.isInsufficientMaterial, true);
  assert.equal(inStatus.winner, 'draw');
});

test('Chess: Captured pieces tracker & all 4 AI difficulty levels return legal moves', () => {
  const game = new Chess();
  game.move('e4');
  game.move('d5');
  game.move('exd5');
  const captured = getCapturedPieces(game);
  assert.deepEqual(captured.w, ['p']);

  for (const level of ['beginner', 'easy', 'medium', 'expert'] as const) {
    const move = computeBestChessMove(game.fen(), level);
    assert.ok(move !== null, `AI (${level}) should return a move`);
    const verify = new Chess(game.fen());
    assert.doesNotThrow(() => verify.move(move!));
  }
});

test('Checkers: Initial setup has 12 pieces per side and 7 opening moves for dark', () => {
  const state = createInitialCheckersState();
  assert.equal(state.turn, 'b');
  const moves = getLegalCheckersMoves(state);
  assert.equal(moves.length, 7);
});

test('Checkers: Mandatory capture and multi-jump chain capture', () => {
  const state = createInitialCheckersState();
  // Clear board for controlled multi-jump test
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      state.board[r][c] = null;
    }
  }
  state.board[5][0] = { color: 'b', king: false };
  state.board[4][1] = { color: 'w', king: false };
  state.board[2][3] = { color: 'w', king: false };
  state.board[5][6] = { color: 'b', king: false }; // another dark piece with step moves, must be ignored due to mandatory capture
  state.turn = 'b';

  const legal1 = getLegalCheckersMoves(state);
  assert.equal(legal1.length, 1, 'Mandatory jump must restrict moves to the jump');
  assert.equal(legal1[0].to.row, 3);
  assert.equal(legal1[0].to.col, 2);

  const afterJump1 = applyCheckersMove(state, legal1[0]);
  assert.equal(afterJump1.turn, 'b', 'Same player must continue multi-jump');
  assert.deepEqual(afterJump1.activeJumpFrom, { row: 3, col: 2 });

  const legal2 = getLegalCheckersMoves(afterJump1);
  assert.equal(legal2.length, 1);
  assert.equal(legal2[0].to.row, 1);
  assert.equal(legal2[0].to.col, 4);

  const afterJump2 = applyCheckersMove(afterJump1, legal2[0]);
  assert.equal(afterJump2.winner, 'b', 'Dark wins after capturing all white pieces');
});

test('Checkers: King promotion, bidirectional king movement, and undo', () => {
  const state = createInitialCheckersState();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      state.board[r][c] = null;
    }
  }
  state.board[1][2] = { color: 'b', king: false };
  state.board[6][5] = { color: 'w', king: false };
  state.turn = 'b';

  const moves = getLegalCheckersMoves(state);
  const promoMove = moves.find((m) => m.to.row === 0 && m.to.col === 1);
  assert.ok(promoMove);
  const afterPromo = applyCheckersMove(state, promoMove!);
  assert.equal(afterPromo.board[0][1]?.king, true);
  assert.equal(afterPromo.turn, 'w');

  // Undo restores exact non-king position
  const undone = undoCheckersMove(afterPromo);
  assert.equal(undone.board[1][2]?.king, false);
  assert.equal(undone.board[0][1], null);
  assert.equal(undone.turn, 'b');
});

test('Checkers: All 4 AI difficulty levels produce valid moves', () => {
  const state = createInitialCheckersState();
  for (const level of ['beginner', 'easy', 'medium', 'expert'] as const) {
    const move = computeBestCheckersMove(state, level);
    assert.ok(move !== null, `Checkers AI (${level}) should pick a move`);
    assert.doesNotThrow(() => applyCheckersMove(state, move!));
  }
});
