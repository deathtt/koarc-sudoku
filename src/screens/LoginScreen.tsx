// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator, Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useGoogleSignIn, signInWithApple, useDiscordSignIn } from "../firebase/auth";
import { theme } from "../theme";

export default function LoginScreen() {
  const [loading, setLoading] = useState<string | null>(null);
  const { signInWithGoogle } = useGoogleSignIn();
  const { signInWithDiscord } = useDiscordSignIn();

  async function handle(provider: string, action: () => Promise<any>) {
    setLoading(provider);
    try {
      await action();
    } catch (err: any) {
      Alert.alert("Sign-in failed", err?.message ?? "Please try again.");
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
          style={[styles.btn, styles.google]}
          onPress={() => handle("google", signInWithGoogle)}
          disabled={!!loading}
        >
          {loading === "google" ? <ActivityIndicator color={theme.colors.ink} /> : <Text style={styles.btnTextDark}>Continue with Google</Text>}
        </Pressable>

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={24}
            style={styles.appleBtn}
            onPress={() => handle("apple", signInWithApple)}
          />
        )}

        <Pressable
          style={[styles.btn, styles.discord]}
          onPress={() => handle("discord", signInWithDiscord)}
          disabled={!!loading}
        >
          {loading === "discord" ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTextLight}>Continue with Discord</Text>}
        </Pressable>
      </View>

      <Text style={styles.footnote}>
        By continuing you agree to Koarc's Terms and Privacy Policy.
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
    fontSize: 72,
    color: theme.colors.white,
    lineHeight: 72,
  },
  subtitle: {
    color: theme.colors.white,
    opacity: 0.9,
    fontSize: 14,
    marginBottom: 40,
  },
  buttons: { width: "100%", maxWidth: 340, gap: 12 },
  btn: {
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  google: { backgroundColor: theme.colors.white },
  discord: { backgroundColor: "#5865F2" },
  appleBtn: { width: "100%", height: 48 },
  btnTextDark: { color: theme.colors.ink, fontWeight: "600", fontSize: 15 },
  btnTextLight: { color: "#fff", fontWeight: "600", fontSize: 15 },
  footnote: {
    color: theme.colors.white,
    opacity: 0.75,
    fontSize: 11,
    marginTop: 30,
    textAlign: "center",
    maxWidth: 280,
  },
});
