# Security Specification (`security_spec.md`) — HanViệt Lexicon SaaS

## 1. Data Invariants
1. **Default-Deny Catch-All**: Any path not explicitly matched under `/users/{userId}` or `/users/{userId}/vocabularies/{vocabId}` is unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity & PII Isolation**:
   - All reads and writes require `request.auth != null` and `request.auth.token.email_verified == true`.
   - `/users/{userId}` contains PII (`email`, `displayName`, `photoURL`). Access is strictly restricted to `request.auth.uid == userId`. Collection-level `list` on `/users` is strictly forbidden (`allow list: if false;`) to prevent user enumeration and PII scraping.
3. **Master Gate (Relational Sync)**:
   - A `SavedVocabularyItem` at `/users/{userId}/vocabularies/{vocabId}` can only be created, read (`get`), updated, or deleted if the parent document `/users/{userId}` exists (`exists(/databases/$(database)/documents/users/$(userId))`) and `request.auth.uid == userId`.
4. **Immutable Ownership & Temporal Integrity**:
   - `uid` and `createdAt` on `UserProfile` are immutable after creation; `createdAt` must equal `request.time` on `create`, and `updatedAt` must equal `request.time` on both `create` and `update`.
   - `userId`, `vocabId`, and `createdAt` on `SavedVocabularyItem` are immutable after creation; `createdAt == request.time` on `create`, and `updatedAt == request.time` on `create` and `update`.
5. **Commercial Tier Integrity (Self-Assigned Role / Plan Prevention)**:
   - Users creating a profile must initialize `subscriptionTier` in `['free', 'pro']` and cannot inject arbitrary keys or shadow fields (`hasAll` + `hasOnly`).
6. **Secure List Queries**:
   - `allow list` on `/users/{userId}/vocabularies/{vocabId}` enforces `request.auth.uid == userId && resource.data.userId == request.auth.uid` without `get()`/`exists()` inside `allow list` to prevent O(n) read cost explosions.

---

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Profile Read**: `auth = null`, `GET /users/user_123` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoof**: `auth = { uid: 'user_123', token: { email_verified: false } }`, `CREATE /users/user_123` -> `PERMISSION_DENIED`.
3. **Cross-User PII Read**: `auth = { uid: 'attacker_99', token: { email_verified: true } }`, `GET /users/victim_123` -> `PERMISSION_DENIED`.
4. **User Directory Enumeration**: `auth = { uid: 'user_123', token: { email_verified: true } }`, `LIST /users` -> `PERMISSION_DENIED`.
5. **Shadow Field Injection on Profile Create**: Payload includes all required `UserProfile` fields plus `"isAdmin": true` -> Rejected by `data.keys().hasOnly(...)` -> `PERMISSION_DENIED`.
6. **ID Poisoning Attack**: `CREATE /users/user_123/vocabularies/bad$id!@#` -> Rejected by `isValidId(vocabId)` regex `^[a-zA-Z0-9_\-]+$` -> `PERMISSION_DENIED`.
7. **Orphaned Subcollection Write**: `CREATE /users/user_no_profile/vocabularies/vocab_1` when `/users/user_no_profile` does not exist -> Rejected by `exists(/databases/$(database)/documents/users/$(userId))` -> `PERMISSION_DENIED`.
8. **Ownership Spoofing on Vocabulary Create**: `auth.uid = 'user_123'`, `CREATE /users/user_123/vocabularies/vocab_1` with `userId: 'other_user'` -> Rejected by `data.userId == request.auth.uid` -> `PERMISSION_DENIED`.
9. **Client Timestamp Forgery**: `CREATE /users/user_123` with `createdAt: timestamp('2020-01-01T00:00:00Z') != request.time` -> Rejected by `incoming().createdAt == request.time` -> `PERMISSION_DENIED`.
10. **Immutable Field Mutation on Update**: `UPDATE /users/user_123/vocabularies/vocab_1` attempting to mutate `createdAt` or `userId` -> Rejected by `affectedKeys().hasOnly(...)` and immutability gates -> `PERMISSION_DENIED`.
11. **Value Poisoning / Denial-of-Wallet String Overflow**: `UPDATE /users/user_123/vocabularies/vocab_1` setting `personalNote` to a 50,000-character string -> Rejected by `isValidSavedVocabularyItem(incoming())` (`personalNote.size() <= 1000`) -> `PERMISSION_DENIED`.
12. **Unbounded Array Injection**: `CREATE /users/user_123/vocabularies/vocab_1` with `synonyms` containing 50 items -> Rejected by `data.synonyms.size() <= 10` -> `PERMISSION_DENIED`.

---

## 3. Red Team Audit & Conflict Report
- **Identity Spoofing**: Blocked (`data.uid == request.auth.uid` and `data.userId == request.auth.uid` + `request.auth.uid == userId`).
- **State Shortcutting / Shadow Updates**: Blocked (`hasAll` + `hasOnly` on `create`, action-based `affectedKeys().hasOnly(...)` + full `isValid[Entity](incoming())` wrapper on `update`).
- **Resource / Value Poisoning**: Blocked (`isValidId` regex + `.size()` limits on every string and list).
- **PII Blanket Leak**: Blocked (`allow get` on `/users/{userId}` requires `isOwner(userId)` and `allow list: if false;`).
- **Query Trust Leak**: Blocked (`allow list` on `/users/{userId}/vocabularies/{vocabId}` enforces `request.auth.uid == userId && resource.data.userId == request.auth.uid`).
