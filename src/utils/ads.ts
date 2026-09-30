// src/utils/ads.ts
//
// Shows a single interstitial ad once per app session (per your "once, not
// repeated" requirement) — after the player's first puzzle finish, not
// before, so it doesn't interrupt first-time onboarding.
//
// You need a real AdMob account (admob.google.com, free to create) and your
// own ad unit IDs — the test IDs below always work in development but earn
// nothing; swap them for your real ad unit IDs before publishing.

import mobileAds, {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : "REPLACE_WITH_YOUR_REAL_ADMOB_INTERSTITIAL_UNIT_ID";

let hasShownThisSession = false;
let interstitial: InterstitialAd | null = null;

export async function initAds() {
  await mobileAds().initialize();
  interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: false,
  });
  interstitial.load();
}

export function showOnceAd(onClosed?: () => void) {
  if (hasShownThisSession || !interstitial) {
    onClosed?.();
    return;
  }
  const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitial?.show();
  });
  const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    hasShownThisSession = true;
    unsubscribeLoaded();
    unsubscribeClosed();
    onClosed?.();
  });
  const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
    // Ad failed to load (no fill, offline, etc.) — don't block the player
    unsubscribeLoaded();
    unsubscribeClosed();
    unsubscribeError();
    onClosed?.();
  });
  if (interstitial.loaded) {
    interstitial.show();
  }
}
