// src/firebase/auth.ts
import {
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { auth } from "./config";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

// ---------- Google Sign-In ----------
// Requires a Google OAuth client ID from Firebase Console → Authentication →
// Sign-in method → Google → Web SDK configuration.
const GOOGLE_WEB_CLIENT_ID = "REPLACE_WITH_YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com";

export function useGoogleSignIn() {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri: AuthSession.makeRedirectUri(),
      responseType: "id_token",
    },
    { authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth" }
  );

  async function signInWithGoogle() {
    const result = await promptAsync();
    if (result.type === "success" && result.params.id_token) {
      const credential = GoogleAuthProvider.credential(result.params.id_token);
      return signInWithCredential(auth, credential);
    }
    throw new Error("Google sign-in was cancelled or failed.");
  }

  return { signInWithGoogle, request };
}

// ---------- Apple Sign-In (iOS only, required by App Store if you offer any social login) ----------
export async function signInWithApple() {
  if (Platform.OS !== "ios") {
    throw new Error("Apple Sign-In is only available on iOS.");
  }
  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken: appleCredential.identityToken ?? undefined,
  });
  return signInWithCredential(auth, credential);
}

// ---------- Discord Sign-In ----------
// Firebase has no built-in Discord provider, so this uses Discord's OAuth2
// directly, then exchanges it via a generic OAuthProvider. You'll need a
// Discord Application (discord.com/developers/applications) with OAuth2
// redirect configured, plus a small server endpoint OR Firebase Cloud
// Function to exchange the Discord code for a Firebase custom token, since
// Firebase does not verify Discord tokens natively. The client-side half:
const DISCORD_CLIENT_ID = "REPLACE_WITH_YOUR_DISCORD_CLIENT_ID";

export function useDiscordSignIn() {
  const discovery = {
    authorizationEndpoint: "https://discord.com/api/oauth2/authorize",
    tokenEndpoint: "https://discord.com/api/oauth2/token",
  };
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: DISCORD_CLIENT_ID,
      scopes: ["identify", "email"],
      redirectUri: AuthSession.makeRedirectUri(),
      responseType: "code",
    },
    discovery
  );

  async function signInWithDiscord() {
    const result = await promptAsync();
    if (result.type !== "success" || !result.params.code) {
      throw new Error("Discord sign-in was cancelled or failed.");
    }
    // IMPORTANT: exchange this code for a Firebase custom token on YOUR
    // OWN backend (a small Cloud Function is enough) — never put your
    // Discord client secret in the mobile app. See README for the
    // Cloud Function snippet that does this exchange.
    const res = await fetch("https://REPLACE_WITH_YOUR_CLOUD_FUNCTION_URL/discordAuth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: result.params.code, redirectUri: AuthSession.makeRedirectUri() }),
    });
    const { firebaseToken } = await res.json();
    const { signInWithCustomToken } = await import("firebase/auth");
    return signInWithCustomToken(auth, firebaseToken);
  }

  return { signInWithDiscord, request };
}

export function signOut() {
  return firebaseSignOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
