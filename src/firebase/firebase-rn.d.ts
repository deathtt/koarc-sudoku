// src/firebase/firebase-rn.d.ts
//
// Firebase's public typings omit `getReactNativePersistence`, but the
// React Native build of the SDK (which Metro/Expo bundles automatically)
// does export it. This declaration only teaches TypeScript about it; it
// changes nothing at runtime.
import type { Persistence } from "firebase/auth";

declare module "firebase/auth" {
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
