// src/screens/PublicRoomsScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import { auth } from "../firebase/config";
import { joinRoom, listenToPublicRooms } from "../firebase/rooms";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "PublicRooms">;

export default function PublicRoomsScreen({ navigation }: Props) {
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => listenToPublicRooms((r) => setRooms(r.sort((a, b) => b.createdAt - a.createdAt))), []);

  async function join(code: string) {
    const user = auth.currentUser!;
    try {
      await joinRoom(code, user.uid, user.displayName ?? "Player");
      navigation.navigate("Room", { code });
    } catch (e: any) {
      Alert.alert("Couldn't join", e?.message ?? "Try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Public rooms</Text>
      <FlatList
        data={rooms}
        keyExtractor={(r) => r.code}
        ListEmptyComponent={<Text style={styles.empty}>No open rooms right now. Create one!</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => join(item.code)}>
            <View>
              <Text style={styles.rowTitle}>{item.mode === "race" ? "Race" : "Co-op"} · {item.difficulty}</Text>
              <Text style={styles.rowSub}>Code {item.code}</Text>
            </View>
            <Text style={styles.count}>{item.playerCount}/{item.maxPlayers}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 20 },
  title: { fontFamily: theme.fonts.display, fontSize: 48, color: theme.colors.white, textAlign: "center", marginBottom: 12 },
  empty: { color: theme.colors.white, textAlign: "center", marginTop: 40 },
  row: { backgroundColor: theme.colors.white, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowTitle: { color: theme.colors.ink, fontWeight: "600" },
  rowSub: { color: theme.colors.inkSoft, fontSize: 12 },
  count: { color: theme.colors.accentDeep, fontWeight: "700", fontSize: 16 },
});
