
---

## TAKEN — VERPLICHTE VOLGORDE

### 1. STRUCTURELE VERGELIJKING
- Vergelijk project ↔ canon
- Detecteer alle afwijkingen in:
  - UX/UI (tokens, componenten, layout)
  - Navigatie
  - Datamodel
  - Rollen & rechten
  - Creditsysteem
  - Backend logica
  - Security rules

---

### 2. AUTOMATISCHE CORRECTIE
Pas het project aan zodat het:

- Exact dezelfde UX/UI-structuur volgt
- Het canonieke Firebase model gebruikt
- Per-app rollen & rechten afdwingt
- Credits uitsluitend server-side muteert
- Ledger entries altijd creëert
- Cloud Functions als enige mutatiepad gebruikt
- Firestore Security Rules afdwingt

Geen optimalisaties.  
Geen alternatieven.  
Geen interpretatie.

---

### 3. SUPABASE MIGRATIE (INDIEN AANWEZIG)

Als Supabase wordt gedetecteerd:

- Migreer data, auth en logica naar Firebase
- Map alles naar het canonieke model
- Implementeer Firebase Auth, Firestore, Functions en Rules
- Verwijder Supabase volledig (zie Supabase Clean Check)

---

### 4. SUPABASE CLEAN CHECK (HARDE GATE)

Alle onderstaande checks **MOETEN slagen**:

- [ ] Geen Supabase SDK imports
- [ ] Geen Supabase environment variables / keys / URLs
- [ ] Geen Supabase auth flows
- [ ] Geen Supabase database calls
- [ ] Geen Supabase policies of edge functions
- [ ] Geen Supabase project afhankelijkheden

❌ Als één check faalt → **PROJECT IS NON-CONFORM**  
❌ Verder bouwen is verboden

---

### 5. SECURITY VALIDATIE
- Controleer Firestore Security Rules:
  - app-scope enforced
  - credits & ledger server-only
  - geen client-side writes naar gevoelige paden
- Controleer Cloud Functions:
  - auth-checks
  - role-checks
  - transacties + ledger entries

---

## OUTPUT (VERPLICHT)

De agent moet **exact** dit opleveren:

### A. UITGEVOERDE WIJZIGINGEN
- Lijst van alle aanpassingen
- Gegroepeerd per domein (UI, data, backend, security)

### B. BLOKKADES
- Wat niet automatisch kon worden aangepast
- Waarom niet
- Wat handmatige actie vereist

### C. EINDSTATUS
Eén van de volgende (verplicht):

- ✅ “Project is CONFORM aan DaCapo Canon”
- ❌ “Project is NON-CONFORM” + redenen

Zonder eindstatus is de conformity run ongeldig.

---

## VERBODEN GEDRAG

De agent mag **NOOIT**:
- Afwijken van canon
- Meerdere oplossingen voorstellen
- Creatieve verbeteringen doen
- “Betere alternatieven” suggereren
- Supabase laten bestaan “tijdelijk”

---

## SLOTVERKLARING

Dit document is de **enige toegestane manier**
om projecten binnen DaCapo Tools te laten bouwen of aanpassen.

Niet conform = niet bouwen.

---

EINDE PROCEDURE
