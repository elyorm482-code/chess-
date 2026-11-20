import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bot,
  CheckCircle2,
  Coins,
  Crown,
  Gift,
  Globe,
  Monitor,
  Play,
  Settings,
  ShoppingBag,
  Sparkles,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import { DAILY_MISSIONS, DAILY_REWARD_SCHEDULE } from '../data/gamification';
import type { Translations } from '../i18n/translations';
import type {
  AIDifficulty,
  AppScreen,
  GameType,
  PlayMode,
  PlayerProfile,
} from '../shared/types';
import { soundEngine } from '../utils/soundEngine';
import { CheckersPieceSvg, ChessPieceSvg } from './PieceIcons';

interface HomeDashboardProps {
  t: Translations;
  profile: PlayerProfile;
  onStartGame: (config: {
    gameType: GameType;
    mode: PlayMode;
    difficulty: AIDifficulty;
    timeControlSeconds: number;
  }) => void;
  onNavigate: (screen: AppScreen) => void;
  onClaimDailyReward: () => void;
  onClaimMission: (missionId: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  t,
  profile,
  onStartGame,
  onNavigate,
  onClaimDailyReward,
  onClaimMission,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType>('chess');
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('medium');
  const [timeControl, setTimeControl] = useState<number>(600);

  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyClaimedToday = profile.lastDailyClaimDate === todayStr;
  const nextDailyReward =
    DAILY_REWARD_SCHEDULE[profile.dailyStreak % DAILY_REWARD_SCHEDULE.length];

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 space-y-8">
      {/* Hero Stage: Asymmetric Split with Calm Negative Space + Interactive Centerpiece */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10121C] via-[#131524] to-[#1A132B] text-slate-100 border border-amber-500/25 shadow-2xl p-6 sm:p-10">
        <div
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full pointer-events-none opacity-25 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(212,175,55,0.45) 0%, rgba(168,85,247,0.25) 60%, transparent 100%)',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
          {/* Left: Title & Primary Launch */}
          <div className="space-y-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              {t.tagline}
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-balance">
              {t.home.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              {t.home.heroSubtitle}
            </p>

            {/* Primary Discipline Switch + AI Launch Controls */}
            <div className="p-4 rounded-2xl bg-black/35 border border-white/10 space-y-4 max-w-xl">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedGame('chess');
                  }}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                    selectedGame === 'chess'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>{t.game.chess}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedGame('checkers');
                  }}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                    selectedGame === 'checkers'
                      ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.game.checkers}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    {t.home.selectDifficulty}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['beginner', 'easy', 'medium', 'expert'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedDifficulty(diff);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                          selectedDifficulty === diff
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {t.difficulty[diff]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    {t.home.timeControl}
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[180, 300, 600, 900].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setTimeControl(sec);
                        }}
                        className={`py-1.5 rounded-lg font-mono-nums text-xs font-semibold border transition-colors ${
                          timeControl === sec
                            ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {sec / 60}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  data-start="true"
                  onClick={() => {
                    soundEngine.playClick();
                    onStartGame({
                      gameType: selectedGame,
                      mode: 'ai',
                      difficulty: selectedDifficulty,
                      timeControlSeconds: timeControl,
                    });
                  }}
                  className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow-[0_0_24px_rgba(245,158,11,0.3)] transition-all whitespace-nowrap shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {selectedGame === 'chess' ? t.home.quickChess : t.home.quickCheckers} ·{' '}
                    {t.difficulty[selectedDifficulty]}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onStartGame({
                      gameType: selectedGame,
                      mode: 'local',
                      difficulty: 'medium',
                      timeControlSeconds: timeControl,
                    });
                  }}
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 border border-white/15 transition-colors whitespace-nowrap shrink-0"
                >
                  <Monitor className="w-4 h-4" />
                  <span>{t.home.local2p}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Sculpted 3D Board & Pieces Centerpiece */}
          <div className="hidden lg:flex items-center justify-center">
            <motion.div
              whileHover={{ rotateX: 4, rotateY: -4, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="relative w-80 h-80 rounded-3xl p-4 bg-[#0B0C13] border border-amber-500/35 shadow-[0_25px_60px_rgba(0,0,0,0.65)]"
            >
              <div className="grid grid-cols-4 grid-rows-4 w-full h-full rounded-xl overflow-hidden border border-white/10">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const r = Math.floor(idx / 4);
                  const c = idx % 4;
                  const isLight = (r + c) % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-center p-1.5"
                      style={{ backgroundColor: isLight ? '#2D3042' : '#151722' }}
                    >
                      {idx === 5 && (
                        <ChessPieceSvg type="k" color="w" skinId={profile.settings.chessSkin} />
                      )}
                      {idx === 6 && (
                        <ChessPieceSvg type="q" color="b" skinId={profile.settings.chessSkin} />
                      )}
                      {idx === 9 && (
                        <CheckersPieceSvg
                          color="b"
                          king={true}
                          skinId={profile.settings.checkersSkin}
                        />
                      )}
                      {idx === 10 && (
                        <ChessPieceSvg type="n" color="w" skinId={profile.settings.chessSkin} />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Mode Matrix: All Requested Modes & Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onStartGame({
              gameType: 'chess',
              mode: 'ai',
              difficulty: selectedDifficulty,
              timeControlSeconds: timeControl,
            });
          }}
          className="group text-left p-5 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 hover:border-amber-500/60 transition-all shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base">{t.home.vsComputer}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {t.home.vsComputerDesc}
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onNavigate('online');
          }}
          className="group text-left p-5 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 hover:border-purple-500/60 transition-all shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base">{t.home.playFriends}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {t.home.playFriendsDesc}
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onStartGame({
              gameType: selectedGame,
              mode: 'local',
              difficulty: 'medium',
              timeControlSeconds: timeControl,
            });
          }}
          className="group text-left p-5 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 hover:border-amber-500/60 transition-all shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Monitor className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base">{t.home.local2p}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {t.home.local2pDesc}
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onNavigate('online');
          }}
          className="group text-left p-5 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 hover:border-purple-500/60 transition-all shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base">{t.home.onlineMulti}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {t.home.onlineMultiDesc}
          </p>
        </button>
      </section>

      {/* Secondary Row: Tournament + Quick Checkers + Daily Rewards & Missions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tournament & Checkers Spotlight */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onNavigate('tournament');
            }}
            className="w-full text-left p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-purple-500/10 border border-amber-500/35 hover:border-amber-400 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">{t.home.tournamentMode}</h3>
              </div>
              <span className="font-mono-nums text-xs font-semibold text-amber-500">+300</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.home.tournamentDesc}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onStartGame({
                gameType: 'checkers',
                mode: 'ai',
                difficulty: selectedDifficulty,
                timeControlSeconds: timeControl,
              });
            }}
            className="w-full text-left p-5 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8">
                <CheckersPieceSvg color="b" king={true} skinId={profile.settings.checkersSkin} />
              </div>
              <h3 className="font-bold text-base">{t.home.quickCheckers}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.home.checkersDesc}
            </p>
          </button>
        </div>

        {/* Daily Tribute */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">{t.home.dailyReward}</h3>
              </div>
              <span className="font-mono-nums text-xs text-slate-500 dark:text-slate-400">
                Streak {profile.dailyStreak}/7
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {DAILY_REWARD_SCHEDULE.map((item, idx) => {
                const isCurrent = idx === profile.dailyStreak % 7;
                const isPast = idx < profile.dailyStreak % 7;
                return (
                  <div
                    key={item.day}
                    className={`p-2 rounded-lg text-center border text-[11px] font-mono-nums ${
                      isCurrent && !dailyClaimedToday
                        ? 'bg-amber-500/20 border-amber-500 text-amber-500 font-bold'
                        : isPast
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                    }`}
                  >
                    <div>D{item.day}</div>
                    <div className="mt-0.5">{item.coins}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            disabled={dailyClaimedToday}
            onClick={() => {
              soundEngine.playPromote();
              onClaimDailyReward();
            }}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all ${
              dailyClaimedToday
                ? 'bg-emerald-500/15 text-emerald-500 cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110'
            }`}
          >
            {dailyClaimedToday ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.home.claimedToday}</span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4" />
                <span>
                  {t.home.claimReward} (+{nextDailyReward.coins})
                </span>
              </>
            )}
          </button>
        </div>

        {/* Daily Missions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 flex flex-col justify-between">
          <h3 className="font-bold text-base mb-3">{t.home.missions}</h3>
          <div className="space-y-3 flex-1">
            {DAILY_MISSIONS.map((mission) => {
              const state = profile.missions.find((m) => m.id === mission.id) || {
                id: mission.id,
                progress: 0,
                claimed: false,
              };
              const pct = Math.min(100, Math.round((state.progress / mission.target) * 100));
              const ready = state.progress >= mission.target && !state.claimed;

              return (
                <div
                  key={mission.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold">{mission.title}</span>
                    <span className="font-mono-nums text-amber-500">
                      +{mission.rewardCoins}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {ready ? (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playPromote();
                          onClaimMission(mission.id);
                        }}
                        className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[11px] font-bold"
                      >
                        {t.home.claimReward}
                      </button>
                    ) : (
                      <span className="font-mono-nums text-[11px] text-slate-400">
                        {state.claimed ? 'Done' : `${Math.min(state.progress, mission.target)}/${mission.target}`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-2 pt-4 mt-3 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onNavigate('leaderboard');
              }}
              className="py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex flex-col items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="truncate max-w-full px-1">{t.nav.leaderboard}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onNavigate('shop');
              }}
              className="py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex flex-col items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              <span className="truncate max-w-full px-1">{t.nav.shop}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onNavigate('profile');
              }}
              className="py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex flex-col items-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span className="truncate max-w-full px-1">{t.nav.profile}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onNavigate('settings');
              }}
              className="py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex flex-col items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-full px-1">{t.nav.settings}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
