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

Files are stored locally in the `uploads/` directory, organized by project and category. Project and file metadata are stored in JSON files in the `data/` directory.

For production use, consider:
- Cloud storage (AWS S3, Cloudinary, etc.)
- Database (PostgreSQL, MongoDB, etc.)
- Proper authentication system (NextAuth, Clerk, etc.)

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
