# 🌍 GlobeTrotter — Master Context Block

> **Purpose**: This document is the **single source of truth** for every AI-assisted coding session on this project. Paste this into every new chat/context window. All four team members MUST follow these specifications to prevent architectural conflicts, merge collisions, and inconsistency.

---

## 1 · Project Identity

| Field | Value |
|---|---|
| **App Name** | GlobeTrotter |
| **Tagline** | Empowering Personalized Travel Planning |
| **Repo** | `Odoo-x-LDCE-Hackathon-26` |
| **Tech Stack** | MERN — MongoDB · Express 5 · React 19 (Vite 8) · Node.js |
| **Runtime** | Node ≥ 20, npm |
| **Client Port** | `5173` (Vite default) |
| **Server Port** | `5000` |

---

## 2 · Monorepo Structure (Canonical)

Every team member MUST place files exactly in these locations. **Do NOT create folders that don't exist in this tree without team consensus.**

```
/
├── client/                         # React (Vite) frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── main.jsx                # ReactDOM root — DO NOT MODIFY
│   │   ├── App.jsx                 # Top-level router + layout shell
│   │   ├── App.css                 # Global app-level overrides (minimal)
│   │   ├── index.css               # Design tokens + CSS resets ONLY
│   │   ├── assets/                 # Static images, icons, illustrations
│   │   ├── components/             # Reusable UI components
│   │   │   ├── common/             # Buttons, Inputs, Modals, Cards, Loader, Badge
│   │   │   ├── layout/             # Navbar, Sidebar, Footer, PageShell
│   │   │   ├── trip/               # TripCard, TripForm, StopCard, ActivityCard
│   │   │   ├── itinerary/          # ItineraryTimeline, DayBlock, CalendarView
│   │   │   ├── budget/             # BudgetSummary, CostBreakdownChart, BudgetAlert
│   │   │   └── search/             # CitySearchBar, ActivityFilter, ResultCard
│   │   ├── pages/                  # Route-level page components (one per screen)
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── CreateTripPage.jsx
│   │   │   ├── MyTripsPage.jsx
│   │   │   ├── ItineraryBuilderPage.jsx
│   │   │   ├── ItineraryViewPage.jsx
│   │   │   ├── CitySearchPage.jsx
│   │   │   ├── ActivitySearchPage.jsx
│   │   │   ├── BudgetPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── SharedItineraryPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useTrips.js
│   │   │   └── useBudget.js
│   │   ├── context/                # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── TripContext.jsx
│   │   ├── services/               # API call wrappers (axios instances)
│   │   │   ├── api.js              # Axios base instance + interceptors
│   │   │   ├── authService.js
│   │   │   ├── tripService.js
│   │   │   ├── cityService.js
│   │   │   ├── activityService.js
│   │   │   └── adminService.js
│   │   ├── utils/                  # Pure utility/helper functions
│   │   │   ├── formatDate.js
│   │   │   ├── formatCurrency.js
│   │   │   └── validators.js
│   │   └── constants/              # Enums, config constants
│   │       └── index.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Express backend
│   ├── index.js                    # Entry point — app.listen, DB connect
│   ├── config/
│   │   ├── db.js                   # Mongoose connection
│   │   └── env.js                  # dotenv loader + validation
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js
│   │   ├── Trip.js
│   │   ├── Stop.js
│   │   ├── Activity.js
│   │   ├── Expense.js
│   │   └── City.js
│   ├── routes/                     # Express routers
│   │   ├── authRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── stopRoutes.js
│   │   ├── activityRoutes.js
│   │   ├── cityRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── shareRoutes.js
│   │   └── adminRoutes.js
│   ├── controllers/                # Route handlers (business logic)
│   │   ├── authController.js
│   │   ├── tripController.js
│   │   ├── stopController.js
│   │   ├── activityController.js
│   │   ├── cityController.js
│   │   ├── budgetController.js
│   │   ├── shareController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   ├── adminMiddleware.js      # isAdmin check
│   │   ├── errorHandler.js         # Central error handler
│   │   └── validate.js             # Request body validation (Joi/Zod)
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seedData.js             # Optional seed script for cities/activities
│   └── package.json
│
├── server.js                       # LEGACY — migrate to server/index.js
├── package.json                    # Root package (workspace scripts)
├── .env.example                    # Environment variable template
└── README.md
```

> [!IMPORTANT]
> The current `server.js` in the root is a placeholder. All backend code goes into `server/`. The root `package.json` should only contain workspace-level scripts (e.g., `"dev": "concurrently ..."`).

---

## 3 · Database Schema (MongoDB / Mongoose)

All models use these conventions:
- Collection names: **lowercase plural** (auto by Mongoose)
- `_id`: ObjectId (Mongoose default) — never override
- Timestamps: `{ timestamps: true }` on every schema
- References: always use `mongoose.Schema.Types.ObjectId` + `ref`

### 3.1 User

```js
{
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true },             // bcrypt hashed
  avatar:        { type: String, default: '' },                // URL
  role:          { type: String, enum: ['user', 'admin'], default: 'user' },
  preferences: {
    language:    { type: String, default: 'en' },
    currency:    { type: String, default: 'INR' }
  },
  savedCities:   [{ type: ObjectId, ref: 'City' }],
}
```

### 3.2 Trip

```js
{
  user:          { type: ObjectId, ref: 'User', required: true, index: true },
  name:          { type: String, required: true, trim: true },
  description:   { type: String, default: '' },
  coverImage:    { type: String, default: '' },                // URL
  startDate:     { type: Date, required: true },
  endDate:       { type: Date, required: true },
  isPublic:      { type: Boolean, default: false },
  shareSlug:     { type: String, unique: true, sparse: true }, // for public URL
  totalBudget:   { type: Number, default: 0 },                // user-set limit
  stops:         [{ type: ObjectId, ref: 'Stop' }],            // ordered array
}
```

### 3.3 Stop

```js
{
  trip:          { type: ObjectId, ref: 'Trip', required: true, index: true },
  city:          { type: ObjectId, ref: 'City', required: true },
  arrivalDate:   { type: Date, required: true },
  departureDate: { type: Date, required: true },
  order:         { type: Number, required: true },             // for reordering
  activities:    [{ type: ObjectId, ref: 'Activity' }],
  notes:         { type: String, default: '' },
}
```

### 3.4 Activity

```js
{
  name:          { type: String, required: true, trim: true },
  description:   { type: String, default: '' },
  category:      { type: String, enum: ['sightseeing', 'food', 'adventure', 'culture', 'shopping', 'nightlife', 'relaxation', 'transport', 'other'], required: true },
  city:          { type: ObjectId, ref: 'City', required: true, index: true },
  estimatedCost: { type: Number, default: 0 },                // in base currency (INR)
  duration:      { type: Number, default: 60 },                // in minutes
  imageUrl:      { type: String, default: '' },
  rating:        { type: Number, min: 0, max: 5, default: 0 },
  isGlobal:      { type: Boolean, default: true },             // seed data vs user-created
}
```

### 3.5 Expense

```js
{
  stop:          { type: ObjectId, ref: 'Stop', required: true, index: true },
  trip:          { type: ObjectId, ref: 'Trip', required: true, index: true },
  category:      { type: String, enum: ['transport', 'accommodation', 'food', 'activity', 'misc'], required: true },
  label:         { type: String, required: true },
  amount:        { type: Number, required: true },
  currency:      { type: String, default: 'INR' },
  date:          { type: Date },
}
```

### 3.6 City

```js
{
  name:          { type: String, required: true, trim: true },
  country:       { type: String, required: true },
  region:        { type: String, default: '' },                // e.g., "South Asia"
  costIndex:     { type: Number, min: 1, max: 5, default: 3 },// 1=cheap, 5=expensive
  imageUrl:      { type: String, default: '' },
  description:   { type: String, default: '' },
  latitude:      { type: Number },
  longitude:     { type: Number },
  popularity:    { type: Number, default: 0 },                 // derived or manual
}
```

> [!WARNING]
> **Never embed large arrays inside documents.** Stops reference Activities by ObjectId array. If an activity list could exceed 50 items, switch to a query-based approach (find activities by `stop` field) instead of an embedded array.

---

## 4 · API Contract (RESTful)

**Base URL**: `http://localhost:5000/api`

All authenticated routes require header: `Authorization: Bearer <jwt_token>`

### 4.1 Auth

| Method | Endpoint | Body | Response | Auth |
|---|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | `{ token, user }` | ✗ |
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` | ✗ |
| GET | `/auth/me` | — | `{ user }` | ✓ |

### 4.2 Trips

| Method | Endpoint | Body / Params | Response | Auth |
|---|---|---|---|---|
| POST | `/trips` | `{ name, description, startDate, endDate, coverImage?, totalBudget? }` | `{ trip }` | ✓ |
| GET | `/trips` | query: `?page=1&limit=10` | `{ trips[], total }` | ✓ |
| GET | `/trips/:id` | — | `{ trip }` (populated stops) | ✓ |
| PUT | `/trips/:id` | partial trip fields | `{ trip }` | ✓ |
| DELETE | `/trips/:id` | — | `{ message }` | ✓ |

### 4.3 Stops

| Method | Endpoint | Body | Response | Auth |
|---|---|---|---|---|
| POST | `/trips/:tripId/stops` | `{ cityId, arrivalDate, departureDate, order }` | `{ stop }` | ✓ |
| PUT | `/stops/:id` | partial stop fields | `{ stop }` | ✓ |
| DELETE | `/stops/:id` | — | `{ message }` | ✓ |
| PATCH | `/trips/:tripId/stops/reorder` | `{ stopIds: [ordered] }` | `{ stops[] }` | ✓ |

### 4.4 Activities

| Method | Endpoint | Params | Response | Auth |
|---|---|---|---|---|
| GET | `/activities` | `?cityId=&category=&minCost=&maxCost=&q=` | `{ activities[] }` | ✓ |
| POST | `/stops/:stopId/activities` | `{ activityId }` or `{ name, category, estimatedCost, ... }` | `{ stop }` | ✓ |
| DELETE | `/stops/:stopId/activities/:actId` | — | `{ stop }` | ✓ |

### 4.5 Cities

| Method | Endpoint | Params | Response | Auth |
|---|---|---|---|---|
| GET | `/cities` | `?q=&country=&region=&sort=popularity` | `{ cities[] }` | ✗ |
| GET | `/cities/:id` | — | `{ city, activities[] }` | ✗ |

### 4.6 Budget

| Method | Endpoint | Body | Response | Auth |
|---|---|---|---|---|
| GET | `/trips/:tripId/budget` | — | `{ totalEstimated, breakdown: { transport, accommodation, food, activity, misc }, perDay[], overBudget: bool }` | ✓ |
| POST | `/trips/:tripId/expenses` | `{ stopId, category, label, amount, currency?, date? }` | `{ expense }` | ✓ |
| GET | `/trips/:tripId/expenses` | — | `{ expenses[] }` | ✓ |
| DELETE | `/expenses/:id` | — | `{ message }` | ✓ |

### 4.7 Sharing

| Method | Endpoint | Body | Response | Auth |
|---|---|---|---|---|
| POST | `/trips/:tripId/share` | — | `{ shareSlug, publicUrl }` | ✓ |
| DELETE | `/trips/:tripId/share` | — | `{ message }` | ✓ |
| GET | `/shared/:slug` | — | `{ trip }` (read-only, populated) | ✗ |
| POST | `/shared/:slug/copy` | — | `{ newTrip }` | ✓ |

### 4.8 Admin

| Method | Endpoint | Response | Auth |
|---|---|---|---|
| GET | `/admin/stats` | `{ totalUsers, totalTrips, topCities[], topActivities[], tripsPerDay[] }` | ✓ Admin |
| GET | `/admin/users` | `{ users[] }` | ✓ Admin |
| DELETE | `/admin/users/:id` | `{ message }` | ✓ Admin |

### 4.9 Profile

| Method | Endpoint | Body | Response | Auth |
|---|---|---|---|---|
| PUT | `/auth/profile` | `{ name?, avatar?, preferences? }` | `{ user }` | ✓ |
| DELETE | `/auth/account` | — | `{ message }` | ✓ |

> [!NOTE]
> **Standard Response Envelope**: Every API response follows this shape:
> ```json
> // Success
> { "success": true, "data": { ... } }
> // Error
> { "success": false, "error": { "message": "...", "code": "VALIDATION_ERROR" } }
> ```
> Use the central `errorHandler.js` middleware. Never send raw errors to the client.

---

## 5 · Design System & Tokens

### 5.1 Color Palette

Paste these CSS custom properties into `client/src/index.css`. **Every component must reference these tokens — never hard-code hex values.**

```css
:root {
  /* ── Backgrounds ── */
  --color-bg-page:        #FAF9F6;  /* warm off-white */
  --color-bg-surface:     #FFFFFF;  /* card surfaces */
  --color-bg-sunken:      #F0EEE6;  /* nested sections, inputs, dividers */

  /* ── Primary (ocean teal) ── */
  --color-primary:        #0E7C86;  /* navbar, active states, links, icons */
  --color-primary-hover:  #0B646D;  /* button hover / active */

  /* ── Accent / CTA (coral-orange) — ONE per view ── */
  --color-accent:         #F2703C;  /* primary action buttons ONLY */
  --color-accent-hover:   #D65E2C;

  /* ── Text ── */
  --color-text-primary:   #2B2D33;  /* headings, body */
  --color-text-secondary: #6B6E76;  /* captions, meta, timestamps */

  /* ── Borders ── */
  --color-border:         #E4E1D8;  /* hairline borders on cards & inputs */

  /* ── Semantic (ONLY for status meaning) ── */
  --color-success:        #2FA36B;  /* under-budget, confirmations */
  --color-warning:        #E0574C;  /* over-budget, delete, destructive */
  --color-info:           #DCEFF0;  /* badges, filter chips, tags */

  /* ── Typography ── */
  --font-family:          'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-size-xs:         0.75rem;   /* 12px */
  --font-size-sm:         0.875rem;  /* 14px */
  --font-size-base:       1rem;      /* 16px */
  --font-size-lg:         1.25rem;   /* 20px */
  --font-size-xl:         1.5rem;    /* 24px */
  --font-size-2xl:        2rem;      /* 32px */
  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  /* ── Spacing scale (multiples of 4px) ── */
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */

  /* ── Radii ── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* ── Shadows (subtle — NO heavy drop-shadows) ── */
  --shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md:   0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-lg:   0 4px 16px rgba(0, 0, 0, 0.08);

  /* ── Transitions ── */
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow:   400ms ease;
}
```

### 5.2 Design Rules (MANDATORY)

| # | Rule |
|---|---|
| 1 | **Only ONE accent (coral) button per view.** Reserve it for the single primary action ("Plan New Trip", "Add Stop", "Save"). All other buttons use `--color-primary` or ghost/outline styles. |
| 2 | **Success/Warning are semantic only.** Green = under-budget/confirmation. Red = over-budget/delete. Never use them for decoration. |
| 3 | **Cards** sit on `--color-bg-page` with `border: 1px solid var(--color-border)` and `border-radius: var(--radius-lg)`. Shadows are `--shadow-sm` only. |
| 4 | **Text on colored buttons/badges** must be `#FFFFFF` or the darkest shade of that color family — **never plain `#000`**. |
| 5 | **Font**: Import Inter from Google Fonts in `index.html`. |
| 6 | **Responsive**: Mobile-first (`min-width` breakpoints). Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`. |

---

## 6 · Frontend Conventions

### 6.1 Routing (React Router v7)

```jsx
// App.jsx — use createBrowserRouter or <Routes>
<Routes>
  <Route path="/login"          element={<LoginPage />} />
  <Route path="/signup"         element={<SignupPage />} />
  <Route path="/"               element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  <Route path="/trips"          element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />
  <Route path="/trips/new"      element={<ProtectedRoute><CreateTripPage /></ProtectedRoute>} />
  <Route path="/trips/:id"      element={<ProtectedRoute><ItineraryViewPage /></ProtectedRoute>} />
  <Route path="/trips/:id/edit" element={<ProtectedRoute><ItineraryBuilderPage /></ProtectedRoute>} />
  <Route path="/trips/:id/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
  <Route path="/trips/:id/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
  <Route path="/cities"         element={<ProtectedRoute><CitySearchPage /></ProtectedRoute>} />
  <Route path="/activities"     element={<ProtectedRoute><ActivitySearchPage /></ProtectedRoute>} />
  <Route path="/shared/:slug"   element={<SharedItineraryPage />} />
  <Route path="/profile"        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
  <Route path="/admin"          element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
</Routes>
```

### 6.2 Component Rules

1. **Functional components only** — no class components.
2. **One component per file.** File name = component name in PascalCase (e.g., `TripCard.jsx`).
3. **Co-located CSS modules**: `TripCard.jsx` → `TripCard.module.css` in the same folder. Or use vanilla CSS with BEM naming (`.trip-card`, `.trip-card__title`, `.trip-card--featured`).
4. **Props**: Destructure in the function signature. Add JSDoc or comments for non-obvious props.
5. **State management**: React Context + `useReducer` for auth and trip state. **No Redux** unless the team explicitly agrees.
6. **API calls** happen ONLY in `services/*.js` files. Components call hooks → hooks call services.

### 6.3 Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Component file | PascalCase `.jsx` | `TripCard.jsx` |
| CSS module | PascalCase `.module.css` | `TripCard.module.css` |
| Hook file | camelCase `use*.js` | `useTrips.js` |
| Service file | camelCase `*Service.js` | `tripService.js` |
| Utility file | camelCase `.js` | `formatDate.js` |
| CSS variable | kebab-case `--color-*` | `--color-primary` |
| Mongoose model | PascalCase singular | `Trip.js` → `'Trip'` |
| API route file | camelCase `*Routes.js` | `tripRoutes.js` |
| Controller file | camelCase `*Controller.js` | `tripController.js` |

---

## 7 · Backend Conventions

### 7.1 Project Setup

```bash
# From root
cd server && npm init -y
npm i express mongoose dotenv cors bcryptjs jsonwebtoken joi
npm i -D nodemon
```

### 7.2 Entry Point Pattern (`server/index.js`)

```js
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
// ...route imports

const app = express();
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/auth',       authRoutes);
app.use('/api/trips',      tripRoutes);
app.use('/api/stops',      stopRoutes);
app.use('/api/activities',  activityRoutes);
app.use('/api/cities',     cityRoutes);
app.use('/api/shared',     shareRoutes);
app.use('/api/admin',      adminRoutes);

// Central error handler (MUST be last middleware)
app.use(errorHandler);

connectDB().then(() => {
  app.listen(5000, () => console.log('🚀 Server running on :5000'));
});
```

### 7.3 Controller Pattern

```js
// controllers/tripController.js
export const createTrip = async (req, res, next) => {
  try {
    const trip = await Trip.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: { trip } });
  } catch (err) {
    next(err); // → errorHandler middleware
  }
};
```

### 7.4 Auth Flow

- **Registration**: Hash password with bcrypt (salt rounds = 10) → save User → return JWT.
- **Login**: Find user by email → compare hash → return JWT.
- **JWT**: Sign with `process.env.JWT_SECRET`, expires in `7d`. Payload: `{ id: user._id, role: user.role }`.
- **Middleware**: `authMiddleware.js` extracts token from `Authorization: Bearer <token>`, verifies, attaches `req.user`.

---

## 8 · Environment Variables

Create `.env` in `server/` (NEVER commit it):

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/globetrotter?retryWrites=true&w=majority
JWT_SECRET=<random-64-char-string>
NODE_ENV=development
```

---

## 9 · Team Ownership Matrix

Assign each member a **vertical slice** to avoid merge conflicts. Each person owns their pages, components, routes, controllers, and models end-to-end.

| Member | Screens | Backend Routes | Models Owned |
|---|---|---|---|
| **Member 1 — Auth & Core** | Login, Signup, Profile, Dashboard | `/auth`, `/auth/profile` | `User` |
| **Member 2 — Trip CRUD & Sharing** | CreateTrip, MyTrips, SharedItinerary | `/trips`, `/shared` | `Trip` |
| **Member 3 — Itinerary & Calendar** | ItineraryBuilder, ItineraryView, Calendar, CitySearch, ActivitySearch | `/stops`, `/activities`, `/cities` | `Stop`, `Activity`, `City` |
| **Member 4 — Budget & Admin** | Budget, AdminDashboard | `/budget`, `/expenses`, `/admin` | `Expense` |

> [!IMPORTANT]
> **Cross-cutting rules**:
> - If you need to modify a model you don't own, **notify the owner first**.
> - Shared components in `components/common/` and `components/layout/` can be edited by anyone, but **add a comment with your name** when creating a new shared component.
> - The `services/api.js` base instance is shared — coordinate changes.

---

## 10 · Git Workflow

```
main ← dev ← feature/<member>/<feature-name>
```

| Rule | Detail |
|---|---|
| **Branch naming** | `feature/m1/login-page`, `feature/m3/itinerary-builder` |
| **Commit messages** | `feat: add login page`, `fix: budget calculation`, `chore: seed cities data` |
| **PRs** | Always merge feature → `dev`. Only merge `dev` → `main` after team review. |
| **Conflicts** | If you touch a file outside your ownership zone, coordinate on the team chat FIRST. |

---

## 11 · Key Libraries (Approved)

| Purpose | Package | Notes |
|---|---|---|
| HTTP client | `axios` | Wrap in `services/api.js` |
| Routing | `react-router-dom@7` | v7 with data APIs |
| Charts | `recharts` or `chart.js` + `react-chartjs-2` | For budget breakdowns |
| Date handling | `date-fns` | Lighter than moment |
| Drag & drop | `@dnd-kit/core` | For reordering stops/activities |
| Toast notifications | `react-hot-toast` | Consistent feedback |
| Form validation (FE) | Native + `utils/validators.js` | Keep it simple |
| Validation (BE) | `joi` | Schema-based request validation |
| Auth tokens | `jsonwebtoken` | Server-side JWT |
| Password hashing | `bcryptjs` | Pure JS bcrypt |
| Icons | `lucide-react` | Consistent, tree-shakeable |

> [!CAUTION]
> **Do NOT install** TailwindCSS, styled-components, Material UI, or any CSS framework. We use vanilla CSS with design tokens. Any new dependency must be discussed with the team first.

---

## 12 · Seed Data

Member 3 should create `server/utils/seedData.js` to populate:
- **20+ cities** across multiple countries/regions with cost indices
- **50+ activities** linked to those cities with categories, costs, and durations

This seed data is critical for demo-ability. Run via: `node server/utils/seedData.js`

---

## 13 · Quick Reference — AI Prompt Suffix

When any team member starts a new AI session, **append this block** to their prompt:

```
CONTEXT: I am working on "GlobeTrotter", a MERN-stack travel planning app.
- Follow the Master Context Block for all architecture, file placement, naming, and design decisions.
- Use ONLY the CSS custom properties defined in the design tokens (--color-*, --space-*, etc.).
- Place files in the canonical folder structure — do not create new top-level folders.
- Use the standard API response envelope: { success: bool, data: {} } or { success: bool, error: { message, code } }.
- All Mongoose models use { timestamps: true } and reference other models by ObjectId.
- One accent (coral) button per view. Semantic colors for status only.
- Functional React components only. API calls in services/, state in context/.
- I am Member [1/2/3/4] working on [my assigned screens/routes].
```

---

## 14 · Screens → API Mapping (Quick Reference)

| Screen | Primary API Calls |
|---|---|
| Login / Signup | `POST /auth/login`, `POST /auth/register` |
| Dashboard | `GET /trips?limit=5`, `GET /cities?sort=popularity&limit=6` |
| Create Trip | `POST /trips` |
| My Trips | `GET /trips` |
| Itinerary Builder | `GET /trips/:id`, `POST /trips/:id/stops`, `PUT /stops/:id`, `PATCH /trips/:id/stops/reorder`, `GET /activities?cityId=`, `POST /stops/:id/activities` |
| Itinerary View | `GET /trips/:id` (deep populated) |
| City Search | `GET /cities?q=&country=` |
| Activity Search | `GET /activities?cityId=&category=&q=` |
| Budget | `GET /trips/:id/budget`, `POST /trips/:id/expenses`, `GET /trips/:id/expenses` |
| Calendar | `GET /trips/:id` (derive from stops + activities) |
| Shared Itinerary | `GET /shared/:slug`, `POST /shared/:slug/copy` |
| Profile | `GET /auth/me`, `PUT /auth/profile`, `DELETE /auth/account` |
| Admin Dashboard | `GET /admin/stats`, `GET /admin/users`, `DELETE /admin/users/:id` |

---

> **Last updated**: 2026-08-22 · **Version**: 1.0
> **Rule**: If any team member needs to deviate from this document, they must update it here first and notify the team.
