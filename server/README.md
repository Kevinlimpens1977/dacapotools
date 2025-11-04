# DaCapo Tools - Server

Express API serving app tiles with MySQL, file uploads, and simple token auth.

## Env
Copy `.env.example` to `.env` and adjust if needed.

## Scripts
- `npm run dev` — start with nodemon on port 3000
- `npm start` — production start

## Traefik (example, commented)
```
# labels:
#   - "traefik.enable=true"
#   - "traefik.http.routers.dacapo-api.rule=Host(`api.dacapotools.nl`)"
#   - "traefik.http.routers.dacapo-api.entrypoints=websecure"
#   - "traefik.http.routers.dacapo-api.tls.certresolver=myresolver"
#   - "traefik.http.services.dacapo-api.loadbalancer.server.port=3000"
#   - "traefik.http.middlewares.dacapo-cors.headers.accessControlAllowOriginList=https://tools.dacapo.nl,https://www.dacapo.nl"
#   - "traefik.http.routers.dacapo-api.middlewares=dacapo-cors@file"
```
