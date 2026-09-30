// src/screens/RoomScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Share } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import SudokuBoard from "../components/SudokuBoard";
import { auth } from "../firebase/config";
import { Room, listenToRoom, startRoom, submitRaceProgress, submitRaceFinish, updateSharedCell, leaveRoom } from "../firebase/rooms";
import { Grid } from "../utils/sudokuGenerator";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Room">;

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function RoomScreen({ route, navigation }: Props) {
  const { code } = route.params;
  const uid = auth.currentUser!.uid;
  const [room, setRoom] = useState<Room | null>(null);
  const [mine, setMine] = useState<Grid | null>(null);
  const [status, setStatus] = useState("");
  const [now, setNow] = useState(Date.now());
  const finished = useRef(false);

  useEffect(() => listenToRoom(code, setRoom), [code]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => () => { leaveRoom(code, uid); }, [code, uid]);

  useEffect(() => {
    if (room && room.mode === "race" && !mine) setMine(room.puzzle.map((r) => r.slice()));
  }, [room, mine]);

  const players = useMemo(() => Object.values(room?.players ?? {}), [room]);
  const startedAt = (room as any)?.startedAt as number | undefined;
  const elapsed = startedAt ? now - startedAt : 0;

  if (!room) return <View style={styles.container}><Text style={styles.white}>Loading room...</Text></View>;

  const isHost = room.hostUid === uid;

  if (room.status === "waiting") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Room {room.code}</Text>
        <Text style={styles.white}>{room.mode === "race" ? "Race" : "Co-op"} · {room.visibility}</Text>
        <Pressable onPress={() => Share.share({ message: `Join my Koarc Sudoku room! Code: ${room.code}` })}>
          <Text style={styles.link}>Share code</Text>
        </Pressable>
        <View style={styles.list}>
          {players.map((p) => <Text key={p.uid} style={styles.player}>• {p.name}{p.uid === room.hostUid ? " (host)" : ""}</Text>)}
        </View>
        <Text style={styles.white}>{players.length}/{room.maxPlayers} players</Text>
        {isHost ? (
          <Pressable style={styles.primary} onPress={() => startRoom(code)}>
            <Text style={styles.primaryText}>Start game</Text>
          </Pressable>
        ) : <Text style={styles.white}>Waiting for the host to start...</Text>}
      </View>
    );
  }

  if (room.mode === "race" && mine) {
    const board = mine;
    const filled = board.flat().filter((v) => v !== 0).length;
    const ranked = players.filter((p) => p.finishedAt).sort((a, b) => a.finishedAt! - b.finishedAt!);

    const onChange = (r: number, c: number, v: number) => {
      const next = board.map((row, ri) => (ri === r ? row.map((x, ci) => (ci === c ? v : x)) : row));
      setMine(next);
      submitRaceProgress(code, uid, next.flat().filter((x) => x !== 0).length);
      const full = next.every((row) => row.every((x) => x !== 0));
      if (full && !finished.current) {
        const ok = next.every((row, ri) => row.every((x, ci) => x === room.solution[ri]![ci]));
        if (ok) { finished.current = true; submitRaceFinish(code, uid, Date.now() - startedAt!, true); setStatus("Solved! Waiting for results..."); }
        else setStatus("The grid is full but something is wrong — keep looking.");
      }
    };

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Race</Text>
        <Text style={styles.timer}>{fmt(elapsed)}</Text>
        <SudokuBoard givens={room.puzzle} values={board} editable={!finished.current} onChange={onChange} />
        <Text style={styles.white}>{filled}/81 filled</Text>
        <Text style={styles.status}>{status}</Text>
        <View style={styles.list}>
          {players.map((p) => (
            <Text key={p.uid} style={styles.player}>
              {p.name}: {p.finishedAt ? `finished ${fmt(p.finishedAt)}` : `${p.progress ?? 0}/81`}
            </Text>
          ))}
        </View>
        {ranked[0] && <Text style={styles.winner}>🏆 {ranked[0].name} wins in {fmt(ranked[0].finishedAt!)}</Text>}
      </ScrollView>
    );
  }

  if (room.mode === "coop" && room.sharedGrid) {
    const grid = room.sharedGrid;
    const full = grid.every((row) => row.every((x) => x !== 0));
    const solved = full && grid.every((row, ri) => row.every((x, ci) => x === room.solution[ri]![ci]));
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Co-op</Text>
        <Text style={styles.timer}>{fmt(elapsed)}</Text>
        <SudokuBoard givens={room.puzzle} values={grid} editable={!solved} onChange={(r, c, v) => updateSharedCell(code, r, c, v)} />
        <Text style={styles.white}>{players.length} playing together</Text>
        {solved && <Text style={styles.winner}>🎉 Solved together in {fmt(elapsed)}!</Text>}
        {full && !solved && <Text style={styles.status}>The grid is full but something is off — talk it through!</Text>}
      </ScrollView>
    );
  }

  return <View style={styles.container}><Text style={styles.white}>Loading...</Text></View>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center", padding: 16, gap: 8 },
  title: { fontFamily: theme.fonts.display, fontSize: 48, color: theme.colors.white },
  timer: { fontFamily: theme.fonts.display, fontSize: 32, color: theme.colors.white },
  white: { color: theme.colors.white },
  link: { color: theme.colors.white, textDecorationLine: "underline", marginVertical: 6 },
  list: { marginVertical: 10, alignSelf: "stretch", paddingHorizontal: 30 },
  player: { color: theme.colors.white, paddingVertical: 2 },
  status: { color: theme.colors.white, textAlign: "center" },
  winner: { color: theme.colors.white, fontWeight: "700", fontSize: 16, marginTop: 8 },
  primary: { backgroundColor: theme.colors.accentDeep, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 40 },
  primaryText: { color: "#fff", fontWeight: "600" },
});
