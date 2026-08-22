# 🌍 GlobeTrotter — Master Context Block

> **Purpose**: This document is the **single source of truth** for every AI-assisted coding session on this project. Paste this into every new chat/context window. All four team members MUST follow these specifications to prevent architectural conflicts, merge collisions, and inconsistency.
>
> **Wireframe reference**: `GlobeTrotter - 8 hours.excalidraw` — 12 screens. Every screen, model, and route below maps directly to those wireframes.

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

## 2 · Screen Map (from Excalidraw wireframes)

| # | Screen Name | Route | Key UI Elements |
|---|---|---|---|
| 1 | **Login Screen** | `/login` | Username field, Password field, Login button, link to Register |
| 2 | **Registration Screen** | `/register` | Photo upload, First Name, Last Name, Email, Phone, City, Country, Additional Info, Register button |
| 3 | **Main Landing Page** | `/` | Banner image, Search bar, Group By / Filter / Sort By controls, "Plan a Trip" CTA, Top Regional Selections, Previous Trips |
| 4 | **Create a New Trip** | `/trips/new` | Select a Place, Start Date, End Date, Suggestions for Places/Activities, "Add another Section" button |
| 5 | **Build Itinerary Screen** | `/trips/:id/edit` | Sections (each with: title, description, date range, budget), add/remove/reorder sections |
| 6 | **User Trip Listing** | `/trips` | Search + Group By + Filter + Sort By, trip cards categorized as **Ongoing / Upcoming / Completed** |
| 7 | **User Profile Page** | `/profile` | User photo, editable user details, Preplanned Trips list, Previous Trips list |
| 8 | **Activity & City Search** | `/search` | Combined search page — Search bar + Group By + Filter + Sort By, result cards with "View" button |
| 9 | **Itinerary View with Budget** | `/trips/:id` | Day-wise breakdown (Day 1, Day 2…), each day shows: Physical Activities + Expense per activity |
| 10 | **Community Tab** | `/community` | Community posts where users share trip/activity experiences, Search + Group By + Filter + Sort By |
| 11 | **Calendar View** | `/trips/:id/calendar` | Calendar component showing trip schedule, Search + Group By + Filter + Sort By |
| 12 | **Admin Panel** | `/admin` | Manage Users section, Popular Cities, Popular Activities, User Trends & Analytics |

> [!IMPORTANT]
> **Consistent Navbar on ALL screens (3–12)**: Every authenticated screen shows the **GlobeTrotter** brand + a **Search bar** + **Group By** / **Filter** / **Sort By** controls in the top navigation area. Build this once in `components/layout/Navbar.jsx`.

---

## 3 · Monorepo Structure (Canonical)

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
│   │   │   ├── common/             # Button, Input, Modal, Card, Loader, Badge, SearchBar, FilterBar
│   │   │   ├── layout/             # Navbar, Sidebar, Footer, PageShell
│   │   │   ├── trip/               # TripCard, TripForm, SectionCard, ActivityCard
│   │   │   ├── itinerary/          # ItineraryTimeline, DayBlock, CalendarView
│   │   │   ├── budget/             # BudgetSummary, CostBreakdownChart, BudgetAlert
│   │   │   ├── search/             # CityResultCard, ActivityResultCard, SearchFilters
│   │   │   └── community/          # CommunityPost, PostForm, PostCard
│   │   ├── pages/                  # Route-level page components (one per screen)
│   │   │   ├── LoginPage.jsx            # Screen 1
│   │   │   ├── RegisterPage.jsx         # Screen 2
│   │   │   ├── LandingPage.jsx          # Screen 3
│   │   │   ├── CreateTripPage.jsx       # Screen 4
│   │   │   ├── ItineraryBuilderPage.jsx # Screen 5
│   │   │   ├── MyTripsPage.jsx          # Screen 6
│   │   │   ├── ProfilePage.jsx          # Screen 7
│   │   │   ├── SearchPage.jsx           # Screen 8  (combined city + activity)
│   │   │   ├── ItineraryViewPage.jsx    # Screen 9  (with budget)
│   │   │   ├── CommunityPage.jsx        # Screen 10
│   │   │   ├── CalendarPage.jsx         # Screen 11
│   │   │   └── AdminPanelPage.jsx       # Screen 12
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useTrips.js
│   │   │   ├── useBudget.js
│   │   │   └── useCommunity.js
│   │   ├── context/                # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── TripContext.jsx
│   │   ├── services/               # API call wrappers (axios instances)
│   │   │   ├── api.js              # Axios base instance + interceptors
│   │   │   ├── authService.js
│   │   │   ├── tripService.js
│   │   │   ├── cityService.js
│   │   │   ├── activityService.js
│   │   │   ├── communityService.js
│   │   │   └── adminService.js
│   │   ├── utils/                  # Pure utility/helper functions
│   │   │   ├── formatDate.js
│   │   │   ├── formatCurrency.js
│   │   │   ├── tripStatus.js       # Derive ongoing/upcoming/completed from dates
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
│   │   ├── City.js
│   │   └── CommunityPost.js
│   ├── routes/                     # Express routers
│   │   ├── authRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── stopRoutes.js
│   │   ├── activityRoutes.js
│   │   ├── cityRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── communityRoutes.js
│   │   └── adminRoutes.js
│   ├── controllers/                # Route handlers (business logic)
│   │   ├── authController.js
│   │   ├── tripController.js
│   │   ├── stopController.js
│   │   ├── activityController.js
│   │   ├── cityController.js
│   │   ├── budgetController.js
│   │   ├── communityController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   ├── adminMiddleware.js      # isAdmin check
│   │   ├── errorHandler.js         # Central error handler
│   │   └── validate.js             # Request body validation (Joi/Zod)
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seedData.js             # Seed script for cities/activities
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

## 4 · Database Schema (MongoDB / Mongoose)

All models use these conventions:
- Collection names: **lowercase plural** (auto by Mongoose)
- `_id`: ObjectId (Mongoose default) — never override
- Timestamps: `{ timestamps: true }` on every schema
- References: always use `mongoose.Schema.Types.ObjectId` + `ref`

### 4.1 User  ← (Screen 2: Registration)

```js
{
  firstName:     { type: String, required: true, trim: true },
  lastName:      { type: String, required: true, trim: true },
  username:      { type: String, required: true, unique: true, trim: true }, // Screen 1 login field
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true },             // bcrypt hashed
  phone:         { type: String, default: '' },
  avatar:        { type: String, default: '' },                // Photo upload URL
  city:          { type: String, default: '' },                // User's home city
  country:       { type: String, default: '' },                // User's country
  additionalInfo:{ type: String, default: '' },                // "Additional Information" field
  role:          { type: String, enum: ['user', 'admin'], default: 'user' },
  preferences: {
    language:    { type: String, default: 'en' },
    currency:    { type: String, default: 'INR' }
  },
  savedCities:   [{ type: ObjectId, ref: 'City' }],
}
```

### 4.2 Trip  ← (Screen 4, 5, 6)

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
  stops:         [{ type: ObjectId, ref: 'Stop' }],            // ordered sections
}
```

> **Trip status** (Ongoing / Upcoming / Completed from Screen 6) is **derived from dates on the client**, not stored:
> ```js
> // utils/tripStatus.js
> export function getTripStatus(startDate, endDate) {
>   const now = new Date();
>   if (now < new Date(startDate)) return 'upcoming';
>   if (now > new Date(endDate))   return 'completed';
>   return 'ongoing';
> }
> ```

### 4.3 Stop (a.k.a. "Section")  ← (Screen 5)

The wireframe calls these **"Sections"** — each section has a title, description, date range, and budget. In the data model they are called `Stop` for clarity.

```js
{
  trip:          { type: ObjectId, ref: 'Trip', required: true, index: true },
  city:          { type: ObjectId, ref: 'City', required: true },
  title:         { type: String, default: '' },                // "Section 1", "Section 2", etc.
  description:   { type: String, default: '' },                // "All the necessary information..."
  arrivalDate:   { type: Date, required: true },               // Date Range start
  departureDate: { type: Date, required: true },               // Date Range end
  order:         { type: Number, required: true },             // for reordering
  sectionBudget: { type: Number, default: 0 },                // "Budget of this section"
  activities:    [{ type: ObjectId, ref: 'Activity' }],
  notes:         { type: String, default: '' },
}
```

### 4.4 Activity  ← (Screen 8, 9)

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

### 4.5 Expense  ← (Screen 9)

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

### 4.6 City  ← (Screen 8)

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

### 4.7 CommunityPost  ← (Screen 10) — NEW

```js
{
  user:          { type: ObjectId, ref: 'User', required: true, index: true },
  trip:          { type: ObjectId, ref: 'Trip', default: null },  // optional link to a trip
  activity:      { type: ObjectId, ref: 'Activity', default: null }, // optional link to an activity
  title:         { type: String, required: true, trim: true },
  content:       { type: String, required: true },             // user experience / review
  images:        [{ type: String }],                           // array of image URLs
  tags:          [{ type: String }],                           // e.g., ["adventure", "goa", "paragliding"]
  likes:         { type: Number, default: 0 },
  likedBy:       [{ type: ObjectId, ref: 'User' }],
}
```

> [!WARNING]
> **Never embed large arrays inside documents.** Stops reference Activities by ObjectId array. If an activity list could exceed 50 items, switch to a query-based approach (find activities by `stop` field) instead of an embedded array.

---

## 5 · API Contract (RESTful)

**Base URL**: `http://localhost:5000/api`

All authenticated routes require header: `Authorization: Bearer <jwt_token>`

### 5.1 Auth  ← (Screen 1, 2)

| Method | Endpoint | Body | Response | Auth |
|---|---|---|---|---|
| POST | `/auth/register` | `{ firstName, lastName, username, email, password, phone?, avatar?, city?, country?, additionalInfo? }` | `{ token, user }` | ✗ |
| POST | `/auth/login` | `{ username, password }` | `{ token, user }` | ✗ |
| GET | `/auth/me` | — | `{ user }` | ✓ |

### 5.2 Trips  ← (Screen 4, 6)

| Method | Endpoint | Body / Params | Response | Auth |
|---|---|---|---|---|
| POST | `/trips` | `{ name, description, startDate, endDate, coverImage?, totalBudget? }` | `{ trip }` | ✓ |
| GET | `/trips` | query: `?page=1&limit=10&q=&sortBy=&groupBy=&filter=` | `{ trips[], total }` | ✓ |
| GET | `/trips/:id` | — | `{ trip }` (populated stops + activities) | ✓ |
| PUT | `/trips/:id` | partial trip fields | `{ trip }` | ✓ |
| DELETE | `/trips/:id` | — | `{ message }` | ✓ |

### 5.3 Stops (Sections)  ← (Screen 5)

| Method | Endpoint | Body | Response | Auth |
|---|---|---|---|---|
| POST | `/trips/:tripId/stops` | `{ cityId, title?, description?, arrivalDate, departureDate, order, sectionBudget? }` | `{ stop }` | ✓ |
| PUT | `/stops/:id` | partial stop fields | `{ stop }` | ✓ |
| DELETE | `/stops/:id` | — | `{ message }` | ✓ |
| PATCH | `/trips/:tripId/stops/reorder` | `{ stopIds: [ordered] }` | `{ stops[] }` | ✓ |

### 5.4 Activities  ← (Screen 8, 9)

| Method | Endpoint | Params | Response | Auth |
|---|---|---|---|---|
| GET | `/activities` | `?cityId=&category=&minCost=&maxCost=&q=&sortBy=&groupBy=` | `{ activities[] }` | ✓ |
| POST | `/stops/:stopId/activities` | `{ activityId }` or `{ name, category, estimatedCost, ... }` | `{ stop }` | ✓ |
| DELETE | `/stops/:stopId/activities/:actId` | — | `{ stop }` | ✓ |

### 5.5 Cities  ← (Screen 8)

| Method | Endpoint | Params | Response | Auth |
|---|---|---|---|---|
| GET | `/cities` | `?q=&country=&region=&sortBy=popularity&groupBy=&filter=` | `{ cities[] }` | ✗ |
| GET | `/cities/:id` | — | `{ city, activities[] }` | ✗ |

### 5.6 Budget  ← (Screen 9)

| Method | Endpoint | Body | Response | Auth |
|---|---|---|---|---|
| GET | `/trips/:tripId/budget` | — | `{ totalEstimated, breakdown: { transport, accommodation, food, activity, misc }, perDay[], overBudget: bool }` | ✓ |
| POST | `/trips/:tripId/expenses` | `{ stopId, category, label, amount, currency?, date? }` | `{ expense }` | ✓ |
| GET | `/trips/:tripId/expenses` | — | `{ expenses[] }` | ✓ |
| DELETE | `/expenses/:id` | — | `{ message }` | ✓ |

### 5.7 Community  ← (Screen 10) — NEW

| Method | Endpoint | Body / Params | Response | Auth |
|---|---|---|---|---|
| GET | `/community` | `?q=&tags=&sortBy=recent&groupBy=&filter=&page=1&limit=10` | `{ posts[], total }` | ✓ |
| GET | `/community/:id` | — | `{ post }` (populated user, trip) | ✓ |
| POST | `/community` | `{ title, content, tripId?, activityId?, images?, tags? }` | `{ post }` | ✓ |
| PUT | `/community/:id` | partial post fields | `{ post }` | ✓ |
| DELETE | `/community/:id` | — | `{ message }` | ✓ |
| POST | `/community/:id/like` | — | `{ post }` | ✓ |

### 5.8 Admin  ← (Screen 12)

| Method | Endpoint | Response | Auth |
|---|---|---|---|
| GET | `/admin/stats` | `{ totalUsers, totalTrips, topCities[], topActivities[], userTrends[] }` | ✓ Admin |
| GET | `/admin/users` | `{ users[] }` | ✓ Admin |
| DELETE | `/admin/users/:id` | `{ message }` | ✓ Admin |
| GET | `/admin/popular-cities` | `{ cities[] }` | ✓ Admin |
| GET | `/admin/popular-activities` | `{ activities[] }` | ✓ Admin |

### 5.9 Profile  ← (Screen 7)

| Method | Endpoint | Body | Response | Auth |
|---|---|---|---|---|
| GET | `/auth/me` | — | `{ user }` (with preplanned + previous trips) | ✓ |
| PUT | `/auth/profile` | `{ firstName?, lastName?, phone?, avatar?, city?, country?, preferences? }` | `{ user }` | ✓ |
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

## 6 · Design System & Tokens

### 6.1 Color Palette

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

### 6.2 Design Rules (MANDATORY)

| # | Rule |
|---|---|
| 1 | **Only ONE accent (coral) button per view.** Reserve it for the single primary action ("Plan a Trip", "Add another Section", "Save"). All other buttons use `--color-primary` or ghost/outline styles. |
| 2 | **Success/Warning are semantic only.** Green = under-budget/confirmation. Red = over-budget/delete. Never use them for decoration. |
| 3 | **Cards** sit on `--color-bg-page` with `border: 1px solid var(--color-border)` and `border-radius: var(--radius-lg)`. Shadows are `--shadow-sm` only. |
| 4 | **Text on colored buttons/badges** must be `#FFFFFF` or the darkest shade of that color family — **never plain `#000`**. |
| 5 | **Font**: Import Inter from Google Fonts in `index.html`. |
| 6 | **Responsive**: Mobile-first (`min-width` breakpoints). Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`. |
| 7 | **Consistent toolbar**: Every page (Screens 3–12) includes the unified Navbar with Search + Group By + Filter + Sort By controls. |

---

## 7 · Frontend Conventions

### 7.1 Routing (React Router v7)

```jsx
// App.jsx — maps 1:1 to the 12 Excalidraw screens
<Routes>
  {/* Public */}
  <Route path="/login"              element={<LoginPage />} />           {/* Screen 1 */}
  <Route path="/register"           element={<RegisterPage />} />        {/* Screen 2 */}

  {/* Protected */}
  <Route path="/"                   element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />           {/* Screen 3 */}
  <Route path="/trips/new"          element={<ProtectedRoute><CreateTripPage /></ProtectedRoute>} />        {/* Screen 4 */}
  <Route path="/trips/:id/edit"     element={<ProtectedRoute><ItineraryBuilderPage /></ProtectedRoute>} />  {/* Screen 5 */}
  <Route path="/trips"              element={<ProtectedRoute><MyTripsPage /></ProtectedRoute>} />           {/* Screen 6 */}
  <Route path="/profile"            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />           {/* Screen 7 */}
  <Route path="/search"             element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />            {/* Screen 8 */}
  <Route path="/trips/:id"          element={<ProtectedRoute><ItineraryViewPage /></ProtectedRoute>} />     {/* Screen 9 */}
  <Route path="/community"          element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />         {/* Screen 10 */}
  <Route path="/trips/:id/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />          {/* Screen 11 */}

  {/* Admin */}
  <Route path="/admin"              element={<AdminRoute><AdminPanelPage /></AdminRoute>} />                {/* Screen 12 */}
</Routes>
```

### 7.2 Component Rules

1. **Functional components only** — no class components.
2. **One component per file.** File name = component name in PascalCase (e.g., `TripCard.jsx`).
3. **Co-located CSS modules**: `TripCard.jsx` → `TripCard.module.css` in the same folder. Or use vanilla CSS with BEM naming (`.trip-card`, `.trip-card__title`, `.trip-card--featured`).
4. **Props**: Destructure in the function signature. Add JSDoc or comments for non-obvious props.
5. **State management**: React Context + `useReducer` for auth and trip state. **No Redux** unless the team explicitly agrees.
6. **API calls** happen ONLY in `services/*.js` files. Components call hooks → hooks call services.

### 7.3 Shared UI Pattern — FilterBar

Since **every screen (3–12)** in the wireframes has Search + Group By + Filter + Sort By, build a single reusable component:

```
components/common/FilterBar.jsx
```

Props: `{ onSearch, onGroupBy, onFilter, onSort, groupByOptions, filterOptions, sortOptions }`

Each page passes its own options. This ensures visual consistency across all views.

### 7.4 Naming Conventions

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

## 8 · Backend Conventions

### 8.1 Project Setup

```bash
# From root
cd server && npm init -y
npm i express mongoose dotenv cors bcryptjs jsonwebtoken joi
npm i -D nodemon
```

### 8.2 Entry Point Pattern (`server/index.js`)

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
app.use('/api/auth',        authRoutes);
app.use('/api/trips',       tripRoutes);
app.use('/api/stops',       stopRoutes);
app.use('/api/activities',  activityRoutes);
app.use('/api/cities',      cityRoutes);
app.use('/api/community',   communityRoutes);
app.use('/api/admin',       adminRoutes);

// Central error handler (MUST be last middleware)
app.use(errorHandler);

connectDB().then(() => {
  app.listen(5000, () => console.log('🚀 Server running on :5000'));
});
```

### 8.3 Controller Pattern

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

### 8.4 Auth Flow

- **Registration** (Screen 2): Validate all fields → hash password with bcrypt (salt rounds = 10) → save User → return JWT.
- **Login** (Screen 1): Find user by **username** → compare hash → return JWT.
- **JWT**: Sign with `process.env.JWT_SECRET`, expires in `7d`. Payload: `{ id: user._id, role: user.role }`.
- **Middleware**: `authMiddleware.js` extracts token from `Authorization: Bearer <token>`, verifies, attaches `req.user`.

---

## 9 · Environment Variables

Create `.env` in `server/` (NEVER commit it):

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/globetrotter?retryWrites=true&w=majority
JWT_SECRET=<random-64-char-string>
NODE_ENV=development
```

---

## 10 · Team Ownership Matrix

Assign each member a **vertical slice** to avoid merge conflicts. Each person owns their pages, components, routes, controllers, and models end-to-end.

| Member | Screens (by wireframe #) | Backend Routes | Models Owned |
|---|---|---|---|
| **Member 1 — Auth & Profile** | Screen 1 (Login), Screen 2 (Register), Screen 7 (Profile) | `/auth`, `/auth/profile` | `User` |
| **Member 2 — Trips & Landing** | Screen 3 (Landing), Screen 4 (Create Trip), Screen 6 (My Trips) | `/trips` | `Trip` |
| **Member 3 — Itinerary, Search & Calendar** | Screen 5 (Build Itinerary), Screen 8 (Search), Screen 9 (Itinerary View), Screen 11 (Calendar) | `/stops`, `/activities`, `/cities`, `/budget` | `Stop`, `Activity`, `City`, `Expense` |
| **Member 4 — Community & Admin** | Screen 10 (Community), Screen 12 (Admin Panel) | `/community`, `/admin` | `CommunityPost` |

> [!IMPORTANT]
> **Cross-cutting rules**:
> - If you need to modify a model you don't own, **notify the owner first**.
> - Shared components in `components/common/` and `components/layout/` can be edited by anyone, but **add a comment with your name** when creating a new shared component.
> - The `services/api.js` base instance and `components/common/FilterBar.jsx` are shared — coordinate changes.

---

## 11 · Git Workflow

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

## 12 · Key Libraries (Approved)

| Purpose | Package | Notes |
|---|---|---|
| HTTP client | `axios` | Wrap in `services/api.js` |
| Routing | `react-router-dom@7` | v7 with data APIs |
| Charts | `recharts` or `chart.js` + `react-chartjs-2` | For budget breakdowns + admin analytics |
| Date handling | `date-fns` | Lighter than moment |
| Drag & drop | `@dnd-kit/core` | For reordering sections/activities |
| Toast notifications | `react-hot-toast` | Consistent feedback |
| Form validation (FE) | Native + `utils/validators.js` | Keep it simple |
| Validation (BE) | `joi` | Schema-based request validation |
| Auth tokens | `jsonwebtoken` | Server-side JWT |
| Password hashing | `bcryptjs` | Pure JS bcrypt |
| Icons | `lucide-react` | Consistent, tree-shakeable |

> [!CAUTION]
> **Do NOT install** TailwindCSS, styled-components, Material UI, or any CSS framework. We use vanilla CSS with design tokens. Any new dependency must be discussed with the team first.

---

## 13 · Seed Data

Member 3 should create `server/utils/seedData.js` to populate:
- **20+ cities** across multiple countries/regions with cost indices
- **50+ activities** linked to those cities with categories, costs, and durations

This seed data is critical for demo-ability. Run via: `node server/utils/seedData.js`

---

## 14 · Quick Reference — AI Prompt Suffix

When any team member starts a new AI session, **append this block** to their prompt:

```
CONTEXT: I am working on "GlobeTrotter", a MERN-stack travel planning app.
- Follow the Master Context Block for all architecture, file placement, naming, and design decisions.
- The app has 12 screens matching the Excalidraw wireframes (Login, Register, Landing, CreateTrip, BuildItinerary, MyTrips, Profile, Search, ItineraryView, Community, Calendar, Admin).
- Use ONLY the CSS custom properties defined in the design tokens (--color-*, --space-*, etc.).
- Place files in the canonical folder structure — do not create new top-level folders.
- Use the standard API response envelope: { success: bool, data: {} } or { success: bool, error: { message, code } }.
- All Mongoose models use { timestamps: true } and reference other models by ObjectId.
- Login uses USERNAME (not email). Registration collects: firstName, lastName, email, phone, photo, city, country, additionalInfo.
- Every page (Screens 3–12) includes the shared Navbar + FilterBar (Search, Group By, Filter, Sort By).
- Trip status (ongoing/upcoming/completed) is derived from dates, not stored.
- "Sections" in the wireframe = "Stop" model in the code.
- One accent (coral) button per view. Semantic colors for status only.
- Functional React components only. API calls in services/, state in context/.
- I am Member [1/2/3/4] working on [my assigned screens/routes].
```

---

## 15 · Screens → API Mapping (Quick Reference)

| Screen # | Screen Name | Primary API Calls |
|---|---|---|
| 1 | Login | `POST /auth/login` |
| 2 | Registration | `POST /auth/register` |
| 3 | Main Landing Page | `GET /trips?limit=5`, `GET /cities?sort=popularity&limit=6` |
| 4 | Create a New Trip | `POST /trips`, `GET /cities?q=`, `GET /activities?cityId=` |
| 5 | Build Itinerary | `GET /trips/:id`, `POST /trips/:id/stops`, `PUT /stops/:id`, `PATCH /trips/:id/stops/reorder` |
| 6 | User Trip Listing | `GET /trips` (client groups by ongoing/upcoming/completed) |
| 7 | User Profile | `GET /auth/me`, `PUT /auth/profile`, `GET /trips` |
| 8 | Activity & City Search | `GET /cities?q=&country=&sortBy=&groupBy=`, `GET /activities?q=&category=&sortBy=` |
| 9 | Itinerary View + Budget | `GET /trips/:id` (deep populated), `GET /trips/:id/budget`, `GET /trips/:id/expenses` |
| 10 | Community Tab | `GET /community`, `POST /community`, `POST /community/:id/like` |
| 11 | Calendar View | `GET /trips/:id` (derive calendar from stops + activities) |
| 12 | Admin Panel | `GET /admin/stats`, `GET /admin/users`, `GET /admin/popular-cities`, `GET /admin/popular-activities` |

---

> **Last updated**: 2026-08-22 · **Version**: 2.0  
> **Rule**: If any team member needs to deviate from this document, they must update it here first and notify the team.
