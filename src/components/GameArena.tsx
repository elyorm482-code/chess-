import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type PieceSymbol, type Square } from 'chess.js';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Crown,
  Flag,
  Handshake,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Swords,
  Undo2,
  Volume2,
  VolumeX,
  Music,
  RefreshCw,
} from 'lucide-react';
import {
  computeBestChessMove,
  getCapturedPieces,
  getChessStatus,
} from '../engines/chessEngine';
import {
  applyCheckersMove,
  computeBestCheckersMove,
  createInitialCheckersState,
  getCheckersCapturedCounts,
  getLegalCheckersMoves,
  undoCheckersMove,
  type CheckersMove,
  type CheckersState,
} from '../engines/checkersEngine';
import type { Translations } from '../i18n/translations';
import type {
  AIDifficulty,
  ChatMessage,
  GameType,
  PlayMode,
  PlayerProfile,
  RoomPlayer,
} from '../shared/types';
import { soundEngine } from '../utils/soundEngine';
import { ChessBoard } from './ChessBoard';
import { CheckersBoard } from './CheckersBoard';
import { AvatarBadge, CheckersPieceSvg, ChessPieceSvg } from './PieceIcons';

export interface OnlineRoomSnapshot {
  code: string;
  gameType: GameType;
  timeControlSeconds: number;
  players: { w: RoomPlayer | null; b: RoomPlayer | null };
  chessFen: string;
  chessSanHistory: string[];
  lastChessMove: { from: string; to: string } | null;
  checkersState: CheckersState;
  turn: 'w' | 'b';
  clocks: { w: number; b: number };
  status: 'waiting' | 'playing' | 'finished';
  winner: 'w' | 'b' | 'draw' | null;
  reason: string | null;
  drawOfferBy: 'w' | 'b' | null;
  rematchCount: number;
  rematchPlayerIds: string[];
  chat: ChatMessage[];
}

interface GameArenaProps {
  t: Translations;
  profile: PlayerProfile;
  gameType: GameType;
  mode: PlayMode;
  difficulty: AIDifficulty;
  timeControlSeconds: number;
  opponentLabel?: string;
  onlineRoom?: OnlineRoomSnapshot | null;
  onOnlineSend?: (msg: Record<string, unknown>) => void;
  onLeaveOnline?: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onMatchFinished: (outcome: {
    result: 'win' | 'loss' | 'draw';
    movesCount: number;
    opponentName: string;
    wasExpertAi: boolean;
  }) => { xpEarned: number; coinsEarned: number; ratingDelta: number } | void;
  onExitToMenu: () => void;
  onTournamentNext?: (won: boolean) => void;
}

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export const GameArena: React.FC<GameArenaProps> = ({
  t,
  profile,
  gameType,
  mode,
  difficulty,
  timeControlSeconds,
  opponentLabel,
  onlineRoom,
  onOnlineSend,
  onLeaveOnline,
  onToggleSound,
  onToggleMusic,
  onMatchFinished,
  onExitToMenu,
  onTournamentNext,
}) => {
  const isOnline = mode === 'online' && Boolean(onlineRoom);

  // Local Chess state
  const [chessGame, setChessGame] = useState<Chess>(() => new Chess());
  const [chessVersion, setChessVersion] = useState(0);
  const [lastChessMove, setLastChessMove] = useState<{ from: string; to: string } | null>(null);

  // Local Checkers state
  const [checkersState, setCheckersState] = useState<CheckersState>(() =>
    createInitialCheckersState()
  );

  // Clocks & match end tracking for local/AI/tournament
  const [clocks, setClocks] = useState<{ w: number; b: number }>({
    w: timeControlSeconds,
    b: timeControlSeconds,
  });
  const [localResignedWinner, setLocalResignedWinner] = useState<'w' | 'b' | 'draw' | null>(null);
  const [localEndReason, setLocalEndReason] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [matchRewardSummary, setMatchRewardSummary] = useState<{
    xpEarned: number;
    coinsEarned: number;
    ratingDelta: number;
  } | null>(null);

  const recordedEndRef = useRef(false);

  // Determine player side
  const myOnlineSide: 'w' | 'b' | null = useMemo(() => {
    if (!isOnline || !onlineRoom) return null;
    if (onlineRoom.players.w?.id === profile.id) return 'w';
    if (onlineRoom.players.b?.id === profile.id) return 'b';
    return null;
  }, [isOnline, onlineRoom, profile.id]);

  // Human plays White in Chess (or Dark 'b' in Checkers) against AI / Tournament
  const humanSideAgainstAi: 'w' | 'b' = gameType === 'chess' ? 'w' : 'b';
  const aiSide: 'w' | 'b' = humanSideAgainstAi === 'w' ? 'b' : 'w';

  const activeChess = useMemo(() => {
    if (isOnline && onlineRoom) {
      return new Chess(onlineRoom.chessFen);
    }
    return chessGame;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, onlineRoom?.chessFen, chessGame, chessVersion]);

  const activeCheckers = isOnline && onlineRoom ? onlineRoom.checkersState : checkersState;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chessStatus = useMemo(() => getChessStatus(activeChess), [activeChess, chessVersion]);

  const currentTurn: 'w' | 'b' = isOnline && onlineRoom
    ? onlineRoom.turn
    : gameType === 'chess'
      ? activeChess.turn()
      : activeCheckers.turn;

  const winner: 'w' | 'b' | 'draw' | null = isOnline && onlineRoom
    ? onlineRoom.winner
    : localResignedWinner !== null
      ? localResignedWinner
      : gameType === 'chess'
        ? chessStatus.winner
        : activeCheckers.winner;

  const endReason: string | null = isOnline && onlineRoom
    ? onlineRoom.reason
    : localEndReason !== null
      ? localEndReason
      : gameType === 'chess'
        ? chessStatus.reason
        : activeCheckers.reason;

  const isGameOver = winner !== null;

  // Update document.body.dataset.state for game shell discipline
  useEffect(() => {
    document.body.dataset.state = isGameOver ? 'gameover' : 'playing';
  }, [isGameOver]);

  // Auto-orient board for Online player
  useEffect(() => {
    if (isOnline && myOnlineSide) {
      if (gameType === 'chess') {
        setFlipped(myOnlineSide === 'b');
      } else {
        setFlipped(myOnlineSide === 'w');
      }
    }
  }, [isOnline, myOnlineSide, gameType]);

  // Local / AI / Tournament Clock Timer
  useEffect(() => {
    if (isOnline || isGameOver) return;
    const id = window.setInterval(() => {
      setClocks((prev) => {
        const nextVal = Math.max(0, prev[currentTurn] - 1);
        if (nextVal <= 0) {
          setLocalResignedWinner(currentTurn === 'w' ? 'b' : 'w');
          setLocalEndReason('timeout');
          soundEngine.playDefeat();
        }
        return { ...prev, [currentTurn]: nextVal };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isOnline, isGameOver, currentTurn]);

  // Record match completion once
  useEffect(() => {
    if (!isGameOver || recordedEndRef.current) return;
    recordedEndRef.current = true;

    const mySide: 'w' | 'b' = isOnline
      ? myOnlineSide || 'w'
      : mode === 'ai' || mode === 'tournament'
        ? humanSideAgainstAi
        : gameType === 'chess'
          ? 'w'
          : 'b';

    const result: 'win' | 'loss' | 'draw' =
      winner === 'draw' ? 'draw' : winner === mySide ? 'win' : 'loss';

    if (result === 'win') soundEngine.playVictory();
    else if (result === 'loss') soundEngine.playDefeat();
    else soundEngine.playCheck();

    const movesCount =
      gameType === 'chess'
        ? isOnline && onlineRoom
          ? onlineRoom.chessSanHistory.length
          : activeChess.history().length
        : activeCheckers.moveList.length;

    const oppName =
      opponentLabel ||
      (isOnline && onlineRoom
        ? (mySide === 'w' ? onlineRoom.players.b?.username : onlineRoom.players.w?.username) ||
          'Online Rival'
        : mode === 'ai'
          ? `${t.game.computer} (${t.difficulty[difficulty]})`
          : t.game.player2);

    const summary = onMatchFinished({
      result,
      movesCount,
      opponentName: oppName,
      wasExpertAi: (mode === 'ai' || mode === 'tournament') && difficulty === 'expert',
    });
    if (summary) {
      setMatchRewardSummary(summary);
    }
  }, [
    isGameOver,
    winner,
    isOnline,
    myOnlineSide,
    mode,
    humanSideAgainstAi,
    gameType,
    onlineRoom,
    activeChess,
    activeCheckers.moveList.length,
    opponentLabel,
    difficulty,
    t.game.computer,
    t.game.player2,
    t.difficulty,
    onMatchFinished,
  ]);

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (isOnline || isGameOver) return;
    if (mode !== 'ai' && mode !== 'tournament') return;
    if (currentTurn !== aiSide) return;

    setAiThinking(true);
    const delay = gameType === 'checkers' && activeCheckers.activeJumpFrom ? 380 : 480;

    const timer = window.setTimeout(() => {
      if (gameType === 'chess') {
        const best = computeBestChessMove(activeChess.fen(), difficulty);
        if (best) {
          const clone = new Chess(activeChess.fen());
          // Preserve full history by mutating the actual game instance
          const moveRes = chessGame.move({
            from: best.from,
            to: best.to,
            promotion: best.promotion || 'q',
          });
          setLastChessMove({ from: moveRes.from, to: moveRes.to });
          setChessVersion((v) => v + 1);

          if (chessGame.isCheck()) soundEngine.playCheck();
          else if (moveRes.isPromotion()) soundEngine.playPromote();
          else if (moveRes.isCapture()) soundEngine.playCapture();
          else soundEngine.playMove();
          void clone;
        }
      } else {
        const best = computeBestCheckersMove(activeCheckers, difficulty);
        if (best) {
          const next = applyCheckersMove(activeCheckers, best);
          setCheckersState(next);
          if (best.promoted) soundEngine.playPromote();
          else if (best.captured) soundEngine.playCapture();
          else soundEngine.playMove();
        }
      }
      setAiThinking(false);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    isOnline,
    isGameOver,
    mode,
    currentTurn,
    aiSide,
    gameType,
    difficulty,
    activeChess,
    chessGame,
    activeCheckers,
  ]);

  const handleChessMove = (move: { from: Square; to: Square; promotion?: PieceSymbol }) => {
    if (isGameOver) return;
    if (isOnline && onOnlineSend && onlineRoom) {
      onOnlineSend({
        type: 'game:move',
        code: onlineRoom.code,
        playerId: profile.id,
        move,
      });
      soundEngine.playMove();
      return;
    }

    try {
      const result = chessGame.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q',
      });
      setLastChessMove({ from: result.from, to: result.to });
      setChessVersion((v) => v + 1);
      if (chessGame.isCheck()) soundEngine.playCheck();
      else if (result.isPromotion()) soundEngine.playPromote();
      else if (result.isCapture()) soundEngine.playCapture();
      else soundEngine.playMove();
    } catch {
      // ignore invalid
    }
  };

  const handleCheckersMove = (move: CheckersMove) => {
    if (isGameOver) return;
    if (isOnline && onOnlineSend && onlineRoom) {
      onOnlineSend({
        type: 'game:move',
        code: onlineRoom.code,
        playerId: profile.id,
        move,
      });
      if (move.promoted) soundEngine.playPromote();
      else if (move.captured) soundEngine.playCapture();
      else soundEngine.playMove();
      return;
    }

    const next = applyCheckersMove(checkersState, move);
    setCheckersState(next);
    if (move.promoted) soundEngine.playPromote();
    else if (move.captured) soundEngine.playCapture();
    else soundEngine.playMove();
  };

  const handleUndo = () => {
    if (isOnline || aiThinking || isGameOver) return;
    soundEngine.playClick();
    if (gameType === 'chess') {
      if (mode === 'ai' || mode === 'tournament') {
        chessGame.undo();
        chessGame.undo();
      } else {
        chessGame.undo();
      }
      const hist = chessGame.history({ verbose: true });
      const last = hist[hist.length - 1];
      setLastChessMove(last ? { from: last.from, to: last.to } : null);
      setChessVersion((v) => v + 1);
    } else {
      if (mode === 'ai' || mode === 'tournament') {
        let s = undoCheckersMove(checkersState);
        while (s.history.length > 0 && s.turn !== humanSideAgainstAi) {
          s = undoCheckersMove(s);
        }
        setCheckersState(s);
      } else {
        setCheckersState((prev) => undoCheckersMove(prev));
      }
    }
  };

  const handleRestart = () => {
    if (isOnline) {
      if (onOnlineSend && onlineRoom) {
        onOnlineSend({
          type: 'game:rematch',
          code: onlineRoom.code,
          playerId: profile.id,
        });
      }
      return;
    }
    soundEngine.playClick();
    recordedEndRef.current = false;
    setMatchRewardSummary(null);
    setLocalResignedWinner(null);
    setLocalEndReason(null);
    setAiThinking(false);
    setClocks({ w: timeControlSeconds, b: timeControlSeconds });
    if (gameType === 'chess') {
      chessGame.reset();
      setLastChessMove(null);
      setChessVersion((v) => v + 1);
    } else {
      setCheckersState(createInitialCheckersState());
    }
  };

  const handleResign = () => {
    if (isGameOver) return;
    soundEngine.playClick();
    if (isOnline && onOnlineSend && onlineRoom) {
      onOnlineSend({
        type: 'game:resign',
        code: onlineRoom.code,
        playerId: profile.id,
      });
      return;
    }
    const loserSide = mode === 'ai' || mode === 'tournament' ? humanSideAgainstAi : currentTurn;
    setLocalResignedWinner(loserSide === 'w' ? 'b' : 'w');
    setLocalEndReason('resigned');
  };

  const handleOfferDraw = () => {
    if (isGameOver) return;
    soundEngine.playClick();
    if (isOnline && onOnlineSend && onlineRoom) {
      onOnlineSend({
        type: 'game:draw_offer',
        code: onlineRoom.code,
        playerId: profile.id,
      });
      return;
    }
    if (mode === 'local' || mode === 'friends') {
      setLocalResignedWinner('draw');
      setLocalEndReason('draw_agreed');
    }
  };

  // Player info bars
  const topSide: 'w' | 'b' =
    gameType === 'chess' ? (flipped ? 'w' : 'b') : flipped ? 'b' : 'w';
  const bottomSide: 'w' | 'b' = topSide === 'w' ? 'b' : 'w';

  const getSideInfo = (side: 'w' | 'b') => {
    if (isOnline && onlineRoom) {
      const rp = onlineRoom.players[side];
      return {
        name: rp?.username || 'Opponent',
        avatarId: rp?.avatarId || 'queen_violet',
        rating: rp?.rating || 1200,
        clock: onlineRoom.clocks[side],
        isActiveTurn: currentTurn === side && !isGameOver,
      };
    }
    const isHumanBottom =
      mode === 'ai' || mode === 'tournament' ? side === humanSideAgainstAi : side === (gameType === 'chess' ? 'w' : 'b');

    return {
      name: isHumanBottom
        ? profile.username
        : opponentLabel ||
          (mode === 'ai' || mode === 'tournament'
            ? `${t.game.computer} (${t.difficulty[difficulty]})`
            : t.game.player2),
      avatarId: isHumanBottom ? profile.avatarId : 'crown_obsidian',
      rating: isHumanBottom
        ? gameType === 'chess'
          ? profile.chessRating
          : profile.checkersRating
        : difficulty === 'beginner'
          ? 900
          : difficulty === 'easy'
            ? 1150
            : difficulty === 'medium'
              ? 1450
              : 1850,
      clock: clocks[side],
      isActiveTurn: currentTurn === side && !isGameOver,
    };
  };

  const topInfo = getSideInfo(topSide);
  const bottomInfo = getSideInfo(bottomSide);

  const chessCaptured = useMemo(
    () => (gameType === 'chess' ? getCapturedPieces(activeChess) : { w: [], b: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameType, activeChess, chessVersion]
  );
  const checkersCaptured = useMemo(
    () => (gameType === 'checkers' ? getCheckersCapturedCounts(activeCheckers.board) : { b: 0, w: 0 }),
    [gameType, activeCheckers.board]
  );

  const sanMoves =
    gameType === 'chess'
      ? isOnline && onlineRoom
        ? onlineRoom.chessSanHistory
        : activeChess.history()
      : activeCheckers.moveList.map((m) => m.notation);

  const movePairs = useMemo(() => {
    const pairs: { num: number; first: string; second?: string }[] = [];
    for (let i = 0; i < sanMoves.length; i += 2) {
      pairs.push({
        num: Math.floor(i / 2) + 1,
        first: sanMoves[i],
        second: sanMoves[i + 1],
      });
    }
    return pairs;
  }, [sanMoves]);

  const checkersLegal = useMemo(
    () => (gameType === 'checkers' ? getLegalCheckersMoves(activeCheckers) : []),
    [gameType, activeCheckers]
  );
  const showMandatoryJumpHint =
    gameType === 'checkers' &&
    !isGameOver &&
    checkersLegal.some((m) => Boolean(m.captured));

  const reasonLabel = (r: string | null) => {
    switch (r) {
      case 'checkmate': return t.game.reasonCheckmate;
      case 'stalemate': return t.game.reasonStalemate;
      case 'repetition': return t.game.reasonRepetition;
      case 'insufficient': return t.game.reasonInsufficient;
      case 'fifty_moves': return t.game.reasonFiftyMoves;
      case 'timeout': return t.game.reasonTimeout;
      case 'resigned': return t.game.reasonResigned;
      case 'all_captured': return t.game.reasonAllCaptured;
      case 'no_moves': return t.game.reasonNoMoves;
      case 'forty_moves': return t.game.reasonFortyMoves;
      case 'draw_agreed': return t.game.reasonDrawAgreed;
      default: return '';
    }
  };

  const myViewerSide: 'w' | 'b' = isOnline
    ? myOnlineSide || 'w'
    : mode === 'ai' || mode === 'tournament'
      ? humanSideAgainstAi
      : gameType === 'chess'
        ? 'w'
        : 'b';
  const didIWin = winner === myViewerSide;
  const isDrawResult = winner === 'draw';

  const interactiveBoard =
    !isGameOver &&
    !aiThinking &&
    (isOnline
      ? Boolean(myOnlineSide && currentTurn === myOnlineSide && onlineRoom?.status === 'playing')
      : mode === 'ai' || mode === 'tournament'
        ? currentTurn === humanSideAgainstAi
        : true);

  const playerBoardSide: 'w' | 'b' | 'both' = isOnline
    ? myOnlineSide || 'w'
    : mode === 'ai' || mode === 'tournament'
      ? humanSideAgainstAi
      : 'both';

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#08090E] text-slate-900 dark:text-slate-100">
      {/* Compact Arena Header Strip */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0E1018]/90">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              if (isOnline && onLeaveOnline) onLeaveOnline();
              else onExitToMenu();
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-200/80 dark:bg-white/5 hover:bg-slate-300/80 dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.game.backToMenu}</span>
          </button>
          <span className="hidden sm:inline font-display font-bold text-base tracking-wide text-amber-600 dark:text-amber-400">
            {gameType === 'chess' ? t.game.chess : t.game.checkers}
          </span>
          {isOnline && onlineRoom && (
            <span className="font-mono-nums text-xs px-2.5 py-1 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
              {onlineRoom.code}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t.settings.soundFx}
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-slate-200/80 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors"
          >
            {profile.settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <button
            type="button"
            aria-label={t.settings.music}
            onClick={onToggleMusic}
            className={`p-2 rounded-lg transition-colors ${
              profile.settings.musicEnabled
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'bg-slate-200/80 dark:bg-white/5 text-slate-400 hover:bg-slate-300 dark:hover:bg-white/10'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Playfield + Tactical Side Dock */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        {/* Left: Board Column */}
        <div className="flex flex-col gap-3 w-full max-w-[560px] mx-auto">
          {/* Top Player Card */}
          <div
            className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-all ${
              topInfo.isActiveTurn
                ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                : 'bg-white dark:bg-[#11131C] border-slate-200 dark:border-white/10'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <AvatarBadge avatarId={topInfo.avatarId} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{topInfo.name}</span>
                  <span className="font-mono-nums text-xs text-slate-500 dark:text-slate-400">
                    {topInfo.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 min-h-[16px]">
                  {gameType === 'chess' ? (
                    chessCaptured[topSide].slice(0, 10).map((p, i) => (
                      <span key={i} className="w-4 h-4 inline-block">
                        <ChessPieceSvg
                          type={p}
                          color={topSide === 'w' ? 'b' : 'w'}
                          skinId={profile.settings.chessSkin}
                        />
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t.game.captured}: {checkersCaptured[topSide]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`font-mono-nums text-lg font-bold px-3 py-1 rounded-lg ${
                topInfo.isActiveTurn
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300'
              }`}
            >
              {formatClock(topInfo.clock)}
            </div>
          </div>

          {/* Status Banner (Check / Mandatory Jump / AI Thinking) */}
          <div className="min-h-[28px] flex items-center justify-between px-1 text-xs font-medium">
            <div className="flex items-center gap-2">
              {gameType === 'chess' && chessStatus.isCheck && !isGameOver && (
                <span className="inline-flex items-center gap-1.5 text-rose-500 font-semibold">
                  <ShieldAlert className="w-4 h-4" />
                  {t.game.check}
                </span>
              )}
              {showMandatoryJumpHint && (
                <span className="text-purple-500 dark:text-purple-300">
                  {activeCheckers.activeJumpFrom
                    ? t.game.multiJumpHint
                    : t.game.mandatoryCaptureHint}
                </span>
              )}
              {!chessStatus.isCheck && !showMandatoryJumpHint && !isGameOver && (
                <span className="text-slate-500 dark:text-slate-400">
                  {gameType === 'chess'
                    ? currentTurn === 'w'
                      ? t.game.whiteTurn
                      : t.game.blackTurn
                    : currentTurn === 'b'
                      ? t.game.darkTurn
                      : t.game.lightTurn}
                </span>
              )}
            </div>
            {aiThinking && (
              <span className="text-amber-500 animate-pulse">{t.game.aiThinking}</span>
            )}
          </div>

          {/* Board Surface */}
          {gameType === 'chess' ? (
            <ChessBoard
              fen={activeChess.fen()}
              flipped={flipped}
              interactive={interactiveBoard}
              playerSide={playerBoardSide}
              lastMove={isOnline && onlineRoom ? onlineRoom.lastChessMove : lastChessMove}
              boardThemeId={profile.settings.boardTheme}
              skinId={profile.settings.chessSkin}
              animations={profile.settings.animations}
              promoteLabel={t.game.promotePawn}
              onMove={handleChessMove}
            />
          ) : (
            <CheckersBoard
              state={activeCheckers}
              flipped={flipped}
              interactive={interactiveBoard}
              playerSide={playerBoardSide}
              boardThemeId={profile.settings.boardTheme}
              skinId={profile.settings.checkersSkin}
              animations={profile.settings.animations}
              onMove={handleCheckersMove}
            />
          )}

          {/* Bottom Player Card */}
          <div
            className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-all ${
              bottomInfo.isActiveTurn
                ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                : 'bg-white dark:bg-[#11131C] border-slate-200 dark:border-white/10'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <AvatarBadge avatarId={bottomInfo.avatarId} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{bottomInfo.name}</span>
                  <span className="font-mono-nums text-xs text-slate-500 dark:text-slate-400">
                    {bottomInfo.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 min-h-[16px]">
                  {gameType === 'chess' ? (
                    chessCaptured[bottomSide].slice(0, 10).map((p, i) => (
                      <span key={i} className="w-4 h-4 inline-block">
                        <ChessPieceSvg
                          type={p}
                          color={bottomSide === 'w' ? 'b' : 'w'}
                          skinId={profile.settings.chessSkin}
                        />
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t.game.captured}: {checkersCaptured[bottomSide]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`font-mono-nums text-lg font-bold px-3 py-1 rounded-lg ${
                bottomInfo.isActiveTurn
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300'
              }`}
            >
              {formatClock(bottomInfo.clock)}
            </div>
          </div>
        </div>

        {/* Right: Unified Tactical Dock */}
        <aside className="bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
          {/* Online Draw Offer Banner */}
          {isOnline && onlineRoom?.drawOfferBy && onlineRoom.drawOfferBy !== myOnlineSide && !isGameOver && (
            <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/40 flex flex-col gap-2">
              <p className="text-xs font-medium text-purple-300">{t.online.drawOffered}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onOnlineSend?.({
                      type: 'game:draw_respond',
                      code: onlineRoom.code,
                      accept: true,
                    })
                  }
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  {t.online.accept}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onOnlineSend?.({
                      type: 'game:draw_respond',
                      code: onlineRoom.code,
                      accept: false,
                    })
                  }
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20"
                >
                  {t.online.decline}
                </button>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
            {!isOnline && (
              <button
                type="button"
                onClick={handleUndo}
                disabled={sanMoves.length === 0 || aiThinking || isGameOver}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>{t.game.undo}</span>
              </button>
            )}
            {!isOnline && (
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.game.restart}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setFlipped((f) => !f);
              }}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.game.flipBoard}</span>
            </button>
            {(isOnline || mode === 'local' || mode === 'friends') && (
              <button
                type="button"
                onClick={handleOfferDraw}
                disabled={isGameOver}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>{t.game.offerDraw}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResign}
              disabled={isGameOver}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 disabled:opacity-40 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{t.game.resign}</span>
            </button>
          </div>

          {/* Move History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.game.moveHistory}
              </h3>
              <span className="font-mono-nums text-xs text-slate-400">
                {sanMoves.length}
              </span>
            </div>
            <div
              className="h-52 overflow-y-auto rounded-xl bg-slate-50 dark:bg-[#0B0C12] border border-slate-200 dark:border-white/5 p-2.5 text-xs font-mono-nums"
              data-testid="move-history"
            >
              {movePairs.length === 0 ? (
                <p className="text-slate-400 dark:text-slate-500 py-8 text-center font-sans">
                  {t.game.noMoves}
                </p>
              ) : (
                <div className="space-y-1">
                  {movePairs.map((pair) => (
                    <div
                      key={pair.num}
                      className="grid grid-cols-[32px_1fr_1fr] gap-2 px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <span className="text-slate-400">{pair.num}.</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {pair.first}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {pair.second || ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Online Quick Chat */}
          {isOnline && onlineRoom && (
            <div className="border-t border-slate-200 dark:border-white/10 pt-3">
              <div className="h-28 overflow-y-auto space-y-1.5 mb-2 pr-1 text-xs">
                {onlineRoom.chat.map((c) => (
                  <div key={c.id} className="leading-snug">
                    <span className="font-semibold text-amber-500 mr-1.5">{c.senderName}:</span>
                    <span className="text-slate-700 dark:text-slate-300">{c.text}</span>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatInput.trim()) return;
                  onOnlineSend?.({
                    type: 'game:chat',
                    code: onlineRoom.code,
                    playerId: profile.id,
                    text: chatInput.trim(),
                  });
                  setChatInput('');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t.online.chatPlaceholder}
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-[#0B0C12] border border-slate-200 dark:border-white/10 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  aria-label={t.online.send}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>

      {/* Victory / Defeat / Draw Overlay Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
            role="dialog"
            aria-modal="true"
            data-testid="game-over-modal"
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-2xl bg-[#11131E] border border-amber-500/40 p-6 text-center shadow-2xl text-slate-100"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/40">
                {isDrawResult ? (
                  <Handshake className="w-8 h-8 text-purple-300" />
                ) : didIWin ? (
                  <Crown className="w-8 h-8 text-amber-400" />
                ) : (
                  <Swords className="w-8 h-8 text-rose-400" />
                )}
              </div>

              <h2 className="font-display text-2xl font-bold text-amber-300">
                {isDrawResult
                  ? t.game.matchDraw
                  : mode === 'local' || mode === 'friends'
                    ? `${winner === 'w' ? (gameType === 'chess' ? 'White' : 'Light') : gameType === 'chess' ? 'Black' : 'Dark'} — ${t.game.victory}`
                    : didIWin
                      ? t.game.victory
                      : t.game.defeat}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{reasonLabel(endReason)}</p>

              <div className="grid grid-cols-3 gap-2.5 my-5">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[11px] text-slate-400">{t.game.movesCount}</div>
                  <div className="font-mono-nums text-lg font-bold mt-0.5">{sanMoves.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[11px] text-slate-400">{t.game.xpEarned}</div>
                  <div className="font-mono-nums text-lg font-bold text-purple-300 mt-0.5">
                    +{matchRewardSummary?.xpEarned || 50}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[11px] text-slate-400">{t.game.coinsEarned}</div>
                  <div className="font-mono-nums text-lg font-bold text-amber-400 mt-0.5">
                    +{matchRewardSummary?.coinsEarned || 30}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                {mode === 'tournament' && onTournamentNext ? (
                  <button
                    type="button"
                    data-start="true"
                    onClick={() => onTournamentNext(didIWin)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.tournament.playNextMatch}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    data-start="true"
                    onClick={handleRestart}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>
                      {isOnline
                        ? onlineRoom?.rematchPlayerIds.includes(profile.id)
                          ? t.online.rematchWaiting
                          : onlineRoom && onlineRoom.rematchCount > 0
                            ? t.online.rematchAccept
                            : t.game.rematch
                        : t.game.playAgain}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isOnline && onLeaveOnline) onLeaveOnline();
                    else onExitToMenu();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-slate-100 transition-colors"
                >
                  {t.game.backToMenu}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
