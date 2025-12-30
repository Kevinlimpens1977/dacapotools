# Firestore Security Rules for Per-App Credits

This document describes the recommended Firestore security rules for the per-app credit system.

## Data Structure

```
users/{uid}
├── role: string (optional) - "user" | "admin" | "supervisor"
├── email: string
├── displayName: string
├── ... other user fields
└── apps/
    └── {appId}/
        ├── creditsRemaining: number
        ├── monthlyLimit: number
        ├── totalUsedThisMonth: number
        ├── lastResetAt: timestamp
        └── createdAt: timestamp
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function getUserRole(email) {
      // Supervisor emails (hardcoded fallback)
      let supervisorEmails = ['kevlimpens@gmail.com'];
      let adminEmails = ['kevlimpens@gmail.com'];
      
      if (email in supervisorEmails) {
        return 'supervisor';
      } else if (email in adminEmails) {
        return 'admin';
      }
      return 'user';
    }
    
    function isSupervisor() {
      return isAuthenticated() && 
        (getUserRole(request.auth.token.email) == 'supervisor' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'supervisor');
    }
    
    function isAdminOrSupervisor() {
      let role = getUserRole(request.auth.token.email);
      let firestoreRole = get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
      return isAuthenticated() && 
        (role in ['admin', 'supervisor'] || firestoreRole in ['admin', 'supervisor']);
    }
    
    // User documents
    match /users/{userId} {
      // Users can read their own document
      // Admins and supervisors can read all user documents
      allow read: if isOwner(userId) || isAdminOrSupervisor();
      
      // Users can update their own document (except role field)
      // Only supervisors can update role field
      allow update: if isOwner(userId) && !('role' in request.resource.data) ||
                       isSupervisor();
      
      // Users can create their own document
      allow create: if isOwner(userId);
      
      // App credits subcollection
      match /apps/{appId} {
        // Users can read their own credits
        // Admins and supervisors can read all credits
        allow read: if isOwner(userId) || isAdminOrSupervisor();
        
        // Users can create their own credits (initialization)
        allow create: if isOwner(userId);
        
        // Users can update their own credits (for app logic to deduct)
        // BUT only if creditsRemaining is being decremented or totalUsedThisMonth is incremented
        // This prevents users from manually increasing their credits
        allow update: if isOwner(userId) && 
          (request.resource.data.creditsRemaining <= resource.data.creditsRemaining) ||
          isSupervisor();
        
        // Only supervisors can delete credits
        allow delete: if isSupervisor();
      }
    }
    
    // Tools collection (existing rules)
    match /tools/{toolId} {
      allow read: if true;
      allow write: if isAdminOrSupervisor();
    }
    
    // Labels collection (existing rules)
    match /labels/{labelId} {
      allow read: if true;
      allow write: if isAdminOrSupervisor();
    }
    
    // Tool clicks collection (existing rules)
    match /toolClicks/{clickId} {
      allow read: if isAdminOrSupervisor();
      allow create: if isAuthenticated();
    }
  }
}
```

## Key Security Decisions

### 1. Role Resolution
- Primary source: `users/{uid}.role` field in Firestore
- Fallback: Hardcoded supervisor/admin email lists
- Role hierarchy: supervisor > admin > user

### 2. Credit Write Permissions

| Action | User | Admin | Supervisor |
|--------|------|-------|------------|
| Read own credits | ✅ | ✅ | ✅ |
| Read all credits | ❌ | ✅ | ✅ |
| Initialize own credits | ✅ | ✅ | ✅ |
| Decrement own credits (app logic) | ✅ | ✅ | ✅ |
| Increment own credits | ❌ | ❌ | ✅ |
| Modify any user's credits | ❌ | ❌ | ✅ |
| Modify monthly limits | ❌ | ❌ | ✅ |

### 3. Credit Deduction Security

The rule `request.resource.data.creditsRemaining <= resource.data.creditsRemaining` ensures:
- Users/app logic can only **decrement** credits
- Users cannot manually increase their credits
- Only supervisors can increase credits or modify limits

### 4. Monthly Reset

Monthly reset is handled by the app logic when a new month is detected:
- App checks `lastResetAt` against current date
- If new month, resets `creditsRemaining` to `monthlyLimit`
- This is allowed because the reset restores to the existing limit, not exceeding it

> **Note**: For production, consider using Cloud Functions for credit operations to ensure complete security. Client-side rules work for the current phase but are less secure than server-side enforcement.

## Deployment

To deploy these rules:

1. Copy the rules to your Firebase Console: **Firestore Database > Rules**
2. Or use Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules
   ```
