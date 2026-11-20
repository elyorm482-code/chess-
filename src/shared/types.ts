export type GameType = 'chess' | 'checkers';
export type PlayMode = 'ai' | 'local' | 'friends' | 'online' | 'tournament';
export type AIDifficulty = 'beginner' | 'easy' | 'medium' | 'expert';
export type Language = 'en' | 'uz' | 'ru';
export type ThemeMode = 'dark' | 'light';
export type AnimationLevel = 'full' | 'reduced';

export type BoardThemeId =
  | 'obsidian_gold'
  | 'royal_amethyst'
  | 'emerald_velvet'
  | 'ivory_marble'
  | 'mahogany_heritage';

export type ChessSkinId =
  | 'staunton_gold'
  | 'obsidian_crown'
  | 'amethyst_crystal'
  | 'neo_minimal';

export type CheckersSkinId =
  | 'tourmaline_discs'
  | 'gilded_chips'
  | 'royal_lacquer'
  | 'pearl_onyx';

export interface PlayerSettings {
  language: Language;
  soundEnabled: boolean;
  musicEnabled: boolean;
  themeMode: ThemeMode;
  animations: AnimationLevel;
  boardTheme: BoardThemeId;
  chessSkin: ChessSkinId;
  checkersSkin: CheckersSkinId;
}

export interface MatchRecord {
  id: string;
  gameType: GameType;
  mode: PlayMode;
  opponentName: string;
  result: 'win' | 'loss' | 'draw';
  movesCount: number;
  ratingDelta: number;
  xpEarned: number;
  coinsEarned: number;
  playedAt: string;
}

export interface MissionState {
  id: string;
  progress: number;
  claimed: boolean;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatarId: string;
  xp: number;
  level: number;
  coins: number;
  chessRating: number;
  checkersRating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  unlockedItems: string[];
  achievements: string[];
  dailyStreak: number;
  lastDailyClaimDate: string | null;
  missions: MissionState[];
  matchHistory: MatchRecord[];
  settings: PlayerSettings;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatarId: string;
  level: number;
  chessRating: number;
  checkersRating: number;
  wins: number;
  gamesPlayed: number;
  xp: number;
}

export interface RoomPlayer {
  id: string;
  username: string;
  avatarId: string;
  rating: number;
  side: 'w' | 'b';
  connected: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export type AppScreen =
  | 'home'
  | 'play_setup'
  | 'game'
  | 'online'
  | 'tournament'
  | 'leaderboard'
  | 'profile'
  | 'shop'
  | 'settings';
