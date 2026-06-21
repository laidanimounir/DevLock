# NexVault — Professional Developer Vault

NexVault is a professional personal tool built for freelance developers who need to manage multiple client projects while keeping sensitive credentials secure. It combines project management with AES-256 encrypted credential storage in a single, polished application — accessible from web, iOS, and Android.

Built with Expo, Supabase, and a three-layer authentication system, NexVault ensures your client data and passwords are protected at every level.

## ✨ Features

### 🔐 Security
- **Three-layer authentication** — Email/password → TOTP 2FA → PIN/biometric lock
- **AES-256-CBC encryption** — Every credential password encrypted with a unique IV before storage
- **Shamir's Secret Sharing** — 3-of-2 split master key recovery (never lose access)
- **Local-only PIN** — PIN never leaves your device, stored exclusively in SecureStore/Keychain
- **Auto-lock** — App locks after 5 minutes of inactivity, clearing decrypted data from memory
- **Activity logging** — Every sensitive action (view password, add/edit/delete) is audited
- **Screenshot prevention** — Content hidden when app backgrounds on both platforms

### 📁 Project Management
- Create, edit, and organize client projects with multi-step forms
- Track project type (mobile, web, mixed), status, and technology stack
- Client contact management with quick-call, WhatsApp, and email buttons
- Domain and hosting expiry tracking with alert notifications
- File and image attachments per project
- Full-text search across projects, clients, and technologies
- Filter and sort by status, type, payment status

### 💰 Financial Tracking
- Contract value and payment tracking per project
- Invoice creation with due dates and paid status
- Monthly income charts (last 6 months)
- Per-project earned vs pending breakdown
- Overdue invoice detection and alerts
- Payment reminder notifications

### ⚙️ Automation
- **Health checks** — Edge Function pings project URLs every 4 days, logs status
- **Keep-alive** — Edge Function prevents Supabase free-tier auto-pause
- **Expiry reminders** — Local notifications 30 days before domain/hosting expiry
- **Client inactivity alerts** — Flags clients not contacted in 60+ days

### 💾 Backup & Recovery
- Encrypted JSON backup export of all data
- Encrypted backup import for restore
- Shamir recovery screen (enter 2 of 3 shares to recover master key)

## 🔐 Security Architecture

### Authentication Layers

```
Layer 1: Email + Password → Supabase Auth (JWT session)
Layer 2: TOTP 6-digit code → Supabase MFA (Time-based One-Time Password)
Layer 3: 6-digit PIN + Biometric → Local device (expo-secure-store only)
```

Each layer must pass before accessing any vault data. The PIN is never transmitted to the server — it stays encrypted in the device's secure enclave (iOS Keychain / Android Keystore).

### Credential Encryption

```
Plain text password
  → AES-256-CBC encrypt (random 16-byte IV per credential)
  → Master key (generated per device, stored in SecureStore)
  → Server stores: password_enc + iv (ciphertext only)
  → Decryption only on explicit user action (tap "view password")
```

Every credential's password gets a **unique IV** — identical passwords for different credentials produce different ciphertext. The master encryption key never leaves the device.

### Shamir's Secret Sharing (3-of-2)

```
Master key → Split into 3 shares (threshold = 2)
  Share 1 → User writes down / saves offline
  Share 2 → Device SecureStore
  Share 3 → Supabase (encrypted)
  
Recovery: Any 2 shares reconstruct the master key
```

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Expo SDK 52** | Cross-platform React Native framework |
| **TypeScript** | Type-safe development |
| **NativeWind v4** | Tailwind CSS for React Native |
| **Supabase** | PostgreSQL database, Auth, MFA, Edge Functions, Storage |
| **Zustand** | Lightweight state management |
| **TanStack React Query** | Server state and caching |
| **React Navigation 7** | Screen navigation (stacks + tabs) |
| **CryptoJS** | AES-256 encryption engine |
| **expo-secure-store** | Encrypted local storage (Keychain/Keystore) |
| **expo-crypto** | Cryptographically secure random bytes |
| **expo-local-authentication** | Biometric auth (Face ID / fingerprint) |
| **expo-notifications** | Local push notifications |
| **react-native-reanimated** | Smooth animations |
| **date-fns** | Date formatting and calculations |

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| **projects** | Core project data — name, client, type, status, technologies, financials, expiry dates |
| **credentials** | Encrypted service credentials — AES-256 ciphertext + unique IV per entry |
| **clients** | Client contact info — phone, WhatsApp, email, preferred contact method, notes |
| **invoices** | Invoice tracking — amount, status (paid/pending/overdue), due/paid dates |
| **attachments** | File uploads — Supabase Storage URLs, file type, description |
| **health_checks** | Automated monitoring — service status (up/down/warning), response time |
| **activity_log** | Audit trail — every view/edit/delete action with project, device, timestamp |

All tables have **Row Level Security (RLS)** enabled with policies enforcing `auth.uid() = user_id`.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app (iOS/Android) or a web browser
- A Supabase account (free tier works)

### Installation

```bash
git clone https://github.com/yourusername/nexvault.git
cd nexvault

npm install
```

### Environment Setup

Create a `.env` file in the project root:

```env
# Supabase Project
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Email Service (optional — for password reset)
RESEND_API_KEY=your_resend_api_key_here
BREVO_API_KEY=your_brevo_api_key_here

# Security (auto-generated by the app on first launch)
# APP_MASTER_SECRET=will_be_generated_automatically
```

### Running

```bash
npx expo start        # Development server
npx expo start --web   # Web only
npx expo start --ios   # iOS simulator
npx expo start --android  # Android emulator
```

Scan the QR code with Expo Go, or press `w` for web.

### Database Setup

The database schema and RLS policies are applied automatically via Supabase migrations. If setting up manually, run the SQL in the migrations to create all 7 tables with their policies.

## 📱 Screens

| Screen | Description |
|--------|-------------|
| **Login** | Email + password authentication with show/hide toggle and animated UI |
| **TOTP Setup** | QR code scanner for Google Authenticator enrollment |
| **TOTP Verify** | 6-digit code verification (auto-submits when complete) |
| **PIN Setup** | 6-digit PIN creation with biometric opt-in |
| **PIN Verify** | Device unlock — 3 attempts before 30-second lockout |
| **Dashboard** | Greeting, stats cards, alerts, recent projects with pull-to-refresh |
| **Projects List** | Searchable, filterable, sortable project list with status badges |
| **Project Detail** | 5-tab view: Overview, Credentials, Finance, Files, Health |
| **Add Project** | 5-step wizard: Basic Info, Tech Stack, Financial, Dates, Notes |
| **Add Credential** | Service credential form with password generator and strength meter |
| **Stats** | Monthly income bar chart, per-project earned vs pending breakdown |
| **Settings** | Change PIN, TOTP, biometric toggle, activity log, backup, recovery |
| **Activity Log** | Chronological audit trail of all sensitive actions |
| **Shamir Recovery** | Enter 2 of 3 recovery shares to restore master encryption key |

## 🏗️ Project Structure

```
nexvault/
├── app/                       # Expo Router screens (file-based routing)
│   ├── (auth)/                # Auth flow screens
│   │   ├── login.tsx          # Email/password login
│   │   ├── totp-setup.tsx     # TOTP enrollment
│   │   ├── totp-verify.tsx    # TOTP login verification
│   │   ├── pin-setup.tsx      # PIN creation + biometric opt-in
│   │   ├── pin-verify.tsx     # PIN unlock with auto-lock
│   │   └── shamir-recovery.tsx # Master key recovery
│   ├── (tabs)/                # Main app tabs
│   │   ├── dashboard.tsx      # Home dashboard
│   │   ├── projects.tsx       # Project list with search
│   │   ├── stats.tsx          # Financial charts
│   │   └── settings.tsx       # App settings
│   ├── project/               # Project routes
│   │   ├── [id].tsx           # Project detail (tabs: Overview, Credentials, Finance, Files, Health)
│   │   └── add.tsx            # Multi-step project creation
│   ├── settings/              # Settings sub-routes
│   │   └── activity-log.tsx   # Audit trail viewer
│   ├── _layout.tsx            # Root layout with providers
│   └── index.tsx              # Entry redirect
├── components/ui/             # Reusable design system components
│   ├── Button.tsx             # Primary, secondary, danger, ghost variants
│   ├── Input.tsx              # Text, password, search variants
│   ├── Card.tsx               # ProjectCard, StatCard
│   ├── Badge.tsx              # Status, payment, tech, health badges
│   ├── Avatar.tsx             # Project thumbnail avatars
│   ├── Modal.tsx              # Animated bottom sheet modal
│   ├── EmptyState.tsx         # Empty state with action button
│   ├── LoadingSpinner.tsx     # Loading, skeleton, error states
│   └── FileGallery.tsx        # Image grid and document list
├── lib/                       # Core business logic
│   ├── supabase.ts            # Supabase client initialization
│   ├── crypto.ts              # AES-256 encryption engine
│   ├── shamir.ts              # Shamir's Secret Sharing (GF-256)
│   ├── passwordGenerator.ts   # Password generator + strength meter
│   ├── projects.ts            # Project CRUD operations
│   ├── credentials.ts         # Credential CRUD with encryption
│   ├── invoices.ts            # Invoice CRUD operations
│   ├── clients.ts             # Client CRUD operations
│   ├── activityLog.ts         # Activity logging utility
│   ├── backup.ts              # Encrypted backup export/import
│   └── notifications.ts       # Local push notification scheduling
├── store/                     # Zustand state management
│   └── authStore.ts           # Auth state (user, session, TOTP, PIN)
├── hooks/                     # Custom React hooks
│   ├── useAutoLock.ts         # 5-minute inactivity auto-lock
│   └── useScreenshotPrevention.ts # Screenshot protection
├── types/                     # TypeScript type definitions
│   └── database.ts            # Full Supabase database types
├── assets/                    # App icons and images
├── .env                       # Environment variables (gitignored)
├── app.json                   # Expo configuration
├── tailwind.config.js         # NativeWind design tokens
├── metro.config.js            # Metro bundler configuration
└── babel.config.js            # Babel with NativeWind preset
```

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `RESEND_API_KEY` | No | Resend email service API key |
| `BREVO_API_KEY` | No | Brevo email service API key |

> ⚠️ **Important**: Never commit your `.env` file. It is listed in `.gitignore`. The `SUPABASE_SERVICE_ROLE_KEY` should never be exposed to the client — it is only used by Edge Functions and server-side code.

## 📄 License

MIT

---

Built with ❤️ for freelance developers who value security and professionalism.
