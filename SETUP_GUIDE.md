# 🛠️ TrackR Setup Guide — Fix MongoDB Connection

## The Error You Saw
```
Operation 'users.findOne()' buffering timed out after 10000ms
```
This means the backend **cannot connect to MongoDB**. Fix it with one of the two options below.

---

## ✅ OPTION A — MongoDB Atlas (Easiest, Free Cloud, No Install)

1. **Create free account**: Go to https://cloud.mongodb.com

2. **Create a cluster**:
   - Click "Build a Database" → choose **M0 FREE**
   - Pick any cloud provider & region → Click "Create"

3. **Create a database user**:
   - Left menu → Security → **Database Access**
   - Click "Add New Database User"
   - Username: `trackruser`  Password: `trackrpass123` (or anything you like)
   - Role: "Atlas admin" → Save

4. **Allow all IP addresses**:
   - Left menu → Security → **Network Access**
   - Click "Add IP Address" → Click **"Allow Access From Anywhere"** → Confirm

5. **Get your connection string**:
   - Left menu → Deployment → **Database**
   - Click **"Connect"** on your cluster
   - Choose **"Drivers"**
   - Copy the connection string (looks like):
     ```
     mongodb+srv://trackruser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Update your `.env`**:
   - Open `backend/.env`
   - Comment out the local MONGO_URI line
   - Add your Atlas URI (replace `<password>` with your actual password):
     ```env
     # MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_tracker
     MONGO_URI=mongodb+srv://trackruser:trackrpass123@cluster0.xxxxx.mongodb.net/ecommerce_tracker?retryWrites=true&w=majority
     ```
   - Make sure the database name `ecommerce_tracker` is in the URI

7. **Restart the backend**:
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```
   You should see: `MongoDB Connected`

8. **Seed demo data**:
   ```bash
   npm run seed
   ```

---

## ✅ OPTION B — Local MongoDB (If you prefer local)

### Windows
1. Download MongoDB Community: https://www.mongodb.com/try/download/community
2. Install it (default settings)
3. **Open a new terminal** and run:
   ```
   mongod
   ```
   Keep this terminal open while using the app.
4. Your `.env` should already have: `MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_tracker`
5. Run `npm run seed` then `npm run dev`

### macOS (with Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## 🔍 Verify It's Working

After starting the backend, open your browser:
```
http://localhost:5000/api/health
```

You should see:
```json
{ "status": "ok", "mongodb": "connected" }
```

If `mongodb` says `"disconnected"` → MongoDB is still not connected.

---

## 📋 Full Startup Checklist

```
□ 1. MongoDB is running (Atlas OR local mongod)
□ 2. MONGO_URI in backend/.env is correct
□ 3. cd backend  →  npm install  →  npm run dev
   → See "MongoDB Connected" and "Server: http://localhost:5000"
□ 4. npm run seed  (run once to create demo users + orders)
□ 5. cd frontend  →  npm install  →  npm start
□ 6. Open http://localhost:3000
□ 7. Login with admin@trackr.com / admin123
```

---

## � Optional SMS Setup for Order Notifications

If you want real SMS messages when a customer places an order, add these values to `backend/.env` and restart the backend:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

> Without these keys, the app still places orders normally and logs the SMS message in the backend console.

---

## �💡 Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `buffering timed out` | MongoDB not running | Start mongod or use Atlas |
| `Authentication failed` | Wrong Atlas password | Check password in URI |
| `ECONNREFUSED 127.0.0.1:27017` | Local MongoDB not started | Run `mongod` |
| `500 Internal Server Error` | Backend crashed | Check backend terminal for error |
| `Network request failed` | Backend not running | Run `npm run dev` in backend folder |
