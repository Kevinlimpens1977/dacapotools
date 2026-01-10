rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    /* =========================
       HELPERS
    ========================= */

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function userDoc() {
      return isAuthenticated()
        ? get(/databases/$(database)/documents/users/$(request.auth.uid))
        : null;
    }

    function userData() {
      return userDoc() != null ? userDoc().data : null;
    }

    function globalRole() {
      return userData() != null && ('role' in userData())
        ? userData().role
        : null;
    }

    function isSupervisor() {
      return isAuthenticated() && globalRole() == 'supervisor';
    }

    /* =========================
       USERS (IDENTITY)
    ========================= */

    match /users/{userId} {
      // lezen: eigenaar of supervisor
      allow read: if isOwner(userId) || isSupervisor();

      // aanmaken: alleen zichzelf
      allow create: if isOwner(userId);

      // bijwerken:
      // - user mag eigen profiel
      // - supervisor mag alles
      allow update: if (
        isOwner(userId) &&
        !('role' in request.resource.data)
      ) || isSupervisor();

      allow delete: if isSupervisor();
    }

    /* =========================
       USERS → APPS (PER-APP DATA)
       credits, rol, stats
    ========================= */

    match /users/{userId}/apps/{appId} {
      // lezen: owner of supervisor
      allow read: if isOwner(userId) || isSupervisor();

      // schrijven: ALLEEN supervisor
      allow write: if isSupervisor();
    }

    /* =========================
       TOOLS & LABELS (DACAPOTOOLS)
    ========================= */

    match /tools/{toolId} {
      allow read: if true;
      allow write: if isSupervisor();
    }

    match /labels/{labelId} {
      allow read: if true;
      allow write: if isSupervisor();
    }

    match /toolClicks/{clickId} {
      allow create: if isAuthenticated();
      allow read: if isSupervisor();
      allow update, delete: if false;
    }

    /* =========================
       GASTENREGISTRATIE
    ========================= */

    match /guest_registrations/{guestId} {
      allow create: if isAuthenticated();
      allow read, update, delete: if isSupervisor();
    }

    /* =========================
       NIEUWSBRIEF APP
    ========================= */

    function canAccessNewsletterAdmin() {
      return isSupervisor();
    }

    // Config / headers / settings
    match /apps/nieuwsbrief/config/{docId=**} {
      allow read, write: if canAccessNewsletterAdmin();
    }

    // Nieuwsitems
    match /apps/nieuwsbrief/items/{itemId} {
      allow read: if isAuthenticated();

      allow create: if
        isAuthenticated() &&
        request.resource.data.authorId == request.auth.uid;

      allow update, delete: if canAccessNewsletterAdmin();
    }

    // Nieuwsbrieven
    match /apps/nieuwsbrief/newsletters/{newsletterId} {
      allow read: if isAuthenticated();
      allow write: if canAccessNewsletterAdmin();
    }

    // Contentblokken
    match /apps/nieuwsbrief/birthdays/{id} {
      allow read: if isAuthenticated();
      allow write: if canAccessNewsletterAdmin();
    }

    match /apps/nieuwsbrief/words/{id} {
      allow read: if isAuthenticated();
      allow write: if canAccessNewsletterAdmin();
    }

    match /apps/nieuwsbrief/blocks/{id} {
      allow read: if isAuthenticated();
      allow write: if canAccessNewsletterAdmin();
    }

    match /apps/nieuwsbrief/templates/{id} {
      allow read: if isAuthenticated();
      allow write: if isSupervisor();
    }

    /* =========================
       CONFIG
    ========================= */

    match /config/schoolVacations {
      allow read: if isAuthenticated();
      allow write: if isSupervisor();
    }

    /* =========================
       MAIL EXTENSION
    ========================= */

    match /mail/{mailId} {
      allow create: if isAuthenticated();
      allow read, update, delete: if isSupervisor();
    }

    /* =========================
       LEGACY (READ-ONLY)
    ========================= */

    match /paco_users/{userId} {
      allow read: if isOwner(userId) || isSupervisor();
      allow write: if false;
    }
  }
}
