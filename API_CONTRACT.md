# Nihol — Backend API Contract

> **Audience:** Flutter mobile team  
> **Backend:** Next.js 15 (`src/app/api/`)  
> **Last updated:** 2026-06-30  
> **Secrets:** API keys (LLM, RAGFlow, Payme, etc.) live **only on the server**. Mobile must never embed them.

---

## Backend URL

| Environment | Base URL |
|-------------|----------|
| **Production** | `BASE_URL = TODO` *(fill after deploy)* |
| **Local dev** | `http://localhost:3001` |

All paths below are relative to `BASE_URL`.

**Headers (all JSON endpoints):**
```
Content-Type: application/json
Accept: application/json
```

---

## Common response shape

Most endpoints return:

```json
{
  "success": true,
  "data": { ... }
}
```

**Error shape:**
```json
{
  "success": false,
  "error": "Human-readable message in Uzbek",
  "code": "OPTIONAL_CODE"
}
```

| HTTP status | Meaning |
|-------------|---------|
| `200` | OK |
| `400` | Bad request (validation) |
| `401` | Not authenticated |
| `402` | Payment / plan limit |
| `403` | Forbidden (e.g. PIN required) |
| `404` | Not found |
| `409` | Conflict (e.g. email taken) |
| `500` | Server error |
| `503` | Service not configured |

---

## Authentication (important for mobile)

### Current behavior (web)

| Cookie name | Purpose | Lifetime |
|-------------|---------|----------|
| `nihol_session` | Parent login session (JWT) | 7 days |
| `nihol_pin` | Parent PIN verified | 2 hours |

After `POST /api/auth/register` or `POST /api/auth/login`, the server sets `nihol_session` via **`Set-Cookie`** (httpOnly).  
The JWT token is **not** returned in the JSON body today.

After `POST /api/auth/pin`, the server sets `nihol_pin` via **`Set-Cookie`**.

### Mobile integration options

**Option A — Cookie jar (works today)**  
Use `dio` + cookie manager. Send cookies automatically on parent endpoints.

**Option B — Bearer token (recommended, needs small backend change)**  
Backend should:
1. Return `{ "token": "..." }` on login/register.
2. Accept `Authorization: Bearer <token>` on protected routes.

Until Option B is implemented, mobile must use **Option A**.

### Auth levels

| Level | Required for |
|-------|----------------|
| **None** | `/api/health`, `/api/chat`, `/api/figures/*/chat`, `/api/mood` |
| **Parent session** | `/api/auth/me`, `/api/auth/pin`, `/api/parent/*`, `/api/payments/checkout` |
| **Parent session + PIN verified** | `/api/parent/insights`, `/api/parent/safety` (only if parent has PIN set) |

> **Security note:** Child chat/mood endpoints currently accept any valid `childId` without child auth. Treat `childId` as sensitive; store it securely on device after parent creates the child profile.

---

## Mobile mapping tables

### Figure slug mapping (mobile → backend)

Mobile app uses short IDs. Backend URL path uses **web slugs**.

| Mobile ID | Backend slug (use in URL) | Name |
|-----------|---------------------------|------|
| `ulugbek` | `mirzo-ulugbek` | Mirzo Ulug'bek |
| `beruniy` | `abu-rayhon-beruniy` | Abu Rayhon Beruniy |
| `ibnsino` | `ibn-sino` | Ibn Sino |
| `xorazmiy` | `al-xorazmiy` | Al-Xorazmiy |

**Example:** Mobile chat with Ulug'bek →  
`POST /api/figures/mirzo-ulugbek/chat`

**Other backend figures (no mobile ID yet):**

| Backend slug | Name |
|--------------|------|
| `alisher-navoiy` | Alisher Navoiy |
| `amir-temur` | Amir Temur |
| `imom-al-buxoriy` | Imom al-Buxoriy |

**Free plan** unlocks only: `mirzo-ulugbek`, `al-xorazmiy`, `alisher-navoiy`.

---

### Mood mapping (mobile → backend)

Mobile uses 3 enum values. Backend uses **emoji strings**.

| Mobile `MoodType` | Send to API as `emoji` | Score |
|-------------------|------------------------|-------|
| `happy` | `😊` | 5 |
| `neutral` | `😐` | 3 |
| `sad` | `😢` | 1 |

Optional finer mapping if you add more UI later:

| Emoji | Score | Label |
|-------|-------|-------|
| `😊` | 5 | Very happy |
| `🙂` | 4 | Happy |
| `😐` | 3 | Neutral |
| `😔` | 2 | Sad |
| `😢` | 1 | Very sad |

---

### Subscription tier mapping (mobile → backend)

Mobile UI uses `mini / plus / max`. Backend uses **`free / standard / family`**.

| Mobile tier | Backend `planId` | Price (UZS/mo) | Features |
|-------------|------------------|----------------|----------|
| `mini` | `free` | 0 | 1 child, 15 msgs/day, 3 figures |
| `plus` | `standard` | 24 000 | 1 child, unlimited chat, all figures, weekly report |
| `max` | `family` | 29 000 | 3 children, unlimited chat, all figures, weekly report |

**Checkout API** accepts only `"standard"` or `"family"` (not `"free"`).

Plan is stored in `ParentSettings.subscriptionPlan`.

---

# Endpoints (19 mobile + 3 server-only)

---

## 1. Health check

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/health` |
| **Auth** | None |

### Response `200`

```json
{
  "status": "ok",
  "version": "0.1.0",
  "environment": "development",
  "dataResidency": {
    "region": "UZ",
    "database": true,
    "minio": true,
    "compliant": true,
    "warnings": []
  }
}
```

`status` may be `"degraded"` if data residency checks fail.

### Example

```http
GET /api/health HTTP/1.1
Host: localhost:3001
```

---

## 2. Register parent

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/auth/register` |
| **Auth** | None |
| **Side effect** | Sets `nihol_session` cookie |

### Request body

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | ✅ | Valid email |
| `password` | string | ✅ | Min 8 characters |
| `name` | string | ❌ | Parent display name |

### Success `200`

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "parent@example.com",
    "name": "Jasurbek"
  }
}
```

### Errors

| Status | `error` |
|--------|---------|
| `400` | `Noto'g'ri email` / `Parol kamida 8 belgidan iborat bo'lishi kerak` |
| `409` | `Bu email allaqachon ro'yxatdan o'tgan` |
| `500` | `Ro'yxatdan o'tishda xatolik` |

### Example

```json
// Request
POST /api/auth/register
{
  "email": "parent@example.com",
  "password": "securepass123",
  "name": "Jasurbek Alimov"
}

// Response
{
  "success": true,
  "data": {
    "id": "clxabc123",
    "email": "parent@example.com",
    "name": "Jasurbek Alimov"
  }
}
```

---

## 3. Login parent

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/auth/login` |
| **Auth** | None |
| **Side effect** | Sets `nihol_session` cookie |

### Request body

| Field | Type | Required |
|-------|------|----------|
| `email` | string | ✅ |
| `password` | string | ✅ |

### Success `200`

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "parent@example.com",
    "name": "Jasurbek",
    "hasPin": true
  }
}
```

### Errors

| Status | `error` |
|--------|---------|
| `400` | `Email va parol talab qilinadi` |
| `401` | `Email yoki parol noto'g'ri` |
| `500` | `Kirishda xatolik` |

### Example

```json
POST /api/auth/login
{ "email": "parent@example.com", "password": "securepass123" }
```

---

## 4. Logout

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/auth/logout` |
| **Auth** | Session cookie (optional) |
| **Side effect** | Clears session + PIN cookies |

### Success `200`

```json
{ "success": true }
```

---

## 5. Current parent profile

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/auth/me` |
| **Auth** | ✅ Parent session |

### Success `200`

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "parent@example.com",
    "name": "Jasurbek",
    "hasPin": true,
    "pinVerified": false,
    "children": [
      {
        "id": "clxchild1",
        "parentId": "clx...",
        "name": "Ahrorbek",
        "age": 9,
        "language": "uz",
        "createdAt": "2026-06-30T10:00:00.000Z",
        "updatedAt": "2026-06-30T10:00:00.000Z"
      }
    ],
    "settings": {
      "id": "...",
      "parentId": "clx...",
      "screenTimeMinutes": 60,
      "contentLevel": "standard",
      "subscriptionPlan": "free",
      "subscriptionActive": false,
      "subscriptionExpiresAt": null
    }
  }
}
```

### Errors

| Status | `error` |
|--------|---------|
| `401` | `Avtorizatsiya talab qilinadi` |

---

## 6. Parent PIN

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/auth/pin` |
| **Auth** | ✅ Parent session |
| **Side effect** | Sets `nihol_pin` cookie on success |

### Request body — verify PIN

| Field | Type | Required |
|-------|------|----------|
| `pin` | string | ✅ (4–6 digits) |

### Request body — set / change PIN

| Field | Type | Required |
|-------|------|----------|
| `action` | `"set"` | ✅ |
| `newPin` | string | ✅ (4–6 digits) |
| `pin` | string | ✅ if PIN already exists (current PIN) |

### Success `200`

```json
{
  "success": true,
  "data": { "pinVerified": true }
}
```

### Errors

| Status | `error` |
|--------|---------|
| `400` | `PIN talab qilinadi` / `PIN 4-6 raqamdan iborat bo'lishi kerak` |
| `401` | `Avtorizatsiya talab qilinadi` / `PIN noto'g'ri` / `Joriy PIN noto'g'ri` |
| `500` | `PIN xatolik` |

### Example — verify

```json
POST /api/auth/pin
{ "pin": "2026" }
```

### Example — set new PIN

```json
POST /api/auth/pin
{ "action": "set", "newPin": "2026" }
```

---

## 7. General AI chat (non-figure)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/chat` |
| **Auth** | None *(childId in body)* |

> Prefer `/api/figures/{slug}/chat` for historical figure conversations in the mobile app.

### Request body

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `childId` | string | ✅ | From `POST /api/parent/children` |
| `message` | string | ✅ | 1–2000 chars |
| `age` | number | ✅ | 7–12 |
| `language` | string | ✅ | `"uz"` or `"ru"` |
| `name` | string | ❌ | Child name |
| `conversationId` | string | ❌ | Continue existing chat |

### Success `200`

```json
{
  "success": true,
  "data": {
    "conversationId": "clxconv...",
    "reply": "Salom! Bugun nima o'rganamiz?",
    "filtered": false,
    "crisis": false
  }
}
```

| Field | Meaning |
|-------|---------|
| `filtered` | Safety filter modified/blocked content |
| `crisis` | Crisis protocol triggered — show parent alert UI |
| `error` | Optional soft error inside success payload |

### Errors

| Status | `error` |
|--------|---------|
| `400` | Validation (missing childId, age, language, etc.) |
| `402` | Daily chat limit reached (free plan) |
| `500` | `Suhbatda xatolik yuz berdi. Keyinroq urinib ko'ring.` |

### Example

```json
POST /api/chat
{
  "childId": "clxchild1",
  "message": "Salom!",
  "age": 9,
  "name": "Ahrorbek",
  "language": "uz"
}
```

---

## 8. Figure chat (alloma)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/figures/{slug}/chat` |
| **Auth** | None *(childId in body)* |

**`{slug}`** = backend slug (see mapping table), e.g. `mirzo-ulugbek`.

### Request body

Same as `/api/chat`.

### Success `200`

```json
{
  "success": true,
  "data": {
    "conversationId": "clxconv...",
    "figureSlug": "mirzo-ulugbek",
    "figureName": "Mirzo Ulug'bek",
    "reply": "Salom, yosh astronom! ...",
    "filtered": false,
    "crisis": false,
    "grounded": true,
    "sources": ["Ziji jadvali"]
  }
}
```

| Field | Meaning |
|-------|---------|
| `grounded` | Answer used RAG/knowledge base |
| `sources` | RAG source labels (may be empty) |

### Errors

| Status | `error` |
|--------|---------|
| `400` | Validation error |
| `402` | Figure locked (free plan) or chat limit |
| `404` | Figure not found |
| `500` | Server error |

### Example

```json
POST /api/figures/mirzo-ulugbek/chat
{
  "childId": "clxchild1",
  "message": "Yulduzlar qanday paydo bo'lgan?",
  "age": 9,
  "name": "Ahrorbek",
  "language": "uz",
  "conversationId": "clxconv..."
}
```

---

## 9. Save mood

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/mood` |
| **Auth** | None *(childId in body)* |

### Request body

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `childId` | string | ✅ | |
| `emoji` | string | ✅ | One of: `😊` `🙂` `😐` `😔` `😢` |
| `note` | string | ❌ | Max 200 chars |

### Success `200`

```json
{
  "success": true,
  "data": {
    "id": "clxmood...",
    "childId": "clxchild1",
    "emoji": "😊",
    "score": 5,
    "note": "Bugun yaxshi kun",
    "entryDate": "2026-06-30T00:00:00.000Z",
    "createdAt": "2026-06-30T14:30:00.000Z",
    "analysis": {
      "trend": "stable",
      "alerts": []
    }
  }
}
```

**`trend` values:** `improving` | `stable` | `declining` | `insufficient_data`

### Errors

| Status | `error` |
|--------|---------|
| `400` | `childId talab qilinadi` / invalid emoji / note too long |
| `500` | `Kayfiyat saqlashda xatolik` |

### Example

```json
POST /api/mood
{
  "childId": "clxchild1",
  "emoji": "😊"
}
```

---

## 10. Get mood history

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/mood` |
| **Auth** | None |

### Query parameters

| Param | Type | Required | Default |
|-------|------|----------|---------|
| `childId` | string | ✅ | — |
| `days` | number | ❌ | `7` |

### Success `200`

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "clxmood...",
        "emoji": "😊",
        "score": 5,
        "entryDate": "2026-06-30T00:00:00.000Z"
      }
    ],
    "analysis": {
      "trend": "stable",
      "averageScore": 4.2,
      "entryCount": 5,
      "periodStart": "2026-06-24T00:00:00.000Z",
      "periodEnd": "2026-06-30T23:59:59.999Z",
      "lowMoodDays": 0,
      "summary": "...",
      "alerts": []
    }
  }
}
```

### Example

```http
GET /api/mood?childId=clxchild1&days=7
```

---

## 11. List children

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/parent/children` |
| **Auth** | ✅ Parent session |

### Success `200`

```json
{
  "success": true,
  "data": [
    {
      "id": "clxchild1",
      "parentId": "clxparent1",
      "name": "Ahrorbek",
      "age": 9,
      "language": "uz",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

## 12. Create child profile

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/parent/children` |
| **Auth** | ✅ Parent session |

### Request body

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | ✅ | |
| `age` | number | ✅ | 7–12 |
| `language` | string | ❌ | `"uz"` (default) or `"ru"` |

### Success `200`

```json
{
  "success": true,
  "data": {
    "id": "clxchild1",
    "parentId": "clxparent1",
    "name": "Ahrorbek",
    "age": 9,
    "language": "uz",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Errors

| Status | `error` |
|--------|---------|
| `400` | `Ism talab qilinadi` / age validation |
| `402` | Child limit for current plan |
| `401` | Not authenticated |

### Example

```json
POST /api/parent/children
{ "name": "Ahrorbek", "age": 9, "language": "uz" }
```

> **Mobile flow:** After parent registers, call this to get `childId` for chat/mood APIs.

---

## 13. Update child

| | |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/api/parent/children/{id}` |
| **Auth** | ✅ Parent session |

### Request body (all optional)

| Field | Type | Rules |
|-------|------|-------|
| `name` | string | |
| `age` | number | 7–12 |
| `language` | string | `"uz"` or `"ru"` |

### Success `200`

```json
{ "success": true, "data": { "id": "...", "name": "...", "age": 10, ... } }
```

### Errors

| Status | `error` |
|--------|---------|
| `404` | `Bola topilmadi` |
| `400` | Age validation |

---

## 14. Delete child

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/api/parent/children/{id}` |
| **Auth** | ✅ Parent session |

### Success `200`

```json
{ "success": true }
```

### Errors

| Status | `error` |
|--------|---------|
| `404` | `Bola topilmadi` |

---

## 15. Parent insights (weekly report)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/parent/insights` |
| **Auth** | ✅ Parent session + ✅ PIN verified (if PIN set) |

### Query parameters

| Param | Type | Required | Default |
|-------|------|----------|---------|
| `childId` | string | ✅ | — |
| `days` | number | ❌ | `7` |
| `language` | string | ❌ | `"uz"` or `"ru"` |

### Success `200`

```json
{
  "success": true,
  "data": {
    "child": { "id": "...", "name": "...", "age": 9, ... },
    "report": {
      "childId": "...",
      "periodStart": "...",
      "periodEnd": "...",
      "moodAnalysis": { "trend": "stable", "averageScore": 4.0, ... },
      "interests": [{ "topic": "astronomiya", "confidence": "high", ... }],
      "activity": { "totalMessages": 42, "activeDays": 5, ... },
      "activitySummary": "...",
      "summary": "...",
      "recommendations": ["...", "..."]
    },
    "moodChart": [
      { "date": "2026-06-30", "score": 5, "emoji": "😊" }
    ],
    "insightAlerts": [
      {
        "id": "...",
        "type": "MOOD_DECLINE",
        "severity": "LOW",
        "summary": "...",
        "createdAt": "..."
      }
    ]
  }
}
```

### Errors

| Status | `code` | Meaning |
|--------|--------|---------|
| `403` | `PIN_REQUIRED` | Verify PIN first |
| `402` | `REPORT_LOCKED` | Need standard/family plan |
| `404` | — | Child not found |

---

## 16. Safety events

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/parent/safety` |
| **Auth** | ✅ Parent session + ✅ PIN verified (if PIN set) |

### Query parameters

| Param | Type | Required | Default |
|-------|------|----------|---------|
| `childId` | string | ❌ | All parent's children |
| `limit` | number | ❌ | `20` |

### Success `200`

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "childId": "...",
      "source": "chat",
      "severity": "LOW",
      "category": "filtered_content",
      "summary": "...",
      "createdAt": "..."
    }
  ]
}
```

---

## 17. Get parent settings

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/parent/settings` |
| **Auth** | ✅ Parent session |

### Success `200`

```json
{
  "success": true,
  "data": {
    "id": "...",
    "parentId": "...",
    "screenTimeMinutes": 60,
    "contentLevel": "standard",
    "subscriptionPlan": "free",
    "subscriptionActive": false,
    "subscriptionExpiresAt": null
  }
}
```

---

## 18. Update parent settings

| | |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/api/parent/settings` |
| **Auth** | ✅ Parent session |

### Request body (optional fields)

| Field | Type | Rules |
|-------|------|-------|
| `screenTimeMinutes` | number | 15–180 |
| `contentLevel` | string | `"standard"` or `"strict"` |

### Success `200`

```json
{ "success": true, "data": { ...settings } }
```

---

## 19. Payment checkout

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/payments/checkout` |
| **Auth** | ✅ Parent session |

> Mobile should open `checkoutUrl` in WebView / external browser. **Do not** collect card numbers in-app — use Payme/Click hosted page.

### Request body

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `plan` | string | ✅ | `"standard"` or `"family"` |
| `provider` | string | ✅ | `"payme"` or `"click"` |

### Success `200`

```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.paycom.uz/...",
    "transactionId": "...",
    "merchantTransId": "...",
    "amount": 24000,
    "plan": "standard",
    "provider": "payme",
    "recurrent": true
  }
}
```

### Errors

| Status | `error` |
|--------|---------|
| `400` | `Noto'g'ri tarif` |
| `503` | `Payme sozlanmagan` / `Click sozlanmagan` |
| `401` | Not authenticated |

### Example

```json
POST /api/payments/checkout
{ "plan": "standard", "provider": "payme" }
```

---

# Server-only webhooks (NOT for mobile)

These are called by **Payme/Click servers**, not the Flutter app.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/webhooks/payme` | Payme JSON-RPC callbacks |
| `POST` | `/api/webhooks/click/prepare` | Click prepare step |
| `POST` | `/api/webhooks/click/complete` | Click complete step |

---

# Recommended mobile API flow

```
1. POST /api/auth/register  (or /login)
   → save session cookie / future Bearer token

2. POST /api/parent/children
   → save childId locally

3. POST /api/auth/pin { pin }
   → for parent dashboard screens

4. Child app:
   POST /api/figures/{slug}/chat
   POST /api/mood

5. Parent app:
   GET  /api/parent/insights?childId=...
   GET  /api/parent/safety?childId=...
   POST /api/payments/checkout → open checkoutUrl
```

---

# Not yet available (mobile features without backend)

| Mobile feature | Status |
|----------------|--------|
| Shorts feed | ❌ No API — mock only in Flutter |
| Drawing / Gemini vision analysis | ❌ No API |
| Stars / quests / achievements | ❌ No API |
| Parent assignments (quiz) | ❌ No API |
| Voice / camera upload | ❌ No API |
| List all figures (catalog) | ❌ No dedicated endpoint — use hardcoded slug list above |

---

# Endpoint index

| # | Method | Path | Auth |
|---|--------|------|------|
| 1 | GET | `/api/health` | — |
| 2 | POST | `/api/auth/register` | — |
| 3 | POST | `/api/auth/login` | — |
| 4 | POST | `/api/auth/logout` | session |
| 5 | GET | `/api/auth/me` | session |
| 6 | POST | `/api/auth/pin` | session |
| 7 | POST | `/api/chat` | — |
| 8 | POST | `/api/figures/{slug}/chat` | — |
| 9 | POST | `/api/mood` | — |
| 10 | GET | `/api/mood` | — |
| 11 | GET | `/api/parent/children` | session |
| 12 | POST | `/api/parent/children` | session |
| 13 | PATCH | `/api/parent/children/{id}` | session |
| 14 | DELETE | `/api/parent/children/{id}` | session |
| 15 | GET | `/api/parent/insights` | session + PIN |
| 16 | GET | `/api/parent/safety` | session + PIN |
| 17 | GET | `/api/parent/settings` | session |
| 18 | PATCH | `/api/parent/settings` | session |
| 19 | POST | `/api/payments/checkout` | session |
| 20 | POST | `/api/webhooks/payme` | server |
| 21 | POST | `/api/webhooks/click/prepare` | server |
| 22 | POST | `/api/webhooks/click/complete` | server |

**Total documented: 22 endpoints** (19 for mobile app + 3 server webhooks)
