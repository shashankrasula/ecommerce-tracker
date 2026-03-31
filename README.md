# 🚀 TrackR — E-Commerce Order Tracking System

A full-stack order tracking platform with **3 role-based dashboards** (Admin, Manager, User) and a live weather widget on every page.

---

## 🗂️ Project Structure

```
ecommerce-tracker/
├── backend/          # Node.js + Express + MongoDB API
│   ├── models/       # Mongoose schemas
│   ├── routes/       # REST API endpoints
│   ├── middleware/   # JWT auth middleware
│   ├── server.js     # Entry point
│   ├── seed.js       # Demo data seeder
│   └── .env          # Environment variables
│
└── frontend/         # React + Tailwind CSS
    └── src/
        ├── components/   # Reusable UI (Sidebar, WeatherBox, Layout, etc.)
        ├── context/      # Auth context (JWT)
        ├── pages/
        │   ├── admin/    # AdminDashboard, AdminOrders, AdminUsers, AdminProducts, AdminAnalytics
        │   ├── manager/  # ManagerDashboard, ManagerOrders, ManagerProfile
        │   └── user/     # UserDashboard, UserOrders, TrackOrder, UserProfile
        └── utils/        # API helper, formatting utilities
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**
- Optional: OpenWeatherMap API key (free at https://openweathermap.org/)

---

## 🛠️ Setup Instructions

### 1. Clone / Extract the project

```bash
cd ecommerce-tracker
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce_tracker
JWT_SECRET=your_super_secret_key_here
WEATHER_API_KEY=your_openweathermap_api_key   # optional — mock data used if absent
```

> **Weather API**: Sign up free at https://openweathermap.org/api → get your API key → paste it in `.env`
> Without a key, the app uses realistic mock weather data automatically.

### 3. Seed Demo Data

```bash
npm run seed
```

This creates:
| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@trackr.com       | admin123    |
| Manager | manager@trackr.com     | manager123  |
| User    | user@trackr.com        | user123     |

### 4. Start the Backend

```bash
npm run dev    # with nodemon (auto-reload)
# or
npm start      # production mode
```

Backend runs at: **http://localhost:5000**

### 5. Setup the Frontend

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🎯 Features by Role

### 👑 Admin Dashboard
- Global stats: Total orders, revenue, users, managers
- Monthly revenue bar chart + order trend line chart
- Order status pie chart
- Full order management (view, update status, tracking history)
- User management (activate/deactivate, change roles)
- Product catalog management (add/remove products)
- Analytics page with Recharts visualizations

### 🧑‍💼 Manager Dashboard
- Active order queue with status filters
- Update order status + add tracking events (location, description)
- View tracking history for each order
- Personal profile with city (weather) setting

### 👤 User Dashboard
- Personal order history with status filter tabs
- Latest order progress stepper
- Total spent summary
- Track any order by Order ID
- Detailed order view with full tracking timeline
- Profile management (name, city, phone, address)

### 🌤️ Weather Widget (All Pages)
- Shows in the top-right header of every dashboard
- Displays: temperature, city, description, humidity, wind speed
- Uses user's city from profile for local weather
- Auto-refreshes every 10 minutes
- Fallback to realistic mock data if no API key

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint         | Access |
|--------|-----------------|--------|
| POST   | /api/auth/login  | Public |
| POST   | /api/auth/register | Public |
| GET    | /api/auth/me     | Auth   |
| PUT    | /api/auth/me     | Auth   |

### Orders
| Method | Endpoint                      | Access          |
|--------|-------------------------------|-----------------|
| GET    | /api/orders                   | Admin, Manager  |
| GET    | /api/orders/my-orders         | User            |
| GET    | /api/orders/track/:orderId    | Auth            |
| POST   | /api/orders                   | User            |
| PUT    | /api/orders/:id/status        | Admin, Manager  |
| DELETE | /api/orders/:id               | Admin           |

### Users, Products, Dashboard, Weather follow similar patterns.

---

## 🧰 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Tailwind CSS, React Router |
| Charts    | Recharts                            |
| Backend   | Node.js, Express                    |
| Database  | MongoDB, Mongoose                   |
| Auth      | JWT (jsonwebtoken), bcryptjs        |
| Weather   | OpenWeatherMap API                  |
| Fonts     | Sora (Google Fonts)                 |

---

## 🎨 Design

- Dark theme with slate/blue palette
- Role-specific color accents (Blue=Admin, Purple=Manager, Teal=User)
- Animated page transitions and hover states
- Responsive sidebar layout
- Progress stepper for order status visualization
- Modal order detail panels

---

## 📝 Notes

- The frontend proxies API calls to `http://localhost:5000` via the `proxy` field in `package.json`
- JWT tokens expire after 7 days
- Weather falls back to mock data automatically — no API key required to run
- Run `npm run seed` again to reset demo data anytime
