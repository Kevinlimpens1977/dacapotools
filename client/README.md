# DaCapo Tools - Client

React + Vite + TypeScript + Tailwind frontend with Smart-TV style dashboard.

## Env (optional)

Create `.env.local`:
```
VITE_API_URL=http://localhost:3000/api
```

Defaults to `http://localhost:3000/api` if not set.

## Scripts

- `npm run dev` — start on port 5173
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build on port 5174
- `npm run typecheck` — check types without build

## Structure

- `/src/routes`: App (layout), Dashboard (public), Admin, Login
- `/src/components`: Nav, SearchBar, RowCarousel, AppTile
- `/src/lib`: api.ts (axios helpers), types.ts (models)

## Traefik (example, commented for serving after build + deploy)

```
# Serve static built client from /var/www/dacapotools
# Configure nginx or Traefik rules for SPA fallback to index.html
```
