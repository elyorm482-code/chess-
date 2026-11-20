import { createDefaultProfile, getXpForNextLevel } from '../data/gamification';
import type { GameType, MatchRecord, PlayMode, PlayerProfile, PlayerSettings } from '../shared/types';

const STORAGE_KEY = 'cc_ultimate_profile_v1';

export function getOrCreateLocalProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerProfile;
      const defaults = createDefaultProfile(parsed.id || generatePlayerId(), parsed.username || 'Grandmaster');
      return {
        ...defaults,
        ...parsed,
        settings: { ...defaults.settings, ...(parsed.settings || {}) },
        unlockedItems: Array.from(new Set([...defaults.unlockedItems, ...(parsed.unlockedItems || [])])),
        missions: parsed.missions?.length ? parsed.missions : defaults.missions,
      };
    }
  } catch {
    // ignore storage errors
  }

  const fresh = createDefaultProfile(generatePlayerId(), `Strategist_${Math.floor(100 + Math.random() * 899)}`);
  saveLocalProfile(fresh);
  return fresh;
}

export function saveLocalProfile(profile: PlayerProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage errors
  }
}

function generatePlayerId(): string {
  return 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export async function syncProfileToServer(profile: PlayerProfile): Promise<PlayerProfile> {
  saveLocalProfile(profile);
  try {
    const res = await fetch('/api/profile/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (res.ok) {
      const updated = (await res.json()) as PlayerProfile;
      saveLocalProfile(updated);
      return updated;
    }
  } catch {
    // offline fallback retains local state
  }
  return profile;
}

export function applyMatchOutcomeToProfile(
  profile: PlayerProfile,
  params: {
    gameType: GameType;
    mode: PlayMode;
    opponentName: string;
    result: 'win' | 'loss' | 'draw';
    movesCount: number;
    wasExpertAi?: boolean;
  }
): { nextProfile: PlayerProfile; xpEarned: number; coinsEarned: number; ratingDelta: number } {
  const { gameType, mode, opponentName, result, movesCount, wasExpertAi } = params;
  const xpEarned = result === 'win' ? 120 : result === 'draw' ? 60 : 35;
  const coinsEarned = result === 'win' ? 90 : result === 'draw' ? 40 : 20;
  const ratingDelta = result === 'win' ? 18 : result === 'draw' ? 2 : -12;

  let xp = profile.xp + xpEarned;
  let level = profile.level;
  while (xp >= getXpForNextLevel(level)) {
    xp -= getXpForNextLevel(level);
    level++;
  }

  const nextChess =
    gameType === 'chess' ? Math.max(800, profile.chessRating + ratingDelta) : profile.chessRating;
  const nextCheckers =
    gameType === 'checkers' ? Math.max(800, profile.checkersRating + ratingDelta) : profile.checkersRating;

  const newAchievements = new Set(profile.achievements);
  const totalWins = profile.wins + (result === 'win' ? 1 : 0);

  if (result === 'win') {
    newAchievements.add('first_blood');
    if (wasExpertAi) newAchievements.add('giant_slayer');
  }
  if (mode === 'online') newAchievements.add('online_duelist');

  const chessWins =
    profile.matchHistory.filter((m) => m.gameType === 'chess' && m.result === 'win').length +
    (gameType === 'chess' && result === 'win' ? 1 : 0);
  if (chessWins >= 3) newAchievements.add('chess_tactician');

  const checkersWins =
    profile.matchHistory.filter((m) => m.gameType === 'checkers' && m.result === 'win').length +
    (gameType === 'checkers' && result === 'win' ? 1 : 0);
  if (checkersWins >= 3) newAchievements.add('checkers_kingmaker');

  if (profile.unlockedItems.length >= 4) newAchievements.add('collector');

  const nextMissions = profile.missions.map((m) => {
    if (m.id === 'play_2') return { ...m, progress: m.progress + 1 };
    if (m.id === 'win_1' && result === 'win') return { ...m, progress: m.progress + 1 };
    if (m.id === 'win_3' && result === 'win') return { ...m, progress: m.progress + 1 };
    return m;
  });

  const record: MatchRecord = {
    id: 'm_' + Date.now().toString(36),
    gameType,
    mode,
    opponentName,
    result,
    movesCount,
    ratingDelta,
    xpEarned,
    coinsEarned,
    playedAt: new Date().toISOString(),
  };

  const nextProfile: PlayerProfile = {
    ...profile,
    xp,
    level,
    coins: profile.coins + coinsEarned,
    chessRating: nextChess,
    checkersRating: nextCheckers,
    gamesPlayed: profile.gamesPlayed + 1,
    wins: totalWins,
    losses: profile.losses + (result === 'loss' ? 1 : 0),
    draws: profile.draws + (result === 'draw' ? 1 : 0),
    achievements: Array.from(newAchievements),
    missions: nextMissions,
    matchHistory: [record, ...profile.matchHistory].slice(0, 30),
  };

  return { nextProfile, xpEarned, coinsEarned, ratingDelta };
}

export function updateProfileSettings(
  profile: PlayerProfile,
  partial: Partial<PlayerSettings>
): PlayerProfile {
  return {
    ...profile,
    settings: {
      ...profile.settings,
      ...partial,
    },
  };
}
