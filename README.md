# SafarAI

7–12 yoshli bolalar uchun xavfsiz AI yordamchi — Next.js 15 (App Router), PostgreSQL, ALEMLLM, RAGFlow.

## Talablar

- Node.js 20+
- PostgreSQL 14+ (O'zbekiston hududida)
- nginx (production)
- npm

## Tez boshlash (development)

```bash
npm install
cp .env.example .env
# .env ni to'ldiring

npm run prisma:generate
# DATABASE_URL ni .env ga yozing (bo'sh SafarAI DB — Langflow DB emas!)
npm run prisma:migrate:deploy   # production / shadow DB yo'q muhitda
npm run prisma:seed             # 7 Buyuk Siymo

npm run dev           # http://localhost:3000
npm run dev:3001      # port 3001
```

## Scriptlar

| Script | Vazifasi |
|--------|----------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm test` | Barcha testlar (xavfsizlik audit + integratsion) |
| `npm run prisma:migrate` | Dev migratsiya (shadow DB kerak) |
| `npm run prisma:migrate:deploy` | Production migratsiya (shadow DB shart emas) |
| `npm run prisma:seed` | Buyuk Siymolar seed |

## Papka tuzilishi

```
src/
  app/
    (child)/          # Bola interfeysi
    (parent)/         # Ota-ona interfeysi
    api/              # REST API + webhooklar
  lib/
    ai/               # ALEMLLM chat
    safety/           # Kirish/chiqish filtri, inqiroz
    rag/              # RAGFlow + Buyuk Siymolar
    payments/         # Payme + Click obuna
    insights/         # Mood + haftalik hisobot
    dataLocality.ts   # Ma'lumotlar lokalizatsiyasi tekshiruvi
deploy/
  nginx.conf          # Production reverse proxy
```

---

## Production deploy qo'llanmasi

### 1. Server tayyorlash (O'zbekiston)

Ma'lumotlar **O'zbekiston hududida** saqlanishi kerak:

| Komponent | Talab |
|-----------|-------|
| PostgreSQL | Ichki server yoki `.uz` domen |
| MinIO | RAG hujjatlar — ichki `.uz` host |
| ALEMLLM | O'zbekiston API endpoint |
| Next.js app | VPS / dedicated server |

```bash
# Serverda
git clone <repo-url> /opt/safarai
cd /opt/safarai
npm ci
cp .env.production.example .env.production
nano .env.production   # barcha qiymatlarni to'ldiring
```

### 2. Muhit o'zgaruvchilari

```bash
# Majburiy production
NODE_ENV=production
DATA_RESIDENCY_REGION=UZ
DATABASE_URL=postgresql://...@db.safarai.internal.uz:5432/safarai
JWT_SECRET=<uzun-random-string>
APP_URL=https://safarai.uz

# API kalitlar — faqat .env.production da, git ga commit qilmang
ALEMLLM_API_KEY=...
PAYME_SECRET_KEY=...
CLICK_SECRET_KEY=...
```

**Tekshiruv:** `GET /api/health` — `dataResidency.compliant: true` bo'lishi kerak.

### 3. Build va ishga tushirish

**Ma'lumotlar bazasi (production):**

```bash
# 1. Alem/administrator dan BO'SH SafarAI DB so'rang (Langflow DB dan ALOHIDA!)
# 2. .env.production ga DATABASE_URL yozing:
#    postgresql://USER:PASS@a1-postgres1.alem.ai:30100/safarai_... 

npm run prisma:generate
npm run prisma:migrate:deploy   # prisma/migrations/ dagi init migratsiyani qo'llaydi
npm run prisma:seed             # 7 ta Buyuk Siymo
npm run build
```

> **Eslatma:** `prisma migrate dev` shadow DB yaratish huquqini talab qiladi. Alem hostingda odatda `migrate deploy` ishlatiladi. Langflow DB (`langflow_*`) ga migratsiya qilmang — u Langflow jadvallarini buzadi.

```bash
# systemd yoki pm2
NODE_ENV=production node node_modules/next/dist/bin/next start -p 3000
```

**pm2 misol:**
```bash
pm2 start npm --name safarai -- start
pm2 save
```

### 4. nginx sozlash

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/safarai
sudo ln -s /etc/nginx/sites-available/safarai /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

nginx `/api/*` va frontend ni bir xil Next.js upstream ga yo'naltiradi. To'lov webhooklari:

| Provayder | URL |
|-----------|-----|
| Payme | `https://safarai.uz/api/webhooks/payme` |
| Click prepare | `https://safarai.uz/api/webhooks/click/prepare` |
| Click complete | `https://safarai.uz/api/webhooks/click/complete` |

### 5. SSL

```bash
sudo certbot --nginx -d safarai.uz -d www.safarai.uz
```

### 6. Post-deploy tekshiruv

```bash
curl https://safarai.uz/api/health
npm test
```

---

## Xavfsizlik checklist

| # | Talab | Holat |
|---|-------|-------|
| 1 | Har bir bola-AI javobi `filterChildInput` + `filterAiOutput` dan o'tadi | ✅ `chatService`, `figureService` |
| 2 | Inqiroz aniqlash va ota-onaga eskalatsiya | ✅ `crisisHandler` → `SafetyEvent` HIGH |
| 3 | Buyuk Siymolar faqat RAG manbasiga tayanadi | ✅ manba yo'q → LLM chaqirilmaydi |
| 4 | Ota-onaga umumlashtirilgan insight (so'zma-so'z emas) | ✅ `interestExtractor`, `reportGenerator` |
| 5 | API kalitlar kodda yo'q | ✅ faqat `process.env` / `env.ts` |
| 6 | Ma'lumotlar O'zbekistonda saqlanadi | ✅ `DATA_RESIDENCY_REGION=UZ` + `validateDataResidency()` |

Audit testlari: `src/lib/safety/safetyAudit.test.ts`

---

## AI oqimlari (xavfsizlik audit)

```
Bola xabari
  → filterChildInput (qoidalar + LLM moderatsiya)
  → [inqiroz?] → crisisHandler → SafetyEvent HIGH
  → [blok?] → fallback javob (LLM yo'q)
  → ALEMLLM / RAG
  → filterAiOutput (MAJBURIY)
  → bola javobi
```

**Buyuk Siymolar qo'shimcha qoida:**
```
RAGFlow retrieval → manba yo'q? → getNoSourceReply (LLM yo'q)
                  → manba bor? → LangFlow/ALEMLLLM + RAG kontekst → filterAiOutput
```

**Ota-ona insight (bola-AI emas):**
- Faqat statistika + umumlashtirilgan mavzular LLM ga yuboriladi
- Suhbat matnlari ota-onaga ko'rsatilmaydi

---

## To'lov oqimi (qisqa)

1. Ota-ona `/subscription` → Payme/Click
2. `POST /api/payments/checkout` → tranzaksiya yaratiladi
3. Webhook (imzo bilan) → obuna 30 kun faollashadi
4. Cheklovlar: chat, siymo, hisobot, bola profili

---

## Loglar

Production da JSON strukturli log (`src/lib/logger.ts`):

```json
{"level":"error","scope":"POST /api/chat","message":"...","ts":"2026-06-30T..."}
```

Xatoliklar `src/lib/api/errors.ts` orqali loglanadi — foydalanuvchiga faqat xavfsiz xabar qaytariladi.

---

## Testlar

```bash
npm test
```

| Test fayli | Qamrov |
|------------|--------|
| `safetyAudit.test.ts` | AI oqimlari filterdan o'tishi |
| `mainFlows.test.ts` | Inqiroz, insight, lokalizatsiya, kalitlar |
| `inputFilter.test.ts` | Kirish filtri |
| `crisisHandler.test.ts` | Inqiroz eskalatsiyasi |
| `payments.test.ts` | To'lov imzolari |

---

## Muhit o'zgaruvchilari

Development: `.env.example` → `.env`  
Production: `.env.production.example` → `.env.production`

Hech qachon `.env` yoki `.env.production` ni git ga commit qilmang.
