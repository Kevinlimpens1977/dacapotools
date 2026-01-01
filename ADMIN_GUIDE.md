# ADMIN_GUIDE.md  
## DaCapoTools – Nieuwsbrief Generator

Deze handleiding beschrijft hoe de **Nieuwsbrief Generator** binnen **DaCapoTools** wordt gebruikt en beheerd.  
De focus ligt op **rollen, workflow, analytics en verantwoordelijkheden**.

---

## 1. Overzicht

De Nieuwsbrief Generator is een geïntegreerde applicatie binnen DaCapoTools voor:

- Het **inzenden** van nieuwsitems door medewerkers
- **Redactie en goedkeuring** door nieuwsbrief-editors
- **Samenstellen en publiceren** van nieuwsbrieven
- **Inzicht** voor MT en directie via analytics

Alles werkt met:
- Centrale login (Firebase Auth)
- Centrale rollenstructuur (DaCapoTools)
- Gescheiden verantwoordelijkheden (veilig & overzichtelijk)

---

## 2. Rollen & Rechten

### Globale Rollen (DaCapoTools)

| Rol | Betekenis |
|----|-----------|
| User | Gewone gebruiker |
| Admin | Beheerder (lezen + inzicht) |
| Supervisor | Volledig beheer, inclusief rollen |

---

### Nieuwsbrief-specifieke Rollen

Deze worden ingesteld **per gebruiker** in de DaCapoTools admin.

| Nieuwsbrief Rol | Rechten |
|-----------------|---------|
| Geen | Geen toegang tot redactie |
| Editor | Items beoordelen, bewerken, goedkeuren |
| Admin | Volledig nieuwsbriefbeheer |

📍 Technisch opgeslagen op:  
`/users/{uid}/apps/nieuwsbrief/role`

---

### Belangrijke regels
- **Admins** kunnen nieuwsbriefrollen **zien**, maar **niet aanpassen**
- **Alleen Supervisors** kunnen nieuwsbriefrollen wijzigen
- Nieuwsbrief-admins hebben **geen** DaCapoTools adminrechten (scheiding van macht)

---

## 3. Gebruikersflow (Inzenden)

1. Gebruiker logt in
2. Gaat naar **Nieuwsbrief → Item indienen**
3. Vult in:
   - Titel
   - Tekst (met AI-hulp mogelijk)
   - Doelgroep (personeel / ouders / niveaus)
   - Week (visueel geselecteerd)
4. Item wordt opgeslagen met status: **Pending**

Na succesvolle inzending ziet de gebruiker een bevestiging met uitleg wat er gebeurt.

---

## 4. Redactieflow (Admin / Editor)

### Overzicht (AdminOverview)
- Weekselector (vorige / volgende week)
- Statusoverzicht:
  - Pending
  - Approved
  - Rejected
  - Published
- Snelle actie: **Samenstellen nieuwsbrief**

---

### Items beheren (AdminItems)
Editors en admins kunnen:

- Items bekijken per week
- Items **inline bewerken**:
  - Titel
  - Inhoud
  - Week
  - Doelgroep
- Items:
  - Goedkeuren
  - Afwijzen
  - Verwijderen

🔒 Niet aanpasbaar (veilig):
- Auteur
- Status (door gebruikers)
- Gekoppelde nieuwsbrief

---

## 5. Nieuwsbrief samenstellen

### AdminCompose

- Selecteer goedgekeurde items
- Sleep items in juiste volgorde
- Kies nieuwsbrief-type (Personeel / Ouders)
- Bekijk **live preview** (realtime)

De preview toont:
- Week & jaartal
- Inhoud in juiste volgorde
- DaCapo-huisstijl

📝 De preview is inhoudelijk correct, maar vereenvoudigd (email-optimalisatie gebeurt bij publicatie).

---

## 6. Publiceren

- Alleen nieuwsbrief-admins
- Nieuwsbrief krijgt status **Published**
- Wordt zichtbaar in het archief
- Kan worden verzonden via het afgesproken kanaal

---

## 7. Analytics (MT & Beheer)

📍 Te vinden via:  
**Admin → Nieuwsbrief Analytics**

### Beschikbare inzichten
- Totaal aantal ingezonden items
- Aantal items in afwachting
- Goedkeuringspercentage
- Gemiddelde goedkeurtijd
- Inzendingen per week
- Inzendingen per gebruiker
- Verdeling per doelgroep

### Export mogelijkheden
De analytics dashboard biedt drie CSV export opties:

1. **Items per Week** - Wekelijkse inzendtrends
2. **Items per Gebruiker** - Contributie per medewerker
3. **Doelgroep Verdeling** - Audience spreiding

Alle exports bevatten:
- Duidelijke headers
- Datum in bestandsnaam
- Geselecteerde periode (bijv. 8 weken)

### Belangrijk
- Analytics is **read-only**
- Alleen zichtbaar voor **Admin & Supervisor**
- Gebaseerd op **echte Firestore data**
- CSV downloads werken client-side (geen backend vereist)

---

## 8. Rollen Beheren (DaCapoTools Admin)

### Via Admin → Gebruikers

Supervisors kunnen nieuwsbriefrollen toewijzen:

1. Navigeer naar **Admin → Gebruikers**
2. Zoek de gebruiker
3. Klik op het **mail icoon** (✉️) voor nieuwsbrief rol
4. Selecteer rol: **Geen / Editor / Admin**
5. Opgeslagen automatisch

Admins (niet-supervisors) kunnen:
- ✅ Rollen **bekijken**
- ❌ Rollen **niet wijzigen**

---

## 9. Beveiliging & Verantwoordelijkheden

- Gebruikers kunnen **alleen eigen items aanpassen zolang ze pending zijn**
- Editors/Admins kunnen redactionele wijzigingen doen
- Rollen worden **centraal** beheerd in DaCapoTools
- Nieuwsbrief app heeft **geen schrijfrechten** op gebruikersdata
- Analytics kan **niet** worden aangepast vanuit de UI
- Firestore rules handhaven alle permissies server-side

---

## 10. Wat admins NIET kunnen

❌ Geen gebruikersrollen wijzigen (tenzij Supervisor)  
❌ Geen analytics aanpassen  
❌ Geen gepubliceerde nieuwsbrieven wijzigen  
❌ Geen auteurschap aanpassen  

---

## 11. Technische Details

### Data Structuur
```
/users/{uid}/
  - role: "user" | "admin" | "supervisor"  (globaal)
  - apps/
    - nieuwsbrief/
      - role: "none" | "editor" | "admin"  (app-specifiek)

/apps/nieuwsbrief/items/{itemId}
  - title, content, week, doelgroep
  - status, submittedBy, createdAt, approvedAt
```

### Performance Optimalisatie
- Admin routes gebruiken **code-splitting** (React.lazy)
- Nieuwsbrief Analytics wordt alleen geladen wanneer nodig
- Main bundle: ~645KB (gzipped: ~200KB)
- Admin chunks: 4-22KB per module

---

## 12. Support & Doorontwikkeling

Toekomstige uitbreidingen (optioneel):
- ~~CSV / Excel exports voor MT~~ ✅ **Geïmplementeerd**
- Trendanalyse t.o.v. vorige periode
- Audit logging
- Preview inclusief verjaardagen & woord van de dag
- Email integratie voor automatische verzending

---

## 13. Samenvatting

De Nieuwsbrief Generator binnen DaCapoTools is:

- ✅ Veilig
- ✅ Overzichtelijk
- ✅ Schaalbaar
- ✅ Rol-gedreven
- ✅ Geschikt voor dagelijks gebruik door schoolorganisaties
- ✅ Voorzien van analytics en export functionaliteit

Bij vragen: neem contact op met de DaCapoTools Supervisor.

---

**Versie:** 1.0  
**Laatste update:** Januari 2026  
**Auteur:** DaCapoTools Development Team
