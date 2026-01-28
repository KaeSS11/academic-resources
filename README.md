# Academic Resources

A Next.js application for storing and organizing academic project materials and papers.

## Features

- **Projects Management**: Create and view projects (admin can create, others can only view)
- **File Categories**: Organize files into four categories:
  - Graphical Data
  - Literature
  - Questionnaire Data
  - Other
- **File Upload**: Upload multiple files to each category
- **File Viewing**: View and download uploaded files
- **Admin Mode**: Toggle admin mode to create projects and upload files

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. (Optional) Set up admin password:
   - Copy `.env.local.example` to `.env.local`
   - Change `ADMIN_PASSWORD` to your desired password
   - Default password is `admin123` if not set

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Admin Login**: Click "Admin Login" button and enter your password (default: `admin123`)
   - Only you can access admin features - others can only view projects and files
   - To change the password, set `ADMIN_PASSWORD` in `.env.local` file
2. **Create Projects**: After logging in, click "Create New Project" to add a new project
3. **View Projects**: Click on any project card to view its categories
4. **Upload Files**: Click on a category, then use the file upload form to add files (admin only)
5. **Download Files**: Click the "Download" button on any file to download it
6. **Logout**: Click "Logout" button when done with admin tasks

## Storage

This project uses **static file storage** - all data is stored in files that are committed to git. This means:

- ✅ **Works when deployed** - No database or external storage needed!
- ✅ **Simple** - Just commit files to git
- ✅ **Free** - No storage costs

### How It Works

- **Projects**: Stored in `data/projects.json`
- **Files**: Stored in `public/uploads/` (served as static assets)
- **File Metadata**: Stored in `data/files.json`

### Local Development

1. **Create/Edit Projects**: Use the website - it works locally!
2. **Upload Files**: Use the website upload feature
3. **Commit Changes**: After making changes, commit the files:
   ```bash
   git add data/ public/uploads/
   git commit -m "Update projects and files"
   git push
   ```

### Production Deployment

**The website is read-only in production** - you cannot create projects or upload files through the website.

To add files in production:

1. **Add files manually**:
   - Place files in: `public/uploads/[projectId]/[categoryId]/[filename]`
   - Example: `public/uploads/1234567890/code/document.pdf`

2. **Update metadata**:
   - Edit `data/files.json` and add file entries
   - Edit `data/projects.json` to add/edit projects

3. **Commit and deploy**:
   ```bash
   git add public/uploads/ data/
   git commit -m "Add files manually"
   git push
   ```

See `MANUAL_FILE_UPLOAD.md` for detailed instructions.

### Deployment to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Deploy - that's it! No environment variables or storage setup needed.

**Note**: Make sure `data/` and `public/uploads/` are committed to git (they're not in `.gitignore`).

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── projects/         # Project pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (projects list)
├── lib/
│   ├── auth.ts           # Authentication helpers
│   ├── files.ts          # File management
│   └── projects.ts       # Project management
├── public/
│   └── uploads/          # Uploaded files (committed to git)
└── data/                 # JSON data files (committed to git)
```
