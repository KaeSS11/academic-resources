// Server-side project management (API routes and Server Components only)
import fs from 'fs';
import path from 'path';
import type { Project } from './projects';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify([]));
  }
}

export function getAllProjects(): Project[] {
  ensureDataDir();
  try {
    const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getProject(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
}

export function createProject(name: string, description?: string, moduleName?: string, supervisorName?: string): Project {
  ensureDataDir();
  const projects = getAllProjects();
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
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  return newProject;
}

export function updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'moduleName' | 'supervisorName'>>): Project | null {
  ensureDataDir();
  const projects = getAllProjects();
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
  
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  return projects[projectIndex];
}
