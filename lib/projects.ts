// Client-safe types and constants (no Node.js dependencies)
import { BarChart, BookOpen, CheckCircle, MoreHorizontal, FileText, Folder, ArrowLeft, Download, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  description?: string;
  moduleName?: string;
  supervisorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'graphical-data',
    name: 'Graphical Data',
    icon: BarChart,
    color: 'blue',
    description: 'Charts, graphs, diagrams, and visual data representations'
  },
  {
    id: 'literature',
    name: 'Literature',
    icon: BookOpen,
    color: 'purple',
    description: 'Academic literature, journal articles, books, and other scholarly references cited in the poster.'
  },
  {
    id: 'questionnaire-data',
    name: 'Questionnaire Data',
    icon: CheckCircle,
    color: 'green',
    description: 'Survey responses, questionnaire data, and research findings'
  },
  {
    id: 'other',
    name: 'Other',
    icon: MoreHorizontal,
    color: 'orange',
    description: 'Other project materials and resources'
  }
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id);
}

// Export commonly used icons
export { FileText, Folder, ArrowLeft, Download, Trash2 };
