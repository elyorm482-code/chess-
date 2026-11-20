import React, { useState } from 'react';
import { Check, Copy, Link2, Loader2, LogIn, Plus, Users, Wifi, WifiOff } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type { GameType, PlayerProfile } from '../shared/types';
import { soundEngine } from '../utils/soundEngine';
import type { OnlineRoomSnapshot } from './GameArena';
import { AvatarBadge } from './PieceIcons';

interface OnlineArenaProps {
  t: Translations;
  profile: PlayerProfile;
  wsConnected: boolean;
  room: OnlineRoomSnapshot | null;
  errorMsg: string | null;
  onCreateRoom: (gameType: GameType, timeControlSeconds: number) => void;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
  initialRoomCode?: string;
}

export const OnlineArena: React.FC<OnlineArenaProps> = ({
  t,
  wsConnected,
  room,
  errorMsg,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  initialRoomCode = '',
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType>('chess');
  const [timeControl, setTimeControl] = useState<number>(300);
  const [joinCode, setJoinCode] = useState<string>(initialRoomCode);
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = () => {
    if (!room) return;
    soundEngine.playClick();
    const url = `${window.location.origin}/?room=${room.code}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (room && room.status === 'waiting') {
    const host = room.players.w || room.players.b;
    return (
      <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#11131C] border border-amber-500/30 shadow-2xl text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-500 mb-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t.online.waitingOpponent}</span>
        </div>

        <h2 className="font-display text-2xl font-bold">{t.online.roomCode}</h2>
        <div
          className="my-4 py-4 px-6 rounded-xl bg-slate-100 dark:bg-[#08090E] border border-amber-500/40 font-mono-nums text-4xl font-bold tracking-[0.28em] text-amber-500 select-all"
          data-testid="room-code-display"
        >
          {room.code}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t.online.shareCodeHint}
        </p>

        {host && (
          <div className="flex items-center justify-center gap-3 mb-6 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <AvatarBadge avatarId={host.avatarId} size="sm" />
            <span className="font-semibold text-sm">{host.username}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-purple-400 font-medium">
              {room.gameType === 'chess' ? t.game.chess : t.game.checkers}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleCopyInvite}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t.online.copied : t.online.copyInvite}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onLeaveRoom();
            }}
            className="py-2.5 px-4 rounded-xl font-semibold text-sm bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 transition-colors"
          >
            {t.online.leaveRoom}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.online.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.online.subtitle}</p>
        </div>
        <div
          className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border ${
            wsConnected
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          {wsConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{wsConnected ? t.online.connected : t.online.disconnected}</span>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-sm font-medium"
        >
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Room */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 shadow-xl flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Plus className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold">{t.online.createRoom}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  {t.tournament.chooseGame}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(['chess', 'checkers'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedGame(g);
                      }}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${
                        selectedGame === g
                          ? 'bg-amber-500/15 border-amber-500 text-amber-500'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {g === 'chess' ? t.game.chess : t.game.checkers}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  {t.home.timeControl}
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[180, 300, 600, 900].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setTimeControl(sec);
                      }}
                      className={`py-2 rounded-lg font-mono-nums text-xs font-semibold border transition-all ${
                        timeControl === sec
                          ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {sec / 60}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!wsConnected}
            onClick={() => {
              soundEngine.playClick();
              onCreateRoom(selectedGame, timeControl);
            }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>{t.online.createRoom}</span>
          </button>
        </section>

        {/* Join Room */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/10 shadow-xl flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Link2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold">{t.online.joinRoom}</h3>
            </div>

            <form
              id="join-room-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!joinCode.trim()) return;
                soundEngine.playClick();
                onJoinRoom(joinCode.trim().toUpperCase());
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="room-code-input"
                  className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2"
                >
                  {t.online.roomCode}
                </label>
                <input
                  id="room-code-input"
                  type="text"
                  maxLength={8}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder={t.online.enterCode}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#08090E] border border-slate-200 dark:border-white/15 font-mono-nums text-lg tracking-widest uppercase focus:outline-none focus:border-purple-500"
                />
              </div>
            </form>
          </div>

          <button
            type="submit"
            form="join-room-form"
            disabled={!wsConnected || joinCode.trim().length < 4}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-all inline-flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{t.online.joinRoom}</span>
          </button>
        </section>
      </div>
    </div>
  );
};
