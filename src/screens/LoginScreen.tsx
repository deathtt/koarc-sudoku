// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator, Alert } from "react-native";
import { useGoogleSignIn, signInWithApple, useDiscordSignIn } from "../firebase/auth";
import { theme } from "../theme";

export default function LoginScreen({ onGuest }: { onGuest: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const { signInWithGoogle } = useGoogleSignIn();
  const { signInWithDiscord } = useDiscordSignIn();

  async function handle(provider: string, action: () => Promise<any>) {
    setLoading(provider);
    try {
      await action();
    } catch (err: any) {
      const msg = err?.message ?? "Please try again.";
      if (Platform.OS === "web") {
        window.alert("Sign-in failed: " + msg + "\n\nTip: use Play as Guest until Firebase/Google is configured.");
      } else {
        Alert.alert("Sign-in failed", msg);
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Koarc</Text>
      <Text style={styles.subtitle}>Daily puzzles by KoraCraft</Text>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.btn, styles.guest]}
          onPress={onGuest}
          disabled={!!loading}
        >
          <Text style={styles.btnTextLight}>Play as Guest</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.google]}
          onPress={() => handle("google", signInWithGoogle)}
          disabled={!!loading}
        >
          {loading === "google" ? (
            <ActivityIndicator color={theme.colors.ink} />
          ) : (
            <Text style={styles.btnTextDark}>Continue with Google</Text>
          )}
        </Pressable>

        {Platform.OS === "ios" && (
          <Pressable
            style={[styles.btn, styles.apple]}
            onPress={() => handle("apple", signInWithApple)}
            disabled={!!loading}
          >
            <Text style={styles.btnTextLight}>Continue with Apple</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.btn, styles.discord]}
          onPress={() => handle("discord", signInWithDiscord)}
          disabled={!!loading}
        >
          {loading === "discord" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnTextLight}>Continue with Discord</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.footnote}>
        Guest mode works offline for daily puzzles. Google/Discord need Firebase keys.
      </Text>
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
  },
  title: {
    fontFamily: theme.fonts.display,
    fontSize: 80,
    fontWeight: "700",
    color: theme.colors.ink,
    lineHeight: 88,
  },
  subtitle: {
    color: theme.colors.inkSoft,
    fontSize: 15,
    marginBottom: 36,
  },
  buttons: { width: "100%", maxWidth: 340, gap: 12 },
  btn: {
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  guest: { backgroundColor: theme.colors.accentDeep },
  google: { backgroundColor: theme.colors.white },
  apple: { backgroundColor: "#000" },
  discord: { backgroundColor: "#5865F2" },
  btnTextDark: { color: theme.colors.ink, fontWeight: "600", fontSize: 15 },
  btnTextLight: { color: "#fff", fontWeight: "600", fontSize: 15 },
  footnote: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    marginTop: 28,
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 18,
  },
});
