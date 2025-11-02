# DaCapo Tools

Smart-TV-style web portal with horizontal app carousels. Full-stack: React + Vite + Tailwind (frontend) and Node/Express + MySQL (backend).

## Quick Start

### Backend (server/)

```powershell
cd server
cp .env.example .env
# Edit .env with your DB credentials if needed
npm install
npm run dev
```

Server runs on http://localhost:3000

### Frontend (client/)

```powershell
cd client
npm install
npm run dev
```

Client runs on http://localhost:5173

### Admin Login

- Default password: `kevinmaaktalles` (change `ADMIN_SECRET` in server `.env`)
- Visit http://localhost:5173/login
- After login, go to http://localhost:5173/admin

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind, Framer Motion (minimal), React Router
- **Backend**: Node.js, Express, mysql2, multer (file upload), jsonwebtoken (auth), cors
- **Database**: MySQL on Hostinger VPS (72.60.34.162:3306, DB `dacapo_apps`)

## Features

- **Public Dashboard**: 4 horizontal rows (Personeel, Administratie, MT, Overzicht) with draggable carousels
- **Search**: Live filter across all tiles
- **Admin Panel**: Add/delete apps, upload or paste images, CRUD
- **Auth**: Simple password-based JWT token

## Deploy on Hostinger VPS with Traefik

See `server/README.md` and `client/README.md` for Traefik label examples.

## License

Private project for DaCapo.
