# Vercel Deployment Guide

## Backend Deployment (Current Directory)

Your backend is now configured for Vercel serverless deployment.

### Environment Variables Required

Add these in your Vercel project settings (Settings → Environment Variables):

1. **MONGODB_URI**
   ```
   mongodb+srv://parth4win_db_user:Parth9108%40@money-manager.ugys2ed.mongodb.net/money_manager?appName=money-manager
   ```

2. **JWT_SECRET**
   ```
   your_super_secret_jwt_key_change_this_in_production_12345
   ```

3. **NODE_ENV**
   ```
   production
   ```

### Deployment Steps

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Configure for Vercel deployment"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration
   - Add environment variables in project settings
   - Deploy!

3. **Update Frontend API URL**:
   After backend deployment, update `frontend/src/api.js`:
   ```javascript
   const API_URL = 'https://your-backend-url.vercel.app/api';
   ```

## Frontend Deployment

Deploy the frontend separately:

1. **Navigate to frontend folder**:
   ```bash
   cd frontend
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   Or connect via Vercel dashboard as a separate project.

3. **Set Root Directory**: In Vercel project settings, set root directory to `frontend`

## Testing

After deployment:
- Backend: `https://your-backend.vercel.app/health`
- Frontend: `https://your-frontend.vercel.app`

## Important Notes

- MongoDB Atlas must allow connections from anywhere (0.0.0.0/0) for Vercel
- CORS is configured to allow all origins (`*`) - restrict in production
- Environment variables are case-sensitive
- Vercel functions have a 10-second timeout on free tier
