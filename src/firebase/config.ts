// src/firebase/config.ts
//
// Fill in your own Firebase project's config values below.
// Firebase Console → Project Settings → General → Your apps → SDK setup.

import { Platform } from "react-native";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from "firebase/auth";
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

// Web uses browser persistence; native uses AsyncStorage.
function createAuth() {
  if (Platform.OS === "web") {
    return initializeAuth(app, { persistence: browserLocalPersistence });
  }
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Already initialized (hot reload)
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
