import { NextRequest, NextResponse } from 'next/server';
import { getFilesByCategory } from '@/lib/files';
import fs from 'fs';
import path from 'path';

async function getProjectPassword(projectId: string, categoryId: string): Promise<string | null> {
  try {
    const projectsPath = path.join(process.cwd(), 'data', 'projects.json');
    const data = fs.readFileSync(projectsPath, 'utf-8');
    const projects = JSON.parse(data);
    
    // Find project by ID or slug
    const project = projects.find((p: any) => p.id === projectId || p.slug === projectId);
    if (!project) {
      console.warn(`Project not found: ${projectId}`);
      return null;
    }
    
    const categoryPassword = project.categories?.[categoryId]?.password;
    if (!categoryPassword) {
      console.warn(`No password found for category ${categoryId} in project ${projectId}`);
      return null;
    }
    
    return categoryPassword;
  } catch (error) {
    console.error('Error reading project password:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { id, categoryId } = await params;
    
    // Check if this category requires a password
    const requiredPassword = await getProjectPassword(id, categoryId);
    if (requiredPassword) {
      const providedPassword = request.headers.get('x-category-password');
      console.log('Password check - Required:', requiredPassword, 'Provided:', providedPassword, 'Match:', providedPassword === requiredPassword);
      if (providedPassword !== requiredPassword) {
        console.warn(`Password mismatch for category ${categoryId} in project ${id}`);
        return NextResponse.json(
          { error: 'Password required to access this category' },
          { status: 403 }
        );
      }
    } else {
      console.log(`No password protection for category ${categoryId} in project ${id}`);
    }
    
    const files = await getFilesByCategory(id, categoryId);
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
