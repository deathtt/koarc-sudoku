// src/firebase/config.ts
//
// Fill in your own Firebase project's config values below. Get these from:
// Firebase Console → Project Settings → General → "Your apps" → SDK setup.
// Free to create at https://console.firebase.google.com

import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID",
  databaseURL: "https://REPLACE_WITH_YOUR_PROJECT-default-rtdb.firebaseio.com",
};

export const app = initializeApp(firebaseConfig);

// React Native needs explicit persistence, or users get logged out on every restart
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);           // player profiles, points, purchase history
export const rtdb = getDatabase(app);           // live multiplayer room state (low-latency)
