import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  getLegalCheckersMoves,
  getLegalCheckersMovesForSquare,
  type CheckersMove,
  type CheckersState,
  type Coord,
} from '../engines/checkersEngine';
import { BOARD_THEMES } from '../data/gamification';
import type { AnimationLevel, BoardThemeId, CheckersSkinId } from '../shared/types';
import { CheckersPieceSvg } from './PieceIcons';

interface CheckersBoardProps {
  state: CheckersState;
  flipped?: boolean;
  interactive: boolean;
  playerSide?: 'b' | 'w' | 'both';
  boardThemeId: BoardThemeId;
  skinId: CheckersSkinId;
  animations: AnimationLevel;
  onMove: (move: CheckersMove) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

export const CheckersBoard: React.FC<CheckersBoardProps> = ({
  state,
  flipped = false,
  interactive,
  playerSide = 'both',
  boardThemeId,
  skinId,
  animations,
  onMove,
}) => {
  const [selected, setSelected] = useState<Coord | null>(null);

  const theme = useMemo(
    () => BOARD_THEMES.find((t) => t.id === boardThemeId) || BOARD_THEMES[0],
    [boardThemeId]
  );

  const canControlTurn =
    interactive &&
    state.winner === null &&
    (playerSide === 'both' || playerSide === state.turn);

  const allLegalMoves = useMemo(() => getLegalCheckersMoves(state), [state]);
  const hasMandatoryCapture = useMemo(
    () => allLegalMoves.some((m) => Boolean(m.captured)),
    [allLegalMoves]
  );

  // Active selection automatically locks to activeJumpFrom during multi-jump
  const effectiveSelected = state.activeJumpFrom || selected;

  const legalForSelected = useMemo(() => {
    if (!effectiveSelected) return [];
    return getLegalCheckersMovesForSquare(state, effectiveSelected);
  }, [state, effectiveSelected]);

  const rows = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const handleCellClick = (row: number, col: number) => {
    if (!canControlTurn) return;

    const matchingMove = legalForSelected.find((m) => m.to.row === row && m.to.col === col);
    if (matchingMove) {
      onMove(matchingMove);
      setSelected(null);
      return;
    }

    // Cannot deselect during forced multi-jump
    if (state.activeJumpFrom) return;

    const piece = state.board[row][col];
    if (piece && piece.color === state.turn) {
      const pieceMoves = allLegalMoves.filter((m) => m.from.row === row && m.from.col === col);
      if (pieceMoves.length > 0) {
        setSelected(
          selected && selected.row === row && selected.col === col ? null : { row, col }
        );
      } else {
        setSelected(null);
      }
    } else {
      setSelected(null);
    }
  };

  return (
    <div
      className="relative w-full max-w-[560px] aspect-square mx-auto p-2.5 sm:p-3.5 rounded-2xl shadow-2xl"
      style={{
        backgroundColor: theme.frameBg,
        border: `1.5px solid ${theme.frameBorder}`,
      }}
      data-testid="checkers-board"
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-lg overflow-hidden border border-black/40">
        {rows.map((row) =>
          cols.map((col) => {
            const isPlayableDark = (row + col) % 2 === 1;
            const piece = state.board[row][col];
            const isSelected =
              effectiveSelected !== null &&
              effectiveSelected.row === row &&
              effectiveSelected.col === col;
            const isLegalDest = legalForSelected.some(
              (m) => m.to.row === row && m.to.col === col
            );
            const isJumpOrigin =
              hasMandatoryCapture &&
              canControlTurn &&
              allLegalMoves.some((m) => m.from.row === row && m.from.col === col);
            const isLast =
              state.lastMove &&
              ((state.lastMove.from.row === row && state.lastMove.from.col === col) ||
                (state.lastMove.to.row === row && state.lastMove.to.col === col));

            const sqName = `${FILES[col]}${8 - row}`;
            const pieceLabel = piece
              ? `${piece.color === 'b' ? 'Dark' : 'Light'} ${piece.king ? 'King' : 'Checker'}`
              : 'Empty';

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                data-square={sqName}
                aria-label={`Square ${sqName}, ${pieceLabel}${isLegalDest ? ', legal destination' : ''}`}
                onClick={() => handleCellClick(row, col)}
                className="relative flex items-center justify-center w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:z-10"
                style={{
                  backgroundColor: isPlayableDark ? theme.darkSquare : theme.lightSquare,
                }}
              >
                {isLast && (
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: theme.highlightLast }}
                  />
                )}

                {isSelected && (
                  <span className="absolute inset-0 ring-2 ring-inset ring-amber-400 bg-amber-400/20 pointer-events-none" />
                )}

                {isJumpOrigin && !isSelected && (
                  <span className="absolute inset-1 rounded-full ring-2 ring-purple-400/80 pointer-events-none" />
                )}

                {piece && (
                  <motion.div
                    initial={animations === 'full' ? { scale: 0.86, opacity: 0.85 } : false}
                    animate={{ scale: isSelected ? 1.09 : 1, y: isSelected ? -2 : 0, opacity: 1 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 w-[80%] h-[80%]"
                  >
                    <CheckersPieceSvg
                      color={piece.color}
                      king={piece.king}
                      skinId={skinId}
                    />
                  </motion.div>
                )}

                {isLegalDest && (
                  <span className="relative z-20 w-4 h-4 rounded-full bg-amber-400/85 shadow-[0_0_10px_rgba(245,158,11,0.8)] pointer-events-none" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
