# Firestore Security Rules - CANONICAL
# DaCapo Tools v1.0
# Status: CANON (Normatief)

## SUPERVISOR POLICY (ABSOLUTE)

- There is EXACTLY ONE supervisor
- Supervisor role is determined EXCLUSIVELY via Firebase Custom Claims
- Custom claim check: `request.auth.token.supervisor == true`
- NO Firestore field may determine supervisor status
- NO client-side role escalation is possible

---

## CANONICAL SECURITY RULES

Deploy these rules to Firebase Console > Firestore > Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ═══════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
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
    
    // Admin check: supervisor OR app-level administrator
    function isAppAdmin(appId) {
      return isSupervisor() || (
        isAuthenticated() && 
        exists(/databases/$(database)/documents/apps/$(appId)/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/apps/$(appId)/users/$(request.auth.uid)).data.role == 'administrator'
      );
    }
    
    // Check if user has any admin role (for platform-level read access)
    function hasAdminAccess() {
      return isSupervisor(); // Only supervisor has platform-wide admin access
    }
    
    // ═══════════════════════════════════════════════════════════════
    // USERS COLLECTION (Identity Only)
    // ═══════════════════════════════════════════════════════════════
    
    match /users/{userId} {
      // Users can read their own document
      // Supervisor can read all user documents
      allow read: if isOwner(userId) || isSupervisor();
      
      // Users can create their own document
      allow create: if isOwner(userId);
      
      // Users can update their own document
      // FORBIDDEN: No 'role' field allowed in /users (roles are per-app)
      allow update: if isOwner(userId) && 
        !('role' in request.resource.data);
      
      // Only supervisor can delete users
      allow delete: if isSupervisor();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // APPS COLLECTION (App Registry & Per-App User Data)
    // ═══════════════════════════════════════════════════════════════
    
    match /apps/{appId} {
      // App config is readable by authenticated users
      allow read: if isAuthenticated();
      
      // Only supervisor can modify app config
      allow write: if isSupervisor();
      
      // Per-app user data
      match /users/{userId} {
        // Users can read their own app data
        // App admins and supervisor can read all
        allow read: if isOwner(userId) || isAppAdmin(appId);
        
        // CANONICAL: No client-side writes to app user data
        // All mutations must go through Cloud Functions
        allow create: if false;
        allow update: if false;
        allow delete: if false;
      }
      
      // Credit Ledger - IMMUTABLE
      match /creditLedger/{entryId} {
        // Supervisor and app admins can read ledger
        allow read: if isAppAdmin(appId);
        
        // CANONICAL: Ledger is immutable - no client writes
        allow create: if false;
        allow update: if false;
        allow delete: if false;
      }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // TOOLS COLLECTION
    // ═══════════════════════════════════════════════════════════════
    
    match /tools/{toolId} {
      // Tools are publicly readable
      allow read: if true;
      
      // Only supervisor can modify tools
      allow write: if isSupervisor();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // LABELS COLLECTION
    // ═══════════════════════════════════════════════════════════════
    
    match /labels/{labelId} {
      // Labels are publicly readable
      allow read: if true;
      
      // Only supervisor can modify labels
      allow write: if isSupervisor();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // TOOL CLICKS (Analytics)
    // ═══════════════════════════════════════════════════════════════
    
    match /toolClicks/{clickId} {
      // Only supervisor can read analytics
      allow read: if isSupervisor();
      
      // Authenticated users can create click records
      allow create: if isAuthenticated();
      
      // No updates or deletes
      allow update: if false;
      allow delete: if isSupervisor();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // LEGACY: /users/{uid}/apps/{appId} (TO BE MIGRATED)
    // Read-only access during migration period
    // ═══════════════════════════════════════════════════════════════
    
    match /users/{userId}/apps/{appId} {
      // Read-only during migration
      allow read: if isOwner(userId) || isSupervisor();
      
      // No writes - all mutations via Cloud Functions
      allow write: if false;
    }
  }
}
```

---

## KEY SECURITY DECISIONS

### 1. Supervisor Resolution (CANONICAL)

| Method | Status |
|--------|--------|
| Firebase Custom Claims (`token.supervisor == true`) | ✅ REQUIRED |
| Firestore field (`users/{uid}.role`) | ❌ FORBIDDEN |
| Email-based fallback | ❌ FORBIDDEN |
| Client-side role assignment | ❌ FORBIDDEN |

### 2. Credit Write Permissions

| Action | User | App Admin | Supervisor |
|--------|------|-----------|------------|
| Read own credits | ✅ | ✅ | ✅ |
| Read all credits | ❌ | ✅ (own app) | ✅ |
| Modify credits (client) | ❌ | ❌ | ❌ |
| Modify credits (Cloud Function) | ❌ | ❌ | ✅ |

### 3. Ledger Immutability

- Credit ledger entries can NEVER be modified or deleted via client
- Only Cloud Functions with supervisor context can create entries
- This provides a complete audit trail

### 4. Role Assignment

- Only supervisor can assign roles
- Role assignment MUST go through Cloud Functions
- No client-side role escalation possible

---

## DEPLOYMENT

```bash
# Deploy via Firebase CLI
firebase deploy --only firestore:rules

# Or copy rules to Firebase Console:
# Firestore Database > Rules
```

---

## MIGRATION NOTES

The legacy structure `/users/{uid}/apps/{appId}` is set to read-only.
All new data should be written to `/apps/{appId}/users/{uid}`.
Migration should be completed via Cloud Functions.

---

**EINDE SECURITY RULES CANON**
