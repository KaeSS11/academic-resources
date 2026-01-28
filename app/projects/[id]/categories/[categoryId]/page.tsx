'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORIES, getCategoryById, FileText, ArrowLeft, Download, Trash2 } from '@/lib/projects';
import { checkAdminStatus } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

interface FileMetadata {
  id: string;
  projectId: string;
  categoryId: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const categoryId = params.categoryId as string;
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [projectName, setProjectName] = useState('');

  const category = getCategoryById(categoryId);

  useEffect(() => {
    checkAdminStatus().then(setIsAdminUser);
    if (projectId && categoryId) {
      fetchProjectName();
      fetchFiles();
    }
  }, [projectId, categoryId]);

  const fetchProjectName = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProjectName(data.name);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/categories/${categoryId}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    Array.from(fileList).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(
        `/api/projects/${projectId}/categories/${categoryId}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        fetchFiles();
        e.target.value = ''; // Reset input
      } else {
        alert('Failed to upload files');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (file: FileMetadata) => {
    window.open(`/api/projects/${projectId}/categories/${categoryId}/files/${file.filename}`, '_blank');
  };

  const handleDelete = async (file: FileMetadata) => {
    if (!confirm(`Are you sure you want to delete "${file.originalName}"?`)) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/categories/${categoryId}/files/${file.filename}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        fetchFiles();
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex items-center justify-center transition-colors">
        <p className="text-gray-600 dark:text-gray-400">Category not found</p>
      </div>
    );
  }

  const getCategoryColor = () => {
    const colorMap: Record<string, string> = {
      'graphical-data': 'text-blue-400',
      'literature': 'text-purple-400',
      'questionnaire-data': 'text-green-400',
      'other': 'text-orange-400',
    };
    return colorMap[categoryId] || 'text-gray-400';
  };

  const getCategoryBgColor = () => {
    const colorMap: Record<string, string> = {
      'graphical-data': 'bg-blue-100/50 dark:bg-muted-blue-light/30',
      'literature': 'bg-purple-100/50 dark:bg-muted-purple-light/30',
      'questionnaire-data': 'bg-green-100/50 dark:bg-muted-green-light/30',
      'other': 'bg-orange-100/50 dark:bg-muted-orange-light/30',
    };
    return colorMap[categoryId] || 'bg-gray-100/50 dark:bg-gray-700/30';
  };

  const getCategoryBorderColor = () => {
    const colorMap: Record<string, string> = {
      'graphical-data': 'border-blue-200 dark:border-muted-blue',
      'literature': 'border-purple-200 dark:border-muted-purple',
      'questionnaire-data': 'border-green-200 dark:border-muted-green',
      'other': 'border-orange-200 dark:border-muted-orange',
    };
    return colorMap[categoryId] || 'border-gray-200 dark:border-gray-700';
  };

  const getIconColor = () => {
    const colorMap: Record<string, string> = {
      'graphical-data': 'text-icon-blue',
      'literature': 'text-icon-purple',
      'questionnaire-data': 'text-icon-green',
      'other': 'text-icon-orange',
    };
    return colorMap[categoryId] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-all duration-300 ease-in-out">
      <div className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800/50 transition-all duration-300 ease-in-out">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex justify-between items-start mb-4">
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${getCategoryBgColor()} ${getCategoryBorderColor()} rounded-lg flex items-center justify-center border-2`}>
              <category.icon className={`w-6 h-6 ${getIconColor()}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{category.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">References & Citations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{category.name} Resources</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{category.description}</p>
        </div>

        {isAdminUser && (
          <div className="mb-8">
            <label className="block mb-4">
              <span className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Upload Files</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-200 dark:file:bg-blue-600/30 file:text-blue-800 dark:file:text-blue-400 hover:file:bg-blue-300 dark:hover:file:bg-blue-600/50 file:cursor-pointer disabled:opacity-50"
              />
            </label>
            {isUploading && (
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading files...</p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {files.length === 0 ? (
            <div className="text-center py-16 text-gray-600 dark:text-gray-400">
              <p className="text-lg mb-2">No files uploaded yet</p>
              {isAdminUser && (
                <p className="text-sm">Upload files using the form above</p>
              )}
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="bg-gray-50 dark:bg-[#1E1E1E] p-6 rounded-lg border border-gray-200 dark:border-gray-800/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1 text-gray-900 dark:text-white">{file.originalName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownload(file)}
                    className="px-4 py-2 bg-blue-200 dark:bg-blue-600/30 hover:bg-blue-300 dark:hover:bg-blue-600/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 text-blue-800 dark:text-blue-400"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  {isAdminUser && (
                    <button
                      onClick={() => handleDelete(file)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
