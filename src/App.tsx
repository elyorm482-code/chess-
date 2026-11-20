import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Coins, Crown } from 'lucide-react';
import {
  DAILY_MISSIONS,
  DAILY_REWARD_SCHEDULE,
  getXpForNextLevel,
} from './data/gamification';
import { TRANSLATIONS } from './i18n/translations';
import type {
  AIDifficulty,
  AppScreen,
  GameType,
  PlayMode,
  PlayerProfile,
  PlayerSettings,
} from './shared/types';
import {
  applyMatchOutcomeToProfile,
  getOrCreateLocalProfile,
  saveLocalProfile,
  syncProfileToServer,
  updateProfileSettings,
} from './utils/playerStore';
import { soundEngine } from './utils/soundEngine';
import { GameArena, type OnlineRoomSnapshot } from './components/GameArena';
import { HomeDashboard } from './components/HomeDashboard';
import { LoadingScreen } from './components/LoadingScreen';
import { OnlineArena } from './components/OnlineArena';
import {
  LeaderboardView,
  ProfileView,
  SettingsView,
  ShopView,
} from './components/SecondaryViews';
import {
  advanceTournamentBracket,
  createTournamentBracket,
  TournamentView,
  type TournamentMatch,
  type TournamentState,
} from './components/TournamentView';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => getOrCreateLocalProfile());
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' || params.get('room')) return false;
    }
    return true;
  });

  const [screen, setScreen] = useState<AppScreen>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return 'game';
      if (params.get('room')) return 'online';
    }
    return 'home';
  });

  const [activeGameConfig, setActiveGameConfig] = useState<{
    gameType: GameType;
    mode: PlayMode;
    difficulty: AIDifficulty;
    timeControlSeconds: number;
    opponentLabel?: string;
    matchKey: number;
  }>({
    gameType: 'chess',
    mode: 'ai',
    difficulty: 'medium',
    timeControlSeconds: 600,
    matchKey: 1,
  });

  // Tournament State
  const [tournament, setTournament] = useState<TournamentState | null>(null);

  // Online WebSocket State
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoomSnapshot | null>(null);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const initialRoomCode =
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('room') || '').toUpperCase()
      : '';

  const t = TRANSLATIONS[profile.settings.language] || TRANSLATIONS.en;

  // Brief loading screen on boot
  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, [loading]);

  // Sync dark/light class, sound engine, and body dataset state
  useEffect(() => {
    const root = document.documentElement;
    if (profile.settings.themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    soundEngine.setSoundEnabled(profile.settings.soundEnabled);
    soundEngine.setMusicEnabled(profile.settings.musicEnabled);
  }, [profile.settings]);

  useEffect(() => {
    if (screen !== 'game') {
      document.body.dataset.state = 'title';
    }
  }, [screen]);

  // Initial server profile sync
  useEffect(() => {
    syncProfileToServer(profile).then((synced) => {
      setProfile(synced);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Connect WebSocket for Online Multiplayer
  useEffect(() => {
    let closed = false;
    let reconnectTimer: number | null = null;

    const connect = () => {
      if (closed) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        setOnlineError(null);
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.type === 'room:state' && data.room) {
            const snap = data.room as OnlineRoomSnapshot;
            setOnlineRoom(snap);
            setOnlineError(null);
            if (snap.status === 'playing') {
              setScreen('game');
            }
            if (data.fx === 'capture') soundEngine.playCapture();
            else if (data.fx === 'check') soundEngine.playCheck();
            else if (data.fx === 'promote') soundEngine.playPromote();
          } else if (data.type === 'room:error') {
            setOnlineError(String(data.message || 'Room error'));
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        if (!closed) {
          reconnectTimer = window.setTimeout(connect, 2000);
        }
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  const sendWs = useCallback((payload: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }, []);

  const persistProfile = useCallback((next: PlayerProfile) => {
    setProfile(next);
    saveLocalProfile(next);
    syncProfileToServer(next);
  }, []);

  const handleUpdateSettings = useCallback(
    (partial: Partial<PlayerSettings>) => {
      setProfile((prev) => {
        const next = updateProfileSettings(prev, partial);
        saveLocalProfile(next);
        syncProfileToServer(next);
        return next;
      });
    },
    []
  );

  const handleUpdateProfile = useCallback((partial: Partial<PlayerProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      saveLocalProfile(next);
      syncProfileToServer(next);
      return next;
    });
  }, []);

  const handleUnlockAndEquip = useCallback(
    (itemId: string, cost: number, settingUpdate: Partial<PlayerSettings>) => {
      setProfile((prev) => {
        const alreadyUnlocked = prev.unlockedItems.includes(itemId) || cost === 0;
        if (!alreadyUnlocked && prev.coins < cost) return prev;
        const nextUnlocked = alreadyUnlocked
          ? prev.unlockedItems
          : [...prev.unlockedItems, itemId];
        const nextAchievements = new Set(prev.achievements);
        if (nextUnlocked.length >= 4) nextAchievements.add('collector');

        const next: PlayerProfile = {
          ...prev,
          coins: alreadyUnlocked ? prev.coins : prev.coins - cost,
          unlockedItems: nextUnlocked,
          achievements: Array.from(nextAchievements),
          settings: { ...prev.settings, ...settingUpdate },
        };
        saveLocalProfile(next);
        syncProfileToServer(next);
        return next;
      });
    },
    []
  );

  const handleClaimDailyReward = useCallback(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setProfile((prev) => {
      if (prev.lastDailyClaimDate === todayStr) return prev;
      const reward = DAILY_REWARD_SCHEDULE[prev.dailyStreak % DAILY_REWARD_SCHEDULE.length];
      let xp = prev.xp + reward.xp;
      let level = prev.level;
      while (xp >= getXpForNextLevel(level)) {
        xp -= getXpForNextLevel(level);
        level++;
      }
      const next: PlayerProfile = {
        ...prev,
        coins: prev.coins + reward.coins,
        xp,
        level,
        dailyStreak: prev.dailyStreak + 1,
        lastDailyClaimDate: todayStr,
      };
      saveLocalProfile(next);
      syncProfileToServer(next);
      return next;
    });
  }, []);

  const handleClaimMission = useCallback((missionId: string) => {
    const def = DAILY_MISSIONS.find((m) => m.id === missionId);
    if (!def) return;
    setProfile((prev) => {
      const mState = prev.missions.find((m) => m.id === missionId);
      if (!mState || mState.claimed || mState.progress < def.target) return prev;

      let xp = prev.xp + def.rewardXp;
      let level = prev.level;
      while (xp >= getXpForNextLevel(level)) {
        xp -= getXpForNextLevel(level);
        level++;
      }
      const next: PlayerProfile = {
        ...prev,
        coins: prev.coins + def.rewardCoins,
        xp,
        level,
        missions: prev.missions.map((m) => (m.id === missionId ? { ...m, claimed: true } : m)),
      };
      saveLocalProfile(next);
      syncProfileToServer(next);
      return next;
    });
  }, []);

  const handleStartGame = useCallback(
    (config: {
      gameType: GameType;
      mode: PlayMode;
      difficulty: AIDifficulty;
      timeControlSeconds: number;
      opponentLabel?: string;
    }) => {
      setActiveGameConfig((prev) => ({
        ...config,
        matchKey: prev.matchKey + 1,
      }));
      setScreen('game');
    },
    []
  );

  const handleMatchFinished = useCallback(
    (outcome: {
      result: 'win' | 'loss' | 'draw';
      movesCount: number;
      opponentName: string;
      wasExpertAi: boolean;
    }) => {
      let summary = { xpEarned: 50, coinsEarned: 30, ratingDelta: 0 };
      setProfile((prev) => {
        const res = applyMatchOutcomeToProfile(prev, {
          gameType: onlineRoom?.gameType || activeGameConfig.gameType,
          mode: onlineRoom ? 'online' : activeGameConfig.mode,
          ...outcome,
        });
        summary = {
          xpEarned: res.xpEarned,
          coinsEarned: res.coinsEarned,
          ratingDelta: res.ratingDelta,
        };
        saveLocalProfile(res.nextProfile);
        syncProfileToServer(res.nextProfile);
        return res.nextProfile;
      });
      return summary;
    },
    [activeGameConfig.gameType, activeGameConfig.mode, onlineRoom]
  );

  const handleCreateOnlineRoom = useCallback(
    (gameType: GameType, timeControlSeconds: number) => {
      setOnlineError(null);
      sendWs({
        type: 'room:create',
        gameType,
        timeControlSeconds,
        player: {
          id: profile.id,
          username: profile.username,
          avatarId: profile.avatarId,
          rating: gameType === 'chess' ? profile.chessRating : profile.checkersRating,
        },
      });
    },
    [sendWs, profile]
  );

  const handleJoinOnlineRoom = useCallback(
    (code: string) => {
      setOnlineError(null);
      sendWs({
        type: 'room:join',
        code: code.trim().toUpperCase(),
        player: {
          id: profile.id,
          username: profile.username,
          avatarId: profile.avatarId,
          rating: profile.chessRating,
        },
      });
    },
    [sendWs, profile]
  );

  const handleLeaveOnline = useCallback(() => {
    setOnlineRoom(null);
    setScreen('home');
  }, []);

  const handleTournamentStart = useCallback(
    (gameType: GameType, size: 4 | 8) => {
      setTournament(createTournamentBracket(profile.username, gameType, size));
    },
    [profile.username]
  );

  const handleTournamentPlayMatch = useCallback(
    (match: TournamentMatch, gameType: GameType) => {
      const opp = match.p1 === profile.username ? match.p2 : match.p1;
      handleStartGame({
        gameType,
        mode: 'tournament',
        difficulty: match.difficulty,
        timeControlSeconds: 300,
        opponentLabel: opp,
      });
    },
    [profile.username, handleStartGame]
  );

  const handleTournamentNext = useCallback(
    (won: boolean) => {
      if (!tournament) {
        setScreen('tournament');
        return;
      }
      const next = advanceTournamentBracket(tournament, profile.username, won);
      setTournament(next);
      if (next.champion === profile.username) {
        // Award Tournament Champion bonus
        const nextAchievements = new Set(profile.achievements);
        nextAchievements.add('tournament_champ');
        persistProfile({
          ...profile,
          coins: profile.coins + 300,
          xp: profile.xp + 250,
          achievements: Array.from(nextAchievements),
        });
      }
      setScreen('tournament');
    },
    [tournament, profile, persistProfile]
  );

  if (loading) {
    return <LoadingScreen label={t.loading} />;
  }

  // Active Game Screen uses dedicated Game Shell without SaaS nav header
  if (screen === 'game') {
    const effectiveGameType = onlineRoom ? onlineRoom.gameType : activeGameConfig.gameType;
    const effectiveMode = onlineRoom ? 'online' : activeGameConfig.mode;

    return (
      <GameArena
        key={`${activeGameConfig.matchKey}-${onlineRoom?.code || 'local'}`}
        t={t}
        profile={profile}
        gameType={effectiveGameType}
        mode={effectiveMode}
        difficulty={activeGameConfig.difficulty}
        timeControlSeconds={
          onlineRoom ? onlineRoom.timeControlSeconds : activeGameConfig.timeControlSeconds
        }
        opponentLabel={activeGameConfig.opponentLabel}
        onlineRoom={onlineRoom}
        onOnlineSend={sendWs}
        onLeaveOnline={handleLeaveOnline}
        onToggleSound={() =>
          handleUpdateSettings({ soundEnabled: !profile.settings.soundEnabled })
        }
        onToggleMusic={() =>
          handleUpdateSettings({ musicEnabled: !profile.settings.musicEnabled })
        }
        onMatchFinished={handleMatchFinished}
        onExitToMenu={() => setScreen('home')}
        onTournamentNext={handleTournamentNext}
      />
    );
  }

  const navItems: { id: AppScreen; label: string }[] = [
    { id: 'online', label: t.nav.online },
    { id: 'tournament', label: t.nav.tournament },
    { id: 'leaderboard', label: t.nav.leaderboard },
    { id: 'shop', label: t.nav.shop },
    { id: 'settings', label: t.nav.settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#08090E] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Clean 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0B0D14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Title */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setScreen('home');
            }}
            className="inline-flex items-center gap-2.5 font-display text-base sm:text-lg font-bold tracking-wide text-amber-600 dark:text-amber-400 whitespace-nowrap shrink-0"
          >
            <Crown className="w-5 h-5" />
            <span>Chess &amp; Checkers</span>
          </button>

          {/* Zone 2: Concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setScreen(item.id);
                }}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                  screen === item.id
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Single Primary Profile/Coins Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setScreen('profile');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/35 hover:bg-amber-500/25 transition-colors whitespace-nowrap shrink-0"
            >
              <Coins className="w-3.5 h-3.5" />
              <span className="font-mono-nums">{profile.coins}</span>
              <span aria-hidden="true">·</span>
              <span className="max-w-[90px] truncate">{profile.username}</span>
            </button>
          </div>
        </div>

        {/* Mobile Compact Nav Row */}
        <nav className="flex md:hidden items-center gap-4 px-4 py-2 overflow-x-auto border-t border-slate-200 dark:border-white/5 text-xs font-medium">
          {[
            { id: 'home' as AppScreen, label: t.nav.home },
            ...navItems,
            { id: 'profile' as AppScreen, label: t.nav.profile },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setScreen(item.id);
              }}
              className={`whitespace-nowrap shrink-0 py-1 ${
                screen === item.id
                  ? 'text-amber-500 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 pb-10">
        {screen === 'home' && (
          <HomeDashboard
            t={t}
            profile={profile}
            onStartGame={handleStartGame}
            onNavigate={setScreen}
            onClaimDailyReward={handleClaimDailyReward}
            onClaimMission={handleClaimMission}
          />
        )}

        {screen === 'online' && (
          <OnlineArena
            t={t}
            profile={profile}
            wsConnected={wsConnected}
            room={onlineRoom}
            errorMsg={onlineError}
            onCreateRoom={handleCreateOnlineRoom}
            onJoinRoom={handleJoinOnlineRoom}
            onLeaveRoom={handleLeaveOnline}
            initialRoomCode={initialRoomCode}
          />
        )}

        {screen === 'tournament' && (
          <TournamentView
            t={t}
            profile={profile}
            tournament={tournament}
            onStartTournament={handleTournamentStart}
            onPlayMatch={handleTournamentPlayMatch}
            onResetTournament={() => setTournament(null)}
          />
        )}

        {screen === 'leaderboard' && <LeaderboardView t={t} profile={profile} />}

        {screen === 'profile' && (
          <ProfileView t={t} profile={profile} onUpdateProfile={handleUpdateProfile} />
        )}

        {screen === 'shop' && (
          <ShopView
            t={t}
            profile={profile}
            onUnlockAndEquip={handleUnlockAndEquip}
          />
        )}

        {screen === 'settings' && (
          <SettingsView
            t={t}
            profile={profile}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>
    </div>
  );
}
