# GlobeTrotter — Full Implementation Plan

Build the complete GlobeTrotter MERN-stack travel planning app from the current scaffold (empty Vite+React client + placeholder `server.js`) based on [MASTER_CONTEXT.md](file:///d:/Project/odoo/MASTER_CONTEXT.md).

## Current State

- **Client**: Fresh Vite 8 + React 19 scaffold — only boilerplate `App.jsx`, `main.jsx`, `index.css`
- **Server**: A single root `server.js` placeholder — no `server/` directory, no models, routes, or controllers
- **Dependencies**: Only `express`, `react`, `react-dom` installed — no mongoose, JWT, bcrypt, axios, react-router, etc.

## Proposed Changes

The build is organized into **5 phases** in dependency order. Each phase produces working, testable code before the next begins.

---

### Phase 1 — Foundation & Infrastructure

Set up the monorepo structure, install all dependencies, configure the design system, and create the shared server/client skeletons.

#### [MODIFY] [package.json](file:///d:/Project/odoo/package.json)
- Add workspace scripts: `dev` (concurrently runs client + server), `dev:client`, `dev:server`
- Add `concurrently` as dev dependency

#### [NEW] [.env.example](file:///d:/Project/odoo/.env.example)
- Template with `PORT`, `MONGO_URI`, `JWT_SECRET`, `NODE_ENV`

#### [NEW] [server/package.json](file:///d:/Project/odoo/server/package.json)
- ESM (`"type": "module"`), dependencies: express, mongoose, dotenv, cors, bcryptjs, jsonwebtoken, joi
- Dev dependencies: nodemon

#### [NEW] [server/index.js](file:///d:/Project/odoo/server/index.js)
- Express app with CORS, JSON parsing, route mounting, central error handler, DB connection

#### [NEW] [server/config/db.js](file:///d:/Project/odoo/server/config/db.js)
- Mongoose connection utility

#### [NEW] [server/config/env.js](file:///d:/Project/odoo/server/config/env.js)
- dotenv loader with validation

#### [NEW] [server/middleware/errorHandler.js](file:///d:/Project/odoo/server/middleware/errorHandler.js)
- Central error handler returning `{ success: false, error: { message, code } }`

#### [NEW] [server/middleware/authMiddleware.js](file:///d:/Project/odoo/server/middleware/authMiddleware.js)
- JWT verification, attaches `req.user`

#### [NEW] [server/middleware/adminMiddleware.js](file:///d:/Project/odoo/server/middleware/adminMiddleware.js)
- `isAdmin` role check

#### [NEW] [server/middleware/validate.js](file:///d:/Project/odoo/server/middleware/validate.js)
- Joi schema validation middleware factory

#### [NEW] [server/utils/generateToken.js](file:///d:/Project/odoo/server/utils/generateToken.js)
- JWT sign helper (7d expiry, payload: `{ id, role }`)

#### [MODIFY] [client/index.html](file:///d:/Project/odoo/client/index.html)
- Add Inter font     from Google Fonts, update `<title>` to "GlobeTrotter"

#### [MODIFY] [client/src/index.css](file:///d:/Project/odoo/client/src/index.css)
- Replace with full design token system (all CSS custom properties from §6.1) + CSS reset

#### [MODIFY] [client/package.json](file:///d:/Project/odoo/client/package.json)
- Add dependencies: `axios`, `react-router-dom@7`, `recharts`, `date-fns`, `@dnd-kit/core`, `@dnd-kit/sortable`, `react-hot-toast`, `lucide-react`

#### [MODIFY] [client/vite.config.js](file:///d:/Project/odoo/client/vite.config.js)
- Add API proxy: `/api` → `http://localhost:5000`

#### [NEW] [client/src/services/api.js](file:///d:/Project/odoo/client/src/services/api.js)
- Axios base instance with interceptors (auto-attach Bearer token, error handling)

#### [NEW] [client/src/constants/index.js](file:///d:/Project/odoo/client/src/constants/index.js)
- Enum-like constants for categories, roles, trip statuses

#### [NEW] [client/src/utils/formatDate.js](file:///d:/Project/odoo/client/src/utils/formatDate.js)
#### [NEW] [client/src/utils/formatCurrency.js](file:///d:/Project/odoo/client/src/utils/formatCurrency.js)
#### [NEW] [client/src/utils/tripStatus.js](file:///d:/Project/odoo/client/src/utils/tripStatus.js)
#### [NEW] [client/src/utils/validators.js](file:///d:/Project/odoo/client/src/utils/validators.js)

---

### Phase 2 — Database Models & Auth System

All 7 Mongoose models + complete Auth flow (Screens 1 & 2).

#### [NEW] [server/models/User.js](file:///d:/Project/odoo/server/models/User.js)
#### [NEW] [server/models/Trip.js](file:///d:/Project/odoo/server/models/Trip.js)
#### [NEW] [server/models/Stop.js](file:///d:/Project/odoo/server/models/Stop.js)
#### [NEW] [server/models/Activity.js](file:///d:/Project/odoo/server/models/Activity.js)
#### [NEW] [server/models/Expense.js](file:///d:/Project/odoo/server/models/Expense.js)
#### [NEW] [server/models/City.js](file:///d:/Project/odoo/server/models/City.js)
#### [NEW] [server/models/CommunityPost.js](file:///d:/Project/odoo/server/models/CommunityPost.js)

All models follow the exact schemas from §4 with `{ timestamps: true }`.

#### [NEW] [server/routes/authRoutes.js](file:///d:/Project/odoo/server/routes/authRoutes.js)
#### [NEW] [server/controllers/authController.js](file:///d:/Project/odoo/server/controllers/authController.js)
- `POST /auth/register` — validate, hash password (bcrypt, 10 rounds), save User, return JWT + user
- `POST /auth/login` — find by username, compare hash, return JWT + user
- `GET /auth/me` — return authenticated user
- `PUT /auth/profile` — update profile fields
- `DELETE /auth/account` — delete account

#### [NEW] [client/src/context/AuthContext.jsx](file:///d:/Project/odoo/client/src/context/AuthContext.jsx)
- Auth state with `useReducer`: user, token, loading
- Persist token in localStorage
- Provide `login`, `register`, `logout`, `updateProfile` actions

#### [NEW] [client/src/hooks/useAuth.js](file:///d:/Project/odoo/client/src/hooks/useAuth.js)
#### [NEW] [client/src/services/authService.js](file:///d:/Project/odoo/client/src/services/authService.js)

#### [NEW] [client/src/components/layout/Navbar.jsx](file:///d:/Project/odoo/client/src/components/layout/Navbar.jsx)
- Brand "GlobeTrotter", search bar, nav links (Home, Trips, Search, Community, Profile), user avatar dropdown, logout
- Responsive hamburger for mobile

#### [NEW] [client/src/components/layout/Navbar.module.css](file:///d:/Project/odoo/client/src/components/layout/Navbar.module.css)

#### [NEW] [client/src/components/layout/PageShell.jsx](file:///d:/Project/odoo/client/src/components/layout/PageShell.jsx)
- Wraps protected pages with Navbar + main content area

#### [NEW] [client/src/components/common/Button.jsx](file:///d:/Project/odoo/client/src/components/common/Button.jsx)
- Variants: primary (teal), accent (coral), outline, ghost, danger

#### [NEW] [client/src/components/common/Input.jsx](file:///d:/Project/odoo/client/src/components/common/Input.jsx)
#### [NEW] [client/src/components/common/Modal.jsx](file:///d:/Project/odoo/client/src/components/common/Modal.jsx)
#### [NEW] [client/src/components/common/Card.jsx](file:///d:/Project/odoo/client/src/components/common/Card.jsx)
#### [NEW] [client/src/components/common/Loader.jsx](file:///d:/Project/odoo/client/src/components/common/Loader.jsx)
#### [NEW] [client/src/components/common/Badge.jsx](file:///d:/Project/odoo/client/src/components/common/Badge.jsx)
#### [NEW] [client/src/components/common/SearchBar.jsx](file:///d:/Project/odoo/client/src/components/common/SearchBar.jsx)
#### [NEW] [client/src/components/common/FilterBar.jsx](file:///d:/Project/odoo/client/src/components/common/FilterBar.jsx)
- Shared filter controls: `{ onSearch, onGroupBy, onFilter, onSort, groupByOptions, filterOptions, sortOptions }`

#### [NEW] [client/src/pages/LoginPage.jsx](file:///d:/Project/odoo/client/src/pages/LoginPage.jsx) — Screen 1
- Username + password form, login button, link to Register

#### [NEW] [client/src/pages/RegisterPage.jsx](file:///d:/Project/odoo/client/src/pages/RegisterPage.jsx) — Screen 2
- Full registration form: photo upload, first name, last name, email, phone, city, country, additional info

#### [MODIFY] [client/src/App.jsx](file:///d:/Project/odoo/client/src/App.jsx)
- Replace boilerplate with `BrowserRouter`, `AuthProvider`, all routes from §7.1
- `ProtectedRoute` and `AdminRoute` wrapper components

---

### Phase 3 — Core Trip Features (Screens 3–6, 9, 11)

#### [NEW] [server/routes/tripRoutes.js](file:///d:/Project/odoo/server/routes/tripRoutes.js)
#### [NEW] [server/controllers/tripController.js](file:///d:/Project/odoo/server/controllers/tripController.js)
- CRUD for trips with pagination, search, sorting, filtering

#### [NEW] [server/routes/stopRoutes.js](file:///d:/Project/odoo/server/routes/stopRoutes.js)
#### [NEW] [server/controllers/stopController.js](file:///d:/Project/odoo/server/controllers/stopController.js)
- Create/update/delete stops, reorder stops

#### [NEW] [server/routes/activityRoutes.js](file:///d:/Project/odoo/server/routes/activityRoutes.js)
#### [NEW] [server/controllers/activityController.js](file:///d:/Project/odoo/server/controllers/activityController.js)
- List activities (filter by city, category, cost range), add/remove activities from stops

#### [NEW] [server/routes/cityRoutes.js](file:///d:/Project/odoo/server/routes/cityRoutes.js)
#### [NEW] [server/controllers/cityController.js](file:///d:/Project/odoo/server/controllers/cityController.js)
- List/search cities, get city with its activities

#### [NEW] [server/routes/budgetRoutes.js](file:///d:/Project/odoo/server/routes/budgetRoutes.js)
#### [NEW] [server/controllers/budgetController.js](file:///d:/Project/odoo/server/controllers/budgetController.js)
- Budget summary, CRUD expenses

#### [NEW] [client/src/services/tripService.js](file:///d:/Project/odoo/client/src/services/tripService.js)
#### [NEW] [client/src/services/cityService.js](file:///d:/Project/odoo/client/src/services/cityService.js)
#### [NEW] [client/src/services/activityService.js](file:///d:/Project/odoo/client/src/services/activityService.js)
#### [NEW] [client/src/context/TripContext.jsx](file:///d:/Project/odoo/client/src/context/TripContext.jsx)
#### [NEW] [client/src/hooks/useTrips.js](file:///d:/Project/odoo/client/src/hooks/useTrips.js)
#### [NEW] [client/src/hooks/useBudget.js](file:///d:/Project/odoo/client/src/hooks/useBudget.js)

#### [NEW] [client/src/components/trip/TripCard.jsx](file:///d:/Project/odoo/client/src/components/trip/TripCard.jsx)
#### [NEW] [client/src/components/trip/TripForm.jsx](file:///d:/Project/odoo/client/src/components/trip/TripForm.jsx)
#### [NEW] [client/src/components/trip/SectionCard.jsx](file:///d:/Project/odoo/client/src/components/trip/SectionCard.jsx)
#### [NEW] [client/src/components/trip/ActivityCard.jsx](file:///d:/Project/odoo/client/src/components/trip/ActivityCard.jsx)
#### [NEW] [client/src/components/itinerary/ItineraryTimeline.jsx](file:///d:/Project/odoo/client/src/components/itinerary/ItineraryTimeline.jsx)
#### [NEW] [client/src/components/itinerary/DayBlock.jsx](file:///d:/Project/odoo/client/src/components/itinerary/DayBlock.jsx)
#### [NEW] [client/src/components/itinerary/CalendarView.jsx](file:///d:/Project/odoo/client/src/components/itinerary/CalendarView.jsx)
#### [NEW] [client/src/components/budget/BudgetSummary.jsx](file:///d:/Project/odoo/client/src/components/budget/BudgetSummary.jsx)
#### [NEW] [client/src/components/budget/CostBreakdownChart.jsx](file:///d:/Project/odoo/client/src/components/budget/CostBreakdownChart.jsx)
#### [NEW] [client/src/components/budget/BudgetAlert.jsx](file:///d:/Project/odoo/client/src/components/budget/BudgetAlert.jsx)
#### [NEW] [client/src/components/search/CityResultCard.jsx](file:///d:/Project/odoo/client/src/components/search/CityResultCard.jsx)
#### [NEW] [client/src/components/search/ActivityResultCard.jsx](file:///d:/Project/odoo/client/src/components/search/ActivityResultCard.jsx)
#### [NEW] [client/src/components/search/SearchFilters.jsx](file:///d:/Project/odoo/client/src/components/search/SearchFilters.jsx)

#### Pages:
#### [NEW] [client/src/pages/LandingPage.jsx](file:///d:/Project/odoo/client/src/pages/LandingPage.jsx) — Screen 3
- Banner, search bar, "Plan a Trip" CTA (accent button), top regional cities, recent/previous trips

#### [NEW] [client/src/pages/CreateTripPage.jsx](file:///d:/Project/odoo/client/src/pages/CreateTripPage.jsx) — Screen 4
- Place selector, date range, suggestions, "Add another Section"

#### [NEW] [client/src/pages/ItineraryBuilderPage.jsx](file:///d:/Project/odoo/client/src/pages/ItineraryBuilderPage.jsx) — Screen 5
- Drag-and-drop sections with @dnd-kit, each section: title, description, date range, budget

#### [NEW] [client/src/pages/MyTripsPage.jsx](file:///d:/Project/odoo/client/src/pages/MyTripsPage.jsx) — Screen 6
- Trip cards grouped by ongoing/upcoming/completed (derived from dates)

#### [NEW] [client/src/pages/ProfilePage.jsx](file:///d:/Project/odoo/client/src/pages/ProfilePage.jsx) — Screen 7
- User details, editable profile, preplanned + previous trips

#### [NEW] [client/src/pages/SearchPage.jsx](file:///d:/Project/odoo/client/src/pages/SearchPage.jsx) — Screen 8
- Combined city + activity search with FilterBar

#### [NEW] [client/src/pages/ItineraryViewPage.jsx](file:///d:/Project/odoo/client/src/pages/ItineraryViewPage.jsx) — Screen 9
- Day-wise breakdown with activities + expenses, budget summary with chart

#### [NEW] [client/src/pages/CalendarPage.jsx](file:///d:/Project/odoo/client/src/pages/CalendarPage.jsx) — Screen 11
- Calendar grid derived from trip stops + activities

---

### Phase 4 — Community & Admin (Screens 10, 12) [✅ COMPLETE]

#### [NEW] [server/routes/communityRoutes.js](file:///d:/Project/odoo/server/routes/communityRoutes.js)
#### [NEW] [server/controllers/communityController.js](file:///d:/Project/odoo/server/controllers/communityController.js)
- CRUD posts, like/unlike

#### [NEW] [server/routes/adminRoutes.js](file:///d:/Project/odoo/server/routes/adminRoutes.js)
#### [NEW] [server/controllers/adminController.js](file:///d:/Project/odoo/server/controllers/adminController.js)
- Stats, user management, popular cities/activities

#### [NEW] [client/src/services/communityService.js](file:///d:/Project/odoo/client/src/services/communityService.js)
#### [NEW] [client/src/services/adminService.js](file:///d:/Project/odoo/client/src/services/adminService.js)
#### [NEW] [client/src/hooks/useCommunity.js](file:///d:/Project/odoo/client/src/hooks/useCommunity.js)

#### [NEW] [client/src/components/community/CommunityPost.jsx](file:///d:/Project/odoo/client/src/components/community/CommunityPost.jsx)
#### [NEW] [client/src/components/community/PostForm.jsx](file:///d:/Project/odoo/client/src/components/community/PostForm.jsx)
#### [NEW] [client/src/components/community/PostCard.jsx](file:///d:/Project/odoo/client/src/components/community/PostCard.jsx)

#### [NEW] [client/src/pages/CommunityPage.jsx](file:///d:/Project/odoo/client/src/pages/CommunityPage.jsx) — Screen 10
#### [NEW] [client/src/pages/AdminPanelPage.jsx](file:///d:/Project/odoo/client/src/pages/AdminPanelPage.jsx) — Screen 12
- User management table, popular cities/activities lists, user trends charts (recharts)

---

### Phase 5 — Seed Data & Polish

#### [NEW] [server/utils/seedData.js](file:///d:/Project/odoo/server/utils/seedData.js)
- 20+ cities across multiple regions with cost indices
- 50+ activities linked to cities with categories, costs, durations
- 1 admin user for testing

#### CSS Module files
- Co-located `.module.css` for every component (using design tokens, no hard-coded hex values)

#### [NEW] [client/public/favicon.svg](file:///d:/Project/odoo/client/public/favicon.svg)
- GlobeTrotter favicon

---

## User Review Required

> [!IMPORTANT]
> **MongoDB Connection**: You'll need to provide a `MONGO_URI` in `server/.env`. Do you have a MongoDB Atlas cluster set up, or should I configure it for local MongoDB (`mongodb://localhost:27017/globetrotter`)?

> [!IMPORTANT]
> **Scope**: This plan builds the **entire** app (all 12 screens, all 7 models, full API, full frontend). This is ~80+ files. Should I build everything, or would you prefer I focus on specific member assignments (e.g., Member 1's auth screens first)?

> [!WARNING]
> **The existing root `server.js`** will become obsolete once `server/index.js` is created. It will remain in the repo but will no longer be used (as noted in the MASTER_CONTEXT: "LEGACY — migrate to server/index.js").

## Open Questions

1. **Which team member are you?** The MASTER_CONTEXT defines 4 member ownership slices. Should I build only your assigned screens, or the entire app?
2. **Photo/image uploads**: The registration form and trip covers reference image URLs. Should I implement file upload (e.g., multer + local storage), or use placeholder URLs for now?
3. **MongoDB**: Local or Atlas? If Atlas, I'll need the connection string for `.env`.

## Verification Plan

### Automated Tests
- `npm run dev` from root — verify both client (`:5173`) and server (`:5000`) start
- Test all API endpoints via manual curl/Postman commands
- Verify React routing loads all 12 screens

### Manual Verification
- Register a new user → login → create a trip → add stops/activities → view itinerary
- Test budget tracking, community posts, admin panel
- Verify responsive design at mobile/tablet/desktop breakpoints
