# Manual File Upload Guide

Since this site uses static file storage (no database), you can upload files in two ways:

## Option 1: Use the Website (Local Development Only)

1. Run the site locally: `npm run dev`
2. Log in as admin
3. Upload files through the website
4. **Important**: Commit the files to git:
   ```bash
   git add public/uploads/ data/
   git commit -m "Add uploaded files"
   git push
   ```

## Option 2: Manual Upload (Recommended for Production)

1. **Add files to the project**:
   - Place files in: `public/uploads/[projectId]/[categoryId]/[filename]`
   - Example: `public/uploads/1234567890/code/document.pdf`

2. **Update file metadata**:
   - Edit `data/files.json`
   - Add an entry like this:
   ```json
   {
     "id": "unique-id-here",
     "projectId": "1234567890",
     "categoryId": "code",
     "filename": "document.pdf",
     "originalName": "My Document.pdf",
     "mimeType": "application/pdf",
     "uploadedAt": "2026-01-28T12:00:00.000Z"
   }
   ```
   
   **Note**: The `size` field is optional! If you don't include it, the system will automatically calculate it from the actual file when it's displayed.

3. **Commit and deploy**:
   ```bash
   git add public/uploads/ data/files.json
   git commit -m "Add files manually"
   git push
   ```

## File Structure

```
public/
  uploads/
    [projectId]/
      [categoryId]/
        [filename]

data/
  projects.json    # Project data
  files.json       # File metadata
```

## Notes

- **In production**: The website is read-only. You must add files manually and commit them.
- **In development**: You can upload through the website, but remember to commit the files!
- Files in `public/uploads/` are served as static assets, so they work when deployed.
