// src/firebase/rooms.ts
import {
  ref,
  set,
  get,
  push,
  onValue,
  update,
  serverTimestamp,
  runTransaction,
  off,
} from "firebase/database";
import { rtdb } from "./config";
import { generatePuzzle, Grid } from "../utils/sudokuGenerator";

export type RoomMode = "race" | "coop";
export type RoomVisibility = "public" | "private";

export interface RoomPlayer {
  uid: string;
  name: string;
  joinedAt: number;
  finishedAt?: number;   // race mode: when they finished (ms since room start)
  progress?: number;     // 0-81, cells filled — for a simple progress bar
}

export interface Room {
  code: string;               // 6-char join code, works for public or private
  hostUid: string;
  mode: RoomMode;
  visibility: RoomVisibility;
  maxPlayers: number;          // hard cap: 10
  status: "waiting" | "active" | "finished";
  puzzle: Grid;
  solution: Grid;              // only readable by server-side rules ideally;
                                // see README security-rules note
  players: Record<string, RoomPlayer>;
  sharedGrid?: Grid;            // co-op mode only: the one grid everyone edits
  createdAt: number;
}

const MAX_PLAYERS = 10;

function randomRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createRoom(opts: {
  hostUid: string;
  hostName: string;
  mode: RoomMode;
  visibility: RoomVisibility;
  difficulty: string;
}): Promise<string> {
  const code = randomRoomCode();
  const seed = `room:${code}:${Date.now()}`;
  const { puzzle, solution } = generatePuzzle(seed, opts.difficulty);

  const room: Room = {
    code,
    hostUid: opts.hostUid,
    mode: opts.mode,
    visibility: opts.visibility,
    maxPlayers: MAX_PLAYERS,
    status: "waiting",
    puzzle,
    solution,
    players: {
      [opts.hostUid]: { uid: opts.hostUid, name: opts.hostName, joinedAt: Date.now(), progress: 0 },
    },
    sharedGrid: opts.mode === "coop" ? puzzle.map(r => r.slice()) : undefined,
    createdAt: Date.now(),
  };

  await set(ref(rtdb, `rooms/${code}`), room);

  if (opts.visibility === "public") {
    await set(ref(rtdb, `publicRoomIndex/${code}`), {
      code,
      mode: opts.mode,
      difficulty: opts.difficulty,
      playerCount: 1,
      maxPlayers: MAX_PLAYERS,
      createdAt: Date.now(),
    });
  }

  return code;
}

export async function joinRoom(code: string, uid: string, name: string): Promise<void> {
  const roomRef = ref(rtdb, `rooms/${code}`);
  const snap = await get(roomRef);
  if (!snap.exists()) throw new Error("Room not found. Check the code and try again.");
  const room = snap.val() as Room;

  const currentCount = Object.keys(room.players || {}).length;
  if (currentCount >= MAX_PLAYERS) throw new Error("This room is full (10/10 players).");
  if (room.status !== "waiting") throw new Error("This game has already started.");

  await update(ref(rtdb, `rooms/${code}/players/${uid}`), {
    uid, name, joinedAt: Date.now(), progress: 0,
  });

  if (room.visibility === "public") {
    await update(ref(rtdb, `publicRoomIndex/${code}`), { playerCount: currentCount + 1 });
  }
}

export function listenToRoom(code: string, callback: (room: Room | null) => void) {
  const roomRef = ref(rtdb, `rooms/${code}`);
  onValue(roomRef, (snap) => callback(snap.exists() ? (snap.val() as Room) : null));
  return () => off(roomRef);
}

export function listenToPublicRooms(callback: (rooms: any[]) => void) {
  const indexRef = ref(rtdb, "publicRoomIndex");
  onValue(indexRef, (snap) => {
    const val = snap.val() || {};
    callback(Object.values(val));
  });
  return () => off(indexRef);
}

export async function startRoom(code: string): Promise<void> {
  await update(ref(rtdb, `rooms/${code}`), { status: "active", startedAt: Date.now() });
}

// ---- Race mode: each player fills their own copy, first correct finish wins ----
export async function submitRaceProgress(code: string, uid: string, filledCount: number) {
  await update(ref(rtdb, `rooms/${code}/players/${uid}`), { progress: filledCount });
}

export async function submitRaceFinish(code: string, uid: string, elapsedMs: number, correct: boolean) {
  if (!correct) return; // only a correct grid can claim a finish
  await runTransaction(ref(rtdb, `rooms/${code}/players/${uid}/finishedAt`), (current) => {
    if (current) return current; // already finished, don't overwrite
    return elapsedMs;
  });
}

// ---- Co-op mode: everyone edits the same shared grid ----
export async function updateSharedCell(code: string, row: number, col: number, value: number) {
  await update(ref(rtdb, `rooms/${code}/sharedGrid/${row}`), { [col]: value });
}

export function leaveRoom(code: string, uid: string) {
  return set(ref(rtdb, `rooms/${code}/players/${uid}`), null);
}
