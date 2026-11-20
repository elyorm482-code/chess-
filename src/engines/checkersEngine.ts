import type { AIDifficulty } from '../shared/types';

export type CheckersColor = 'b' | 'w'; // 'b' = Dark (moves first, bottom on rows 5-7), 'w' = Light (top on rows 0-2)

export interface CheckersPiece {
  color: CheckersColor;
  king: boolean;
}

export type CheckersBoard = (CheckersPiece | null)[][];

export interface Coord {
  row: number;
  col: number;
}

export interface CheckersMove {
  from: Coord;
  to: Coord;
  captured?: Coord;
  promoted?: boolean;
  notation: string;
}

export interface CheckersHistoryEntry {
  move: CheckersMove;
  boardBefore: CheckersBoard;
  turnBefore: CheckersColor;
  activeJumpFromBefore: Coord | null;
  quietMovesBefore: number;
}

export interface CheckersState {
  board: CheckersBoard;
  turn: CheckersColor;
  /** When a piece makes a capture and has another jump available, it must continue jumping with that same piece */
  activeJumpFrom: Coord | null;
  quietMoves: number; // Moves without capture or man advance (40-move draw rule)
  positionCounts: Record<string, number>;
  history: CheckersHistoryEntry[];
  moveList: CheckersMove[];
  winner: CheckersColor | 'draw' | null;
  reason: string | null;
  lastMove: CheckersMove | null;
}

export function cloneBoard(board: CheckersBoard): CheckersBoard {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function coordToNotation(c: Coord): string {
  const files = 'abcdefgh';
  return `${files[c.col]}${8 - c.row}`;
}

export function createInitialCheckersState(): CheckersState {
  const board: CheckersBoard = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = { color: 'w', king: false };
        } else if (row > 4) {
          board[row][col] = { color: 'b', king: false };
        }
      }
    }
  }

  const state: CheckersState = {
    board,
    turn: 'b', // Dark moves first in standard American/English checkers
    activeJumpFrom: null,
    quietMoves: 0,
    positionCounts: {},
    history: [],
    moveList: [],
    winner: null,
    reason: null,
    lastMove: null,
  };
  const key = serializeCheckersPosition(state);
  state.positionCounts[key] = 1;
  return state;
}

export function serializeCheckersPosition(state: Pick<CheckersState, 'board' | 'turn' | 'activeJumpFrom'>): string {
  let str = state.turn + '|';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p) str += '.';
      else if (p.color === 'b') str += p.king ? 'B' : 'b';
      else str += p.king ? 'W' : 'w';
    }
  }
  if (state.activeJumpFrom) {
    str += `|${state.activeJumpFrom.row},${state.activeJumpFrom.col}`;
  }
  return str;
}

function getMoveDirections(piece: CheckersPiece): [number, number][] {
  if (piece.king) {
    return [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
  }
  // 'b' starts on rows 5-7 and advances UP (row decreasing)
  // 'w' starts on rows 0-2 and advances DOWN (row increasing)
  return piece.color === 'b'
    ? [
        [-1, -1],
        [-1, 1],
      ]
    : [
        [1, -1],
        [1, 1],
      ];
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function getJumpsForPiece(board: CheckersBoard, pos: Coord): CheckersMove[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const dirs = getMoveDirections(piece);
  const jumps: CheckersMove[] = [];

  for (const [dr, dc] of dirs) {
    const midR = pos.row + dr;
    const midC = pos.col + dc;
    const landR = pos.row + dr * 2;
    const landC = pos.col + dc * 2;

    if (!inBounds(landR, landC)) continue;
    const midPiece = board[midR][midC];
    if (midPiece && midPiece.color !== piece.color && board[landR][landC] === null) {
      const promotes =
        !piece.king && ((piece.color === 'b' && landR === 0) || (piece.color === 'w' && landR === 7));
      jumps.push({
        from: { ...pos },
        to: { row: landR, col: landC },
        captured: { row: midR, col: midC },
        promoted: promotes,
        notation: `${coordToNotation(pos)}x${coordToNotation({ row: landR, col: landC })}`,
      });
    }
  }
  return jumps;
}

export function getStepMovesForPiece(board: CheckersBoard, pos: Coord): CheckersMove[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const dirs = getMoveDirections(piece);
  const moves: CheckersMove[] = [];

  for (const [dr, dc] of dirs) {
    const nr = pos.row + dr;
    const nc = pos.col + dc;
    if (!inBounds(nr, nc)) continue;
    if (board[nr][nc] === null) {
      const promotes =
        !piece.king && ((piece.color === 'b' && nr === 0) || (piece.color === 'w' && nr === 7));
      moves.push({
        from: { ...pos },
        to: { row: nr, col: nc },
        promoted: promotes,
        notation: `${coordToNotation(pos)}-${coordToNotation({ row: nr, col: nc })}`,
      });
    }
  }
  return moves;
}

export function getLegalCheckersMoves(state: CheckersState): CheckersMove[] {
  if (state.winner !== null) return [];

  // Mid-multi-jump: only jumps from activeJumpFrom are legal
  if (state.activeJumpFrom) {
    return getJumpsForPiece(state.board, state.activeJumpFrom);
  }

  const allJumps: CheckersMove[] = [];
  const allSteps: CheckersMove[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];
      if (!piece || piece.color !== state.turn) continue;
      const jumps = getJumpsForPiece(state.board, { row: r, col: c });
      if (jumps.length > 0) {
        allJumps.push(...jumps);
      } else if (allJumps.length === 0) {
        allSteps.push(...getStepMovesForPiece(state.board, { row: r, col: c }));
      }
    }
  }

  // Mandatory capture rule: if any jump is available, only jumps are legal
  return allJumps.length > 0 ? allJumps : allSteps;
}

export function getLegalCheckersMovesForSquare(state: CheckersState, pos: Coord): CheckersMove[] {
  return getLegalCheckersMoves(state).filter(
    (m) => m.from.row === pos.row && m.from.col === pos.col
  );
}

export function applyCheckersMove(state: CheckersState, move: CheckersMove): CheckersState {
  const legal = getLegalCheckersMoves(state);
  const matched = legal.find(
    (m) =>
      m.from.row === move.from.row &&
      m.from.col === move.from.col &&
      m.to.row === move.to.row &&
      m.to.col === move.to.col
  );
  if (!matched) {
    throw new Error(`Illegal checkers move: ${move.notation}`);
  }

  const boardBefore = cloneBoard(state.board);
  const nextBoard = cloneBoard(state.board);
  const movingPiece = nextBoard[matched.from.row][matched.from.col]!;
  nextBoard[matched.from.row][matched.from.col] = null;

  if (matched.captured) {
    nextBoard[matched.captured.row][matched.captured.col] = null;
  }

  const becameKing =
    !movingPiece.king &&
    ((movingPiece.color === 'b' && matched.to.row === 0) ||
      (movingPiece.color === 'w' && matched.to.row === 7));

  nextBoard[matched.to.row][matched.to.col] = {
    color: movingPiece.color,
    king: movingPiece.king || becameKing,
  };

  // Standard rule: if a man promotes to King on a capture, the turn ends immediately (no further jumps as new king).
  // Otherwise, if a capture happened and the same piece has further jumps, keep turn on same player with activeJumpFrom.
  let nextActiveJump: Coord | null = null;
  if (matched.captured && !becameKing) {
    const furtherJumps = getJumpsForPiece(nextBoard, matched.to);
    if (furtherJumps.length > 0) {
      nextActiveJump = { ...matched.to };
    }
  }

  const nextTurn: CheckersColor = nextActiveJump
    ? state.turn
    : state.turn === 'b'
      ? 'w'
      : 'b';

  const quietMoves = matched.captured || !movingPiece.king ? 0 : state.quietMoves + 1;

  const nextCounts = { ...state.positionCounts };
  const nextState: CheckersState = {
    board: nextBoard,
    turn: nextTurn,
    activeJumpFrom: nextActiveJump,
    quietMoves,
    positionCounts: nextCounts,
    history: [
      ...state.history,
      {
        move: matched,
        boardBefore,
        turnBefore: state.turn,
        activeJumpFromBefore: state.activeJumpFrom,
        quietMovesBefore: state.quietMoves,
      },
    ],
    moveList: [...state.moveList, matched],
    winner: null,
    reason: null,
    lastMove: matched,
  };

  if (!nextActiveJump) {
    const posKey = serializeCheckersPosition(nextState);
    nextCounts[posKey] = (nextCounts[posKey] || 0) + 1;

    // Check win/draw conditions
    const nextLegal = getLegalCheckersMoves(nextState);
    if (nextLegal.length === 0) {
      nextState.winner = state.turn; // Current mover wins because opponent has no legal moves or no pieces
      nextState.reason = countPieces(nextBoard, nextTurn) === 0 ? 'all_captured' : 'no_moves';
    } else if (quietMoves >= 40) {
      nextState.winner = 'draw';
      nextState.reason = 'forty_moves';
    } else if (nextCounts[posKey] >= 3) {
      nextState.winner = 'draw';
      nextState.reason = 'repetition';
    }
  }

  return nextState;
}

export function undoCheckersMove(state: CheckersState): CheckersState {
  if (state.history.length === 0) return state;
  const last = state.history[state.history.length - 1];
  const nextHistory = state.history.slice(0, -1);
  const nextMoveList = state.moveList.slice(0, -1);

  // Recompute position counts accurately
  const counts: Record<string, number> = {};
  const baseKey = serializeCheckersPosition({
    board: last.boardBefore,
    turn: last.turnBefore,
    activeJumpFrom: last.activeJumpFromBefore,
  });
  counts[baseKey] = 1;

  return {
    board: cloneBoard(last.boardBefore),
    turn: last.turnBefore,
    activeJumpFrom: last.activeJumpFromBefore,
    quietMoves: last.quietMovesBefore,
    positionCounts: counts,
    history: nextHistory,
    moveList: nextMoveList,
    winner: null,
    reason: null,
    lastMove: nextMoveList.length > 0 ? nextMoveList[nextMoveList.length - 1] : null,
  };
}

export function countPieces(board: CheckersBoard, color: CheckersColor): number {
  let count = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color === color) count++;
    }
  }
  return count;
}

export function getCheckersCapturedCounts(board: CheckersBoard): { b: number; w: number } {
  // Captured by Black = 12 - remaining White, Captured by White = 12 - remaining Black
  return {
    b: 12 - countPieces(board, 'w'),
    w: 12 - countPieces(board, 'b'),
  };
}

// --- Checkers AI Engine (Alpha-Beta Pruning + Multi-Jump Turn Horizon) ---

function evaluateCheckersState(state: CheckersState, perspective: CheckersColor): number {
  if (state.winner !== null) {
    if (state.winner === 'draw') return 0;
    return state.winner === perspective ? 100000 : -100000;
  }

  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p) continue;
      let val = p.king ? 235 : 100;

      // Center control bonus
      if (r >= 2 && r <= 5 && c >= 2 && c <= 5) {
        val += 14;
      }
      // Edge safety bonus
      if (c === 0 || c === 7) {
        val += 6;
      }
      // Advancement bonus for men
      if (!p.king) {
        const advance = p.color === 'b' ? 7 - r : r;
        val += advance * 7;
        // Back-row defense bonus
        if ((p.color === 'b' && r === 7) || (p.color === 'w' && r === 0)) {
          val += 12;
        }
      } else {
        // Kings prefer central squares over corners
        const distCenter = Math.abs(3.5 - r) + Math.abs(3.5 - c);
        val += Math.round((7 - distCenter) * 4);
      }

      score += p.color === perspective ? val : -val;
    }
  }

  return score;
}

function orderCheckersMoves(moves: CheckersMove[]): CheckersMove[] {
  return [...moves].sort((a, b) => {
    const scoreA = (a.captured ? 100 : 0) + (a.promoted ? 60 : 0);
    const scoreB = (b.captured ? 100 : 0) + (b.promoted ? 60 : 0);
    return scoreB - scoreA;
  });
}

function minimaxCheckers(
  state: CheckersState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: CheckersColor,
  deadline: number
): number {
  if (Date.now() > deadline || state.winner !== null || depth <= 0) {
    return evaluateCheckersState(state, maximizingPlayer);
  }

  const legal = orderCheckersMoves(getLegalCheckersMoves(state));
  if (legal.length === 0) {
    return state.turn === maximizingPlayer ? -100000 : 100000;
  }

  const isMax = state.turn === maximizingPlayer;

  if (isMax) {
    let best = -Infinity;
    for (const move of legal) {
      const next = applyCheckersMove(state, move);
      // Do not decrement depth if still in mid-multi-jump chain
      const nextDepth = next.activeJumpFrom ? depth : depth - 1;
      const val = minimaxCheckers(next, nextDepth, alpha, beta, maximizingPlayer, deadline);
      if (val > best) best = val;
      if (val > alpha) alpha = val;
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of legal) {
      const next = applyCheckersMove(state, move);
      const nextDepth = next.activeJumpFrom ? depth : depth - 1;
      const val = minimaxCheckers(next, nextDepth, alpha, beta, maximizingPlayer, deadline);
      if (val < best) best = val;
      if (val < beta) beta = val;
      if (alpha >= beta) break;
    }
    return best;
  }
}

export function computeBestCheckersMove(
  state: CheckersState,
  difficulty: AIDifficulty
): CheckersMove | null {
  const legal = getLegalCheckersMoves(state);
  if (legal.length === 0) return null;
  if (legal.length === 1) return legal[0];

  if (difficulty === 'beginner') {
    const captures = legal.filter((m) => Boolean(m.captured));
    const pool = captures.length > 0 ? captures : legal;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6;
  const deadline = Date.now() + (difficulty === 'expert' ? 750 : 350);
  const aiColor = state.turn;
  const ordered = orderCheckersMoves(legal);

  let bestScore = -Infinity;
  let bestMoves: CheckersMove[] = [];

  for (const move of ordered) {
    const next = applyCheckersMove(state, move);
    const nextDepth = next.activeJumpFrom ? depth : depth - 1;
    const noise = difficulty === 'easy' ? (Math.random() - 0.5) * 28 : difficulty === 'medium' ? (Math.random() - 0.5) * 6 : 0;
    const score = minimaxCheckers(next, nextDepth, -Infinity, Infinity, aiColor, deadline) + noise;

    if (score > bestScore + 0.5) {
      bestScore = score;
      bestMoves = [move];
    } else if (Math.abs(score - bestScore) <= 0.5) {
      bestMoves.push(move);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] || ordered[0];
}
