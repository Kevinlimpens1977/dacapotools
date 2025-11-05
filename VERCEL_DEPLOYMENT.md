# Vercel Deployment Guide voor DaCapo Tools

## 🚀 Stappen om te deployen op Vercel

### 1. **Installeer Vercel CLI** (optioneel, voor command line deployment)
```bash
npm install -g vercel
```

### 2. **Deployment via Vercel Dashboard** (Makkelijkste methode)

#### A. Push code naar GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin fix/carousel-undefined-length-error
```

#### B. Ga naar Vercel
1. Ga naar [vercel.com](https://vercel.com)
2. Login met je GitHub account
3. Klik op **"Add New Project"**
4. Selecteer je repository: `Kevinlimpens1977/dacapotools`
5. Vercel detecteert automatisch de configuratie

#### C. Configureer Environment Variables
Voeg de volgende environment variables toe in Vercel dashboard:

**Required:**
```
NODE_ENV=production
DB_HOST=72.60.34.162
DB_PORT=3306
DB_USER=kevin
DB_PASS=[jouw database wachtwoord]
DB_NAME=dacapo_apps
ADMIN_SECRET=[jouw admin wachtwoord]
```

**Optional:**
```
VITE_API_URL=https://jouw-domain.vercel.app
```

#### D. Deploy Settings
- **Framework Preset:** Vite
- **Root Directory:** `./` (laat leeg)
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `client/dist`
- **Install Command:** `npm install`

#### E. Deploy!
Klik op **"Deploy"** en wacht tot de deployment klaar is.

---

### 3. **Deployment via CLI** (Alternatief)

```bash
# Login bij Vercel
vercel login

# Deploy naar preview
vercel

# Deploy naar productie
vercel --prod
```

---

## 📝 Wat is er veranderd voor Vercel?

### Nieuwe bestanden:
1. **`vercel.json`** - Vercel configuratie voor routing
2. **`api/index.js`** - Serverless API wrapper
3. **`VERCEL_DEPLOYMENT.md`** - Deze guide

### Aangepaste bestanden:
1. **`package.json`** - Toegevoegd `vercel-build` script

---

## 🔧 Na Deployment

### API URL
Na deployment krijg je een URL zoals: `https://dacapotools.vercel.app`

### Update Frontend API URL
Als je een custom domain hebt, update de `VITE_API_URL` in Vercel environment variables.

### Test de deployment:
```
Frontend: https://jouw-domain.vercel.app
API Health: https://jouw-domain.vercel.app/api/health
Apps Endpoint: https://jouw-domain.vercel.app/api/apps/all
```

---

## ⚠️ Belangrijke Notes

### Database Connectie
- Zorg dat je MySQL database **publiek toegankelijk** is
- Of gebruik **Vercel Postgres** als alternatief
- Firewall moet Vercel IP ranges toestaan

### File Uploads
- Vercel heeft **read-only filesystem** voor serverless functions
- Voor image uploads moet je externe storage gebruiken:
  - **Vercel Blob Storage** (aanbevolen)
  - **Cloudinary**
  - **AWS S3**

### Environment Variables
- Stel **NOOIT** gevoelige data in git
- Gebruik altijd Vercel dashboard voor secrets
- Test met preview deployments eerst

---

## 🐛 Troubleshooting

### "API not found"
- Check `vercel.json` routing configuratie
- Verify dat `/api/*` routes naar je serverless functie gaan

### "Database connection failed"
- Controleer environment variables in Vercel dashboard
- Test database connectie vanaf Vercel IP
- Check firewall settings

### "Build failed"
- Check build logs in Vercel dashboard
- Verify alle dependencies zijn in `package.json`
- Test lokaal met `npm run vercel-build`

---

## 🎯 Optie 2: Alleen Frontend op Vercel

Als je backend elders wilt hosten (bijv. je VPS):

1. Deploy alleen de `client` folder op Vercel
2. Set `VITE_API_URL=https://api.dacapotools.nl`
3. Backend blijft op je VPS draaien

**Voordeel:** Eenvoudiger, backend blijft bij database  
**Nadeel:** Je moet 2 services beheren

---

## ✅ Checklist voor Go-Live

- [ ] GitHub repository is up-to-date
- [ ] Environment variables zijn ingesteld in Vercel
- [ ] Database is toegankelijk vanaf Vercel
- [ ] Build succesvol lokaal met `npm run vercel-build`
- [ ] API health check werkt
- [ ] Login functionaliteit werkt
- [ ] Apps worden correct geladen
- [ ] Custom domain toegevoegd (optioneel)
- [ ] SSL certificaat is actief (automatisch via Vercel)

---

## 🆘 Support

Bij problemen:
- Check Vercel deployment logs
- Test API endpoints met Postman
- Verify database connectie
- Check CORS settings als frontend/backend errors optreden
