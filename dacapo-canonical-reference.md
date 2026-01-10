# DACAPO CANONICAL REFERENCE

Status: **CANON (Normatief)**  
Versie: v1.0  
Datum: 2026-01-09  
Afwijking = bug  
Wijzigingen alleen via expliciete versie-update

---

## 0. FUNDAMENTELE PRINCIPES (NIET ONDERHANDELBAAR)

- Dit document is de extractie van het bewezen werkende voorbeeldproject.
- Geen creativiteit, geen optimalisatie, geen vereenvoudiging toegestaan.
- Dit document beschrijft uitsluitend wat IS en wat canoniek gemapt moet worden.
- Exacte namen, waarden, structuren en relaties zijn verplicht.
- Dit document is de enige bron van waarheid voor alle DaCapo Tools.

---

## CONFORMITY AUDIT RAPPORT

### Analyse Bronproject: DaCapo Toolbox App

| Sectie | Status | Toelichting |
|--------|--------|-------------|
| Design System | **A) Conform** | Volledig geïmplementeerd via CSS Custom Properties |
| UI Componenten | **A) Conform** | Consistente structuur met herbruikbare componenten |
| Layout & Navigatie | **A) Conform** | Gestandaardiseerde header, sidebar, routing |
| Firebase Datamodel | **B) Legacy** | Credits in `users/{uid}/apps/{appId}` — moet naar `apps/{appId}/users/{uid}` |
| User-App-Role Model | **B) Legacy** | Globale rol nog in `/users/{uid}` — moet verwijderd |
| Credit System | **B) Legacy** | Client-side mutaties — moet naar Cloud Functions |
| Cloud Functions | **B) Legacy** | Niet volledig geïmplementeerd — vereist uitbreiding |
| Firestore Security Rules | **B) Legacy** | Beschreven maar niet volledig afdwingend |
| Admin UI | **A) Conform** | Aanwezig en functioneel |
| Backend | **A) Conform** | Alleen Firebase, geen Supabase |

### Supabase Status
- **Geen Supabase referenties gevonden in broncode**
- **Geen Supabase SDK in dependencies**
- **Status: CONFORM — Supabase is reeds volledig verwijderd**

Bevestiging: **Supabase is geen onderdeel van de DaCapo canon en mag niet blijven bestaan.**

---

## A. DESIGN SYSTEM (EXACT)

### A.1 Kleuren — Light Mode

| Token | Hex | Context |
|-------|-----|---------|
| `--primary` | `#2860E0` | Buttons, links, accenten |
| `--primary-hover` | `#1C4DAB` | Hover states primary |
| `--primary-light` | `#EBF1FF` | Backgrounds, highlights |
| `--bg-app` | `#F8FAFC` | Page background (Slate-50) |
| `--bg-surface` | `#FFFFFF` | Card backgrounds |
| `--bg-surface-hover` | `#F1F5F9` | Hover backgrounds (Slate-100) |
| `--bg-surface-elevated` | `#FFFFFF` | Elevated surfaces |
| `--text-primary` | `#111827` | Primary text (Gray-900) |
| `--text-secondary` | `#4B5563` | Secondary text (Gray-600) |
| `--text-muted` | `#9CA3AF` | Muted text (Gray-400) |
| `--text-on-primary` | `#FFFFFF` | Text on primary buttons |
| `--border-default` | `#CBD5E1` | Default borders (Slate-300) |
| `--border-strong` | `#94A3B8` | Strong borders (Slate-400) |
| `--icon-default` | `#64748B` | Default icon color (Slate-500) |
| `--icon-hover` | `#2860E0` | Hover icon color |

### A.2 Kleuren — Dark Mode

| Token | Hex | Context |
|-------|-----|---------|
| `--primary` | `#3B82F6` | Primary (Blue-500) |
| `--primary-hover` | `#60A5FA` | Hover (Blue-400) |
| `--primary-light` | `#1E293B` | Highlights (Slate-800) |
| `--bg-app` | `#0F172A` | Page background (Slate-900) |
| `--bg-surface` | `#1E293B` | Card backgrounds (Slate-800) |
| `--bg-surface-hover` | `#334155` | Hover backgrounds (Slate-700) |
| `--text-primary` | `#F8FAFC` | Primary text (Slate-50) |
| `--text-secondary` | `#CBD5E1` | Secondary text (Slate-300) |
| `--text-muted` | `#94A3B8` | Muted text (Slate-400) |
| `--border-default` | `#475569` | Default borders (Slate-600) |
| `--border-strong` | `#64748B` | Strong borders (Slate-500) |
| `--icon-default` | `#94A3B8` | Default icon (Slate-400) |
| `--icon-hover` | `#60A5FA` | Hover icon (Blue-400) |

### A.3 Shadows

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--shadow-card` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | `0 4px 6px -1px rgb(0 0 0 / 0.3)` |
| `--shadow-elevated` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | `0 20px 25px -5px rgb(0 0 0 / 0.5)` |

### A.4 Typografie

| Property | Value |
|----------|-------|
| Font Family | `'Inter', sans-serif` |
| Font Weights | 300, 400, 500, 600, 700 |
| Body Transition | `background-color 0.2s ease, color 0.1s ease` |

### A.5 Icon System

- **Library:** Material Symbols Outlined
- **CDN:** `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap`
- **Default Settings:** `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`
- **Filled Variant:** `font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24`

### A.6 Spacing & Touch Targets

| Context | Value |
|---------|-------|
| Mobile min touch target | `44px` |
| Card padding (desktop) | `p-4` to `p-6` |
| Card padding (mobile) | `p-3` to `p-4` |
| Grid gaps | `gap-3` to `gap-6` |

---

## B. UI COMPONENTEN (STRUCTUREEL)

### B.1 Header Component

**Canonieke naam:** `Header`  
**Pad:** `src/components/Header.jsx`

**Structuur:**
```
Header (sticky, z-50)
├── Logo Container
│   ├── Logo Box (size-9, bg-[#2860E0], rounded-lg)
│   └── App Title (text-lg, font-bold)
├── Center Content (flexibel per app)
└── Actions Container
    ├── Theme Toggle (size-9, rounded-full)
    ├── Admin Button (conditional, amber-500)
    └── Profile/Login Button (size-9, rounded-full)
```

**Verplichte Elements:**
- Logo: `size-9 bg-[#2860E0] rounded-lg text-white font-bold`
- Theme Toggle Icon: `light_mode` (dark) / `dark_mode` (light)
- Profile Avatar: `size-9 rounded-full bg-[#2860E0]`

### B.2 Admin Layout Component

**Canonieke naam:** `AdminLayout`  
**Pad:** `src/components/admin/AdminLayout.jsx`

**Structuur:**
```
AdminLayout (min-h-screen, flex)
├── AdminSidebar (w-48 md:w-64, hidden sm:flex)
└── Main Content Area (flex-1)
    ├── AdminHeader
    └── Main (flex-1, p-6)
```

**Route Protection:**
- Redirect naar `/` indien niet ingelogd
- Access denied screen indien `userRole === 'user'`

### B.3 Admin Sidebar Component

**Canonieke naam:** `AdminSidebar`  
**Pad:** `src/components/admin/AdminSidebar.jsx`

**Structuur:**
```
AdminSidebar
├── Logo Section (amber-500 icon, Admin title)
├── Role Badge (purple voor supervisor, blue voor admin)
├── Navigation Links (NavLink met active state)
└── User Info Section
```

**Navigation Items (canoniek):**
| Label | Path | Icon |
|-------|------|------|
| Overzicht | `/admin` | `dashboard` |
| Tools | `/admin/tools` | `construction` |
| Gebruikers | `/admin/users` | `group` |
| Credits | `/admin/credits` | `payments` |
| Kosten | `/admin/costs` | `euro` |
| Labels & Metadata | `/admin/labels` | `label` |
| Rapportages | `/admin/reports` | `description` |

### B.4 Card Component Pattern

**Basis Card Styling:**
```css
.bg-card rounded-xl border border-theme overflow-hidden
hover:shadow-lg hover:border-[#2860E0]/50 transition-all duration-300
```

**KPI Card Structuur:**
```
KPI Card (bg-card rounded-xl border border-theme p-5)
├── Icon Container (size-12 rounded-lg bg-{color}/10)
│   └── Icon (material-symbols-outlined text-{color})
└── Content
    ├── Value (text-2xl font-bold)
    └── Label (text-sm text-secondary)
```

### B.5 Button Patterns

**Primary Button:**
```jsx
className="py-2.5 px-4 bg-[#2860E0] hover:bg-[#1C4DAB] text-white font-medium rounded-lg transition-colors"
```

**Icon Button (Round):**
```jsx
className="flex items-center justify-center size-9 rounded-full hover:bg-[var(--bg-surface-hover)] transition-colors"
```

**Admin Button:**
```jsx
className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors font-bold"
```

### B.6 Form Controls

**Input/Select/Textarea Base:**
```css
background-color: var(--bg-surface);
border: 1px solid var(--border-default);
color: var(--text-primary);
border-radius: 0.5rem;
transition: all 0.2s;
```

**Focus State:**
```css
outline: none;
border-color: var(--primary);
box-shadow: 0 0 0 2px var(--primary-light);
```

### B.7 CreditDisplay Component

**Canonieke naam:** `CreditDisplay`  
**Pad:** `src/components/CreditDisplay.jsx`

**Props:**
- `appId: string` (required)
- `compact: boolean` (default: false)
- `className: string` (optional)

**Status Colors:**
| Status | Color Class |
|--------|-------------|
| OK | `text-green-500` |
| Low (≤10%) | `text-yellow-500` |
| Empty | `text-red-500` |

---

## C. LAYOUT & NAVIGATIE

### C.1 Page Templates

**Dashboard Template:**
```
min-h-screen flex flex-col
├── Header (sticky)
├── Main Content (flex-1 w-full pb-8)
│   ├── [Optional] Favorites Section
│   └── Main Grid Section
└── [Optional] Drawer/Modal
```

**Admin Template:**
```
min-h-screen flex bg-gray-50 dark:bg-gray-900
├── AdminSidebar (w-48 md:w-64)
└── Main Area (flex-1 flex flex-col)
    ├── AdminHeader
    └── Main (flex-1 p-6 overflow-auto)
```

### C.2 Routing Structuur

**Public Routes:**
| Path | Component |
|------|-----------|
| `/` | `Dashboard` |

**Protected Admin Routes:**
| Path | Component | Lazy Loaded |
|------|-----------|-------------|
| `/admin` | `AdminOverview` | Yes |
| `/admin/tools` | `AdminTools` | Yes |
| `/admin/tools/:id` | `AdminToolForm` | Yes |
| `/admin/tools/new` | `AdminToolForm` | Yes |
| `/admin/users` | `AdminUsers` | Yes |
| `/admin/users/:userId` | `AdminUserDetail` | Yes |
| `/admin/credits` | `AdminCredits` | Yes |
| `/admin/costs` | `AdminCosts` | Yes |
| `/admin/labels` | `AdminLabels` | Yes |
| `/admin/reports` | `AdminReports` | Yes |

### C.3 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Show sidebar, 2-col grid |
| `md` | 768px | Wider sidebar (w-64), adjusted spacing |
| `lg` | 1024px | 3-4 col grids |
| `xl` | 1280px | 5 col grids |
| `2xl` | 1536px | 7 col grids |

---

## D. DATA MODEL — FIREBASE (CANONIEK)

### D.1 Verplichte Regels

1. Users bestaan los van apps
2. Users hebben GEEN globale rol (legacy — moet gemigreerd worden)
3. Rollen en rechten bestaan uitsluitend per app
4. Eén userId ↔ meerdere appIds
5. Eén appId ↔ meerdere users
6. Alle data behoort tot exact één appId
7. Geen data zonder appId-context

### D.2 Huidige Structuur (Legacy — niet canoniek)

```
users/{uid}
├── email: string
├── displayName: string
├── photoURL: string (optional)
├── favorites: string[] (tool IDs)
├── role: string (LEGACY — moet verwijderd)
├── themePreference: 'light' | 'dark'
├── createdAt: timestamp
├── lastLogin: timestamp
└── apps/
    └── {appId}/
        ├── creditsRemaining: number
        ├── monthlyLimit: number
        ├── totalUsedThisMonth: number
        ├── lastResetAt: timestamp
        ├── createdAt: timestamp
        └── role: string (optional)
```

### D.3 Canonieke Structuur (TARGET)

```
/users/{uid}
├── email: string
├── displayName: string
├── photoURL: string (optional)
├── favorites: string[] (tool IDs)
├── themePreference: 'light' | 'dark'
├── createdAt: timestamp
└── lastLogin: timestamp

/apps/{appId}
├── name: string
├── description: string
├── hasCredits: boolean
├── monthlyLimit: number (if hasCredits)
├── creditUnit: string (if hasCredits)
├── creditUnitPlural: string (if hasCredits)
└── users/
    └── {uid}/
        ├── role: 'user' | 'administrator'
        ├── credits: number (if app hasCredits)
        ├── totalUsedThisMonth: number
        ├── lastResetAt: timestamp
        └── createdAt: timestamp

/apps/{appId}/creditLedger/{entryId}
├── uid: string
├── delta: number (positive or negative)
├── reason: string
├── source: 'system' | 'admin' | 'consumption'
└── createdAt: timestamp
```

### D.4 Collections & Subcollections

| Collection | Purpose | Status |
|------------|---------|--------|
| `/users` | User identity | Conform |
| `/users/{uid}/apps` | User app data | Legacy — moet naar `/apps/{appId}/users/{uid}` |
| `/tools` | Tool definitions | Conform |
| `/labels` | Label definitions | Conform |
| `/toolClicks` | Usage analytics | Conform |
| `/apps` | App registry | **NIET GEÏMPLEMENTEERD — VEREIST** |
| `/apps/{appId}/creditLedger` | Credit audit trail | **NIET GEÏMPLEMENTEERD — VEREIST** |

---

## E. USER • APP • ROLE MODEL

### E.1 Canonieke Principes

1. `/users/{uid}` = identiteit ONLY
2. Geen credits in `/users`
3. Geen app-specifieke rollen in `/users`
4. Rollen en permissions zijn altijd `(uid + appId)` gebonden
5. Autorisatie is volledig app-scoped

### E.2 Role Definitions

**Gedefinieerde rollen:**
```javascript
export const ROLES = {
    USER: 'user',
    ADMIN: 'admin',           // Legacy — per-app: 'administrator'
    SUPERVISOR: 'supervisor'  // Platform-level
};
```

### E.3 Permissions Matrix

| Permission | User | Admin | Supervisor |
|------------|------|-------|------------|
| `CREDITS_VIEW_OWN` | ✓ | ✓ | ✓ |
| `CREDITS_VIEW_ALL` | ✗ | ✓ | ✓ |
| `CREDITS_MODIFY` | ✗ | ✗ | ✓ |
| `ADMIN_DASHBOARD` | ✗ | ✓ | ✓ |
| `MANAGE_TOOLS` | ✗ | ✓ | ✓ |
| `MANAGE_LABELS` | ✗ | ✓ | ✓ |
| `VIEW_STATS` | ✗ | ✓ | ✓ |

### E.4 Role Resolution (CANONICAL)

**Supervisor Role - ABSOLUTE RULES:**
1. There is EXACTLY ONE supervisor
2. Supervisor role is determined EXCLUSIVELY via Firebase Custom Claims
3. Custom claim check: `request.auth.token.supervisor === true`
4. NO Firestore field may determine supervisor status
5. Supervisor role is permanent and non-transferable

**Resolution Priority:**
1. Supervisor: Firebase Custom Claims (absolute)
2. App Admin: Per-app role in `/apps/{appId}/users/{uid}.role === 'administrator'`
3. User: Default role for all authenticated users

```javascript
// CANONICAL: Supervisor from custom claims ONLY
function getEffectiveRole(isSupervisorClaim, appRole = null) {
    if (isSupervisorClaim === true) {
        return ROLES.SUPERVISOR;
    }
    if (appRole === 'administrator' || appRole === 'admin') {
        return ROLES.ADMIN;
    }
    return ROLES.USER;
}
```

**❌ FORBIDDEN Methods:**
- Storing supervisor role in Firestore
- Deriving supervisor role from email lists
- Client-side role escalation
- Multiple supervisors

---

## F. CREDIT SYSTEM — CANONIEKE ARCHITECTUUR

### F.1 Kernprincipes

1. Credits zijn altijd per app
2. Credits staan NOOIT in `/users` direct
3. Credits worden alleen server-side gemuteerd (TARGET — nu nog client-side = LEGACY)
4. Frontend is read-only (TARGET)
5. Elke mutatie heeft een ledger entry (TARGET — niet geïmplementeerd)
6. Elke app gebruikt exact dezelfde creditlogica

### F.2 Huidige Data Locatie (Legacy)

```
/users/{uid}/apps/{appId}/
├── creditsRemaining: number
├── monthlyLimit: number
├── totalUsedThisMonth: number
├── lastResetAt: timestamp
└── createdAt: timestamp
```

### F.3 Canonieke Data Locatie (TARGET)

```
/apps/{appId}/users/{uid}/
├── credits: number
├── totalUsedThisMonth: number
├── lastResetAt: timestamp
└── createdAt: timestamp

/apps/{appId}/creditLedger/{entryId}/
├── uid: string
├── delta: number
├── reason: string
├── source: string
└── createdAt: timestamp
```

Ledger is **immutable**.

### F.4 App Credits Configuration

```javascript
export const APP_CREDITS_CONFIG = {
    'paco': {
        appId: 'paco',
        appName: 'Paco Generator',
        hasCredits: true,
        monthlyLimit: 50,
        creditUnit: 'afbeelding',
        creditUnitPlural: 'afbeeldingen',
        description: 'Genereer afbeeldingen met AI'
    },
    'translate': {
        appId: 'translate',
        appName: 'Vertaler',
        hasCredits: true,
        monthlyLimit: 1000,
        creditUnit: 'woord',
        creditUnitPlural: 'woorden',
        description: 'Vertaal teksten naar andere talen'
    },
    'nieuwsbrief': {
        appId: 'nieuwsbrief',
        appName: 'Nieuwsbrief Generator',
        hasCredits: false,
        description: 'Beheer en genereer nieuwsbrieven'
    },
    'gastenregistratie': {
        appId: 'gastenregistratie',
        appName: 'Gastenregistratie',
        hasCredits: false,
        description: 'Registreer gasten en bezoekers'
    }
};
```

### F.5 Credit Service Functions (Huidige API)

| Function | Parameters | Purpose |
|----------|------------|---------|
| `initializeCredits` | `uid, appId` | Initialize credits for first use |
| `getCredits` | `uid, appId` | Get current credits (auto-init, auto-reset) |
| `deductCredits` | `uid, appId, amount` | Deduct after successful action |
| `checkCredits` | `uid, appId, amount` | Check availability (no deduct) |
| `modifyCredits` | `uid, appId, updates` | Supervisor: modify credits |
| `resetMonthlyCredits` | `uid, appId` | Reset to monthly limit |

### F.6 Monthly Reset Logic

```javascript
function isNewMonth(lastResetAt) {
    if (!lastResetAt) return true;
    const now = new Date();
    const lastReset = lastResetAt instanceof Timestamp
        ? lastResetAt.toDate()
        : new Date(lastResetAt);
    return (
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()
    );
}
```

---

## G. ROLLEN & BEVOEGDHEDEN

### G.1 Gebruiker (user)

- Mag eigen credits lezen
- Mag acties starten (die credits consumeren)
- Mag geen directe writes uitvoeren naar credits

### G.2 Administrator (admin/administrator)

- Mag credits lezen van alle users (read-only)
- Mag tools en labels beheren
- Mag geen credit mutaties uitvoeren

### G.3 Supervisor

- Mag credits beheren via server-logica
- Mag rollen toekennen
- Volledige platform-controle
- Geen client-side bypass

---

## H. CLOUD FUNCTIONS (CONTRACTUEEL)

### H.1 Huidige Status: LEGACY / INCOMPLEET

Cloud Functions zijn gedeeltelijk geïmplementeerd. De volgende functies zijn **verplicht** voor canonieke conformiteit:

### H.2 Verplichte Cloud Functions

| Function Name | Trigger | Parameters | Purpose |
|---------------|---------|------------|---------|
| `initAppUser` | Callable | `appId, uid` | Initialize user for app |
| `consumeCredits` | Callable | `appId, uid, amount, action` | Deduct credits after action |
| `adminAdjustCredits` | Callable | `appId, uid, delta, reason` | Supervisor credit adjustment |
| `monthlyReset` | Scheduled | — | Reset all users' credits monthly |

### H.3 Function Requirements

Elke functie MOET:
1. Auth-check uitvoeren
2. App-scope valideren
3. Transactioneel zijn (Firestore transaction)
4. Ledger entry creëren bij credit mutaties

---

## I. FIRESTORE SECURITY RULES

### I.1 Helper Functions (CANONICAL)

```javascript
function isAuthenticated() {
    return request.auth != null;
}

function isOwner(userId) {
    return isAuthenticated() && request.auth.uid == userId;
}

// CANONICAL: Supervisor check via custom claims ONLY
function isSupervisor() {
    return isAuthenticated() && request.auth.token.supervisor == true;
}

// App-level admin check
function isAppAdmin(appId) {
    return isSupervisor() || (
        isAuthenticated() && 
        exists(/databases/$(database)/documents/apps/$(appId)/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/apps/$(appId)/users/$(request.auth.uid)).data.role == 'administrator'
    );
}
```

**❌ FORBIDDEN in Security Rules:**
- Reading supervisor status from Firestore documents
- Email-based role checks
- Any client-side role escalation paths

### I.2 Canonieke Rules Structuur

```javascript
// Users collection
match /users/{userId} {
    allow read: if isOwner(userId) || isAdminOrSupervisor();
    allow update: if isOwner(userId) && !('role' in request.resource.data) ||
                     isSupervisor();
    allow create: if isOwner(userId);
    
    // App credits subcollection (LEGACY LOCATION)
    match /apps/{appId} {
        allow read: if isOwner(userId) || isAdminOrSupervisor();
        allow create: if isOwner(userId);
        // Only decrement allowed, no increment
        allow update: if isOwner(userId) && 
            (request.resource.data.creditsRemaining <= resource.data.creditsRemaining) ||
            isSupervisor();
        allow delete: if isSupervisor();
    }
}

// Tools collection
match /tools/{toolId} {
    allow read: if true;
    allow write: if isAdminOrSupervisor();
}

// Labels collection
match /labels/{labelId} {
    allow read: if true;
    allow write: if isAdminOrSupervisor();
}
```

### I.3 Target Rules (Canoniek Model)

```javascript
// Apps collection (TO BE IMPLEMENTED)
match /apps/{appId} {
    allow read: if isAuthenticated();
    allow write: if isSupervisor();
    
    match /users/{userId} {
        allow read: if isOwner(userId) || isAdminOrSupervisor();
        // Credits ONLY via Cloud Functions
        allow write: if false;
    }
    
    match /creditLedger/{entryId} {
        allow read: if isAdminOrSupervisor();
        // Immutable - only Cloud Functions can write
        allow write: if false;
    }
}
```

---

## J. ADMIN UI (STRUCTUREEL)

### J.1 Verplichte Admin Pagina's

| Page | Path | Purpose |
|------|------|---------|
| Overview | `/admin` | Dashboard met KPIs en alerts |
| Tools | `/admin/tools` | CRUD voor tools |
| Users | `/admin/users` | User lijst met rollen |
| User Detail | `/admin/users/:id` | Per-user app settings |
| Credits | `/admin/credits` | Credit overzicht per app |
| Labels | `/admin/labels` | Label beheer |
| Reports | `/admin/reports` | Rapportages |

### J.2 Admin UI Requirements

1. Role-aware content (supervisor vs admin)
2. Read-only indicators voor non-supervisors
3. Consistent card-based layout
4. Loading states met spin animation
5. Empty states met icon + tekst

### J.3 Component Hierarchy

```
AdminLayout
├── AdminSidebar
│   ├── Logo Section
│   ├── Role Badge
│   ├── Navigation
│   └── User Info
├── AdminHeader
└── [Page Content via Outlet]
```

---

## K. EXTENSIEPUNTEN (TOEKOMSTVAST)

### K.1 Mogelijke Uitbreidingen

1. Abonnementen per app
2. Credit bundels
3. Periodieke credit resets (wekelijks, maandelijks)
4. Purchases via server-only
5. API key management per app

### K.2 Extensie Regels

Uitbreiding MAG:
- Nieuwe velden toevoegen aan bestaande structuren
- Nieuwe collections toevoegen

Uitbreiding MAG NIET:
- User-structuur wijzigen
- App-structuur wijzigen (na migratie)
- Ledger omzeilen
- Client-side credit mutaties introduceren

---

## L. CONFORMITY RULES

### L.1 Conformiteit Definities

| Status | Betekenis |
|--------|-----------|
| **VERPLICHT** | Moet exact zo geïmplementeerd worden |
| **OPTIONEEL** | Mag toegevoegd worden indien nodig |
| **VERBODEN** | Mag nooit voorkomen |

### L.2 Verplichte Elementen

- Firebase als enige backend
- CSS Custom Properties design system
- Material Symbols icon library
- Inter font family
- ThemeContext voor dark/light mode
- AuthContext voor authentication
- Supervisor-only credit mutaties (via Cloud Functions)

### L.3 Verboden Elementen

- Supabase (backend, auth, of SDK)
- Client-side credit increments
- Globale rollen voor app-logic
- Direct Firestore writes naar creditLedger
- Inline color values (gebruik tokens)
- Non-Firebase authentication providers

### L.4 Afwijking = Bug

- Wat afwijkt zonder versie-update is NON-CONFORM
- Afwijking = bug
- Canon wint altijd bij conflict

---

## M. BACKEND CANON & MIGRATIE

### M.1 Backend Stack

| Component | Canoniek | Status |
|-----------|----------|--------|
| Authentication | Firebase Auth | Conform |
| Database | Cloud Firestore | Conform |
| Storage | Firebase Storage | Conform |
| Functions | Cloud Functions | Incompleet |
| Hosting | Firebase Hosting | Optioneel |

### M.2 Vereiste Migraties

1. **Credit location:** `/users/{uid}/apps/{appId}` → `/apps/{appId}/users/{uid}`
2. **Global role:** Verwijder `role` uit `/users/{uid}`
3. **Credit mutations:** Client-side → Cloud Functions only
4. **Ledger:** Implementeer `/apps/{appId}/creditLedger`

### M.3 Firebase Project Configuration

**Environment Variables:**
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## N. SUPABASE DECOMMISSIONING (VERPLICHT)

### N.1 Huidige Status

**Supabase is volledig verwijderd uit dit project.**

Verificatie:
- ✓ Geen Supabase imports in code
- ✓ Geen Supabase in package.json
- ✓ Geen Supabase environment variables
- ✓ Geen Supabase auth flows

### N.2 Verboden na Migratie

- Geen Supabase project
- Geen Supabase auth
- Geen Supabase DB calls
- Geen SDK imports
- Geen env vars of keys
- Geen policies of edge functions

**Verder bouwen is verboden zolang Supabase-resten bestaan.**

---

## O. DEFINITIE VAN KLAAR

### O.1 Platform-Waardigheid Checklist

Een project is platform-waardig als:

| Criterium | Status |
|-----------|--------|
| UX/UI conform aan design system | ☑ Vereist |
| Firebase model conform aan canonical structure | ☑ Vereist |
| Rollen per-app (niet globaal) | ☑ Vereist |
| Credits server-side only mutaties | ☑ Vereist |
| Security rules conform | ☑ Vereist |
| Cloud Functions geïmplementeerd | ☑ Vereist |
| Supabase volledig verwijderd | ☑ Vereist |
| Ledger voor credit audit trail | ☑ Vereist |

---

## APPENDIX: TECHNISCHE REFERENTIES

### Dependencies (Canoniek)

```json
{
  "dependencies": {
    "firebase": "^12.7.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.11.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.18",
    "@vitejs/plugin-react": "^5.1.1",
    "tailwindcss": "^4.1.18",
    "vite": "^7.2.4"
  }
}
```

### File Structure (Canoniek)

```
src/
├── App.jsx                 # Main app with routing
├── main.jsx                # Entry point
├── index.css               # Design system CSS
├── firebase.js             # Firebase initialization
├── components/
│   ├── Header.jsx
│   ├── CreditDisplay.jsx
│   ├── admin/
│   │   ├── AdminLayout.jsx
│   │   ├── AdminSidebar.jsx
│   │   └── AdminHeader.jsx
│   └── [...other components]
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── config/
│   ├── appCredits.js
│   └── roles.js
├── hooks/
│   ├── useCredits.js
│   └── [...other hooks]
├── services/
│   └── CreditService.js
└── pages/
    ├── Dashboard.jsx
    └── admin/
        ├── AdminOverview.jsx
        ├── AdminUsers.jsx
        ├── AdminUserDetail.jsx
        ├── AdminCredits.jsx
        └── [...other admin pages]
```

---

## CANON VERKLARING

Dit document is **CANON** en geldt als enige referentie voor conformiteit binnen DaCapo Tools.

Alle toekomstige DaCapo tools moeten volledig conformeren aan de specificaties in dit document.

Afwijkingen zonder expliciete versie-update van dit document zijn bugs en moeten gecorrigeerd worden.

---

**EINDE CANON**
