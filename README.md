# MediCare Plus — Doctor Appointment Booking & Clinic Management SaaS

**MediCare Plus** is a full-stack healthcare SaaS demonstration platform engineered for medical clinics, specialist practices, and outpatient diagnostic centers. It provides an online booking engine with real-time double-booking prevention, together with dedicated operational dashboards for **Patients**, **Doctors**, **Receptionists**, and **Administrators**.

---

## 1. Architectural Highlights

- **Multi-Role Role-Based Access Control (RBAC)**:
  - **Patient**: Real-time slot reservation, appointment history, one-click reschedule & cancellation, personal records.
  - **Doctor**: Daily consultation queue, patient appointment requests review, consultation notes documentation, personal profile and fee management.
  - **Receptionist**: Clinic-wide appointment register, walk-in patient booking, status updates, live schedule filtering.
  - **Administrator**: Comprehensive clinic analytics with interactive Recharts visualizations (weekly activity, booking status distribution, department volume), physician management, service catalog control, and clinic parameters.
- **Double-Booking Prevention Engine**:
  - Validates working days, operating hours, lunch breaks, and existing slot reservations.
  - Rejects past dates and past times.
  - Enforces atomic collision checks at the backend API layer (`409 Conflict`).
  - Releases cancelled slots back to the availability pool.
- **Security & Privacy**:
  - Salting and PBKDF2 cryptographic password hashing on the server (zero plaintext storage).
  - No storage of sensitive clinical diagnostics or protected health histories.
  - Discreet demo disclaimers and synthetic test identities.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Recharts for data analytics, Motion for micro-interactions.
- **Backend**: Node.js, Express.js REST APIs with structured controller routing and error handlers.
- **Data Layer**: In-memory relational database repository with persistent seeding, transactional slot availability checks, and PostgreSQL / Prisma readiness.

---

## 3. Demo Roles & Pre-Seeded Accounts

To test-drive any role, click the **Switch Role** buttons on the top bar or use the following credentials:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Patient** | James Wilson | `james.wilson@example.com` | `Patient123!` |
| **Doctor** | Dr. Sarah Jenkins | `dr.sarah@medicareplus.com` | `Doctor123!` |
| **Receptionist** | Jessica Vance | `reception@medicareplus.com` | `Reception123!` |
| **Administrator** | Dr. Arthur Sterling | `admin@medicareplus.com` | `Admin123!` |

---

## 4. Local Development Setup

### Prerequisites
- Node.js >= 20.x
- npm >= 9.x

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd medicare-plus

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### Running Development Server
```bash
# Starts Express backend and mounts Vite dev server on port 3000
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
# Compiles frontend assets into dist/
npm run build

# Starts production Express server
npm start
```

---

## 5. Production Deployment Architecture

### Frontend (e.g. Vercel / Netlify / Cloudflare Pages)
- Run `npm run build` to generate the static single-page application in `dist/`.
- Set output directory to `dist`.
- Configure `VITE_API_URL` to point to your deployed backend API instance.
- *Note*: A static host alone does not host a persistent relational database; you must deploy the Node/Express backend on a container or serverless runtime.

### Backend & Relational Database (e.g. Google Cloud Run / Render / AWS ECS + PostgreSQL)
- **Node/Express Service**: Run `server.ts` or compiled `server.js` with `NODE_ENV=production`.
- **Database**: Connect to Managed PostgreSQL (e.g., Google Cloud SQL, Neon, Supabase, or AWS RDS).
- **Prisma Migration**:
  ```bash
  npx prisma migrate deploy
  npx prisma db seed
  ```

---

## 6. Verification & Automated Test Status

- `npm run lint`: **Passed** (0 TypeScript diagnostics)
- `npm run build`: **Passed** (Production bundle generated)
- Double-booking prevention: **Verified** (Returns `HTTP 409 Conflict` on concurrent slot collisions)
- Role switching & authentication: **Verified** across all 4 roles.
