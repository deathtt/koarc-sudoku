// App.tsx
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Platform } from "react-native";
import { User } from "firebase/auth";
import Navigation from "./src/navigation";
import { subscribeToAuthChanges } from "./src/firebase/auth";
import { initAds } from "./src/utils/ads";
import { theme } from "./src/theme";

// Inject Google Font "Amatic SC" on web so titles match the brand
if (Platform.OS === "web" && typeof document !== "undefined") {
  const id = "koarc-amatic-font";
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap";
    document.head.appendChild(link);
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [guest, setGuest] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initAds().catch(() => {});
    // If Firebase config is still placeholders, auth may throw — still show UI
    try {
      return subscribeToAuthChanges((u) => {
        setUser(u);
        setReady(true);
      });
    } catch {
      setReady(true);
      return () => {};
    }
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.colors.accentDeep} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Navigation user={user} guest={guest} onGuest={() => setGuest(true)} onSignOutGuest={() => setGuest(false)} />
    </>
  );
}
