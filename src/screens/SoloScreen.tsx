// src/screens/SoloScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { doc, getDoc, setDoc, increment } from "firebase/firestore";
import SudokuBoard from "../components/SudokuBoard";
import { generatePuzzle, todayKey, Grid } from "../utils/sudokuGenerator";
import { showOnceAd } from "../utils/ads";
import { auth, db } from "../firebase/config";
import { theme } from "../theme";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function SoloScreen() {
  const day = todayKey();
  const { puzzle, solution } = useMemo(() => generatePuzzle(`koarc-solo:${day}`, "easy"), [day]);
  const [values, setValues] = useState<Grid>(() => puzzle.map((r) => r.slice()));
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState("");
  const [points, setPoints] = useState(0);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(Date.now());
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const uid = auth.currentUser?.uid;

  const isFull = values.every((r) => r.every((v) => v !== 0));

  useEffect(() => {
    timer.current = setInterval(() => setElapsed(Date.now() - start.current), 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  useEffect(() => {
    (async () => {
      if (!uid) return;
      const snap = await getDoc(doc(db, "players", uid));
      if (snap.exists()) setPoints(snap.data().points ?? 0);
      const doneSnap = await getDoc(doc(db, "players", uid, "daily", day));
      if (doneSnap.exists()) { setDone(true); setStatus("You already played today's puzzle. Come back tomorrow!"); }
    })();
  }, [uid, day]);

  function setCell(r: number, c: number, v: number) {
    setChecked(false);
    setValues((prev) => prev.map((row, ri) => (ri === r ? row.map((x, ci) => (ci === c ? v : x)) : row)));
  }

  async function check() {
    if (!isFull || done) { if (!isFull) setStatus("Keep going — the grid isn't full yet."); return; }
    if (timer.current) clearInterval(timer.current);
    const bad = new Set<string>();
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++)
      if (values[r]![c] !== solution[r]![c]) bad.add(`${r},${c}`);
    setWrong(bad);
    setChecked(true);
    const correct = bad.size === 0;
    const delta = correct ? 10 : -10;
    const next = Math.max(0, points + delta);
    setPoints(next);
    setDone(true);
    setStatus(correct ? `Solved in ${fmt(Date.now() - start.current)}! +10 points.` : "Not quite — check the highlighted cells. -10 points.");
    if (uid) {
      await setDoc(doc(db, "players", uid), { name: auth.currentUser?.displayName ?? "Player", points: next }, { merge: true });
      await setDoc(doc(db, "players", uid, "daily", day), { correct, ms: Date.now() - start.current });
    }
    showOnceAd();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Daily · {day}</Text>
      <Text style={styles.timer}>{fmt(elapsed)}</Text>
      <Text style={styles.points}>{points} pts</Text>
      <SudokuBoard givens={puzzle} values={values} wrongCells={wrong} checked={checked} editable={!done} onChange={setCell} />
      <View style={styles.row}>
        <Pressable style={styles.primary} onPress={check}><Text style={styles.primaryText}>Check</Text></Pressable>
        <Pressable
          style={[styles.secondary, !checked && styles.disabled]}
          disabled={!checked}
          onPress={() => setValues(solution.map((r) => r.slice()))}
        >
          <Text style={styles.secondaryText}>Reveal solution</Text>
        </Pressable>
      </View>
      <Text style={styles.status}>{status}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.bg, alignItems: "center", padding: 16, minHeight: "100%" },
  title: { fontFamily: theme.fonts.display, fontSize: 40, color: theme.colors.white },
  timer: { fontFamily: theme.fonts.display, fontSize: 34, color: theme.colors.white },
  points: { color: theme.colors.white, marginBottom: 12 },
  row: { flexDirection: "row", gap: 10, marginTop: 16 },
  primary: { backgroundColor: theme.colors.accentDeep, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 24 },
  primaryText: { color: "#fff", fontWeight: "600" },
  secondary: { backgroundColor: theme.colors.white, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 20 },
  secondaryText: { color: theme.colors.accentDeep, fontWeight: "600" },
  disabled: { opacity: 0.4 },
  status: { color: theme.colors.white, marginTop: 14, textAlign: "center" },
});
