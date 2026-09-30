// src/utils/sudokuGenerator.ts
//
// Same verified pattern as the Devvit build: fillGrid returns `number[] |
// null`, NEVER a bare array, to avoid the JavaScript truthiness bug where
// an empty/partial array is treated as "success" (documented incident:
// a real Reddit sudoku game shipped unsolvable puzzles for 3 days because
// of exactly this mistake).

export type Grid = number[][];

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(arr: T[], rng: () => number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

function canPlace(grid: Grid, row: number, col: number, val: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row]![i] === val) return false;
    if (grid[i]![col] === val) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (grid[r]![c] === val) return false;
  return true;
}

function fillGrid(rng: () => number, grid: Grid): Grid | null {
  let row = -1, col = -1;
  outer: for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r]![c] === 0) { row = r; col = c; break outer; }
    }
  }
  if (row === -1) return grid;

  for (const val of shuffled([1,2,3,4,5,6,7,8,9], rng)) {
    if (canPlace(grid, row, col, val)) {
      grid[row]![col] = val;
      const result = fillGrid(rng, grid);
      if (result) return result;
      grid[row]![col] = 0;
    }
  }
  return null;
}

function countSolutions(grid: Grid, limit = 2): number {
  const g = grid.map(r => r.slice());
  let count = 0;
  function findBestEmpty() {
    let best: { r: number; c: number; opts: number[] } | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (g[r]![c] !== 0) continue;
        const opts: number[] = [];
        for (let v = 1; v <= 9; v++) if (canPlace(g, r, c, v)) opts.push(v);
        if (!best || opts.length < best.opts.length) {
          best = { r, c, opts };
          if (opts.length <= 1) return best;
        }
      }
    }
    return best;
  }
  function solve() {
    if (count >= limit) return;
    const cell = findBestEmpty();
    if (!cell) { count++; return; }
    for (const v of cell.opts) {
      g[cell.r]![cell.c] = v;
      solve();
      g[cell.r]![cell.c] = 0;
      if (count >= limit) return;
    }
  }
  solve();
  return count;
}

function carveGivens(solved: Grid, rng: () => number, targetClues: number): Grid {
  const puzzle = solved.map(r => r.slice());
  const cells = shuffled(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number]),
    rng
  );
  let toRemove = 81 - targetClues;
  for (const [r, c] of cells) {
    if (toRemove <= 0) break;
    const backup = puzzle[r]![c];
    puzzle[r]![c] = 0;
    if (countSolutions(puzzle, 2) !== 1) puzzle[r]![c] = backup!;
    else toRemove--;
  }
  return puzzle;
}

const CLUES_BY_DIFFICULTY: Record<string, number> = { easy: 40, medium: 32, hard: 27 };

export function generatePuzzle(seedStr: string, difficulty: string): { puzzle: Grid; solution: Grid } {
  const rng = mulberry32(fnv1a(seedStr));
  const empty: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  const solved = fillGrid(rng, empty);
  if (!solved) throw new Error(`Failed to generate a solved grid for seed "${seedStr}"`);
  const clues = CLUES_BY_DIFFICULTY[difficulty] ?? 40;
  const puzzle = carveGivens(solved, rng, clues);
  return { puzzle, solution: solved };
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
