// src/screens/HomeScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Alert, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import { auth } from "../firebase/config";
import { signOut } from "../firebase/auth";
import { joinRoom } from "../firebase/rooms";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home"> & {
  isGuest?: boolean;
  onSignOutGuest?: () => void;
};

export default function HomeScreen({ navigation, isGuest, onSignOutGuest }: Props) {
  const [code, setCode] = useState("");
  const user = auth.currentUser;
  const name = user?.displayName ?? (isGuest ? "Guest" : "Player");

  function alertMsg(title: string, body: string) {
    if (Platform.OS === "web") window.alert(title + "\n\n" + body);
    else Alert.alert(title, body);
  }

  async function handleJoin() {
    if (isGuest || !user) {
      alertMsg("Sign in required", "Multiplayer needs a real account. Use Google/Discord after Firebase is set up, or play the daily puzzle as guest.");
      return;
    }
    const clean = code.trim().toUpperCase();
    if (clean.length !== 6) {
      alertMsg("Room code", "Room codes are 6 characters.");
      return;
    }
    try {
      await joinRoom(clean, user.uid, name);
      navigation.navigate("Room", { code: clean });
    } catch (e: any) {
      alertMsg("Couldn't join", e?.message ?? "Try again.");
    }
  }

  function handleSignOut() {
    if (isGuest) onSignOutGuest?.();
    else signOut();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Koarc</Text>
      <Text style={styles.hello}>Hi, {name}</Text>

      <Pressable style={styles.primary} onPress={() => navigation.navigate("Solo")}>
        <Text style={styles.primaryText}>Play daily puzzle</Text>
      </Pressable>

      <Pressable
        style={[styles.secondary, isGuest && styles.dim]}
        onPress={() => {
          if (isGuest) alertMsg("Sign in required", "Create room needs an account.");
          else navigation.navigate("CreateRoom");
        }}
      >
        <Text style={styles.secondaryText}>Create a room (up to 10 players)</Text>
      </Pressable>

      <Pressable
        style={[styles.secondary, isGuest && styles.dim]}
        onPress={() => {
          if (isGuest) alertMsg("Sign in required", "Public rooms need an account.");
          else navigation.navigate("PublicRooms");
        }}
      >
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

      <Pressable onPress={handleSignOut}>
        <Text style={styles.signOut}>{isGuest ? "Back to login" : "Sign out"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: 72,
    fontWeight: "700",
    color: theme.colors.ink,
    lineHeight: 76,
  },
  hello: { color: theme.colors.inkSoft, marginBottom: 12 },
  primary: {
    backgroundColor: theme.colors.accentDeep,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  secondary: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  secondaryText: { color: theme.colors.accentDeep, fontWeight: "600", fontSize: 15 },
  dim: { opacity: 0.55 },
  joinRow: { flexDirection: "row", gap: 8, width: "100%", maxWidth: 340 },
  input: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    paddingHorizontal: 18,
    height: 48,
    color: theme.colors.ink,
    letterSpacing: 3,
  },
  joinBtn: {
    backgroundColor: theme.colors.accentDeep,
    borderRadius: 24,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  signOut: {
    color: theme.colors.inkSoft,
    marginTop: 18,
    textDecorationLine: "underline",
  },
});
