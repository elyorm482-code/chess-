import React, { useEffect, useState } from 'react';
import {
  Award,
  Check,
  Coins,
  Crown,
  Lock,
  Moon,
  Music,
  Shield,
  Sun,
  Trophy,
  Volume2,
} from 'lucide-react';
import {
  ACHIEVEMENTS,
  AVATARS,
  BOARD_THEMES,
  CHECKERS_SKINS,
  CHESS_SKINS,
  getRankTitle,
  getXpForNextLevel,
} from '../data/gamification';
import type { Translations } from '../i18n/translations';
import type {
  AnimationLevel,
  BoardThemeId,
  CheckersSkinId,
  ChessSkinId,
  Language,
  LeaderboardEntry,
  PlayerProfile,
  PlayerSettings,
} from '../shared/types';
import { soundEngine } from '../utils/soundEngine';
import { AvatarBadge, CheckersPieceSvg, ChessPieceSvg } from './PieceIcons';

// --- Leaderboard View ---

export const LeaderboardView: React.FC<{ t: Translations; profile: PlayerProfile }> = ({
  t,
  profile,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'chessRating' | 'checkersRating' | 'wins' | 'xp'>('chessRating');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data: LeaderboardEntry[]) => {
        if (active && Array.isArray(data)) setEntries(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [profile]);

  const sorted = [...entries].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.leaderboard.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.leaderboard.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-white/5">
          {(
            [
              ['chessRating', t.leaderboard.sortChess],
              ['checkersRating', t.leaderboard.sortCheckers],
              ['wins', t.leaderboard.sortWins],
              ['xp', t.leaderboard.sortXp],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setSortBy(key);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                sortBy === key
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">{t.leaderboard.rankCol}</th>
                  <th className="py-3.5 px-4">{t.leaderboard.playerCol}</th>
                  <th className="py-3.5 px-4 text-right">{t.leaderboard.chessCol}</th>
                  <th className="py-3.5 px-4 text-right">{t.leaderboard.checkersCol}</th>
                  <th className="py-3.5 px-4 text-right">{t.leaderboard.winsCol}</th>
                  <th className="py-3.5 px-4 text-right">{t.leaderboard.levelCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-sm">
                {sorted.map((entry, idx) => {
                  const isYou = entry.id === profile.id;
                  return (
                    <tr
                      key={entry.id}
                      className={
                        isYou
                          ? 'bg-amber-500/10'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5 transition-colors'
                      }
                    >
                      <td className="py-3 px-4 font-mono-nums font-bold">
                        {idx === 0 ? (
                          <Crown className="w-4 h-4 text-amber-400 inline" />
                        ) : (
                          idx + 1
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <AvatarBadge avatarId={entry.avatarId} size="sm" />
                          <span className="font-semibold">{entry.username}</span>
                          {isYou && (
                            <span className="text-xs font-semibold text-amber-500">
                              · {t.leaderboard.you}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums font-semibold">
                        {entry.chessRating}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums font-semibold">
                        {entry.checkersRating}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums">{entry.wins}</td>
                      <td className="py-3 px-4 text-right font-mono-nums text-purple-400">
                        Lv.{entry.level}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Player Profile View ---

export const ProfileView: React.FC<{
  t: Translations;
  profile: PlayerProfile;
  onUpdateProfile: (partial: Partial<PlayerProfile>) => void;
}> = ({ t, profile, onUpdateProfile }) => {
  const [nameInput, setNameInput] = useState(profile.username);
  const [savedToast, setSavedToast] = useState(false);

  const winRate =
    profile.gamesPlayed > 0
      ? Math.round((profile.wins / profile.gamesPlayed) * 100)
      : 0;
  const xpNeeded = getXpForNextLevel(profile.level);
  const xpPct = Math.min(100, Math.round((profile.xp / xpNeeded) * 100));

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameInput.trim().slice(0, 24);
    if (!cleaned) return;
    soundEngine.playClick();
    onUpdateProfile({ username: cleaned });
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <AvatarBadge avatarId={profile.avatarId} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold">{profile.username}</h2>
                <span className="text-xs font-semibold text-amber-500">
                  · {getRankTitle(profile.level, profile.chessRating)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono-nums font-semibold text-purple-400">
                  {t.profile.level} {profile.level}
                </span>
                <div className="w-40 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-purple-500"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
                <span className="font-mono-nums">
                  {profile.xp}/{xpNeeded} XP
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveName} className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={24}
              aria-label={t.profile.username}
              className="px-3.5 py-2 rounded-xl text-sm bg-slate-100 dark:bg-[#08090E] border border-slate-200 dark:border-white/15 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
            >
              {savedToast ? <Check className="w-4 h-4" /> : t.profile.saveName}
            </button>
          </form>
        </div>

        {/* Avatar Picker */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            {t.profile.chooseAvatar}
          </p>
          <div className="flex flex-wrap gap-3">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                aria-label={av.label}
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateProfile({ avatarId: av.id });
                }}
                className={`p-1 rounded-xl border-2 transition-all ${
                  profile.avatarId === av.id
                    ? 'border-amber-500 scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <AvatarBadge avatarId={av.id} size="md" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          [t.profile.gamesPlayed, profile.gamesPlayed],
          [t.profile.wins, profile.wins],
          [t.profile.losses, profile.losses],
          [t.profile.draws, profile.draws],
          [t.profile.winRate, `${winRate}%`],
          [t.profile.chessRating, profile.chessRating],
          [t.profile.checkersRating, profile.checkersRating],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="p-4 rounded-xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{label}</div>
            <div className="font-mono-nums text-xl font-bold mt-1">{value}</div>
          </div>
        ))}
      </div>

      {/* Match History & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="p-5 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10">
          <h3 className="font-bold text-base mb-4">{t.profile.matchHistory}</h3>
          {profile.matchHistory.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              {t.profile.noHistory}
            </p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {profile.matchHistory.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-sm"
                >
                  <div>
                    <div className="font-semibold">
                      {m.gameType === 'chess' ? t.game.chess : t.game.checkers} · {m.opponentName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {m.movesCount} {t.game.movesCount} · {new Date(m.playedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right font-mono-nums">
                    <div
                      className={`font-bold text-xs uppercase ${
                        m.result === 'win'
                          ? 'text-emerald-500'
                          : m.result === 'loss'
                            ? 'text-rose-400'
                            : 'text-slate-400'
                      }`}
                    >
                      {m.result}
                    </div>
                    <div className="text-xs text-amber-500">
                      {m.ratingDelta >= 0 ? `+${m.ratingDelta}` : m.ratingDelta} ELO
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="p-5 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10">
          <h3 className="font-bold text-base mb-4">{t.profile.achievements}</h3>
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = profile.achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                    unlocked
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {unlocked ? (
                      <Award className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-sm">{ach.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {ach.description}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono-nums text-xs font-semibold text-amber-500 shrink-0">
                    +{ach.rewardCoins}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

// --- Royal Armory / Cosmetics Shop View ---

export const ShopView: React.FC<{
  t: Translations;
  profile: PlayerProfile;
  onUnlockAndEquip: (
    itemId: string,
    cost: number,
    settingUpdate: Partial<PlayerSettings>
  ) => void;
}> = ({ t, profile, onUnlockAndEquip }) => {
  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.shop.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.shop.subtitle}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 font-mono-nums font-bold text-amber-500">
          <Coins className="w-4 h-4" />
          <span>{profile.coins}</span>
        </div>
      </div>

      {/* Board Themes */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t.shop.boardThemes}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOARD_THEMES.map((theme) => {
            const unlocked = profile.unlockedItems.includes(theme.id) || theme.cost === 0;
            const equipped = profile.settings.boardTheme === theme.id;
            const canAfford = profile.coins >= theme.cost;

            return (
              <div
                key={theme.id}
                className={`p-4 rounded-2xl bg-white dark:bg-[#11131C] border transition-all ${
                  equipped
                    ? 'border-amber-500 shadow-lg'
                    : 'border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="grid grid-cols-4 h-16 rounded-xl overflow-hidden mb-3 border border-black/30">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: i % 2 === 0 ? theme.lightSquare : theme.darkSquare,
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm">{theme.name}</span>
                  <button
                    type="button"
                    disabled={equipped || (!unlocked && !canAfford)}
                    onClick={() => {
                      soundEngine.playClick();
                      onUnlockAndEquip(theme.id, unlocked ? 0 : theme.cost, {
                        boardTheme: theme.id as BoardThemeId,
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      equipped
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : unlocked
                          ? 'bg-slate-200 dark:bg-white/10 hover:bg-amber-500 hover:text-slate-950'
                          : canAfford
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                            : 'bg-slate-200/50 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {equipped
                      ? t.shop.equipped
                      : unlocked
                        ? t.shop.equip
                        : `${t.shop.unlockFor} · ${theme.cost}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chess Skins */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t.shop.chessSkins}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHESS_SKINS.map((skin) => {
            const unlocked = profile.unlockedItems.includes(skin.id) || skin.cost === 0;
            const equipped = profile.settings.chessSkin === skin.id;
            const canAfford = profile.coins >= skin.cost;

            return (
              <div
                key={skin.id}
                className={`p-4 rounded-2xl bg-white dark:bg-[#11131C] border ${
                  equipped ? 'border-amber-500' : 'border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-3 py-3 mb-3 rounded-xl bg-slate-100 dark:bg-[#08090E]">
                  <div className="w-12 h-12">
                    <ChessPieceSvg type="k" color="w" skinId={skin.id} />
                  </div>
                  <div className="w-12 h-12">
                    <ChessPieceSvg type="q" color="b" skinId={skin.id} />
                  </div>
                </div>
                <div className="font-semibold text-sm mb-2">{skin.name}</div>
                <button
                  type="button"
                  disabled={equipped || (!unlocked && !canAfford)}
                  onClick={() => {
                    soundEngine.playClick();
                    onUnlockAndEquip(skin.id, unlocked ? 0 : skin.cost, {
                      chessSkin: skin.id as ChessSkinId,
                    });
                  }}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                    equipped
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : unlocked
                        ? 'bg-slate-200 dark:bg-white/10 hover:bg-amber-500 hover:text-slate-950'
                        : canAfford
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-slate-200/50 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {equipped
                    ? t.shop.equipped
                    : unlocked
                      ? t.shop.equip
                      : `${t.shop.unlockFor} · ${skin.cost}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Checkers Skins */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t.shop.checkersSkins}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHECKERS_SKINS.map((skin) => {
            const unlocked = profile.unlockedItems.includes(skin.id) || skin.cost === 0;
            const equipped = profile.settings.checkersSkin === skin.id;
            const canAfford = profile.coins >= skin.cost;

            return (
              <div
                key={skin.id}
                className={`p-4 rounded-2xl bg-white dark:bg-[#11131C] border ${
                  equipped ? 'border-amber-500' : 'border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-3 py-3 mb-3 rounded-xl bg-slate-100 dark:bg-[#08090E]">
                  <div className="w-12 h-12">
                    <CheckersPieceSvg color="b" king={true} skinId={skin.id} />
                  </div>
                  <div className="w-12 h-12">
                    <CheckersPieceSvg color="w" king={false} skinId={skin.id} />
                  </div>
                </div>
                <div className="font-semibold text-sm mb-2">{skin.name}</div>
                <button
                  type="button"
                  disabled={equipped || (!unlocked && !canAfford)}
                  onClick={() => {
                    soundEngine.playClick();
                    onUnlockAndEquip(skin.id, unlocked ? 0 : skin.cost, {
                      checkersSkin: skin.id as CheckersSkinId,
                    });
                  }}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                    equipped
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : unlocked
                        ? 'bg-slate-200 dark:bg-white/10 hover:bg-amber-500 hover:text-slate-950'
                        : canAfford
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-slate-200/50 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {equipped
                    ? t.shop.equipped
                    : unlocked
                      ? t.shop.equip
                      : `${t.shop.unlockFor} · ${skin.cost}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

// --- Settings View ---

export const SettingsView: React.FC<{
  t: Translations;
  profile: PlayerProfile;
  onUpdateSettings: (partial: Partial<PlayerSettings>) => void;
}> = ({ t, profile, onUpdateSettings }) => {
  const s = profile.settings;

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.settings.title}</h2>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 space-y-6 shadow-xl">
        {/* Language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="font-semibold text-sm">{t.settings.language}</span>
          <div className="flex gap-2">
            {(
              [
                ['en', 'English'],
                ['uz', "O'zbekcha"],
                ['ru', 'Русский'],
              ] as [Language, string][]
            ).map(([code, label]) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateSettings({ language: code });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  s.language === code
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sound FX */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-sm">{t.settings.soundFx}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onUpdateSettings({ soundEnabled: !s.soundEnabled });
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
              s.soundEnabled
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-200 dark:bg-white/10 text-slate-500'
            }`}
          >
            {s.soundEnabled ? t.settings.on : t.settings.off}
          </button>
        </div>

        {/* Music */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <Music className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-sm">{t.settings.music}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onUpdateSettings({ musicEnabled: !s.musicEnabled });
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
              s.musicEnabled
                ? 'bg-purple-500 text-white'
                : 'bg-slate-200 dark:bg-white/10 text-slate-500'
            }`}
          >
            {s.musicEnabled ? t.settings.on : t.settings.off}
          </button>
        </div>

        {/* Dark / Light Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <span className="font-semibold text-sm">{t.settings.themeMode}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onUpdateSettings({ themeMode: 'dark' });
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border ${
                s.themeMode === 'dark'
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{t.settings.darkMode}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onUpdateSettings({ themeMode: 'light' });
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border ${
                s.themeMode === 'light'
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t.settings.lightMode}</span>
            </button>
          </div>
        </div>

        {/* Animations */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <span className="font-semibold text-sm">{t.settings.animations}</span>
          <div className="flex gap-2">
            {(['full', 'reduced'] as AnimationLevel[]).map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateSettings({ animations: lv });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border ${
                  s.animations === lv
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
                }`}
              >
                {lv === 'full' ? t.settings.animFull : t.settings.animReduced}
              </button>
            ))}
          </div>
        </div>

        {/* Board & Piece Theme Quick Selectors */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="settings-board-theme"
              className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5"
            >
              {t.settings.boardTheme}
            </label>
            <select
              id="settings-board-theme"
              value={s.boardTheme}
              onChange={(e) => onUpdateSettings({ boardTheme: e.target.value as BoardThemeId })}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-[#08090E] border border-slate-200 dark:border-white/15"
            >
              {BOARD_THEMES.filter(
                (bt) => bt.cost === 0 || profile.unlockedItems.includes(bt.id)
              ).map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="settings-chess-pieces"
              className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5"
            >
              {t.settings.chessPieces}
            </label>
            <select
              id="settings-chess-pieces"
              value={s.chessSkin}
              onChange={(e) => onUpdateSettings({ chessSkin: e.target.value as ChessSkinId })}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-[#08090E] border border-slate-200 dark:border-white/15"
            >
              {CHESS_SKINS.filter(
                (cs) => cs.cost === 0 || profile.unlockedItems.includes(cs.id)
              ).map((cs) => (
                <option key={cs.id} value={cs.id}>
                  {cs.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="settings-checkers-pieces"
              className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5"
            >
              {t.settings.checkersPieces}
            </label>
            <select
              id="settings-checkers-pieces"
              value={s.checkersSkin}
              onChange={(e) => onUpdateSettings({ checkersSkin: e.target.value as CheckersSkinId })}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-[#08090E] border border-slate-200 dark:border-white/15"
            >
              {CHECKERS_SKINS.filter(
                (cks) => cks.cost === 0 || profile.unlockedItems.includes(cks.id)
              ).map((cks) => (
                <option key={cks.id} value={cks.id}>
                  {cks.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Keep Trophy & Shield exported/used cleanly
export { Trophy, Shield };
