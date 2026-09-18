# FoodShare – Food Donation & Redistribution System 🍲🌱

FoodShare is a full-stack, production-grade web platform engineered to combat food waste and hunger by connecting surplus food donors (restaurants, caterers, banquet halls, supermarkets, and individuals) directly with verified NGOs, shelters, and community volunteers.

---
LINK:-https://foodshare-5wks.onrender.com/
## 🌟 Key Features

### 1. Multi-Role Ecosystem & RBAC
- **Food Donors**: Post cooked meals, raw groceries, or bakery surplus in under 60 seconds with food photos, preparation time, and consume-before expiry countdowns. Track real-time claim status and review community impact.
- **NGOs & Relief Shelters**: Interactive map & multi-criteria filtering to claim matching surplus food, schedule vehicle pickups, and record verified distribution to shelter beneficiaries.
- **Volunteer Couriers**: Discover nearby food rescue missions, accept delivery tasks across bicycle/motorcycle/van transport modes, and earn gamified badges ("Hunger Hero", "Century Deliverer").
- **System Administrators**: Master portal featuring interactive analytics charts (Chart.js), NGO credentials verification queue with 1-click approvals, user management with suspension controls, donation moderation, and system audit logs.

### 2. Complete 6-Stage Donation Lifecycle & State Machine
Every donation moves through transparent lifecycle verification milestones:
$$\text{AVAILABLE} \longrightarrow \text{ACCEPTED} \longrightarrow \text{PICKUP\_ASSIGNED} \longrightarrow \text{COLLECTED} \longrightarrow \text{DISTRIBUTED} \longrightarrow \text{COMPLETED}$$
- Automatic background worker continuously identifies past-due food and transitions them to **`EXPIRED`**.
- Donors or Admins can cancel with reason before collection (**`CANCELLED`**).

### 3. Interactive Maps & Geolocation
- **OpenStreetMap & Leaflet Integration**: Live pin markers showing available food across city neighborhoods, color-coded by lifecycle state.
- Dynamic distance calculation based on the Haversine formula.

### 4. In-App Notification Engine
- Real-time alert notifications for donors when their food is claimed, when pickup is scheduled, when food is collected, and when community distribution is completed.

### 5. Mutual Feedback & Ratings
- Post-completion 5-star rating and testimonial system with celebration confetti animations, helping build donor-NGO trust.

---

## 🏗️ System Architecture & Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet, Chart.js / React-Chartjs-2, Canvas-Confetti, Date-fns, Axios |
| **Backend** | Node.js (v24), Express.js, TypeScript, Multer (Secure File Uploads), Bcryptjs (Password Hashing), JsonWebToken (JWT Session & RBAC), CORS |
| **Database** | SQLite (`node:sqlite` DatabaseSync) with WAL mode, foreign key constraints, indexes, and automated triggers |
| **Testing** | Jest, Supertest, Ts-Jest (Comprehensive 20-point automated integration suite) |

---

## 👥 Demo Login Credentials

For quick evaluation, testing, and grading, one-click autofill buttons are built directly into the login screen, or use the credentials below:

| Role | Email | Password | Organization / Details |
|---|---|---|---|
| **👑 Admin** | `admin@foodshare.org` | `Admin@123` | Master platform administrator |
| **🍲 Donor** | `donor.sarah@freshbites.com` | `Donor@123` | Fresh Bites Artisanal Cafe (San Francisco) |
| **🍲 Donor 2** | `donor.raj@spicehaven.com` | `Donor@123` | Spice Haven Catering & Banquets |
| **🏛️ NGO** | `ngo.hope@feedthecity.org` | `Ngo@123` | FeedTheCity Relief Foundation (Approved) |
| **🏛️ NGO 2** | `ngo.care@mealsonwheels.org` | `Ngo@123` | Meals On Wheels Community Aid (Approved) |
| **🚴 Volunteer** | `volunteer.alex@gmail.com` | `Volunteer@123` | Alex Rivera (Bike Courier) |
| **🚐 Volunteer 2**| `volunteer.maya@gmail.com` | `Volunteer@123` | Maya Sharma (Van Driver) |

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: v20.x or v22.x or v24.x
- **npm**: v9+ or v10+

### 1. Clone / Navigate to Project Directory
```bash
cd scratch/foodshare
```

### 2. Backend Setup
```bash
cd server
npm install
npm run seed     # Seeds demo accounts and 10+ realistic donations across lifecycle stages
npm run build    # Compiles TypeScript
npm start        # Starts server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev      # Launches Vite frontend on http://localhost:5173
```

Open your browser at **`http://localhost:5173`** to access FoodShare!

---

## 🧪 Running Automated Tests

A complete automated test suite is included covering Authentication, RBAC, full Donation State Machine transitions, Admin statistics, and In-App Notifications:

```bash
cd server
npm test
```

Test results output:
```
PASS src/tests/api.test.ts
  FoodShare Full-Stack API Test Suite
    Authentication & RBAC
      ✓ should login donor successfully and return token with profile
      ✓ should login NGO successfully
      ✓ should login Volunteer successfully
      ✓ should login Admin successfully
      ✓ should reject invalid password
      ✓ should register a new donor with validation
    Donation Lifecycle State Machine
      ✓ donor can create a food donation (AVAILABLE)
      ✓ donor cannot accept own donation (role restriction)
      ✓ NGO can accept available donation (AVAILABLE -> ACCEPTED)
      ✓ cannot re-accept an already ACCEPTED donation
      ✓ NGO can assign pickup schedule (ACCEPTED -> PICKUP_ASSIGNED)
      ✓ NGO/Volunteer can mark food collected (PICKUP_ASSIGNED -> COLLECTED)
      ✓ NGO can record distribution (COLLECTED -> DISTRIBUTED)
      ✓ can complete donation cycle (DISTRIBUTED -> COMPLETED)
      ✓ donor can submit feedback for completed donation
      ✓ rejects duplicate review for same donation from same user
    Admin Portal Features
      ✓ admin can fetch system stats & charts
      ✓ non-admin is blocked from admin endpoints
      ✓ admin can list all users and update NGO verification status
    In-App Notification Flow
      ✓ donor has received notifications for status updates

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
```

---

## 📡 REST API Reference

### Auth & Users (`/api/auth`)
- `POST /api/auth/register`: Register new user with role profile (donor, ngo, volunteer)
- `POST /api/auth/login`: Authenticate and issue JWT token
- `GET /api/auth/me`: Get current session, profile, and unread notification count
- `PUT /api/auth/profile`: Update user profile and organization settings
- `POST /api/auth/change-password`: Secure password update

### Food Donations (`/api/donations`)
- `GET /api/donations`: Search and filter food donations (supports `category`, `status`, `dietary`, `city`, `sort`, `search`, `userLat`, `userLng`)
- `GET /api/donations/my-donations`: List donations posted by authenticated donor
- `GET /api/donations/my-tasks`: List claimed/assigned tasks for authenticated NGO or volunteer
- `GET /api/donations/:id`: Get donation details with 5-stage timeline, distribution record, and partner reviews
- `POST /api/donations`: Create food donation with image upload (Multer)
- `PUT /api/donations/:id`: Edit donation details before acceptance
- `POST /api/donations/:id/cancel`: Cancel donation with reason
- `POST /api/donations/:id/accept`: NGO/Volunteer claims available donation (`AVAILABLE` -> `ACCEPTED`)
- `POST /api/donations/:id/assign-pickup`: Schedule pickup window (`ACCEPTED` -> `PICKUP_ASSIGNED`)
- `POST /api/donations/:id/collect`: Confirm food collection (`PICKUP_ASSIGNED` -> `COLLECTED`)
- `POST /api/donations/:id/distribute`: Record distribution details (`COLLECTED` -> `DISTRIBUTED`)
- `POST /api/donations/:id/complete`: Finalize donation cycle (`DISTRIBUTED` -> `COMPLETED`)

### Notifications (`/api/notifications`)
- `GET /api/notifications`: Retrieve in-app alerts and unread count
- `PUT /api/notifications/:id/read`: Mark single notification as read
- `PUT /api/notifications/read-all`: Mark all notifications as read

### Feedback & Reviews (`/api/feedback`)
- `POST /api/feedback`: Submit 5-star rating & review for completed donation
- `GET /api/feedback/donation/:donationId`: Fetch reviews for a donation

### Admin Management (`/api/admin`)
- `GET /api/admin/stats`: Get high-level KPIs, meal counts, CO2 offset, category/status chart datasets
- `GET /api/admin/users`: Search, filter, and paginate platform users
- `PUT /api/admin/users/:id/status`: Suspend or activate user accounts
- `PUT /api/admin/ngo/:id/verification`: Approve or reject NGO legal credentials
- `GET /api/admin/donations`: Audit all platform donations
- `DELETE /api/admin/donations/:id`: Force delete inappropriate or fraudulent listings
- `GET /api/admin/audit-logs`: System audit trail logs

---

## 🛡️ Security Implementation
- **Password Security**: Salted Bcrypt hashing (`bcryptjs` with 10 rounds).
- **Authentication**: JsonWebToken (JWT) Bearer tokens with 7-day expiration.
- **RBAC**: Multi-level route authorization (`requireRole(['ngo', 'volunteer'])`, `requireRole(['admin'])`).
- **File Upload Safety**: File MIME-type whitelist (JPEG, PNG, WebP) and 5MB hard size limit.
- **SQL Protection**: Parameterized prepared statements (`DatabaseSync.prepare(sql).get(...params)`).
