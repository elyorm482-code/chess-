import React from 'react';
import type { PieceSymbol } from 'chess.js';
import {
  AVATARS,
  CHECKERS_SKINS,
  CHESS_SKINS,
  type CheckersSkinDef,
  type ChessSkinDef,
} from '../data/gamification';
import type { CheckersSkinId, ChessSkinId } from '../shared/types';

interface ChessPieceProps {
  type: PieceSymbol;
  color: 'w' | 'b';
  skinId?: ChessSkinId;
  className?: string;
}

export const ChessPieceSvg: React.FC<ChessPieceProps> = ({
  type,
  color,
  skinId = 'staunton_gold',
  className = 'w-full h-full',
}) => {
  const skin: ChessSkinDef = CHESS_SKINS.find((s) => s.id === skinId) || CHESS_SKINS[0];
  const fill = color === 'w' ? skin.whiteFill : skin.blackFill;
  const stroke = color === 'w' ? skin.whiteStroke : skin.blackStroke;
  const accent = color === 'w' ? skin.whiteAccent : skin.blackAccent;
  const gradId = `cp-${type}-${color}-${skin.id}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} drop-shadow-[0_5px_6px_rgba(0,0,0,0.55)] select-none pointer-events-none`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="15%" y1="10%" x2="85%" y2="95%">
          <stop offset="0%" stopColor={fill} />
          <stop offset="55%" stopColor={fill} />
          <stop offset="100%" stopColor={color === 'w' ? '#CBB994' : '#090A10'} />
        </linearGradient>
      </defs>

      {type === 'p' && (
        <g stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          <circle cx="32" cy="19" r="8.5" fill={`url(#${gradId})`} />
          <path d="M25 27c0-2 3-3 7-3s7 1 7 3c0 2-2 3-2 5 0 4 4 8 6 12H21c2-4 6-8 6-12 0-2-2-3-2-5z" fill={`url(#${gradId})`} />
          <rect x="17" y="44" width="30" height="5" rx="2.5" fill={`url(#${gradId})`} />
          <rect x="14" y="49" width="36" height="6" rx="2" fill={`url(#${gradId})`} />
          <path d="M27 16a5 5 0 0 1 4-2" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.65" />
        </g>
      )}

      {type === 'r' && (
        <g stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M18 13h6v5h5v-5h6v5h5v-5h6v10l-4 4v16l4 4H18l4-4V27l-4-4V13z" fill={`url(#${gradId})`} />
          <rect x="15" y="44" width="34" height="5" rx="2" fill={`url(#${gradId})`} />
          <rect x="13" y="49" width="38" height="6" rx="2" fill={`url(#${gradId})`} />
          <line x1="22" y1="26" x2="42" y2="26" stroke={accent} strokeWidth="1.5" opacity="0.7" />
        </g>
      )}

      {type === 'n' && (
        <g stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M21 44c1-8 5-13 8-16-2-2-5-2-8-1-2 1-4-1-4-3 1-5 5-9 10-12l1-4 4 3c4-1 9 1 12 6 3 6 4 15 2 27H21z"
            fill={`url(#${gradId})`}
          />
          <circle cx="27" cy="20" r="1.7" fill={accent} stroke="none" />
          <path d="M36 17c4 4 5 11 4 21" stroke={accent} strokeWidth="1.6" fill="none" opacity="0.65" />
          <rect x="16" y="44" width="32" height="5" rx="2" fill={`url(#${gradId})`} />
          <rect x="13" y="49" width="38" height="6" rx="2" fill={`url(#${gradId})`} />
        </g>
      )}

      {type === 'b' && (
        <g stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          <circle cx="32" cy="11" r="3.5" fill={accent} />
          <path d="M32 15c7 4 10 11 8 18-1 4-3 7-3 11H27c0-4-2-7-3-11-2-7 1-14 8-18z" fill={`url(#${gradId})`} />
          <line x1="28" y1="22" x2="36" y2="30" stroke={accent} strokeWidth="1.8" />
          <line x1="36" y1="22" x2="28" y2="30" stroke={accent} strokeWidth="1.8" />
          <rect x="17" y="44" width="30" height="5" rx="2" fill={`url(#${gradId})`} />
          <rect x="14" y="49" width="36" height="6" rx="2" fill={`url(#${gradId})`} />
        </g>
      )}

      {type === 'q' && (
        <g stroke={stroke} strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round">
          <circle cx="14" cy="18" r="2.6" fill={accent} />
          <circle cx="23" cy="13" r="2.6" fill={accent} />
          <circle cx="32" cy="11" r="3" fill={accent} />
          <circle cx="41" cy="13" r="2.6" fill={accent} />
          <circle cx="50" cy="18" r="2.6" fill={accent} />
          <path
            d="M15 21l8 11 1-16 8 15 8-15 1 16 8-11-5 23H20l-5-23z"
            fill={`url(#${gradId})`}
          />
          <rect x="17" y="44" width="30" height="5" rx="2" fill={`url(#${gradId})`} />
          <rect x="14" y="49" width="36" height="6" rx="2" fill={`url(#${gradId})`} />
        </g>
      )}

      {type === 'k' && (
        <g stroke={stroke} strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round">
          <line x1="32" y1="7" x2="32" y2="17" stroke={accent} strokeWidth="3" />
          <line x1="27" y1="11.5" x2="37" y2="11.5" stroke={accent} strokeWidth="3" />
          <path
            d="M26 20c0-3 3-5 6-5s6 2 6 5c4-2 10 0 11 6 1 5-3 11-6 18H21c-3-7-7-13-6-18 1-6 7-8 11-6z"
            fill={`url(#${gradId})`}
          />
          <path d="M23 39h18" stroke={accent} strokeWidth="1.6" opacity="0.8" />
          <rect x="17" y="44" width="30" height="5" rx="2" fill={`url(#${gradId})`} />
          <rect x="14" y="49" width="36" height="6" rx="2" fill={`url(#${gradId})`} />
        </g>
      )}
    </svg>
  );
};

interface CheckersPieceProps {
  color: 'b' | 'w';
  king: boolean;
  skinId?: CheckersSkinId;
  className?: string;
}

export const CheckersPieceSvg: React.FC<CheckersPieceProps> = ({
  color,
  king,
  skinId = 'tourmaline_discs',
  className = 'w-full h-full',
}) => {
  const skin: CheckersSkinDef =
    CHECKERS_SKINS.find((s) => s.id === skinId) || CHECKERS_SKINS[0];
  const outer = color === 'b' ? skin.darkOuter : skin.lightOuter;
  const inner = color === 'b' ? skin.darkInner : skin.lightInner;
  const rim = color === 'b' ? skin.darkRim : skin.lightRim;

  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} drop-shadow-[0_6px_7px_rgba(0,0,0,0.6)] select-none pointer-events-none`}
      aria-hidden="true"
    >
      {/* 3D thickness base */}
      <ellipse cx="32" cy="36" rx="23" ry="20" fill="#05060A" opacity="0.55" />
      <circle cx="32" cy="34" r="22" fill={outer} stroke={rim} strokeWidth="2.5" />
      {/* Top disc surface */}
      <circle cx="32" cy="30" r="22" fill={outer} stroke={rim} strokeWidth="2.4" />
      <circle cx="32" cy="30" r="16.5" fill={inner} stroke={rim} strokeWidth="1.4" opacity="0.92" />
      <circle cx="32" cy="30" r="11" fill="none" stroke={rim} strokeWidth="1.1" opacity="0.55" />
      {/* Subtle top-left sheen */}
      <path d="M16 23a18 18 0 0 1 22-9" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.3" />

      {king && (
        <g transform="translate(0, -1)">
          <path
            d="M21 36l2-11 5.5 5 3.5-7 3.5 7 5.5-5 2 11H21z"
            fill={rim}
            stroke={outer}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="23" cy="24" r="1.4" fill={rim} />
          <circle cx="32" cy="22" r="1.7" fill={rim} />
          <circle cx="41" cy="24" r="1.4" fill={rim} />
        </g>
      )}
    </svg>
  );
};

export const AvatarBadge: React.FC<{ avatarId: string; size?: 'sm' | 'md' | 'lg' }> = ({
  avatarId,
  size = 'md',
}) => {
  const avatar = AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
  const dims =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';

  return (
    <div
      className={`${dims} rounded-xl flex items-center justify-center shrink-0 border border-white/15 shadow-inner`}
      style={{ backgroundColor: avatar.bg }}
    >
      <svg viewBox="0 0 32 32" className="w-2/3 h-2/3" aria-hidden="true">
        {avatar.symbol === 'king' && (
          <path
            d="M16 4v5M13.5 6.5h5M8 24h16l1.5-8-5 3-4.5-6-4.5 6-5-3L8 24z"
            fill={avatar.accent}
            stroke={avatar.accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}
        {avatar.symbol === 'queen' && (
          <path
            d="M7 24h18l2-10-5.5 4L16 9l-5.5 9L5 14l2 10z"
            fill={avatar.accent}
            stroke={avatar.accent}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        )}
        {avatar.symbol === 'knight' && (
          <path
            d="M10 25h12c1-7 0-12-3-15l-2-3-2 2c-3 1-6 4-6 7 0 1.5 1.5 2.5 3 2-1.5 2-2 4-2 7z"
            fill={avatar.accent}
          />
        )}
        {avatar.symbol === 'rook' && (
          <path
            d="M9 7h3v3h2.5V7h3v3H20V7h3v6l-2 2v8l2 2H9l2-2v-8l-2-2V7z"
            fill={avatar.accent}
          />
        )}
        {avatar.symbol === 'crown' && (
          <path
            d="M6 22h20l1.5-10-5.5 4.5L16 8l-6 8.5L4.5 12 6 22z"
            fill={avatar.accent}
          />
        )}
        {avatar.symbol === 'shield' && (
          <path
            d="M16 5l9 3.5v7c0 5.5-3.8 10.2-9 12-5.2-1.8-9-6.5-9-12v-7L16 5z"
            fill={avatar.accent}
          />
        )}
      </svg>
    </div>
  );
};
