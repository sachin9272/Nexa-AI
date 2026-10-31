# Nexa AI (Grexa.ai Architecture)
**Autonomous AI Growth Engine for Local Businesses & Clinics**

Nexa is an enterprise-grade AI marketing platform built specifically for local businesses (clinics, salons, dental practices). It functions as an automated marketing co-pilot managing high-intent acquisition on **Google Business Profile (GBP)** and retention on **WhatsApp Business Platform**.

---

## 🌟 Key Capabilities

1. **Google Business Profile (GBP) Automation**:
   - Algorithmic profile audit (completeness score 0–100 & top actionable fixes).
   - Automated review ingestion and empathetic draft replies.
   - Guardrailed weekly local SEO post generator.
   - Google Maps insights sync (phone calls, direction requests, website clicks).

2. **WhatsApp CRM & Lifecycle Broadcasts**:
   - Direct Meta Cloud API integration with HMAC-SHA256 webhook validation.
   - E.164 phone normalization and strict consent logging (`OPTED_IN` / `OPTED_OUT`).
   - Automated opt-out guardrail (immediate suppression on "STOP", "CANCEL", "UNSUBSCRIBE").
   - Throttled batch dispatching with read-receipt and reply tracking.

3. **Human-in-the-Loop 1-Tap Approvals**:
   - Zero unvetted content published automatically.
   - Proactive draft generation queued for mobile 1-tap approve/edit/reject.

4. **Multi-Tenant MongoDB Data Layer**:
   - Centralized `tenantScopePlugin` enforcing strict tenant isolation across queries.
   - Compound indexes prefixed by `{ tenantId: 1, ... }` to prevent cross-tenant scanning.

5. **Outcome Analytics & Unit Economics**:
   - Weekly Monday morning WhatsApp Digest for business owners.
   - Granular per-tenant token usage and Meta message cost ledger.

---

## 📂 Project Structure

```
├── client/               # Next.js Web Application & Operating Interface
│   ├── src/
│   │   ├── app/          # App Router pages and layouts
│   │   └── components/   # UI components and business dashboard
│
├── app/                  # Cross-platform Expo client (React Native & Web)
│   ├── src/
│   │   ├── app/          # Navigation and screens
│   │   ├── components/   # UI components (AgentCard, HeroRoiCard, LiveStreamFeed)
│   │   └── hooks/        # State and API hooks
│
└── server/               # Modular Monolith NestJS API
    ├── src/
    │   ├── ai/           # AI Gateway, Prompt Registry & Guardrails
    │   ├── analytics/    # Outcome metrics & Monday WhatsApp Digest
    │   ├── auth/         # JWT Auth & Phone OTP strategies
    │   ├── campaigns/    # WhatsApp Cloud API, dispatch workers & webhooks
    │   ├── common/       # Tenancy plugins, AES-256 encryption, guards & filters
    │   ├── config/       # Configuration loader
    │   ├── content/      # 1-Tap approval state machine & publisher worker
    │   ├── customers/    # Contact directory, E.164 normalization & consent
    │   ├── gbp/          # Google OAuth, audit scorer & sync workers
    │   ├── tenants/      # Clinic profile, services catalog & brand voice
    │   └── users/        # Multi-tenant user memberships
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB 7.0+
- Redis 7.0+

### 1. Web Application (`/client`)

```bash
cd client
npm install
npm run dev
```

- Accessible at: `http://localhost:3000`

### 2. Backend Server Setup (`/server`)

```bash
cd server
npm install
cp .env.example .env
npm run build
npm run start:dev
```

- **Swagger OpenAPI Docs**: `http://localhost:3000/api/docs`

### 3. Mobile Client (`/app`)

```bash
cd app
npm install
npx expo start
```

---

## 🛡️ Architecture & Design Patterns

- **Modular Monolith**: NestJS domain modules communicating via clean injectable service contracts.
- **Asynchronous Processing**: Redis-backed BullMQ queues (`gbp-sync`, `content-publish`, `campaign-dispatch`).
- **Data Security**: Encrypted OAuth refresh tokens using AES-256-GCM.
- **Deterministic Guardrails**: Validates AI generations against the tenant's real services catalog and healthcare compliance rules before human review.
