# 🚀 DaCapo Toolbox - Deployment Guide

## 📋 Prerequisites

### Lokaal (Development)
- Node.js 20+
- NPM
- Toegang tot externe MySQL database (72.60.34.162:3306)

### Productie (VPS)
- Hostinger VPS met Docker
- Traefik reverse proxy running
- MySQL container in `traefik_proxy` netwerk
- Domain: www.dacapotools.nl

---

## 🏠 Lokale Development

### 1. Installeer Dependencies
```bash
# Root dependencies
npm install

# Server dependencies
cd server && npm install && cd ..

# Client dependencies  
cd client && npm install && cd ..
```

### 2. Start Development Servers
```bash
# Start beide servers tegelijk (recommended)
npm run dev

# OF start individueel:
npm run dev:server  # Backend op http://localhost:3001
npm run dev:client  # Frontend op http://localhost:5173
```

### 3. Environment
- Gebruikt automatisch `.env.local`
- Backend draait op port **3001**
- Frontend draait op port **5173**
- Database: externe MySQL via IP **72.60.34.162**

### 4. Login Credentials
- URL: http://localhost:5173/login
- Password: `kevinmaaktalles`

---

## 🐳 Productie Deployment op VPS

### 1. Upload Project naar VPS
```bash
# Via Git (recommended)
ssh root@srv963839.hstgr.cloud
cd /root
git clone https://github.com/Kevinlimpens1977/dacapotools.git
cd dacapotools

# OF via SCP/FTP
# Upload hele project naar /root/dacapotools/
```

### 2. Zorg dat .env.production aanwezig is
```bash
# Check of bestand bestaat
ls -la .env.production

# Inhoud moet zijn:
cat .env.production
```

### 3. Build en Start met Docker Compose
```bash
cd /root/dacapotools

# Build image en start container
docker compose up -d --build

# Check logs
docker compose logs -f web

# Check status
docker compose ps
```

### 4. Verify Deployment
```bash
# Check of container draait
docker ps | grep dacapotools

# Check health
curl http://localhost:3000/api/health

# Check via Traefik
curl https://www.dacapotools.nl/api/health
```

---

## 🔧 Traefik Configuration

Docker Compose heeft deze labels voor Traefik v2.11+:

- **Domain**: `www.dacapotools.nl`
- **HTTPS**: Automatisch via Let's Encrypt
- **Port**: Container port 3000
- **Network**: `traefik_proxy` (external)

### Verify Traefik
```bash
# Check Traefik logs
docker logs traefik

# Check certificaten
docker exec traefik ls -la /letsencrypt/acme.json
```

---

## 🗄️ Database Connection

### Development (Lokaal)
- Host: `72.60.34.162`
- Port: `3306`
- User: `kevin`
- Pass: `20Dacapo25!!`
- Database: `dacapo_apps`

### Production (Docker)
- Host: `mysql` (container hostname)
- Port: `3306`
- User: `kevin`
- Pass: `20Dacapo25!!`
- Database: `dacapo_apps`

---

## 🔄 Updates Deployen

### Via Git
```bash
ssh root@srv963839.hstgr.cloud
cd /root/dacapotools

# Pull laatste wijzigingen
git pull origin main

# Rebuild en herstart
docker compose up -d --build

# Check logs
docker compose logs -f web
```

### Handmatige Upload
```bash
# Upload aangepaste files
scp -r ./client root@srv963839.hstgr.cloud:/root/dacapotools/
scp -r ./server root@srv963839.hstgr.cloud:/root/dacapotools/

# SSH in en rebuild
ssh root@srv963839.hstgr.cloud
cd /root/dacapotools
docker compose up -d --build
```

---

## 🐛 Troubleshooting

### Container start niet
```bash
# Check logs
docker compose logs web

# Check container status
docker compose ps

# Herstart
docker compose restart web
```

### Database connectie fails
```bash
# Check of MySQL container draait
docker ps | grep mysql

# Test connectie vanuit container
docker exec dacapotools node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'mysql',
  user: 'kevin',
  password: '20Dacapo25!!',
  database: 'dacapo_apps'
}).then(() => console.log('OK')).catch(e => console.error(e));
"
```

### Frontend niet bereikbaar
```bash
# Check of dist folder bestaat in container
docker exec dacapotools ls -la /app/client/dist

# Check Traefik routing
curl -H "Host: www.dacapotools.nl" http://localhost/api/health
```

### SSL certificaat issues
```bash
# Check Traefik logs
docker logs traefik | grep www.dacapotools.nl

# Check DNS
nslookup www.dacapotools.nl

# Herstart Traefik
docker restart traefik
```

---

## 📦 Handige Commands

```bash
# Logs bekijken
docker compose logs -f web

# Container herstarten
docker compose restart web

# Container stoppen
docker compose down

# Container verwijderen en opnieuw builden
docker compose down
docker compose up -d --build --force-recreate

# Shell in container
docker exec -it dacapotools sh

# Database backup maken
docker exec mysql mysqldump -u kevin -p20Dacapo25!! dacapo_apps > backup.sql

# Database restore
docker exec -i mysql mysql -u kevin -p20Dacapo25!! dacapo_apps < backup.sql
```

---

## 🔒 Security Notes

1. **Wachtwoorden**: In productie, gebruik Docker secrets of environment variables van je hosting
2. **HTTPS**: Traefik regelt automatisch Let's Encrypt certificaten
3. **CORS**: Ingesteld op `https://www.dacapotools.nl` in productie
4. **Headers**: Security headers toegevoegd via Traefik middleware

---

## ✅ Checklist voor Go-Live

- [ ] DNS wijst naar VPS IP
- [ ] Traefik draait en is geconfigureerd
- [ ] MySQL container draait in `traefik_proxy` netwerk
- [ ] `.env.production` is correct ingesteld
- [ ] Docker compose up succesvol
- [ ] Health check returnt 200: `https://www.dacapotools.nl/api/health`
- [ ] Login werkt: `https://www.dacapotools.nl/login`
- [ ] Apps worden correct geladen
- [ ] Image uploads werken
- [ ] HTTPS certificaat is actief

---

## 📞 Support

Voor vragen of problemen:
- Check logs: `docker compose logs -f web`
- GitHub Issues: https://github.com/Kevinlimpens1977/dacapotools/issues
