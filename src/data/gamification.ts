import type {
  BoardThemeId,
  CheckersSkinId,
  ChessSkinId,
  PlayerProfile,
} from '../shared/types';

export interface BoardThemeDef {
  id: BoardThemeId;
  name: string;
  cost: number;
  lightSquare: string;
  darkSquare: string;
  frameBg: string;
  frameBorder: string;
  coordColor: string;
  highlightLast: string;
}

export const BOARD_THEMES: BoardThemeDef[] = [
  {
    id: 'obsidian_gold',
    name: 'Obsidian & Gold',
    cost: 0,
    lightSquare: '#2A2D3D',
    darkSquare: '#141621',
    frameBg: '#0E1017',
    frameBorder: 'rgba(212, 175, 55, 0.35)',
    coordColor: '#D4AF37',
    highlightLast: 'rgba(212, 175, 55, 0.32)',
  },
  {
    id: 'royal_amethyst',
    name: 'Royal Amethyst',
    cost: 0,
    lightSquare: '#3A3256',
    darkSquare: '#1D182F',
    frameBg: '#120F20',
    frameBorder: 'rgba(168, 85, 247, 0.4)',
    coordColor: '#C084FC',
    highlightLast: 'rgba(168, 85, 247, 0.35)',
  },
  {
    id: 'emerald_velvet',
    name: 'Emerald Velvet',
    cost: 200,
    lightSquare: '#D9E4D7',
    darkSquare: '#1E4D3B',
    frameBg: '#0E241C',
    frameBorder: 'rgba(52, 211, 153, 0.35)',
    coordColor: '#A7F3D0',
    highlightLast: 'rgba(245, 158, 11, 0.38)',
  },
  {
    id: 'ivory_marble',
    name: 'Ivory & Slate Marble',
    cost: 350,
    lightSquare: '#EDE8DC',
    darkSquare: '#5C6473',
    frameBg: '#232730',
    frameBorder: 'rgba(226, 232, 240, 0.35)',
    coordColor: '#E2E8F0',
    highlightLast: 'rgba(212, 175, 55, 0.42)',
  },
  {
    id: 'mahogany_heritage',
    name: 'Mahogany Heritage',
    cost: 500,
    lightSquare: '#E7CFA8',
    darkSquare: '#6E3B23',
    frameBg: '#2C150B',
    frameBorder: 'rgba(217, 119, 6, 0.4)',
    coordColor: '#FDE68A',
    highlightLast: 'rgba(250, 204, 21, 0.38)',
  },
];

export interface ChessSkinDef {
  id: ChessSkinId;
  name: string;
  cost: number;
  whiteFill: string;
  whiteStroke: string;
  whiteAccent: string;
  blackFill: string;
  blackStroke: string;
  blackAccent: string;
}

export const CHESS_SKINS: ChessSkinDef[] = [
  {
    id: 'staunton_gold',
    name: 'Imperial Ivory & Obsidian',
    cost: 0,
    whiteFill: '#F8F4E8',
    whiteStroke: '#B89643',
    whiteAccent: '#D4AF37',
    blackFill: '#1B1D29',
    blackStroke: '#D4AF37',
    blackAccent: '#F59E0B',
  },
  {
    id: 'obsidian_crown',
    name: '24K Gilded Onyx',
    cost: 250,
    whiteFill: '#FDE68A',
    whiteStroke: '#92400E',
    whiteAccent: '#FFFFFF',
    blackFill: '#0F111A',
    blackStroke: '#A855F7',
    blackAccent: '#C084FC',
  },
  {
    id: 'amethyst_crystal',
    name: 'Amethyst & Silver',
    cost: 400,
    whiteFill: '#E2E8F0',
    whiteStroke: '#64748B',
    whiteAccent: '#FFFFFF',
    blackFill: '#4C1D95',
    blackStroke: '#DDD6FE',
    blackAccent: '#E9D5FF',
  },
  {
    id: 'neo_minimal',
    name: 'Tournament Bronze',
    cost: 300,
    whiteFill: '#FFFBEB',
    whiteStroke: '#78350F',
    whiteAccent: '#D97706',
    blackFill: '#292524',
    blackStroke: '#A8A29E',
    blackAccent: '#F59E0B',
  },
];

export interface CheckersSkinDef {
  id: CheckersSkinId;
  name: string;
  cost: number;
  darkOuter: string;
  darkInner: string;
  darkRim: string;
  lightOuter: string;
  lightInner: string;
  lightRim: string;
}

export const CHECKERS_SKINS: CheckersSkinDef[] = [
  {
    id: 'tourmaline_discs',
    name: 'Obsidian & Ivory Gold',
    cost: 0,
    darkOuter: '#181924',
    darkInner: '#2B2E42',
    darkRim: '#D4AF37',
    lightOuter: '#F5EFE2',
    lightInner: '#DFD2B8',
    lightRim: '#B48A2C',
  },
  {
    id: 'gilded_chips',
    name: 'Crimson & Gold',
    cost: 200,
    darkOuter: '#7F1D1D',
    darkInner: '#991B1B',
    darkRim: '#FBBF24',
    lightOuter: '#F8FAFC',
    lightInner: '#E2E8F0',
    lightRim: '#94A3B8',
  },
  {
    id: 'royal_lacquer',
    name: 'Royal Amethyst',
    cost: 350,
    darkOuter: '#3B0764',
    darkInner: '#581C87',
    darkRim: '#E9D5FF',
    lightOuter: '#FEF3C7',
    lightInner: '#FDE68A',
    lightRim: '#D97706',
  },
  {
    id: 'pearl_onyx',
    name: 'Emerald & Onyx',
    cost: 450,
    darkOuter: '#064E3B',
    darkInner: '#047857',
    darkRim: '#A7F3D0',
    lightOuter: '#111827',
    lightInner: '#1F2937',
    lightRim: '#F59E0B',
  },
];

export interface AvatarDef {
  id: string;
  label: string;
  bg: string;
  accent: string;
  symbol: 'king' | 'queen' | 'knight' | 'rook' | 'crown' | 'shield';
}

export const AVATARS: AvatarDef[] = [
  { id: 'king_gold', label: 'Golden King', bg: '#1A1625', accent: '#EAB308', symbol: 'king' },
  { id: 'queen_violet', label: 'Amethyst Queen', bg: '#1F1235', accent: '#A855F7', symbol: 'queen' },
  { id: 'knight_emerald', label: 'Emerald Knight', bg: '#0F241D', accent: '#10B981', symbol: 'knight' },
  { id: 'rook_crimson', label: 'Crimson Fortress', bg: '#2B1116', accent: '#F43F5E', symbol: 'rook' },
  { id: 'crown_obsidian', label: 'Sovereign Crown', bg: '#11131D', accent: '#F59E0B', symbol: 'crown' },
  { id: 'shield_azure', label: 'Cobalt Tactician', bg: '#0F1B2E', accent: '#38BDF8', symbol: 'shield' },
];

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_blood', title: 'First Victory', description: 'Win your first match in Chess or Checkers', rewardCoins: 50 },
  { id: 'chess_tactician', title: 'Chess Tactician', description: 'Win 3 Chess matches', rewardCoins: 100 },
  { id: 'checkers_kingmaker', title: 'Kingmaker', description: 'Win 3 Checkers matches', rewardCoins: 100 },
  { id: 'giant_slayer', title: 'Giant Slayer', description: 'Defeat the Expert AI opponent', rewardCoins: 200 },
  { id: 'online_duelist', title: 'Arena Challenger', description: 'Complete an Online Multiplayer match', rewardCoins: 120 },
  { id: 'tournament_champ', title: 'Grandmaster Champion', description: 'Win a Knockout Tournament', rewardCoins: 250 },
  { id: 'collector', title: 'Royal Collector', description: 'Unlock at least 4 cosmetic items', rewardCoins: 150 },
];

export interface MissionDef {
  id: string;
  title: string;
  target: number;
  rewardCoins: number;
  rewardXp: number;
}

export const DAILY_MISSIONS: MissionDef[] = [
  { id: 'play_2', title: 'Play 2 Matches', target: 2, rewardCoins: 60, rewardXp: 80 },
  { id: 'win_1', title: 'Claim 1 Victory', target: 1, rewardCoins: 80, rewardXp: 100 },
  { id: 'win_3', title: 'Achieve 3 Wins', target: 3, rewardCoins: 160, rewardXp: 200 },
];

export const DAILY_REWARD_SCHEDULE = [
  { day: 1, coins: 50, xp: 40 },
  { day: 2, coins: 75, xp: 60 },
  { day: 3, coins: 100, xp: 80 },
  { day: 4, coins: 130, xp: 100 },
  { day: 5, coins: 160, xp: 120 },
  { day: 6, coins: 200, xp: 150 },
  { day: 7, coins: 350, xp: 250 },
];

export function getRankTitle(level: number, chessRating: number): string {
  const score = level * 40 + chessRating;
  if (score >= 2100) return 'Grandmaster';
  if (score >= 1850) return 'International Master';
  if (score >= 1650) return 'FIDE Master';
  if (score >= 1450) return 'Candidate Master';
  if (score >= 1300) return 'Club Tactician';
  return 'Apprentice';
}

export function getXpForNextLevel(level: number): number {
  return 150 + (level - 1) * 100;
}

export function createDefaultProfile(id: string, username = 'Grandmaster'): PlayerProfile {
  return {
    id,
    username,
    avatarId: 'king_gold',
    xp: 0,
    level: 1,
    coins: 250,
    chessRating: 1200,
    checkersRating: 1200,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    unlockedItems: ['obsidian_gold', 'royal_amethyst', 'staunton_gold', 'tourmaline_discs'],
    achievements: [],
    dailyStreak: 0,
    lastDailyClaimDate: null,
    missions: DAILY_MISSIONS.map((m) => ({ id: m.id, progress: 0, claimed: false })),
    matchHistory: [],
    settings: {
      language: 'en',
      soundEnabled: true,
      musicEnabled: false,
      themeMode: 'dark',
      animations: 'full',
      boardTheme: 'obsidian_gold',
      chessSkin: 'staunton_gold',
      checkersSkin: 'tourmaline_discs',
    },
  };
}
