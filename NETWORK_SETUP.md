# Cross-Network Access Configuration

This guide explains how to set up TripShare for access across different PCs and networks.

## Option 1: Same Network (Local WiFi)

If both PCs are on the same WiFi/local network:

### PC #1 (Backend Host):
1. Find your local IP address:
   - Windows: Open Command Prompt and run `ipconfig`
   - Look for "IPv4 Address" (e.g., `192.168.1.100`)
   - Linux/Mac: Run `ifconfig` or `ip addr`

2. Start your backend:
   ```bash
   cd backend
   npm run dev
   ```

3. **Important**: Make sure Windows Firewall allows Node.js connections:
   - Windows will ask for permission when you first run the server
   - Or manually allow port 4000 in Windows Firewall settings

### PC #2 (Client):
1. Clone the repository or copy the project files

2. Update the API URL in `frontend\src\api\axios.ts`:
   ```typescript
   const api = axios.create({
     baseURL: 'http://192.168.1.100:4000/api',  // Replace with PC #1's IP
     // ... rest of config
   });
   ```

3. Update `.env` in the backend (same Aiven credentials):
   ```
   DB_HOST=mysql-1e2ba2f5-rayenhajh-48b3.g.aivencloud.com
   DB_PORT=10648
   DB_USER=avnadmin
   DB_PASSWORD=AVNS_KPrlavq0RmaCMwVcFrs
   DB_NAME=defaultdb
   ```

4. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Option 2: Different Networks (Internet)

If PCs are on different networks (e.g., home and office), you need to expose your backend:

### Method A: Using ngrok (Recommended for Testing)
1. Install ngrok: https://ngrok.com/download
2. Run your backend on PC #1
3. In a new terminal, run:
   ```bash
   ngrok http 4000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. On PC #2, update `frontend\src\api\axios.ts`:
   ```typescript
   const api = axios.create({
     baseURL: 'https://abc123.ngrok.io/api',
     // ... rest of config
   });
   ```

### Method B: Deploy Backend to Cloud (Production)
Deploy your backend to:
- **Heroku**: Free tier available
- **Railway**: Easy Node.js deployment
- **Render**: Free tier for backend APIs
- **DigitalOcean**: App Platform

Then update the API URL to your deployed backend URL.

## Current Configuration

**Database**: ✅ Aiven Cloud (accessible from anywhere)
**Backend**: Local (`localhost:4000`)
**Frontend**: Local (`localhost:5173`)

## Quick Setup for Same Computer

If you just want to run on multiple computers but use one at a time:

1. ✅ Share the `.env` file (already using Aiven)
2. ✅ Clone the project on each PC
3. ✅ Run `npm install` in both `backend` and `frontend`
4. ✅ Run `npm run dev` in both directories

**All data will be synced via the Aiven cloud database!**

## Security Notes

⚠️ **Important**: 
- Never commit `.env` file to Git (it contains sensitive credentials)
- The current admin password should be changed in production
- For production, use HTTPS and proper authentication
- Consider using environment variables for the API URL
