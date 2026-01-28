import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const FILES_DATA_FILE = path.join(process.cwd(), 'data', 'files.json');

export interface FileMetadata {
  id: string;
  projectId: string;
  categoryId: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

function ensureUploadsDir(projectId: string, categoryId: string) {
  const projectDir = path.join(UPLOADS_DIR, projectId);
  const categoryDir = path.join(projectDir, categoryId);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
}

function ensureFilesDataFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(FILES_DATA_FILE)) {
    fs.writeFileSync(FILES_DATA_FILE, JSON.stringify([]));
  }
}

export function getAllFiles(): FileMetadata[] {
  ensureFilesDataFile();
  try {
    const data = fs.readFileSync(FILES_DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getFilesByProject(projectId: string): FileMetadata[] {
  return getAllFiles().filter(f => f.projectId === projectId);
}

export function getFilesByCategory(projectId: string, categoryId: string): FileMetadata[] {
  return getAllFiles().filter(f => f.projectId === projectId && f.categoryId === categoryId);
}

export function saveFileMetadata(metadata: FileMetadata) {
  ensureFilesDataFile();
  const files = getAllFiles();
  files.push(metadata);
  fs.writeFileSync(FILES_DATA_FILE, JSON.stringify(files, null, 2));
}

export function getFilePath(projectId: string, categoryId: string, filename: string): string {
  return path.join(UPLOADS_DIR, projectId, categoryId, filename);
}

export function saveFile(
  projectId: string,
  categoryId: string,
  filename: string,
  buffer: Buffer
): string {
  ensureUploadsDir(projectId, categoryId);
  const filePath = getFilePath(projectId, categoryId, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export function deleteFile(projectId: string, categoryId: string, filename: string) {
  const filePath = getFilePath(projectId, categoryId, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Remove from metadata
  ensureFilesDataFile();
  const files = getAllFiles();
  const filtered = files.filter(f => 
    !(f.projectId === projectId && f.categoryId === categoryId && f.filename === filename)
  );
  fs.writeFileSync(FILES_DATA_FILE, JSON.stringify(filtered, null, 2));
}
