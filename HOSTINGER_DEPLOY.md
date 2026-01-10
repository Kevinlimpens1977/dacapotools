# Hostinger Deployment Handleiding

## DaCapo Toolbox Deploy naar Hostinger

### Laatste Build
- **Datum**: 10 januari 2026
- **GitHub Repo**: https://github.com/Kevinlimpens1977/dacapotools.git
- **Branch**: master
- **Output folder**: `dest/`

---

## Methode 1: Git Auto-Deploy (Aanbevolen)

### Stap 1: Log in op Hostinger
1. Ga naar [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Selecteer je website/domein

### Stap 2: Git Koppelen
1. Ga naar **Websites** → **Jouw domein** → **Git**
2. Klik op **Create Repository** of **Manage**
3. Koppel de GitHub repository:
   - Repository URL: `https://github.com/Kevinlimpens1977/dacapotools.git`
   - Branch: `master`
   - Auto Deploy: **Ingeschakeld**

### Stap 3: Build Directory Instellen
Hostinger moet weten dat de `dest/` folder de output is:
- Stel de **Public folder** in op: `dest`

### Stap 4: Deploy Triggeren
- Elke push naar `master` triggert automatisch een nieuwe deploy
- Of klik handmatig op **Deploy** in het Git-paneel

---

## Methode 2: Handmatige Upload (Via File Manager)

### Stap 1: Build Maken
De build is al gemaakt en staat klaar in `app/dest/`:
```
dest/
├── .htaccess          (SPA routing + cache headers)
├── assets/            (JS, CSS, fonts)
├── favicon.svg
├── index.html
└── vite.svg
```

### Stap 2: Upload naar Hostinger
1. Ga naar **File Manager** in hPanel
2. Navigeer naar `public_html/` (of je subdirectory)
3. **Verwijder** eerst alle oude bestanden
4. **Upload** de inhoud van de `dest/` folder (NIET de folder zelf, maar de bestanden erin)

### Stap 3: Controleer .htaccess
Zorg dat de `.htaccess` file correct is geüpload. Deze bevat:
- SPA fallback routing (alle routes → index.html)
- CORS headers voor Firebase
- Cache headers voor static assets

---

## Methode 3: FTP Upload

### FTP Gegevens ophalen
1. Ga naar **Files** → **FTP Accounts** in hPanel
2. Noteer de hostserver, gebruikersnaam en wachtwoord

### Upload via FTP client (FileZilla)
1. Open FileZilla
2. Verbind met je FTP server
3. Navigeer naar `public_html/`
4. Upload alle bestanden uit `dest/`

---

## Belangrijke Configuratie

### Environment Variables
De Firebase configuratie staat in de code (client-side). Zorg dat je Firebase project de juiste domeinen heeft geautoriseerd:

1. Ga naar [Firebase Console](https://console.firebase.google.com)
2. **Authentication** → **Settings** → **Authorized domains**
3. Voeg toe:
   - `jouw-domein.com`
   - `www.jouw-domein.com`

### CORS Configuratie
Als je Firebase Cloud Functions gebruikt, zorg dat CORS correct is ingesteld in je functions.

---

## Troubleshooting

### Witte pagina / 404 errors
- Controleer of `.htaccess` correct is geüpload
- Hostinger moet Apache mod_rewrite ondersteunen (standaard aan)

### Firebase Auth werkt niet
- Controleer of je domein is toegevoegd aan Firebase Authorized Domains
- Check de browser console voor specifieke errors

### Cache problemen na update
- Druk Ctrl+Shift+R (hard refresh)
- Wis browser cache
- Assets hebben hashed filenames, dus zouden automatisch vernieuwen

---

## Snel Commando's

### Nieuwe build maken en pushen
```powershell
cd "c:\Users\Kevin\projecten\dacapo toolbox\app"
npm run build
git add -A
git commit -m "build: Update production build"
git push origin master
```

---

## Checklist voor Deploy

- [ ] `npm run build` is succesvol uitgevoerd
- [ ] Geen errors in de console
- [ ] Firebase domeinen zijn geautoriseerd
- [ ] `.htaccess` is aanwezig in de output
- [ ] Bestanden zijn geüpload naar `public_html/`
- [ ] Website test succesvol in browser
