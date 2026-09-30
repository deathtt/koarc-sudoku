# Koarc Sudoku

React Native (Expo) Sudoku app — **works on web, iOS, and Android**.

- Daily solo puzzle with timer + points
- Multiplayer rooms (race + co-op, up to 10 players)
- Google / Apple / Discord login
- Play in the browser via Vercel

---

## Play on the web (Vercel)

### 1. Connect the repo to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import **`deathtt/koarc-sudoku`**
3. Framework: leave as **Other** (vercel.json is already set)
4. Build command: `npx expo export --platform web`
5. Output directory: `dist`
6. Click **Deploy**

Your game will be live at `https://koarc-sudoku-….vercel.app`

### 2. Before first deploy — fill Firebase keys
Edit `src/firebase/config.ts` with your Firebase web app config, then push.
Without this, login and multiplayer will not work.

Also set in Firebase Console:
- Authentication → enable **Google** (and Apple if needed)
- Realtime Database + rules from `firebase/database.rules.json`
- Firestore + rules from `firebase/firestore.rules`

### 3. Local web preview
```bash
npm install --legacy-peer-deps
npx expo start --web
```

Or build static files:
```bash
npm run build:web
# output is in ./dist — same folder Vercel serves
```

---

## Mobile (App Store / Play Store)

Use Expo EAS after Firebase + AdMob are configured:
```bash
npx eas build --platform all
```
See the original setup notes in the repo history for Google/Apple/Discord login and AdMob IDs.

---

## What works on web vs mobile

| Feature              | Web (Vercel) | iOS / Android |
|----------------------|--------------|---------------|
| Solo daily puzzle    | Yes          | Yes           |
| Multiplayer rooms    | Yes          | Yes           |
| Google login         | Yes*         | Yes           |
| Discord login        | Yes*         | Yes           |
| Apple Sign-In        | No           | iOS only      |
| AdMob interstitial   | No (skipped) | Yes           |

\* Needs correct Firebase + OAuth redirect URIs for your Vercel domain.

---

## Project structure

```
App.tsx
src/
  screens/     Home, Solo, Login, CreateRoom, PublicRooms, Room
  components/  SudokuBoard
  firebase/    auth, config, rooms
  utils/       sudokuGenerator, ads (web-safe)
firebase/      database + firestore rules
functions/     Discord OAuth Cloud Function
vercel.json    static web deploy config
```

---

**Repo:** https://github.com/deathtt/koarc-sudoku
