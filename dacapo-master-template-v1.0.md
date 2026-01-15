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

## A.1 CANONICAL COLOR SYSTEM — LOCKED (SOURCE: DACAPO TOOLBOX)

**DaCapo Toolbox is the canonical visual reference implementation.**
All apps MUST use these exact tokens. No deviations allowed.

### 1. TOKEN PALETTE

| Token | Light Value | Dark Value | Usage |
| :--- | :--- | :--- | :--- |
| **BRAND** | | | |
| `--primary` | `#2860E0` | `#2F6BFF` | Primary actions, branding |
| `--primary-hover` | `#1C4DAB` | `#2458D6` | Hover states |
| `--primary-light` | `#EBF1FF` | `rgba(47, 107, 255, 0.15)` | Backgrounds, accents |
| **BACKGROUNDS** | | | |
| `--bg-app` | `#F8FAFC` | `#13192C` | Application background (Deep Navy in Dark) |
| `--bg-surface` | `#FFFFFF` | `#1B2437` | Cards, Panels (Surface 1) |
| `--bg-surface-elevated` | `#FFFFFF` | `#21324A` | Modals, Dropdowns (Surface 2) |
| `--bg-surface-hover` | `#F1F5F9` | `#2B3A52` | Interactive hover states |
| **TEXT** | | | |
| `--text-primary` | `#111827` | `rgba(255, 255, 255, 0.92)` | High contrast body/headings |
| `--text-secondary` | `#4B5563` | `rgba(255, 255, 255, 0.68)` | Medium contrast subtitles |
| `--text-muted` | `#9CA3AF` | `rgba(255, 255, 255, 0.45)` | Low contrast hints |
| `--text-faint` | `#CBD5E1` | `rgba(255, 255, 255, 0.30)` | Borders, decorative |
| `--text-on-primary` | `#FFFFFF` | `#FFFFFF` | Text on primary buttons |
| **BORDERS** | | | |
| `--border-default` | `#CBD5E1` | `rgba(255, 255, 255, 0.10)` | Card borders, dividers |
| `--border-strong` | `#94A3B8` | `rgba(255, 255, 255, 0.16)` | Active borders, inputs |
| **FORMS** | | | |
| `--input-bg` | `#FFFFFF` | `rgba(255, 255, 255, 0.06)` | Input fields |
| `--input-bg-2` | `#F8FAFC` | `rgba(255, 255, 255, 0.08)` | Secondary inputs |
| `--placeholder` | `#9CA3AF` | `rgba(255, 255, 255, 0.42)` | Placeholder text |
| `--focus` | `rgba(40, 96, 224, 0.45)` | `rgba(47, 107, 255, 0.45)` | Focus rings |
| **ACCENTS** | | | |
| `--success` | `#10B981` | `#2DD4BF` | Success messages |
| `--warning` | `#F59E0B` | `#F59E0B` | Warnings |
| `--danger` | `#EF4444` | `#EF4444` | Errors, destructive |
| `--purple` | `#A855F7` | `#A855F7` | Special accents |
| **DEPTH** | | | |
| `--shadow-card` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | `0 20px 60px rgba(0, 0, 0, 0.55)` | Base elevation |
| `--shadow-elevated` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | `0 30px 80px rgba(0, 0, 0, 0.60)` | Modal elevation |
| `--shadow-float` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | `0 30px 80px rgba(0, 0, 0, 0.60)` | Highest elevation |
| `--overlay` | `rgba(0, 0, 0, 0.5)` | `rgba(0, 0, 0, 0.55)` | Backdrops |

### 2. TOKEN → UTILITY MAPPING (LOCKED)

Utilities MUST map 1:1 to these tokens. No derived or inferred mappings allowed.

| Utility Class | Maps To Token |
| :--- | :--- |
| `bg-app` | `var(--bg-app)` |
| `bg-card` | `var(--bg-surface)` |
| `bg-surface-elevated` | `var(--bg-surface-elevated)` |
| `bg-hover` | `var(--bg-surface-hover)` |
| `border-theme` | `var(--border-default)` |
| `text-primary` | `var(--text-primary)` |
| `text-secondary` | `var(--text-secondary)` |
| `text-muted` | `var(--text-muted)` |
| `focus-ring` | `var(--focus)` |

All focus styles MUST use the canonical `--focus` token. Browser default focus styles are forbidden.

### 3. ACCENT USAGE SCOPE (LOCKED)

**Accent colors (Success, Warning, Danger, Purple) MAY be used ONLY for:**
- Status indicators
- Notifications
- Badges
- Success / warning / error messaging

**Accent colors MAY NOT be used for:**
- Page backgrounds
- Card surfaces
- Primary navigation
- Layout-defining elements

### 4. OVERLAY USAGE SCOPE (LOCKED)

**Overlay tokens MAY be used ONLY for:**
- Modal backdrops
- Fullscreen blocking layers

**Overlay tokens MAY NOT be used for:**
- Card backgrounds
- Section backgrounds
- Persistent UI elements

### 5. EXPLICIT FORBIDDANCES (LOCKED)

- **No hardcoded colors** (hex/rgb) allowed in components or CSS.
- **No Tailwind color utilities** (e.g., `bg-gray-100`, `text-slate-800`) unless they map to these tokens.
- **No pseudo-dark implementations** or "inverted" schemes.
- **No per-app color interpretation**; "Primary" is always DaCapo Blue (`#2860E0`/`#2F6BFF`).

**This color system is LOCKED.** No future AG task may reinterpret, regenerate, or modify this system.

---

## A.2 PRIMARY METRIC & INFO BLOCKS (CANONICAL UI)

Primary Metric / Info Blocks are UI elements that present:
- Counts
- Totals
- High-level status indicators
(e.g. “Aantal registraties”, “Aanwezige gasten”).

Rules:
- Background MUST be: `--primary`.
- Text and icons MUST be: `--text-on-primary`.
- Contrast MUST meet WCAG AA.
- Visual style MUST match DaCapo Toolbox dashboards.

Explicitly forbidden:
- White, gray, or surface backgrounds.
- Muted, low-contrast, or inherited text colors.
- App-specific reinterpretation of these blocks.

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
 
---

## C.3 HEADER LOGO IDENTITY (CANONICAL UI)

- Every DaCapo Tool MUST display the app logo in the top-left header position.
- The logo container MUST use background color: `--primary`.
- Logo text and/or icon color MUST be: `--text-on-primary`.
- This rule applies identically in light and dark mode.
- No grayscale, inverted, adaptive, or per-app logo variants are allowed.
- Logo appearance MUST match DaCapo Toolbox exactly.

This rule is MANDATORY for all apps.

 ## C.4 AUTH & LOGIN TEMPLATE
 
 ### AuthGate Component
 - **Pad:** `src/context/AuthGate.jsx` (of `components/AuthGate.jsx`)
 - **Functie:** Route Protection wrapper
 - **Gedrag:**
   - `loading` -> Spinner (full screen)
   - `!user` -> Return `<LoginLanding />`
   - `user` -> Return `<Outlet />` / children
 
### LoginLanding Template
 - **Wrapper:** `relative w-screen h-screen overflow-hidden`
 - **BG Layer:** `absolute inset-0 p-[clamp] overflow-hidden` (Safe Margins via padding)
 - **Gradient:** `absolute inset-0 linear-gradient(...)` inside BG layer
 - **Safe Zone:** `absolute inset-0 max-w-[1280px] mx-auto pointer-events-none`
 - **Vertical Safe Area (Desktop):**
   - `absolute inset-0 flex items-center justify-end`
   - `pt-[clamp(110px,14vh,190px)] pb-[clamp(32px,6vh,80px)]`
   - `pr-[clamp(12px,1.5vw,24px)]`
 - **Card Wrapper:** `pointer-events-auto`
   - Desktop: `static` (inside flex safe area)
   - Mobile: `absolute top-1/2 left-1/2 -translate...` (Centered Overlay)
 - **Float Depth:**
   - Backplate: `absolute -inset-[18px] blur-[22px] radial-gradient`
   - Shadow: `shadow-[0_30px_80px_rgba(0,0,0,0.55)]`
 - **Email Input:** Split badge Design (`flex input + div-badge`)

 ## C.5 DARK MODE TEMPLATE
 
 ### Global Tokens (Required)
 - **File:** `src/index.css` (or `src/styles/theme.css`)
 - **Structure:**
   - `:root { ...light defaults... }`
   - `body.dark { ...canonical dark palette... }`
 
 ### Semantic Usage
 - **Backgrounds:** `bg-card` (maps to `--bg-surface`)
 - **Elevated Surfaces:** `bg-surface-elevated` (maps to `--bg-surface-elevated`)
 - **Text:** `text-primary` (maps to white/92% in dark)
 - **Borders:** `border-theme` (maps to transparent white in dark)
 - **Inputs:** `bg-[var(--input-bg)]`, `text-primary`, `border-theme`
 
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

