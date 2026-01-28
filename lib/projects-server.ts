// Server-side project management - uses static JSON files (works when deployed!)
import type { Project } from './projects';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// Check if we're in production (read-only mode)
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PROJECTS_FILE)) {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error ensuring data directory exists:', error);
    // In production, this is read-only, so don't throw
    if (!isProduction()) {
      throw error;
    }
  }
}

function getAllProjectsLocal(): Project[] {
  try {
    ensureDataDir();
    const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    if (!data.trim()) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading projects from local storage:', error);
    // If file is corrupted, return empty array
    return [];
  }
}

function saveProjectsLocal(projects: Project[]): void {
  if (isProduction()) {
    throw new Error('Project creation/editing is disabled in production. Please update data/projects.json manually and commit to git.');
  }
  try {
    ensureDataDir();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving projects to local storage:', error);
    throw error;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  return getAllProjectsLocal();
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = getAllProjectsLocal();
  return projects.find(p => p.id === id) || null;
}

export async function createProject(
  name: string, 
  description?: string, 
  moduleName?: string, 
  supervisorName?: string
): Promise<Project> {
  const projects = getAllProjectsLocal();
  const newProject: Project = {
    id: Date.now().toString(),
    name,
    description,
    moduleName,
    supervisorName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  projects.push(newProject);
  saveProjectsLocal(projects);
  return newProject;
}

export async function updateProject(
  id: string, 
  updates: Partial<Pick<Project, 'name' | 'description' | 'moduleName' | 'supervisorName'>>
): Promise<Project | null> {
  const projects = getAllProjectsLocal();
  const projectIndex = projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    return null;
  }
  
  const existingProject = projects[projectIndex];
  projects[projectIndex] = {
    ...existingProject,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveProjectsLocal(projects);
  return projects[projectIndex];
}
