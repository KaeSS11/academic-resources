# Simple Workflow Guide

## Upload Files → Push to GitHub → Site Updates Automatically

Yes! You can upload files in development mode and push them to GitHub, and your deployed site will update automatically.

## Step-by-Step Workflow

### 1. Start Development Server

```bash
npm run dev
```

### 2. Upload Files Through Website

1. Open http://localhost:3000
2. Click "Admin Login" (password: `admin123` by default)
3. Create a project or select an existing one
4. Click on a category
5. Upload files using the upload form
6. Files are automatically saved to:
   - `public/uploads/[projectId]/[categoryId]/[filename]`
   - `data/files.json` (metadata)

### 3. Commit and Push to GitHub

```bash
# Check what changed
git status

# Add the new files
git add public/uploads/ data/

# Commit
git commit -m "Add new files"

# Push to GitHub
git push
```

### 4. Site Updates Automatically

- If you're using **Vercel**: It automatically detects the push and redeploys
- If you're using **other platforms**: They usually auto-deploy on git push too

That's it! Your files will appear on the live site within a few minutes.

## Quick Tips

- ✅ **Always commit after uploading** - Files won't appear on the live site until they're in git
- ✅ **Check git status first** - See what files were created/modified
- ✅ **Use descriptive commit messages** - Helps track what you added
- ✅ **Test locally first** - Make sure files upload correctly before pushing

## Example Session

```bash
# 1. Start dev server
npm run dev

# 2. Upload files through website (localhost:3000)
# ... upload some files ...

# 3. Stop dev server (Ctrl+C), then commit
git add public/uploads/ data/
git commit -m "Add questionnaire data files"
git push

# 4. Wait 1-2 minutes for Vercel to redeploy
# 5. Check your live site - files should be there!
```

## Troubleshooting

**Files not showing on live site?**
- Make sure you committed `public/uploads/` and `data/` to git
- Check that your hosting platform is connected to GitHub
- Wait a few minutes for the deployment to complete

**Can't upload files?**
- Make sure you're logged in as admin
- Check that you're running `npm run dev` (not production build)
- Verify `public/uploads/` directory exists and is writable
