import React, { useState } from 'react';
import { Award, Play, RotateCcw, Trophy } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type { AIDifficulty, GameType, PlayerProfile } from '../shared/types';
import { soundEngine } from '../utils/soundEngine';

export interface TournamentMatch {
  id: string;
  round: number;
  p1: string;
  p2: string;
  winner: string | null;
  difficulty: AIDifficulty;
}

export interface TournamentState {
  gameType: GameType;
  size: 4 | 8;
  currentRound: number; // 0-indexed
  rounds: TournamentMatch[][];
  playerEliminated: boolean;
  champion: string | null;
}

interface TournamentViewProps {
  t: Translations;
  profile: PlayerProfile;
  tournament: TournamentState | null;
  onStartTournament: (gameType: GameType, size: 4 | 8) => void;
  onPlayMatch: (match: TournamentMatch, gameType: GameType) => void;
  onResetTournament: () => void;
}

const AI_CONTENDERS = [
  'Karpov_Bot',
  'AmethystMaster',
  'FerganaKnight',
  'SamarkandRook',
  'ObsidianDuke',
  'QueenGambit_AI',
  'BukharaGrand',
];

export function createTournamentBracket(
  username: string,
  gameType: GameType,
  size: 4 | 8
): TournamentState {
  const contenders = [...AI_CONTENDERS].slice(0, size - 1);
  const participants = [username, ...contenders];

  const round0: TournamentMatch[] = [];
  const baseDiff: AIDifficulty = size === 8 ? 'beginner' : 'easy';
  for (let i = 0; i < participants.length; i += 2) {
    round0.push({
      id: `r0_m${i / 2}`,
      round: 0,
      p1: participants[i],
      p2: participants[i + 1],
      winner: null,
      difficulty: baseDiff,
    });
  }

  const rounds: TournamentMatch[][] = [round0];
  let count = round0.length;
  let rIdx = 1;
  while (count > 1) {
    const nextRound: TournamentMatch[] = [];
    const diff: AIDifficulty = count === 2 ? 'expert' : 'medium';
    for (let i = 0; i < count; i += 2) {
      nextRound.push({
        id: `r${rIdx}_m${i / 2}`,
        round: rIdx,
        p1: 'TBD',
        p2: 'TBD',
        winner: null,
        difficulty: diff,
      });
    }
    rounds.push(nextRound);
    count = nextRound.length;
    rIdx++;
  }

  return {
    gameType,
    size,
    currentRound: 0,
    rounds,
    playerEliminated: false,
    champion: null,
  };
}

export function advanceTournamentBracket(
  state: TournamentState,
  playerUsername: string,
  playerWon: boolean
): TournamentState {
  const nextRounds = state.rounds.map((r) => r.map((m) => ({ ...m })));
  const rIdx = state.currentRound;
  const currentMatches = nextRounds[rIdx];

  for (const m of currentMatches) {
    if (m.winner) continue;
    if (m.p1 === playerUsername || m.p2 === playerUsername) {
      const opp = m.p1 === playerUsername ? m.p2 : m.p1;
      m.winner = playerWon ? playerUsername : opp;
    } else {
      m.winner = Math.random() > 0.5 ? m.p1 : m.p2;
    }
  }

  if (!playerWon) {
    return {
      ...state,
      rounds: nextRounds,
      playerEliminated: true,
    };
  }

  const nextRoundIdx = rIdx + 1;
  if (nextRoundIdx >= nextRounds.length) {
    return {
      ...state,
      rounds: nextRounds,
      champion: playerUsername,
    };
  }

  // Populate next round slots
  for (let i = 0; i < currentMatches.length; i += 2) {
    nextRounds[nextRoundIdx][i / 2].p1 = currentMatches[i].winner || 'TBD';
    nextRounds[nextRoundIdx][i / 2].p2 = currentMatches[i + 1].winner || 'TBD';
  }

  return {
    ...state,
    rounds: nextRounds,
    currentRound: nextRoundIdx,
  };
}

export const TournamentView: React.FC<TournamentViewProps> = ({
  t,
  profile,
  tournament,
  onStartTournament,
  onPlayMatch,
  onResetTournament,
}) => {
  const [gameType, setGameType] = useState<GameType>('chess');
  const [size, setSize] = useState<4 | 8>(4);

  if (!tournament) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#11131C] border border-amber-500/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.tournament.title}</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.tournament.subtitle}</p>

          <div className="space-y-5">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {t.tournament.chooseGame}
              </span>
              <div className="grid grid-cols-2 gap-3">
                {(['chess', 'checkers'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setGameType(g);
                    }}
                    className={`py-3 px-4 rounded-xl font-semibold text-sm border transition-all ${
                      gameType === g
                        ? 'bg-amber-500/15 border-amber-500 text-amber-500'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {g === 'chess' ? t.game.chess : t.game.checkers}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {t.tournament.bracketSize}
              </span>
              <div className="grid grid-cols-2 gap-3">
                {([4, 8] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSize(sz);
                    }}
                    className={`py-3 px-4 rounded-xl font-semibold text-sm border transition-all ${
                      size === sz
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {sz === 4 ? t.tournament.players4 : t.tournament.players8}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onStartTournament(gameType, size);
              }}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 transition-all inline-flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>{t.tournament.startTournament}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activePlayerMatch = tournament.rounds[tournament.currentRound]?.find(
    (m) => !m.winner && (m.p1 === profile.username || m.p2 === profile.username)
  );

  const getRoundName = (idx: number, total: number) => {
    if (idx === total - 1) return t.tournament.grandFinal;
    if (idx === total - 2) return t.tournament.semifinals;
    return t.tournament.quarterfinals;
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.tournament.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tournament.gameType === 'chess' ? t.game.chess : t.game.checkers} ·{' '}
            {tournament.size === 4 ? t.tournament.players4 : t.tournament.players8}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onResetTournament();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.tournament.newTournament}</span>
        </button>
      </div>

      {/* Status Banner */}
      {tournament.champion && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-purple-500/20 border border-amber-500/50 text-center">
          <Award className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <h3 className="font-display text-2xl font-bold text-amber-300">{t.tournament.champion}</h3>
          <p className="text-sm text-amber-200/80 mt-1">{t.tournament.championPrize}</p>
        </div>
      )}

      {tournament.playerEliminated && (
        <div className="p-5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-center">
          <p className="font-semibold text-rose-400">{t.tournament.eliminated}</p>
        </div>
      )}

      {/* Bracket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tournament.rounds.map((roundMatches, rIdx) => (
          <div key={rIdx} className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              {getRoundName(rIdx, tournament.rounds.length)}
            </h3>
            <div className="space-y-3">
              {roundMatches.map((m) => {
                const isUserMatch = m.p1 === profile.username || m.p2 === profile.username;
                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border ${
                      isUserMatch && !m.winner && !tournament.playerEliminated
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : 'bg-white dark:bg-[#11131C] border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm py-1">
                      <span
                        className={
                          m.winner === m.p1
                            ? 'font-bold text-amber-500'
                            : m.p1 === profile.username
                              ? 'font-semibold text-purple-400'
                              : ''
                        }
                      >
                        {m.p1}
                      </span>
                      <span className="text-xs text-slate-400">{m.difficulty}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-white/10 my-1.5" />
                    <div className="flex items-center justify-between text-sm py-1">
                      <span
                        className={
                          m.winner === m.p2
                            ? 'font-bold text-amber-500'
                            : m.p2 === profile.username
                              ? 'font-semibold text-purple-400'
                              : ''
                        }
                      >
                        {m.p2}
                      </span>
                      {m.winner && (
                        <span className="text-xs font-semibold text-emerald-500">
                          {m.winner}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {activePlayerMatch && !tournament.playerEliminated && !tournament.champion && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onPlayMatch(activePlayerMatch, tournament.gameType);
            }}
            className="inline-flex items-center gap-2 py-3.5 px-8 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow-lg"
          >
            <Play className="w-4 h-4" />
            <span>{t.tournament.playNextMatch}</span>
          </button>
        </div>
      )}
    </div>
  );
};
