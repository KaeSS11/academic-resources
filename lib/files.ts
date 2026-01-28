// File storage using public directory for static file serving (works when deployed!)
import fs from 'fs';
import path from 'path';

// Use public directory so files are served as static assets
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const DATA_DIR = path.join(process.cwd(), 'data');
const FILES_DATA_FILE = path.join(DATA_DIR, 'files.json');

// Check if we're in production (read-only mode)
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
}

export interface FileMetadata {
  id: string;
  projectId: string;
  categoryId: string;
  filename: string;
  originalName: string;
  size?: number; // Optional - will be auto-calculated if missing
  mimeType: string;
  uploadedAt: string;
  blobUrl?: string;
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILES_DATA_FILE)) {
      fs.writeFileSync(FILES_DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error ensuring data directory exists:', error);
    // In production, this is read-only, so don't throw
    if (!isProduction()) {
      throw error;
    }
  }
}

export function getFilePath(projectId: string, categoryId: string, filename: string): string {
  return path.join(UPLOADS_DIR, projectId, categoryId, filename);
}

// Auto-calculate file size if missing
function enrichFileMetadata(file: FileMetadata): FileMetadata {
  // If size is missing, try to calculate it from the actual file
  if (file.size === undefined || file.size === null) {
    try {
      const filePath = getFilePath(file.projectId, file.categoryId, file.filename);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        file.size = stats.size;
      } else {
        // File doesn't exist, set to 0
        file.size = 0;
      }
    } catch (error) {
      // If we can't get the size, set to 0
      console.warn(`Could not calculate size for file ${file.filename}:`, error);
      file.size = 0;
    }
  }
  return file;
}

function getAllFilesLocal(): FileMetadata[] {
  try {
    ensureDataDir();
    const data = fs.readFileSync(FILES_DATA_FILE, 'utf-8');
    if (!data.trim()) {
      return [];
    }
    const files = JSON.parse(data);
    // Enrich files with auto-calculated sizes if missing
    return files.map(enrichFileMetadata);
  } catch (error) {
    console.error('Error reading files from local storage:', error);
    return [];
  }
}

function saveFilesLocal(files: FileMetadata[]): void {
  if (isProduction()) {
    throw new Error('File uploads are disabled in production. Please add files manually to public/uploads/ and update data/files.json, then commit to git.');
  }
  try {
    ensureDataDir();
    fs.writeFileSync(FILES_DATA_FILE, JSON.stringify(files, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving files to local storage:', error);
    throw error;
  }
}

export async function getAllFiles(): Promise<FileMetadata[]> {
  return getAllFilesLocal();
}

export function getFilesByProject(projectId: string): Promise<FileMetadata[]> {
  return getAllFiles().then(files => files.filter(f => f.projectId === projectId));
}

export function getFilesByCategory(projectId: string, categoryId: string): Promise<FileMetadata[]> {
  return getAllFiles().then(files => 
    files.filter(f => f.projectId === projectId && f.categoryId === categoryId)
  );
}

export async function saveFileMetadata(metadata: FileMetadata): Promise<void> {
  const files = getAllFilesLocal();
  files.push(metadata);
  saveFilesLocal(files);
}

export async function saveFile(
  projectId: string,
  categoryId: string,
  filename: string,
  buffer: Buffer
): Promise<string> {
  if (isProduction()) {
    throw new Error('File uploads are disabled in production. Please add files manually to public/uploads/ and update data/files.json, then commit to git.');
  }

  const projectDir = path.join(UPLOADS_DIR, projectId);
  const categoryDir = path.join(projectDir, categoryId);
  
  try {
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    const filePath = path.join(categoryDir, filename);
    fs.writeFileSync(filePath, buffer);
    // Return public URL path
    return `/uploads/${projectId}/${categoryId}/${filename}`;
  } catch (error) {
    console.error('Error saving file locally:', error);
    throw error;
  }
}

export async function deleteFile(projectId: string, categoryId: string, filename: string): Promise<void> {
  if (isProduction()) {
    throw new Error('File deletion is disabled in production. Please remove files manually from public/uploads/ and update data/files.json, then commit to git.');
  }

  const files = getAllFilesLocal();
  const fileMetadata = files.find(
    f => f.projectId === projectId && f.categoryId === categoryId && f.filename === filename
  );

  // Delete from local storage
  const filePath = getFilePath(projectId, categoryId, filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error deleting file from local storage:', error);
    }
  }

  // Remove from metadata
  const filtered = files.filter(
    f => !(f.projectId === projectId && f.categoryId === categoryId && f.filename === filename)
  );
  saveFilesLocal(filtered);
}

export async function getFileBlobUrl(projectId: string, categoryId: string, filename: string): Promise<string | null> {
  const files = getAllFilesLocal();
  const fileMetadata = files.find(
    f => f.projectId === projectId && f.categoryId === categoryId && f.filename === filename
  );
  
  if (fileMetadata) {
    // Return the public URL path (served as static asset)
    return `/uploads/${projectId}/${categoryId}/${filename}`;
  }
  return null;
}
