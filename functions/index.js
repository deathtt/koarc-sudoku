// functions/index.js
// Deploy with: firebase deploy --only functions
// Set secrets first:
//   firebase functions:secrets:set DISCORD_CLIENT_ID
//   firebase functions:secrets:set DISCORD_CLIENT_SECRET
//
// Firebase has no built-in Discord login, so the app sends the OAuth code
// here. This function trades it with Discord (using the secret, which must
// NEVER live inside the mobile app) and returns a Firebase custom token.

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
admin.initializeApp();

const DISCORD_CLIENT_ID = defineSecret("DISCORD_CLIENT_ID");
const DISCORD_CLIENT_SECRET = defineSecret("DISCORD_CLIENT_SECRET");

exports.discordAuth = onRequest(
  { secrets: [DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET], cors: true },
  async (req, res) => {
    try {
      const { code, redirectUri } = req.body || {};
      if (!code || !redirectUri) return res.status(400).json({ error: "Missing code or redirectUri" });

      const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID.value(),
          client_secret: DISCORD_CLIENT_SECRET.value(),
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });
      const token = await tokenRes.json();
      if (!token.access_token) return res.status(401).json({ error: "Discord rejected the code" });

      const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      const profile = await userRes.json();
      if (!profile.id) return res.status(401).json({ error: "Could not read Discord profile" });

      const uid = `discord:${profile.id}`;
      await admin.auth().updateUser(uid, { displayName: profile.global_name || profile.username }).catch(async () => {
        await admin.auth().createUser({ uid, displayName: profile.global_name || profile.username });
      });
      const firebaseToken = await admin.auth().createCustomToken(uid);
      res.json({ firebaseToken });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Discord sign-in failed" });
    }
  }
);
