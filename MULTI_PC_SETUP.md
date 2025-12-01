# 🚀 Quick Setup Guide for Multiple PCs

## ✅ What's Already Configured
- **Cloud Database**: Aiven MySQL (accessible worldwide)
- **Backend**: Node.js API
- **Frontend**: React + Vite

## 📋 Setup on PC #1 (Current PC)

1. **Database is ready!** ✅ All tables created in Aiven
2. **Backend is running** ✅ Connected to cloud database
3. **Frontend is running** ✅ 

## 📋 Setup on PC #2 (New PC)

### Step 1: Clone the Project
```bash
git clone <your-repo>
cd tripshare
```

### Step 2: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### Step 3: Copy Environment File
Create `backend/.env` with these contents:
```
PORT=4000
NODE_ENV=development

DB_HOST=mysql-1e2ba2f5-rayenhajh-48b3.g.aivencloud.com
DB_PORT=10648
DB_USER=avnadmin
DB_PASSWORD=AVNS_KPrlavq0RmaCMwVcFrs
DB_NAME=defaultdb

JWT_SECRET=super_long_random_string_here
JWT_EXPIRES_IN=7d
```

### Step 4: Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 5: Access the App
- Open browser: `http://localhost:5173`
- Login with admin: `admin@tripshare.com` / `adminpassword`

## 🌐 For Different Networks (Same WiFi)

If PC #2 needs to connect to PC #1's backend:

**On PC #1:**
1. Find your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Look for IPv4 Address (e.g., `192.168.1.100`)

**On PC #2:**
Edit `frontend/src/api/axios.ts`:
```typescript
const BACKEND_HOST = '192.168.1.100';  // Replace with PC #1's IP
```

## 📊 Database Status

All tables created:
- ✅ users
- ✅ trips
- ✅ reservations
- ✅ notifications
- ✅ chats
- ✅ ratings

Default admin user:
- Email: `admin@tripshare.com`
- Password: `adminpassword`

## 🔥 Important Notes

- Both PCs will share the same data (via Aiven cloud database)
- Any changes on one PC will appear on the other
- No need to run database setup again - it's already done!
- Keep your `.env` file secret - don't commit to Git

## 🆘 Troubleshooting

**Can't connect to database?**
- Check internet connection
- Verify `.env` credentials are correct

**Backend won't start?**
- Make sure port 4000 is not in use
- Run `npm install` again

**Frontend can't reach backend?**
- Check if backend is running on port 4000
- Verify the IP address in `axios.ts` if on different PCs
