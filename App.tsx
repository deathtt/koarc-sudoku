// App.tsx
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { User } from "firebase/auth";
import Navigation from "./src/navigation";
import { subscribeToAuthChanges } from "./src/firebase/auth";
import { initAds } from "./src/utils/ads";
import { theme } from "./src/theme";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initAds().catch(() => {});
    return subscribeToAuthChanges((u) => { setUser(u); setReady(true); });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Navigation user={user} />
    </>
  );
}
