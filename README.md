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

### Local Development
Files are stored locally in the `uploads/` directory, organized by project and category. Project and file metadata are stored in JSON files in the `data/` directory.

### Production Deployment (Vercel)

**IMPORTANT**: When deploying to Vercel, you **MUST** configure Redis/KV storage because Vercel's file system is read-only.

#### Option 1: Vercel KV (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create** → **KV**
3. Create a new KV database
4. Go to **Settings** → **Environment Variables**
5. Add the following environment variables (they should be automatically added):
   - `KV_REST_API_URL` - Your KV REST API URL
   - `KV_REST_API_TOKEN` - Your KV REST API token

#### Option 2: Upstash Redis
1. Create an account at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token
4. In Vercel, go to **Settings** → **Environment Variables**
5. Add:
   - `UPSTASH_REDIS_REST_URL` - Your Upstash Redis REST URL
   - `UPSTASH_REDIS_REST_TOKEN` - Your Upstash Redis REST token

**Note**: After adding environment variables, you need to redeploy your application for the changes to take effect.

#### Troubleshooting
If you see a 500 error on `/api/projects`, it's likely because Redis/KV is not configured. Check:
1. Environment variables are set in Vercel project settings
2. You've redeployed after adding environment variables
3. The environment variables are correct (no typos, full URLs/tokens)

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
├── uploads/              # Uploaded files (created automatically)
└── data/                 # JSON data files (created automatically)
```
