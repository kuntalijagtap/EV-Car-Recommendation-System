# EVora

EVora helps people explore electric vehicles in India, compare models, and learn about EV ownership.

## Features

- EV catalog with search, filters, specifications, and vehicle images
- Compare up to four EVs, including charts and available variant prices
- EMI calculator with yearly amortization
- AI EV advisor with chat history
- User accounts, wishlists, and owner reviews
- Admin tools for catalog source verification and review moderation
- Charging station page, with data depending on database availability

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Other:** JWT, bcryptjs, Groq/Gemini AI APIs

## Setup

Requirements: Node.js 20+, npm, and a local MongoDB service or MongoDB Atlas URI.

From the project root in PowerShell:

```powershell
npm install --prefix server
npm install --prefix client
Copy-Item server/.env.example server/.env
```

Generate a private JWT secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Put the generated value in `server/.env` as `JWT_SECRET`. Set `MONGODB_URI` there, and add `GROQ_API_KEY` or `GEMINI_API_KEY` if you want AI responses. Never commit `server/.env` or share its secrets.

Run each command in a separate terminal from the project root:

```powershell
npm run server
npm run client
```

Open <http://localhost:5173>. The API health endpoint is <http://localhost:5000/api/health>.

## Database seed

`npm run seed` **deletes all existing EVora collection data** before inserting demo data. Use it only with a disposable database. Set `ALLOW_DESTRUCTIVE_SEED=true`, `SEED_ADMIN_EMAIL`, and a unique `SEED_ADMIN_PASSWORD` (at least 12 characters) in `server/.env` first. Seeding is disabled in production.

## Build

```powershell
npm run build:client
```

## Data and public repositories

MongoDB data is managed by MongoDB, not stored as one project file. CSV datasets are in `data/`; app code and schemas are in `server/src/`.

Verify redistribution rights and add attribution for the photos in `client/public/images/evs` and datasets in `data/` before making the repository public. Their sources and licenses are not currently recorded here.
