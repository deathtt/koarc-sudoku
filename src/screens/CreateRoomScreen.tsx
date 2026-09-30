// src/screens/CreateRoomScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import { auth } from "../firebase/config";
import { createRoom, RoomMode, RoomVisibility } from "../firebase/rooms";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "CreateRoom">;

function Choice<T extends string>({ label, options, value, onChange }: {
  label: string; options: { v: T; t: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <View style={{ width: "100%", maxWidth: 340, marginBottom: 18 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {options.map((o) => (
          <Pressable key={o.v} onPress={() => onChange(o.v)} style={[styles.chip, value === o.v && styles.chipOn]}>
            <Text style={[styles.chipText, value === o.v && styles.chipTextOn]}>{o.t}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function CreateRoomScreen({ navigation }: Props) {
  const [mode, setMode] = useState<RoomMode>("race");
  const [visibility, setVisibility] = useState<RoomVisibility>("private");
  const [difficulty, setDifficulty] = useState("easy");
  const [busy, setBusy] = useState(false);

  async function create() {
    const user = auth.currentUser;
    if (!user) return;
    setBusy(true);
    try {
      const code = await createRoom({
        hostUid: user.uid, hostName: user.displayName ?? "Player", mode, visibility, difficulty,
      });
      navigation.replace("Room", { code });
    } catch (e: any) {
      Alert.alert("Couldn't create room", e?.message ?? "Try again.");
    } finally { setBusy(false); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New room</Text>
      <Choice label="Mode" value={mode} onChange={setMode}
        options={[{ v: "race", t: "Race" }, { v: "coop", t: "Co-op" }]} />
      <Choice label="Who can join" value={visibility} onChange={setVisibility}
        options={[{ v: "private", t: "Private (code)" }, { v: "public", t: "Public" }]} />
      <Choice label="Difficulty" value={difficulty} onChange={setDifficulty}
        options={[{ v: "easy", t: "Easy" }, { v: "medium", t: "Medium" }, { v: "hard", t: "Hard" }]} />
      <Text style={styles.hint}>
        {mode === "race" ? "Everyone solves the same puzzle. Fastest correct grid wins." : "Everyone fills one shared grid together, live."}
        {"\n"}Up to 10 players.
      </Text>
      <Pressable style={styles.primary} onPress={create} disabled={busy}>
        <Text style={styles.primaryText}>{busy ? "Creating..." : "Create room"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontFamily: theme.fonts.display, fontSize: 56, color: theme.colors.white, marginBottom: 16 },
  label: { color: theme.colors.white, marginBottom: 6, fontSize: 13 },
  chip: { flex: 1, backgroundColor: "rgba(255,255,255,0.35)", borderRadius: 20, paddingVertical: 10, alignItems: "center" },
  chipOn: { backgroundColor: theme.colors.white },
  chipText: { color: theme.colors.white, fontWeight: "600" },
  chipTextOn: { color: theme.colors.accentDeep },
  hint: { color: theme.colors.white, opacity: 0.9, textAlign: "center", marginBottom: 20, maxWidth: 300 },
  primary: { backgroundColor: theme.colors.accentDeep, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 40 },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
