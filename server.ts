import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { Chess } from 'chess.js';
import { createServer as createViteServer } from 'vite';
import {
  applyCheckersMove,
  createInitialCheckersState,
  type CheckersMove,
  type CheckersState,
} from './src/engines/checkersEngine';
import type {
  ChatMessage,
  GameType,
  LeaderboardEntry,
  PlayerProfile,
  RoomPlayer,
} from './src/shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '.data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

interface StoreData {
  profiles: Record<string, PlayerProfile>;
  seedLeaderboard: LeaderboardEntry[];
}

const SEED_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'gm_1', username: 'Nodirbek_GM', avatarId: 'king_gold', level: 18, chessRating: 2480, checkersRating: 1940, wins: 142, gamesPlayed: 175, xp: 4820 },
  { id: 'gm_2', username: 'AmethystQueen', avatarId: 'queen_violet', level: 16, chessRating: 2345, checkersRating: 2110, wins: 118, gamesPlayed: 150, xp: 4190 },
  { id: 'gm_3', username: 'TashkentTactician', avatarId: 'knight_emerald', level: 14, chessRating: 2210, checkersRating: 2280, wins: 96, gamesPlayed: 132, xp: 3650 },
  { id: 'gm_4', username: 'ObsidianRook', avatarId: 'rook_crimson', level: 12, chessRating: 2040, checkersRating: 1890, wins: 78, gamesPlayed: 112, xp: 2940 },
  { id: 'gm_5', username: 'KarpovLegacy', avatarId: 'crown_obsidian', level: 11, chessRating: 1965, checkersRating: 1760, wins: 64, gamesPlayed: 95, xp: 2510 },
  { id: 'gm_6', username: 'SamarkandFox', avatarId: 'shield_azure', level: 9, chessRating: 1810, checkersRating: 1995, wins: 52, gamesPlayed: 84, xp: 1980 },
  { id: 'gm_7', username: 'SilverKnight88', avatarId: 'knight_emerald', level: 7, chessRating: 1640, checkersRating: 1580, wins: 39, gamesPlayed: 68, xp: 1420 },
  { id: 'gm_8', username: 'VelvetCheckers', avatarId: 'queen_violet', level: 6, chessRating: 1420, checkersRating: 1790, wins: 31, gamesPlayed: 55, xp: 1160 },
];

function loadStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as StoreData;
      return {
        profiles: parsed.profiles || {},
        seedLeaderboard: parsed.seedLeaderboard?.length ? parsed.seedLeaderboard : SEED_LEADERBOARD,
      };
    }
  } catch (err) {
    console.error('Failed to read store, initializing fresh:', err);
  }
  return { profiles: {}, seedLeaderboard: SEED_LEADERBOARD };
}

function saveStore(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpPath = STORE_PATH + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, STORE_PATH);
  } catch (err) {
    console.error('Failed to persist store:', err);
  }
}

const store = loadStore();

// --- Server-Authoritative Multiplayer Rooms ---

interface MultiplayerRoom {
  code: string;
  gameType: GameType;
  timeControlSeconds: number;
  players: { w: RoomPlayer | null; b: RoomPlayer | null };
  sockets: Map<string, WebSocket>;
  chess: Chess;
  chessSanHistory: string[];
  lastChessMove: { from: string; to: string } | null;
  checkersState: CheckersState;
  turn: 'w' | 'b'; // For checkers: 'b' (Dark) moves first; for chess: 'w' moves first
  clocks: { w: number; b: number };
  lastTickMs: number | null;
  status: 'waiting' | 'playing' | 'finished';
  winner: 'w' | 'b' | 'draw' | null;
  reason: string | null;
  drawOfferBy: 'w' | 'b' | null;
  rematchRequests: Set<string>;
  chat: ChatMessage[];
  createdAt: number;
}

const rooms = new Map<string, MultiplayerRoom>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (rooms.has(code));
  return code;
}

function serializeRoom(room: MultiplayerRoom) {
  return {
    code: room.code,
    gameType: room.gameType,
    timeControlSeconds: room.timeControlSeconds,
    players: room.players,
    chessFen: room.chess.fen(),
    chessSanHistory: room.chessSanHistory,
    lastChessMove: room.lastChessMove,
    checkersState: room.checkersState,
    turn: room.turn,
    clocks: room.clocks,
    status: room.status,
    winner: room.winner,
    reason: room.reason,
    drawOfferBy: room.drawOfferBy,
    rematchCount: room.rematchRequests.size,
    rematchPlayerIds: Array.from(room.rematchRequests),
    chat: room.chat,
  };
}

function broadcastRoom(room: MultiplayerRoom, extraEvent?: { type: string; fx?: string }) {
  const payload = JSON.stringify({
    type: 'room:state',
    room: serializeRoom(room),
    fx: extraEvent?.fx,
  });
  for (const [, ws] of room.sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

function sendError(ws: WebSocket, message: string) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'room:error', message }));
  }
}

// Tick active multiplayer clocks every second
setInterval(() => {
  const now = Date.now();
  for (const [, room] of rooms) {
    if (room.status === 'playing' && room.lastTickMs !== null) {
      const elapsed = Math.floor((now - room.lastTickMs) / 1000);
      if (elapsed >= 1) {
        room.lastTickMs = now;
        const activeSide = room.turn;
        room.clocks[activeSide] = Math.max(0, room.clocks[activeSide] - elapsed);
        if (room.clocks[activeSide] <= 0) {
          room.status = 'finished';
          room.winner = activeSide === 'w' ? 'b' : 'w';
          room.reason = 'timeout';
          broadcastRoom(room, { type: 'room:state', fx: 'gameover' });
        } else {
          broadcastRoom(room);
        }
      }
    }
    // Prune stale rooms older than 4 hours
    if (now - room.createdAt > 4 * 60 * 60 * 1000 && room.sockets.size === 0) {
      rooms.delete(room.code);
    }
  }
}, 1000);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    let boundRoomCode: string | null = null;
    let boundPlayerId: string | null = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as Record<string, unknown>;
        const type = String(msg.type || '');

        if (type === 'room:create') {
          const gameType = (msg.gameType === 'checkers' ? 'checkers' : 'chess') as GameType;
          const timeControlSeconds = Math.max(60, Math.min(3600, Number(msg.timeControlSeconds) || 300));
          const playerInput = (msg.player || {}) as Partial<RoomPlayer>;
          const playerId = String(playerInput.id || 'p_' + Math.random().toString(36).slice(2, 8));
          const code = generateRoomCode();

          // In Chess, White ('w') moves first; in Checkers, Dark ('b') moves first.
          // Host always starts as the first mover so host plays immediately when guest joins.
          const hostSide: 'w' | 'b' = gameType === 'chess' ? 'w' : 'b';
          const hostPlayer: RoomPlayer = {
            id: playerId,
            username: String(playerInput.username || 'Host').slice(0, 24),
            avatarId: String(playerInput.avatarId || 'king_gold'),
            rating: Number(playerInput.rating) || 1200,
            side: hostSide,
            connected: true,
          };

          const room: MultiplayerRoom = {
            code,
            gameType,
            timeControlSeconds,
            players: {
              w: hostSide === 'w' ? hostPlayer : null,
              b: hostSide === 'b' ? hostPlayer : null,
            },
            sockets: new Map([[playerId, ws]]),
            chess: new Chess(),
            chessSanHistory: [],
            lastChessMove: null,
            checkersState: createInitialCheckersState(),
            turn: gameType === 'chess' ? 'w' : 'b',
            clocks: { w: timeControlSeconds, b: timeControlSeconds },
            lastTickMs: null,
            status: 'waiting',
            winner: null,
            reason: null,
            drawOfferBy: null,
            rematchRequests: new Set(),
            chat: [],
            createdAt: Date.now(),
          };

          rooms.set(code, room);
          boundRoomCode = code;
          boundPlayerId = playerId;
          broadcastRoom(room);
          return;
        }

        if (type === 'room:join') {
          const code = String(msg.code || '').trim().toUpperCase();
          const room = rooms.get(code);
          if (!room) {
            sendError(ws, 'Room not found. Check the 6-character code.');
            return;
          }

          const playerInput = (msg.player || {}) as Partial<RoomPlayer>;
          const playerId = String(playerInput.id || 'p_' + Math.random().toString(36).slice(2, 8));

          // Check if reconnecting to existing seat
          if (room.players.w?.id === playerId) {
            room.players.w.connected = true;
            room.sockets.set(playerId, ws);
            boundRoomCode = code;
            boundPlayerId = playerId;
            broadcastRoom(room);
            return;
          }
          if (room.players.b?.id === playerId) {
            room.players.b.connected = true;
            room.sockets.set(playerId, ws);
            boundRoomCode = code;
            boundPlayerId = playerId;
            broadcastRoom(room);
            return;
          }

          // Assign open seat
          const openSide: 'w' | 'b' | null = !room.players.w ? 'w' : !room.players.b ? 'b' : null;
          if (!openSide) {
            sendError(ws, 'This room is already full.');
            return;
          }

          room.players[openSide] = {
            id: playerId,
            username: String(playerInput.username || 'Challenger').slice(0, 24),
            avatarId: String(playerInput.avatarId || 'queen_violet'),
            rating: Number(playerInput.rating) || 1200,
            side: openSide,
            connected: true,
          };
          room.sockets.set(playerId, ws);
          boundRoomCode = code;
          boundPlayerId = playerId;

          if (room.players.w && room.players.b && room.status === 'waiting') {
            room.status = 'playing';
            room.lastTickMs = Date.now();
          }

          broadcastRoom(room);
          return;
        }

        if (type === 'game:move') {
          const code = String(msg.code || boundRoomCode || '').toUpperCase();
          const room = rooms.get(code);
          if (!room || room.status !== 'playing') return;

          const playerId = String(msg.playerId || boundPlayerId || '');
          const mover =
            room.players.w?.id === playerId
              ? room.players.w
              : room.players.b?.id === playerId
                ? room.players.b
                : null;
          if (!mover || mover.side !== room.turn) {
            sendError(ws, 'Not your turn.');
            return;
          }

          let fx = 'move';

          if (room.gameType === 'chess') {
            const movePayload = msg.move as { from: string; to: string; promotion?: string };
            try {
              const result = room.chess.move({
                from: movePayload.from,
                to: movePayload.to,
                promotion: movePayload.promotion || 'q',
              });
              room.chessSanHistory.push(result.san);
              room.lastChessMove = { from: result.from, to: result.to };
              room.turn = room.chess.turn();
              room.lastTickMs = Date.now();
              room.drawOfferBy = null;

              if (room.chess.isCheckmate()) {
                room.status = 'finished';
                room.winner = mover.side;
                room.reason = 'checkmate';
                fx = 'gameover';
              } else if (room.chess.isDraw()) {
                room.status = 'finished';
                room.winner = 'draw';
                room.reason = room.chess.isStalemate()
                  ? 'stalemate'
                  : room.chess.isThreefoldRepetition()
                    ? 'repetition'
                    : room.chess.isInsufficientMaterial()
                      ? 'insufficient'
                      : 'fifty_moves';
                fx = 'gameover';
              } else if (room.chess.isCheck()) {
                fx = 'check';
              } else if (result.isCapture()) {
                fx = 'capture';
              } else if (result.isPromotion()) {
                fx = 'promote';
              }
            } catch {
              sendError(ws, 'Illegal chess move rejected by server.');
              return;
            }
          } else {
            const movePayload = msg.move as CheckersMove;
            try {
              const nextState = applyCheckersMove(room.checkersState, movePayload);
              room.checkersState = nextState;
              room.turn = nextState.turn;
              room.lastTickMs = Date.now();
              room.drawOfferBy = null;

              if (nextState.winner !== null) {
                room.status = 'finished';
                room.winner = nextState.winner;
                room.reason = nextState.reason;
                fx = 'gameover';
              } else if (movePayload.promoted) {
                fx = 'promote';
              } else if (movePayload.captured) {
                fx = 'capture';
              }
            } catch {
              sendError(ws, 'Illegal checkers move rejected by server.');
              return;
            }
          }

          broadcastRoom(room, { type: 'room:state', fx });
          return;
        }

        if (type === 'game:resign') {
          const code = String(msg.code || boundRoomCode || '').toUpperCase();
          const room = rooms.get(code);
          if (!room || room.status !== 'playing') return;
          const playerId = String(msg.playerId || boundPlayerId || '');
          const side =
            room.players.w?.id === playerId ? 'w' : room.players.b?.id === playerId ? 'b' : null;
          if (!side) return;

          room.status = 'finished';
          room.winner = side === 'w' ? 'b' : 'w';
          room.reason = 'resigned';
          broadcastRoom(room, { type: 'room:state', fx: 'gameover' });
          return;
        }

        if (type === 'game:draw_offer') {
          const code = String(msg.code || boundRoomCode || '').toUpperCase();
          const room = rooms.get(code);
          if (!room || room.status !== 'playing') return;
          const playerId = String(msg.playerId || boundPlayerId || '');
          const side =
            room.players.w?.id === playerId ? 'w' : room.players.b?.id === playerId ? 'b' : null;
          if (!side) return;
          room.drawOfferBy = side;
          broadcastRoom(room);
          return;
        }

        if (type === 'game:draw_respond') {
          const code = String(msg.code || boundRoomCode || '').toUpperCase();
          const room = rooms.get(code);
          if (!room || room.status !== 'playing' || !room.drawOfferBy) return;
          const accept = Boolean(msg.accept);
          if (accept) {
            room.status = 'finished';
            room.winner = 'draw';
            room.reason = 'draw_agreed';
            room.drawOfferBy = null;
            broadcastRoom(room, { type: 'room:state', fx: 'gameover' });
          } else {
            room.drawOfferBy = null;
            broadcastRoom(room);
          }
          return;
        }

        if (type === 'game:rematch') {
          const code = String(msg.code || boundRoomCode || '').toUpperCase();
          const room = rooms.get(code);
          if (!room || room.status !== 'finished') return;
          const playerId = String(msg.playerId || boundPlayerId || '');
          if (!playerId) return;

          room.rematchRequests.add(playerId);
          if (room.players.w && room.players.b && room.rematchRequests.size >= 2) {
            // Swap sides for fair rematch
            const prevW = room.players.w;
            const prevB = room.players.b;
            room.players.w = { ...prevB, side: 'w' };
            room.players.b = { ...prevW, side: 'b' };

            room.chess = new Chess();
            room.chessSanHistory = [];
            room.lastChessMove = null;
            room.checkersState = createInitialCheckersState();
            room.turn = room.gameType === 'chess' ? 'w' : 'b';
            room.clocks = { w: room.timeControlSeconds, b: room.timeControlSeconds };
            room.lastTickMs = Date.now();
            room.status = 'playing';
            room.winner = null;
            room.reason = null;
            room.drawOfferBy = null;
            room.rematchRequests.clear();
          }
          broadcastRoom(room);
          return;
        }

        if (type === 'game:chat') {
          const code = String(msg.code || boundRoomCode || '').toUpperCase();
          const room = rooms.get(code);
          if (!room) return;
          const playerId = String(msg.playerId || boundPlayerId || '');
          const sender =
            room.players.w?.id === playerId
              ? room.players.w
              : room.players.b?.id === playerId
                ? room.players.b
                : null;
          const text = String(msg.text || '').trim().slice(0, 140);
          if (!sender || !text) return;

          room.chat = [
            ...room.chat.slice(-29),
            {
              id: 'c_' + Date.now().toString(36),
              senderId: sender.id,
              senderName: sender.username,
              text,
              timestamp: new Date().toISOString(),
            },
          ];
          broadcastRoom(room);
        }
      } catch (err) {
        console.error('WS message error:', err);
      }
    });

    ws.on('close', () => {
      if (boundRoomCode && boundPlayerId) {
        const room = rooms.get(boundRoomCode);
        if (room) {
          room.sockets.delete(boundPlayerId);
          if (room.players.w?.id === boundPlayerId) room.players.w.connected = false;
          if (room.players.b?.id === boundPlayerId) room.players.b.connected = false;
          broadcastRoom(room);
        }
      }
    });
  });

  // --- REST API Routes ---

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, activeRooms: rooms.size });
  });

  app.get('/api/profile/:id', (req, res) => {
    const profile = store.profiles[req.params.id];
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json(profile);
  });

  app.post('/api/profile/sync', (req, res) => {
    const incoming = req.body as PlayerProfile;
    if (!incoming || !incoming.id) {
      res.status(400).json({ error: 'Invalid profile payload' });
      return;
    }
    const sanitized: PlayerProfile = {
      ...incoming,
      username: String(incoming.username || 'Strategist').trim().slice(0, 24) || 'Strategist',
    };
    store.profiles[sanitized.id] = sanitized;
    saveStore(store);
    res.json(sanitized);
  });

  app.get('/api/leaderboard', (_req, res) => {
    const playerEntries: LeaderboardEntry[] = Object.values(store.profiles).map((p) => ({
      id: p.id,
      username: p.username,
      avatarId: p.avatarId,
      level: p.level,
      chessRating: p.chessRating,
      checkersRating: p.checkersRating,
      wins: p.wins,
      gamesPlayed: p.gamesPlayed,
      xp: p.xp + (p.level - 1) * 200,
    }));

    const merged = [...store.seedLeaderboard];
    for (const pe of playerEntries) {
      const idx = merged.findIndex((x) => x.id === pe.id);
      if (idx >= 0) merged[idx] = pe;
      else merged.push(pe);
    }

    res.json(merged);
  });

  app.get('/api/rooms/:code', (req, res) => {
    const code = String(req.params.code || '').toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json(serializeRoom(room));
  });

  // Mount Vite middleware in development, static dist in production
  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Chess & Checkers Ultimate running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
