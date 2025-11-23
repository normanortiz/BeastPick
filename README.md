# Beast Pick

Real-time voting platform for MrBeast productions.

## Progress Status

### ✅ Completed
1. **Project Structure** - package.json, vercel.json, folder structure
2. **Global CSS** - MrBeast branding with colors (#00bce7, #e64783), Monument Extended font, cool border effects, animations
3. **Database Layer** - Vercel KV integration with all helper functions
4. **Authentication** - Passcode entry screen, role selection, auth API endpoint
5. **Contestant Interface** - Full voting UI with grid layout algorithm, timer support, batch/instant voting modes

### 🚧 In Progress
- API endpoints (auth.js complete, need config.js, players.js, vote.js, display.js, export.js)

### ⏳ To Do
1. **Display Screen** (display.html) - 16:9 landscape, real-time bar graphs, elimination effects
2. **Admin Panel** (admin.html) - Full control panel with all features
3. **Additional CSS** - display.css, admin.css
4. **Remaining API Endpoints**:
   - `/api/config` - Game configuration CRUD
   - `/api/players` - Player management
   - `/api/vote` - Vote submission and retrieval
   - `/api/display` - Display screen data feed
   - `/api/export` - CSV export
5. **Additional JS** - display.js, admin.js, animations.js
6. **Testing & Deployment**

## Key Features Implemented

### Grid Layout Algorithm
Automatically calculates optimal symmetrical layout for player cards:
- 2x2 for 4 players
- 3x3 for 9 players
- 3x4 for 10-12 players
- 4x4 for 16 players
- Dynamic calculation for larger groups

### Voting Modes
- **Instant Submit**: Each vote sent immediately
- **Batch Submit**: Multi-select then submit all
- **Timed Batch**: Auto-submit when timer expires

### Admin Controls (To Be Built)
- Player management (add/edit/delete, photos, numbers, names)
- Game configuration (vote values, units, display options)
- Round control (start/stop voting, reset, next round)
- Live monitoring (see votes as they come in)
- History & export (CSV download)

## Tech Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Vercel Serverless Functions (Node.js)
- Database: Vercel KV (Redis)
- Deployment: Vercel
- Font: Monument Extended Ultrabold
- Colors: #00bce7 (blue), #e64783 (pink), black, white

## Setup Instructions

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Deploy to Vercel
```bash
npm run deploy
```

### Environment Variables Required
- `KV_REST_API_URL` - Vercel KV REST API URL
- `KV_REST_API_TOKEN` - Vercel KV REST API Token

## Default Credentials
- **Passcode**: 123456
- **Admin Password**: admin123

## File Structure
```
beast-pick/
├── public/
│   ├── index.html (passcode entry) ✅
│   ├── contestant.html (voting interface) ✅
│   ├── display.html (public display) ⏳
│   ├── admin.html (admin panel) ⏳
│   ├── css/
│   │   ├── global.css ✅
│   │   ├── contestant.css ✅
│   │   ├── display.css ⏳
│   │   └── admin.css ⏳
│   ├── js/
│   │   ├── auth.js ✅
│   │   ├── contestant.js ✅
│   │   ├── display.js ⏳
│   │   ├── admin.js ⏳
│   │   └── animations.js ⏳
│   └── images/
│       └── (logo and x-overlay to be added)
├── api/
│   ├── auth.js ✅
│   ├── config.js ⏳
│   ├── players.js ⏳
│   ├── vote.js ⏳
│   ├── display.js ⏳
│   └── export.js ⏳
├── lib/
│   └── db.js ✅
├── package.json ✅
├── vercel.json ✅
└── README.md ✅
```

## Next Steps
1. Complete API endpoints (config, players, vote, display, export)
2. Build display screen (16:9 landscape with live bar graphs)
3. Build admin panel (full control interface)
4. Add animations and polish
5. Test thoroughly
6. Deploy to Vercel

## Notes
- Platform designed for iPad portrait mode (contestants) and 16:9 landscape (display)
- Low concurrent user count - optimized for internal controlled environment
- Bold MrBeast-style animations throughout
- All voting data logged and exportable to CSV
