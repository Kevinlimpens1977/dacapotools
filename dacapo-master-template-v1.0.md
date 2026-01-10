# CANONICAL PLATFORM CONTRACT — DaCapo Tools
Status: CANON (Normatief)
Versie: v1.0
Afwijking = bug
Wijzigingen alleen via expliciete versie-update

---

## 0. FUNDAMENTELE PRINCIPES (NIET ONDERHANDELBAAR)

- Dit document is een extractie- en conformiteitscontract.
- Geen creativiteit, geen optimalisatie, geen vereenvoudiging.
- Beschrijf uitsluitend wat IS of wat canoniek gemapt moet worden.
- Exacte namen, waarden, structuren en relaties zijn verplicht.
- Dit document is de enige bron van waarheid voor alle DaCapo Tools.

---

## 1. DOEL

Dit contract definieert de canonieke basis voor:
- UX/UI consistency
- Component- en layoutstructuur
- Firebase datamodel
- User–App–Role architectuur
- Creditsysteem
- Backend logica
- Security
- Migratie en decommissioning

Elke tool moet hier volledig aan conformeren.

---

## A. DESIGN SYSTEM (EXACT)

Extraheer en hanteer:
- Kleuren: hex, tokennaam, gebruikscontext
- Typografie: font, size, weight, line-height, letter-spacing
- Spacing & grid: margins, paddings, vaste afstanden
- Icon usage: plaatsing, grootte, kleur
- States: hover, active, disabled, focus

Geen esthetische termen toegestaan.

---

## B. UI COMPONENTEN (STRUCTUREEL)

Voor elke component:
- Canonieke naam
- Component tree (parent → child → child)
- Vaste afmetingen
- Padding en margins
- Variants
- State- en interactiegedrag
- Accessibility indien aanwezig

---

## C. LAYOUT & NAVIGATIE

- Pagina- en schermtemplates
- Navigatiehiërarchie
- Containerlogica
- Herbruikbare layoutpatronen

---

## D. DATA MODEL — FIREBASE (CANONIEK)

### Verplichte regels
- Users bestaan los van apps
- Users hebben GEEN globale rol
- Rollen en rechten bestaan uitsluitend per app
- Eén userId ↔ meerdere appIds
- Eén appId ↔ meerdere users
- Alle data behoort tot exact één appId
- Geen data zonder appId-context

### Structuur
- Collections en subcollections
- Documentstructuren en veldnamen
- ID-strategieën
- Relaties tussen data

---

## E. USER • APP • ROLE MODEL

- `/users/{uid}` = identiteit ONLY
- Geen credits, geen rollen, geen app-logica in `/users`
- Rollen en permissions zijn altijd `(uid + appId)` gebonden
- Autorisatie is volledig app-scoped

---

## F. CREDIT SYSTEM — CANONIEKE ARCHITECTUUR

### Kernprincipes
- Credits zijn altijd per app
- Credits staan NOOIT in `/users`
- Credits worden alleen server-side gemuteerd
- Frontend is read-only
- Elke mutatie heeft een ledger entry
- Elke app gebruikt exact dezelfde creditlogica

### Datamodel

#### /users/{uid}
Identiteit בלבד

#### /apps/{appId}
App registry

#### /apps/{appId}/users/{uid}
- credits
- role
- permissions (optioneel)
- timestamps

#### /apps/{appId}/creditLedger/{entryId}
- uid
- delta
- reason
- source
- createdAt

Ledger is immutable.

---

## G. ROLLEN & BEVOEGDHEDEN

### Gebruiker
- Mag credits lezen
- Mag acties starten
- Mag geen writes uitvoeren

### App / Functionele logica
- Mag credits checken en consumeren
- Acties pas na succesvolle transactie

### Admin
- Mag credits beheren via server-logica
- Geen client-side bypass

---

## H. CLOUD FUNCTIONS (CONTRACTUEEL)

Alle mutaties lopen via Cloud Functions.

Minimaal verplicht:
- initAppUser(appId, uid)
- consumeCredits(appId, uid, amount, action)
- adminAdjustCredits(appId, uid, delta, reason)

Elke functie:
- Auth-check
- App-scope check
- Transactioneel
- Ledger entry verplicht

---

## I. FIRESTORE SECURITY RULES

Moeten afdwingen:
- App-scope toegang
- Role/permission checks per app
- Verbod op client-side writes naar:
  - credits
  - creditLedger
- Ledger immutable
- Geen server-logica via client mogelijk

---

## J. ADMIN UI (STRUCTUREEL)

Admin UI moet ondersteunen:
- Creditbeheer per app
- User membership per app
- Ledger-inzage
- App-instellingen

Geen visuele vrijheid; alleen structurele conformiteit.

---

## K. EXTENSIEPUNTEN (TOEKOMSTVAST)

Mogelijke uitbreidingen:
- Abonnementen
- Bundels
- Periodieke creditresets
- Purchases via server-only

Uitbreiding mag:
- User-structuur niet wijzigen
- App-structuur niet wijzigen
- Ledger niet omzeilen

---

## L. CONFORMITY RULES

- Wat afwijkt zonder versie-update is NON-CONFORM
- Afwijking = bug
- Canon wint altijd bij conflict

---

## M. BACKEND CANON & MIGRATIE

- Firebase is de enige canonieke backend
- Supabase is legacy/migratiebron
- Supabase-structuren moeten gemapt worden naar Firebase
- Hybride Firebase + Supabase is verboden

---

## N. SUPABASE DECOMMISSIONING (VERPLICHT)

Na implementatie:
- Geen Supabase project
- Geen Supabase auth
- Geen Supabase DB calls
- Geen SDK imports
- Geen env vars of keys
- Geen policies of edge functions

Verder bouwen is verboden zolang Supabase-resten bestaan.

---

## O. DEFINITIE VAN KLAAR

Een project is platform-waardig als:
- UX/UI conform is
- Firebase model conform is
- Rollen & credits conform zijn
- Security rules conform zijn
- Cloud Functions conform zijn
- Supabase volledig verwijderd is

---

EINDE CANON

