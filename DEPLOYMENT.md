# Deployment Guide

## ⚠️ Important: Current Storage Limitation

**The current application stores files and data locally on the filesystem**, which means:
- ❌ Files uploaded will be **lost** on each deployment (serverless platforms reset the filesystem)
- ❌ Project data will be **lost** on each deployment
- ❌ The `/uploads` and `/data` folders are excluded from git (as they should be)

## Required Setup for Production

### 1. Environment Variables

Set these in your deployment platform:

- `ADMIN_PASSWORD` = `3121416kss` (or your desired password)

### 2. Storage Solution (Choose One)

#### Option A: Vercel Blob Storage (Recommended for Vercel)

If deploying to Vercel, use Vercel Blob Storage:

1. Install Vercel Blob:
   ```bash
   npm install @vercel/blob
   ```

2. Get your Blob storage token from Vercel dashboard → Storage → Blob

3. Set environment variable:
   - `BLOB_READ_WRITE_TOKEN` = your blob token

4. Code changes needed: Update file storage to use Vercel Blob instead of local filesystem

#### Option B: Cloud Storage + Database (Recommended for Production)

Use cloud storage (AWS S3, Cloudinary, etc.) + database (PostgreSQL, MongoDB, etc.):

**For Files:**
- AWS S3 + AWS SDK
- Cloudinary
- Supabase Storage
- Google Cloud Storage

**For Data:**
- PostgreSQL (via Supabase, Neon, or Railway)
- MongoDB (via MongoDB Atlas)
- SQLite (via Turso)

#### Option C: Platform with Persistent Storage

Deploy to platforms that support persistent storage:
- Railway
- Render
- Fly.io
- DigitalOcean App Platform

## Quick Fix: Using Vercel Blob Storage

If you're on Vercel, here's the quickest solution:

1. **Install dependencies:**
   ```bash
   npm install @vercel/blob
   ```

2. **Set environment variable in Vercel:**
   - Go to your project → Settings → Environment Variables
   - Add: `BLOB_READ_WRITE_TOKEN` (get from Vercel Storage dashboard)

3. **Code changes needed:**
   - Update `lib/files.ts` to use Vercel Blob Storage
   - Update `lib/projects-server.ts` to use a database or Vercel KV

## Current Deployment Checklist

- [ ] Set `ADMIN_PASSWORD` environment variable
- [ ] Choose and set up storage solution (files)
- [ ] Choose and set up database solution (metadata)
- [ ] Update code to use cloud storage/database
- [ ] Test file uploads persist across deployments
- [ ] Test project creation persists across deployments

## Testing After Deployment

1. Create a test project
2. Upload a test file
3. Redeploy your application
4. Check if project and file still exist
5. If they're gone, you need to implement cloud storage/database

## Need Help?

The current codebase needs modifications to work in production. The main files to update:
- `lib/files.ts` - File storage
- `lib/projects-server.ts` - Project metadata storage
- API routes that read/write files

Would you like me to help implement one of these solutions?
