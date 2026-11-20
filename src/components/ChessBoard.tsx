import React, { useMemo, useState } from 'react';
import { Chess, type Move, type PieceSymbol, type Square } from 'chess.js';
import { motion } from 'motion/react';
import { BOARD_THEMES } from '../data/gamification';
import type { AnimationLevel, BoardThemeId, ChessSkinId } from '../shared/types';
import { ChessPieceSvg } from './PieceIcons';

interface ChessBoardProps {
  fen: string;
  flipped?: boolean;
  interactive: boolean;
  playerSide?: 'w' | 'b' | 'both';
  lastMove?: { from: string; to: string } | null;
  boardThemeId: BoardThemeId;
  skinId: ChessSkinId;
  animations: AnimationLevel;
  promoteLabel: string;
  onMove: (move: { from: Square; to: Square; promotion?: PieceSymbol }) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  flipped = false,
  interactive,
  playerSide = 'both',
  lastMove,
  boardThemeId,
  skinId,
  animations,
  promoteLabel,
  onMove,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const game = useMemo(() => new Chess(fen), [fen]);
  const turn = game.turn();
  const inCheck = game.isCheck();
  const theme = useMemo(
    () => BOARD_THEMES.find((t) => t.id === boardThemeId) || BOARD_THEMES[0],
    [boardThemeId]
  );

  const legalMovesForSelected = useMemo<Move[]>(() => {
    if (!selectedSquare) return [];
    return game.moves({ square: selectedSquare, verbose: true });
  }, [game, selectedSquare]);

  const legalTargetMap = useMemo(() => {
    const map = new Map<string, Move[]>();
    for (const m of legalMovesForSelected) {
      const existing = map.get(m.to) || [];
      existing.push(m);
      map.set(m.to, existing);
    }
    return map;
  }, [legalMovesForSelected]);

  const boardMatrix = game.board();
  const displayRanks = flipped ? [...RANKS].reverse() : [...RANKS];
  const displayFiles = flipped ? [...FILES].reverse() : [...FILES];

  const canControlTurn =
    interactive && (playerSide === 'both' || playerSide === turn);

  const handleSquareClick = (sq: Square) => {
    if (!canControlTurn) return;

    const movesToSq = legalTargetMap.get(sq);
    if (selectedSquare && movesToSq && movesToSq.length > 0) {
      const hasPromotion = movesToSq.some((m) => Boolean(m.promotion));
      if (hasPromotion) {
        setPendingPromotion({ from: selectedSquare, to: sq });
        return;
      }
      onMove({ from: selectedSquare, to: sq });
      setSelectedSquare(null);
      return;
    }

    const piece = game.get(sq);
    if (piece && piece.color === turn) {
      setSelectedSquare(selectedSquare === sq ? null : sq);
    } else {
      setSelectedSquare(null);
    }
  };

  const handlePromotionChoice = (promoPiece: PieceSymbol) => {
    if (!pendingPromotion) return;
    onMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: promoPiece,
    });
    setPendingPromotion(null);
    setSelectedSquare(null);
  };

  return (
    <div
      className="relative w-full max-w-[560px] aspect-square mx-auto p-2.5 sm:p-3.5 rounded-2xl shadow-2xl"
      style={{
        backgroundColor: theme.frameBg,
        border: `1.5px solid ${theme.frameBorder}`,
      }}
      data-testid="chess-board"
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-lg overflow-hidden border border-black/40">
        {displayRanks.map((rank) =>
          displayFiles.map((file) => {
            const sq = `${file}${rank}` as Square;
            const rowIdx = 8 - Number(rank);
            const colIdx = FILES.indexOf(file);
            const isLight = (rowIdx + colIdx) % 2 === 0;
            const piece = boardMatrix[rowIdx][colIdx];
            const isSelected = selectedSquare === sq;
            const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
            const targetMoves = legalTargetMap.get(sq);
            const isLegalTarget = Boolean(targetMoves && targetMoves.length > 0);
            const isCaptureTarget = isLegalTarget && (Boolean(piece) || targetMoves?.some((m) => m.isEnPassant()));
            const isCheckedKing = inCheck && piece?.type === 'k' && piece.color === turn;

            const squareBg = isLight ? theme.lightSquare : theme.darkSquare;
            const showRankLabel = file === (flipped ? 'h' : 'a');
            const showFileLabel = rank === (flipped ? '8' : '1');

            const pieceDesc = piece
              ? `${piece.color === 'w' ? 'White' : 'Black'} ${piece.type.toUpperCase()}`
              : 'Empty';

            return (
              <button
                key={sq}
                type="button"
                data-square={sq}
                aria-label={`Square ${sq}, ${pieceDesc}${isLegalTarget ? ', legal destination' : ''}`}
                onClick={() => handleSquareClick(sq)}
                className="relative flex items-center justify-center w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:z-10 transition-colors duration-150"
                style={{ backgroundColor: squareBg }}
              >
                {/* Last move highlight */}
                {isLast && (
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: theme.highlightLast }}
                  />
                )}

                {/* Selected square ring */}
                {isSelected && (
                  <span className="absolute inset-0 ring-2 ring-inset ring-amber-400 bg-amber-400/20 pointer-events-none" />
                )}

                {/* King in check pulse */}
                {isCheckedKing && (
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(239,68,68,0.75) 0%, rgba(185,28,28,0.35) 65%, transparent 100%)',
                    }}
                  />
                )}

                {/* Coordinate Labels */}
                {showRankLabel && (
                  <span
                    className="absolute top-0.5 left-1 text-[10px] font-mono-nums font-semibold leading-none pointer-events-none opacity-75"
                    style={{ color: theme.coordColor }}
                  >
                    {rank}
                  </span>
                )}
                {showFileLabel && (
                  <span
                    className="absolute bottom-0.5 right-1 text-[10px] font-mono-nums font-semibold leading-none pointer-events-none opacity-75"
                    style={{ color: theme.coordColor }}
                  >
                    {file}
                  </span>
                )}

                {/* Piece */}
                {piece && (
                  <motion.div
                    initial={animations === 'full' ? { scale: 0.88, opacity: 0.85 } : false}
                    animate={{ scale: isSelected ? 1.09 : 1, y: isSelected ? -2 : 0, opacity: 1 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 w-[82%] h-[82%]"
                  >
                    <ChessPieceSvg type={piece.type} color={piece.color} skinId={skinId} />
                  </motion.div>
                )}

                {/* Legal move indicator */}
                {isLegalTarget && !isCaptureTarget && (
                  <span className="relative z-20 w-3.5 h-3.5 rounded-full bg-amber-400/75 shadow-[0_0_8px_rgba(245,158,11,0.7)] pointer-events-none" />
                )}
                {isCaptureTarget && (
                  <span className="absolute inset-1 z-20 rounded-full border-[3px] border-amber-400/90 pointer-events-none" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 rounded-2xl p-4"
          role="dialog"
          aria-modal="true"
          aria-label={promoteLabel}
        >
          <div className="bg-[#141622] border border-amber-500/40 rounded-xl p-5 shadow-2xl text-center">
            <p className="text-sm font-semibold text-amber-300 mb-3">{promoteLabel}</p>
            <div className="flex items-center gap-3">
              {(['q', 'r', 'b', 'n'] as const).map((promoType) => (
                <button
                  key={promoType}
                  type="button"
                  aria-label={`Promote to ${promoType.toUpperCase()}`}
                  onClick={() => handlePromotionChoice(promoType)}
                  className="w-14 h-14 p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/15 hover:border-amber-400 transition-colors"
                >
                  <ChessPieceSvg type={promoType} color={turn} skinId={skinId} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
