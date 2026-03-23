# Vercel Environment Variables Setup

## 🚨 CRITICAL: Update These in Vercel Dashboard

Your MongoDB credentials have been updated. You **MUST** update the environment variables in Vercel for your deployment to work.

## Step-by-Step Instructions

### 1. Go to Vercel Dashboard
- Open: https://vercel.com/dashboard
- Select your **Money-Manager** project
- Click **Settings** tab
- Click **Environment Variables** in the left sidebar

### 2. Update/Add These Variables

#### **MONGODB_URI**
```
mongodb+srv://parth4win_db_user:6NC9qMDvVtUwCkCo@money-manager.65225tu.mongodb.net/money_manager?appName=money-manager
```

**Important Notes:**
- Username: `parth4win_db_user`
- Password: `6NC9qMDvVtUwCkCo` (no special characters, no URL encoding needed)
- Cluster: `money-manager.65225tu.mongodb.net`
- Database: `money_manager`

#### **JWT_SECRET**
```
your_super_secret_jwt_key_change_this_in_production_12345
```

#### **NODE_ENV**
```
production
```

### 3. Apply to All Environments
When adding each variable, make sure to check:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the three dots (•••)
4. Click **Redeploy**
5. Wait for deployment to complete

## 🧪 Testing After Deployment

### Test 1: Health Check (No DB)
```bash
curl https://your-backend.vercel.app/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### Test 2: API Endpoint (With DB)
```bash
curl -X POST https://your-backend.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```
Expected: `{"message":"User created successfully","userId":"..."}`

## 🔍 Troubleshooting

### If deployment still fails:

1. **Check Vercel Logs**
   - Go to Deployments → Click on deployment → View Function Logs
   - Look for MongoDB connection errors

2. **Verify MongoDB Atlas Network Access**
   - Go to MongoDB Atlas dashboard
   - Click **Network Access** in left sidebar
   - Ensure `0.0.0.0/0` is allowed (allows connections from anywhere)

3. **Verify Database User**
   - Go to **Database Access** in MongoDB Atlas
   - Ensure `parth4win_db_user` exists and has read/write permissions

4. **Test Connection String Locally**
   ```bash
   npm start
   ```
   Should see: "✅ Connected to MongoDB database successfully"

## 📝 Connection String Breakdown

```
mongodb+srv://parth4win_db_user:6NC9qMDvVtUwCkCo@money-manager.65225tu.mongodb.net/money_manager?appName=money-manager
```

- **Protocol**: `mongodb+srv://` (SRV connection string)
- **Username**: `parth4win_db_user`
- **Password**: `6NC9qMDvVtUwCkCo`
- **Host**: `money-manager.65225tu.mongodb.net`
- **Database**: `money_manager`
- **App Name**: `money-manager` (for monitoring)

## ⚠️ Security Notes

- Never commit `.env` file to git (already in `.gitignore`)
- Change `JWT_SECRET` to a strong random string in production
- Consider using MongoDB Atlas IP whitelist for additional security
- Rotate database password periodically

---

**After updating these variables and redeploying, your application will work!** 🎉
