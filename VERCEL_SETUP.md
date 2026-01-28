# Vercel Deployment Setup Guide

## ✅ What Vercel Provides

Vercel provides storage services that you need to enable:

1. **Vercel Blob Storage** - For storing uploaded files
2. **Upstash Redis** (via Vercel Integrations) - For storing project and file metadata

**Note:** Vercel KV is deprecated. We're using Upstash Redis instead, which is available through Vercel Integrations.

## 📋 Step-by-Step Setup

### Step 1: Enable Vercel Blob Storage

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab (or click **Create** → **Storage**)
4. Click **Create Database** → Select **Blob**
5. Give it a name (e.g., "academic-resources-blob")
6. Select a region closest to your users
7. Click **Create**
8. After creation, go to the Blob storage settings
9. Copy the **BLOB_READ_WRITE_TOKEN** (you'll need this)

### Step 2: Enable Upstash Redis

1. In your Vercel project dashboard
2. Go to **Integrations** tab (or **Settings** → **Integrations**)
3. Search for "Upstash" or "Redis"
4. Click on **Upstash Redis** integration
5. Click **Add Integration** or **Configure**
6. Create a new Redis database (or use existing)
7. Give it a name (e.g., "academic-resources-redis")
8. Select a region (same as Blob is recommended)
9. Click **Create** or **Add**
10. After creation, the integration will automatically add environment variables to your project:
    - **UPSTASH_REDIS_REST_URL**
    - **UPSTASH_REDIS_REST_TOKEN**
    
    **Note:** These are automatically added, but you can verify them in Settings → Environment Variables

### Step 3: Set Environment Variables

1. In your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:

#### Required Variables:

- **Name:** `ADMIN_PASSWORD`
  - **Value:** `3121416kss`
  - **Environment:** Production, Preview, Development

- **Name:** `BLOB_READ_WRITE_TOKEN`
  - **Value:** (paste from Step 1 - Vercel Blob)
  - **Environment:** Production, Preview, Development

**Note:** The Upstash Redis environment variables (`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`) are **automatically added** when you add the Upstash Redis integration in Step 2. You can verify they exist in Settings → Environment Variables, but you don't need to manually add them.

### Step 4: Install Dependencies

The code has been updated to use Vercel Blob and KV. Install the dependencies:

```bash
npm install
```

This will install:
- `@vercel/blob` - For file storage
- `@upstash/redis` - For metadata storage

### Step 5: Deploy

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Add Vercel Blob and KV storage support"
   git push
   ```

2. Vercel will automatically redeploy, or you can manually trigger a deployment from the dashboard

3. After deployment, test:
   - Create a project
   - Upload a file
   - Redeploy (to verify data persists)
   - Check that project and file still exist

## 🔍 Verification

After deployment, verify everything works:

1. ✅ Login with admin password works
2. ✅ Create a project - it should save
3. ✅ Upload a file - it should save
4. ✅ Download a file - it should work
5. ✅ Redeploy the app - data should persist

## 💰 Pricing

- **Vercel Blob**: 
  - Free tier: 1 GB storage, 1 GB bandwidth/month
  - Paid: $0.15/GB storage, $0.40/GB bandwidth

- **Vercel KV**:
  - Free tier: 256 MB storage, 30M requests/month
  - Paid: $0.20/GB storage, $0.20/million requests

For most academic projects, the free tier should be sufficient.

## 🐛 Troubleshooting

### Files not uploading?
- Check that `BLOB_READ_WRITE_TOKEN` is set correctly
- Check Vercel Blob storage is created and active
- Check deployment logs for errors

### Projects not saving?
- Check that `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set (should be auto-added by integration)
- Check Upstash Redis integration is added and active
- Check deployment logs for errors

### Local development still works?
- Yes! The code falls back to local file system when Vercel environment variables aren't set
- This means you can develop locally without setting up Vercel storage
- Only production deployments need the Vercel storage services

## 📝 Notes

- The code automatically detects if it's running on Vercel (by checking for environment variables)
- If Vercel environment variables are not set, it falls back to local file system (for development)
- All data (projects and files) will now persist across deployments
- Files are stored in Vercel Blob Storage (cloud storage)
- Metadata is stored in Upstash Redis (via Vercel Integration)
