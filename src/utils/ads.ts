// src/utils/ads.ts
// Web-safe: AdMob is mobile-only. On web this is a no-op.

import { Platform } from "react-native";

let hasShownThisSession = false;

export async function initAds() {
  if (Platform.OS === "web") return;
  try {
    const mobileAds = (await import("react-native-google-mobile-ads")).default;
    const { InterstitialAd, TestIds } = await import("react-native-google-mobile-ads");
    const INTERSTITIAL_AD_UNIT_ID = __DEV__
      ? TestIds.INTERSTITIAL
      : "REPLACE_WITH_YOUR_REAL_ADMOB_INTERSTITIAL_UNIT_ID";
    await mobileAds().initialize();
    (globalThis as any).__koarcInterstitial = InterstitialAd.createForAdRequest(
      INTERSTITIAL_AD_UNIT_ID,
      { requestNonPersonalizedAdsOnly: false }
    );
    (globalThis as any).__koarcInterstitial.load();
  } catch {
    // ignore on web / missing native module
  }
}

export function showOnceAd(onClosed?: () => void) {
  if (Platform.OS === "web" || hasShownThisSession) {
    onClosed?.();
    return;
  }
  try {
    const interstitial = (globalThis as any).__koarcInterstitial;
    if (!interstitial) {
      onClosed?.();
      return;
    }
    const { AdEventType } = require("react-native-google-mobile-ads");
    const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitial?.show();
    });
    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      hasShownThisSession = true;
      unsubLoaded();
      unsubClosed();
      onClosed?.();
    });
    const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      unsubLoaded();
      unsubClosed();
      unsubError();
      onClosed?.();
    });
    if (interstitial.loaded) interstitial.show();
  } catch {
    onClosed?.();
  }
}
