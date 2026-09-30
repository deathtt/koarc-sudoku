// src/screens/HomeScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import { auth } from "../firebase/config";
import { signOut } from "../firebase/auth";
import { joinRoom } from "../firebase/rooms";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [code, setCode] = useState("");
  const user = auth.currentUser;
  const name = user?.displayName ?? "Player";

  async function handleJoin() {
    const clean = code.trim().toUpperCase();
    if (clean.length !== 6) {
      Alert.alert("Room code", "Room codes are 6 characters.");
      return;
    }
    try {
      await joinRoom(clean, user!.uid, name);
      navigation.navigate("Room", { code: clean });
    } catch (e: any) {
      Alert.alert("Couldn't join", e?.message ?? "Try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Koarc</Text>
      <Text style={styles.hello}>Hi, {name}</Text>

      <Pressable style={styles.primary} onPress={() => navigation.navigate("Solo")}>
        <Text style={styles.primaryText}>Play daily puzzle</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={() => navigation.navigate("CreateRoom")}>
        <Text style={styles.secondaryText}>Create a room (up to 10 players)</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={() => navigation.navigate("PublicRooms")}>
        <Text style={styles.secondaryText}>Browse public rooms</Text>
      </Pressable>

      <View style={styles.joinRow}>
        <TextInput
          style={styles.input}
          placeholder="Room code"
          placeholderTextColor="#B79AB0"
          autoCapitalize="characters"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />
        <Pressable style={styles.joinBtn} onPress={handleJoin}>
          <Text style={styles.primaryText}>Join</Text>
        </Pressable>
      </View>

      <Pressable onPress={signOut}>
        <Text style={styles.signOut}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontFamily: theme.fonts.display, fontSize: 64, color: theme.colors.white, lineHeight: 64 },
  hello: { color: theme.colors.white, marginBottom: 20 },
  primary: { backgroundColor: theme.colors.accentDeep, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 28, width: "100%", maxWidth: 340, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  secondary: { backgroundColor: theme.colors.white, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 28, width: "100%", maxWidth: 340, alignItems: "center" },
  secondaryText: { color: theme.colors.accentDeep, fontWeight: "600", fontSize: 15 },
  joinRow: { flexDirection: "row", gap: 8, width: "100%", maxWidth: 340 },
  input: { flex: 1, backgroundColor: theme.colors.white, borderRadius: 24, paddingHorizontal: 18, height: 48, color: theme.colors.ink, letterSpacing: 3 },
  joinBtn: { backgroundColor: theme.colors.accentDeep, borderRadius: 24, paddingHorizontal: 24, justifyContent: "center" },
  signOut: { color: theme.colors.white, opacity: 0.8, marginTop: 18, textDecorationLine: "underline" },
});
