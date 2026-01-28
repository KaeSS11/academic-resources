// Server-side project management (API routes and Server Components only)
import type { Project } from './projects';

const PROJECTS_KEY = 'projects';

// Fallback to local storage if Redis is not available (for local development)
function isVercelEnvironment(): boolean {
  // Check for either Upstash Redis or Vercel KV environment variables
  return !!(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL);
}

function getRedisConfig() {
  // Try Vercel KV variables first (if using Vercel KV)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return {
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    };
  }
  // Fall back to Upstash Redis variables
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    };
  }
  return null;
}

async function getAllProjectsFromKV(): Promise<Project[]> {
  if (!isVercelEnvironment()) {
    return getAllProjectsLocal();
  }
  
  try {
    const redisConfig = getRedisConfig();
    if (!redisConfig) {
      throw new Error('Redis configuration is missing. Please set either KV_REST_API_URL/KV_REST_API_TOKEN (for Vercel KV) or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN (for Upstash Redis) in production.');
    }
    
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: redisConfig.url,
      token: redisConfig.token,
    });
    const projects = await redis.get<Project[]>(PROJECTS_KEY);
    return projects || [];
  } catch (error) {
    console.error('Error reading projects from Redis:', error);
    // In production, don't fallback to local storage (it won't work)
    if (isVercelEnvironment()) {
      throw error; // Re-throw in production so we can see the actual error
    }
    return getAllProjectsLocal(); // Fallback to local storage only in development
  }
}

async function saveProjectsToKV(projects: Project[]): Promise<void> {
  if (!isVercelEnvironment()) {
    saveProjectsLocal(projects);
    return;
  }
  
  try {
    const redisConfig = getRedisConfig();
    if (!redisConfig) {
      throw new Error('Redis configuration is missing. Please set either KV_REST_API_URL/KV_REST_API_TOKEN (for Vercel KV) or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN (for Upstash Redis) in production.');
    }
    
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: redisConfig.url,
      token: redisConfig.token,
    });
    await redis.set(PROJECTS_KEY, projects);
  } catch (error) {
    console.error('Error saving projects to Redis:', error);
    // In production, don't fallback to local storage (it won't work)
    if (isVercelEnvironment()) {
      throw error; // Re-throw in production so we can see the actual error
    }
    saveProjectsLocal(projects); // Fallback to local storage only in development
  }
}

// Local storage fallback (for development)
import fs from 'fs';
import path from 'path';

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

function getAllProjectsLocal(): Project[] {
  ensureDataDir();
  try {
    const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveProjectsLocal(projects: Project[]): void {
  ensureDataDir();
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

export async function getAllProjects(): Promise<Project[]> {
  return await getAllProjectsFromKV();
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await getAllProjectsFromKV();
  return projects.find(p => p.id === id) || null;
}

export async function createProject(
  name: string, 
  description?: string, 
  moduleName?: string, 
  supervisorName?: string
): Promise<Project> {
  const projects = await getAllProjectsFromKV();
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
  await saveProjectsToKV(projects);
  return newProject;
}

export async function updateProject(
  id: string, 
  updates: Partial<Pick<Project, 'name' | 'description' | 'moduleName' | 'supervisorName'>>
): Promise<Project | null> {
  const projects = await getAllProjectsFromKV();
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
  
  await saveProjectsToKV(projects);
  return projects[projectIndex];
}
