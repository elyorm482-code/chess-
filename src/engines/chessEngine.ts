import { Chess, Move, PieceSymbol, Square } from 'chess.js';
import type { AIDifficulty } from '../shared/types';

export interface ChessMoveRecord {
  san: string;
  from: Square;
  to: Square;
  color: 'w' | 'b';
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  isCheck: boolean;
  isCastle: boolean;
  isEnPassant: boolean;
}

export interface ChessStatus {
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
  isDrawByFiftyMoves: boolean;
  isGameOver: boolean;
  winner: 'w' | 'b' | 'draw' | null;
  reason: string | null;
}

export function getChessStatus(game: Chess): ChessStatus {
  const turn = game.turn();
  const isCheck = game.isCheck();
  const isCheckmate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isThreefoldRepetition = game.isThreefoldRepetition();
  const isInsufficientMaterial = game.isInsufficientMaterial();
  const isDrawByFiftyMoves = game.isDrawByFiftyMoves();
  const isDraw = game.isDraw();
  const isGameOver = game.isGameOver();

  let winner: 'w' | 'b' | 'draw' | null = null;
  let reason: string | null = null;

  if (isCheckmate) {
    winner = turn === 'w' ? 'b' : 'w';
    reason = 'checkmate';
  } else if (isStalemate) {
    winner = 'draw';
    reason = 'stalemate';
  } else if (isThreefoldRepetition) {
    winner = 'draw';
    reason = 'repetition';
  } else if (isInsufficientMaterial) {
    winner = 'draw';
    reason = 'insufficient';
  } else if (isDrawByFiftyMoves) {
    winner = 'draw';
    reason = 'fifty_moves';
  } else if (isDraw) {
    winner = 'draw';
    reason = 'draw';
  }

  return {
    turn,
    isCheck,
    isCheckmate,
    isStalemate,
    isDraw,
    isThreefoldRepetition,
    isInsufficientMaterial,
    isDrawByFiftyMoves,
    isGameOver,
    winner,
    reason,
  };
}

export function getLegalMovesForSquare(game: Chess, square: Square): Move[] {
  return game.moves({ square, verbose: true });
}

export function getCapturedPieces(game: Chess): { w: PieceSymbol[]; b: PieceSymbol[] } {
  const startingCounts: Record<PieceSymbol, number> = {
    p: 8,
    n: 2,
    b: 2,
    r: 2,
    q: 1,
    k: 1,
  };
  const currentCounts: { w: Record<PieceSymbol, number>; b: Record<PieceSymbol, number> } = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  };

  for (const row of game.board()) {
    for (const cell of row) {
      if (cell) {
        currentCounts[cell.color][cell.type]++;
      }
    }
  }

  // Pieces captured BY white (missing black pieces) and BY black (missing white pieces)
  const order: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];
  const capturedByWhite: PieceSymbol[] = [];
  const capturedByBlack: PieceSymbol[] = [];

  for (const piece of order) {
    const missingBlack = Math.max(0, startingCounts[piece] - currentCounts.b[piece]);
    for (let i = 0; i < missingBlack; i++) capturedByWhite.push(piece);
    const missingWhite = Math.max(0, startingCounts[piece] - currentCounts.w[piece]);
    for (let i = 0; i < missingWhite; i++) capturedByBlack.push(piece);
  }

  return { w: capturedByWhite, b: capturedByBlack };
}

// --- Chess AI Engine (Negamax + Alpha-Beta + Quiescence + Piece-Square Tables) ---

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-square tables from White's perspective (rank 8 at index 0 -> rank 1 at index 7)
const PST_PAWN = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 27, 27, 10,  5,  5],
  [0,  0,  0, 24, 24,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-22,-22, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0],
];

const PST_KNIGHT = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const PST_BISHOP = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const PST_ROOK = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0],
];

const PST_QUEEN = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,   0,  5,  5,  5,  5,  0, -5],
  [0,    0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
];

const PST_KING_MID = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20,  20,  0,  0,  0,  0, 20, 20],
  [20,  30, 10,  0,  0, 10, 30, 20],
];

const PST_KING_END = [
  [-50,-40,-30,-20,-20,-30,-40,-50],
  [-30,-20,-10,  0,  0,-10,-20,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-30,  0,  0,  0,  0,-30,-30],
  [-50,-30,-30,-30,-30,-30,-30,-50],
];

function getPstValue(type: PieceSymbol, row: number, col: number, color: 'w' | 'b', isEndgame: boolean): number {
  const r = color === 'w' ? row : 7 - row;
  switch (type) {
    case 'p': return PST_PAWN[r][col];
    case 'n': return PST_KNIGHT[r][col];
    case 'b': return PST_BISHOP[r][col];
    case 'r': return PST_ROOK[r][col];
    case 'q': return PST_QUEEN[r][col];
    case 'k': return isEndgame ? PST_KING_END[r][col] : PST_KING_MID[r][col];
  }
}

export function evaluateChessBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -99999 : 99999;
  }
  if (game.isDraw()) {
    return 0;
  }

  const board = game.board();
  let nonKingMaterial = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type !== 'k') {
        nonKingMaterial += PIECE_VALUES[piece.type];
      }
    }
  }
  const isEndgame = nonKingMaterial < 2600;

  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type] + getPstValue(piece.type, r, c, piece.color, isEndgame);
      score += piece.color === 'w' ? val : -val;
    }
  }

  // Tempo bonus
  score += game.turn() === 'w' ? 10 : -10;
  return score;
}

function scoreMoveOrder(move: Move): number {
  let score = 0;
  if (move.captured) {
    score += 10 * PIECE_VALUES[move.captured] - PIECE_VALUES[move.piece];
  }
  if (move.promotion) {
    score += PIECE_VALUES[move.promotion];
  }
  if (move.san.includes('+')) {
    score += 50;
  }
  if (move.isKingsideCastle() || move.isQueensideCastle()) {
    score += 65;
  }
  return score;
}

function orderMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => scoreMoveOrder(b) - scoreMoveOrder(a));
}

function quiescence(game: Chess, alpha: number, beta: number, colorFactor: number, qDepth: number): number {
  const standPat = colorFactor * evaluateChessBoard(game);
  if (qDepth <= 0) return standPat;
  if (standPat >= beta) return beta;
  if (alpha < standPat) alpha = standPat;

  const captures = orderMoves(
    game.moves({ verbose: true }).filter((m) => Boolean(m.captured) || Boolean(m.promotion))
  );

  for (const move of captures) {
    game.move(move);
    const score = -quiescence(game, -beta, -alpha, -colorFactor, qDepth - 1);
    game.undo();

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function negamax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  colorFactor: number,
  useQuiescence: boolean,
  deadline: number
): number {
  if (Date.now() > deadline) {
    return colorFactor * evaluateChessBoard(game);
  }
  if (game.isGameOver()) {
    if (game.isCheckmate()) {
      return -90000 - depth * 100;
    }
    return 0;
  }
  if (depth <= 0) {
    return useQuiescence
      ? quiescence(game, alpha, beta, colorFactor, 3)
      : colorFactor * evaluateChessBoard(game);
  }

  const moves = orderMoves(game.moves({ verbose: true }));
  let best = -Infinity;

  for (const move of moves) {
    game.move(move);
    const score = -negamax(game, depth - 1, -beta, -alpha, -colorFactor, useQuiescence, deadline);
    game.undo();

    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }

  return best;
}

export function computeBestChessMove(fen: string, difficulty: AIDifficulty): Move | null {
  const game = new Chess(fen);
  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const colorFactor = game.turn() === 'w' ? 1 : -1;

  if (difficulty === 'beginner') {
    // Evaluate 1-ply, filter out catastrophic queen blunders half the time, pick with high randomness
    const scored = legalMoves.map((m) => {
      game.move(m);
      const val = colorFactor * evaluateChessBoard(game) + (Math.random() - 0.5) * 260;
      game.undo();
      return { move: m, val };
    });
    scored.sort((a, b) => b.val - a.val);
    const pool = scored.slice(0, Math.min(5, scored.length));
    return pool[Math.floor(Math.random() * pool.length)].move;
  }

  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const useQuiescence = difficulty === 'expert' || difficulty === 'medium';
  const timeBudgetMs = difficulty === 'expert' ? 900 : difficulty === 'medium' ? 450 : 150;
  const deadline = Date.now() + timeBudgetMs;

  const ordered = orderMoves(legalMoves);
  let bestMoves: Move[] = [];
  let bestScore = -Infinity;

  for (const move of ordered) {
    game.move(move);
    const noise = difficulty === 'easy' ? (Math.random() - 0.5) * 45 : difficulty === 'medium' ? (Math.random() - 0.5) * 12 : 0;
    const score =
      -negamax(game, depth - 1, -Infinity, Infinity, -colorFactor, useQuiescence, deadline) + noise;
    game.undo();

    if (score > bestScore + 0.5) {
      bestScore = score;
      bestMoves = [move];
    } else if (Math.abs(score - bestScore) <= 0.5) {
      bestMoves.push(move);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] || ordered[0];
}
