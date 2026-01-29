'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CATEGORIES, getCategoryById, FileText, ArrowLeft, Download, Trash2 } from '@/lib/projects';
import { checkAdminStatus } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Eye, EyeOff } from 'lucide-react';

interface FileMetadata {
  id: string;
  projectId: string;
  categoryId: string;
  filename: string;
  originalName: string;
  size?: number; // Optional - auto-calculated if missing
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
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [categoryPassword, setCategoryPassword] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const category = getCategoryById(categoryId);

  useEffect(() => {
    checkAdminStatus().then(setIsAdminUser);
    if (projectId && categoryId) {
      fetchProjectName();
      checkPasswordProtection();
    }
  }, [projectId, categoryId]);

  const checkPasswordProtection = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        const categoryPassword = data.categories?.[categoryId]?.password;
        if (categoryPassword) {
          setIsPasswordProtected(true);
          setShowPasswordModal(true);
        } else {
          fetchFiles();
        }
      }
    } catch (error) {
      console.error('Failed to check password protection:', error);
      fetchFiles();
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordInput.trim()) {
      setPasswordError('Please enter a password');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/categories/${categoryId}/files`, {
        headers: {
          'x-category-password': passwordInput,
        },
      });

      if (response.ok) {
        setCategoryPassword(passwordInput);
        setShowPasswordModal(false);
        setPasswordInput('');
        // Fetch files with the password in the same request
        const data = await response.json();
        setFiles(data);
      } else if (response.status === 403) {
        setPasswordError('Invalid password. Access denied.');
        setPasswordInput('');
      } else {
        setPasswordError('An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Password validation error:', error);
      setPasswordError('An error occurred. Please try again.');
    }
  };

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
      const headers: Record<string, string> = {};
      if (categoryPassword) {
        headers['x-category-password'] = categoryPassword;
      }

      const response = await fetch(`/api/projects/${projectId}/categories/${categoryId}/files`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else if (response.status === 403) {
        setShowPasswordModal(true);
        setPasswordError('Session expired. Please enter password again.');
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

  const handleDownload = async (file: FileMetadata) => {
    if (!categoryPassword && isPasswordProtected) {
      setPasswordError('Password required to download files');
      setShowPasswordModal(true);
      return;
    }

    try {
      const headers: Record<string, string> = {
        'x-category-password': categoryPassword || '',
      };

      const response = await fetch(
        `/api/projects/${projectId}/categories/${categoryId}/files/${file.filename}`,
        { headers }
      );

      if (response.ok) {
        // Get the blob and create a download link
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = file.originalName || file.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } else if (response.status === 403) {
        setPasswordError('Invalid password. Please try again.');
        setShowPasswordModal(true);
      } else {
        alert('Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  const handleViewPDF = async (file: FileMetadata) => {
    if (!categoryPassword && isPasswordProtected) {
      setPasswordError('Password required to view files');
      setShowPasswordModal(true);
      return;
    }

    try {
      const headers: Record<string, string> = {
        'x-category-password': categoryPassword || '',
      };

      const response = await fetch(
        `/api/projects/${projectId}/categories/${categoryId}/files/${file.filename}`,
        { headers }
      );

      if (response.ok) {
        // Get the blob and create a blob URL for viewing
        const blob = await response.blob();
        const viewUrl = window.URL.createObjectURL(blob);
        window.open(viewUrl, '_blank');
      } else if (response.status === 403) {
        setPasswordError('Invalid password. Please try again.');
        setShowPasswordModal(true);
      } else {
        alert('Failed to view file');
      }
    } catch (error) {
      console.error('View error:', error);
      alert('Failed to view file');
    }
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return 'Unknown size';
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
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Access Required
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                This folder is password protected. Please enter the password to access it.
              </p>

              <form onSubmit={handlePasswordSubmit}>
                <div className="relative mb-4">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-2 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {passwordError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-800 dark:text-red-200 text-sm">
                    {passwordError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordInput('');
                      setPasswordError('');
                      router.back();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-900 dark:text-white transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white transition-colors text-sm sm:text-base"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800/50 transition-all duration-300 ease-in-out">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-start mb-4">
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getCategoryBgColor()} ${getCategoryBorderColor()} rounded-lg flex items-center justify-center border-2 flex-shrink-0`}>
              <category.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${getIconColor()}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white break-words">{category.name}</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">References & Citations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white break-words">{category.name} Resources</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">{category.description}</p>
        </div>

        {isAdminUser && (
          <div className="mb-6 sm:mb-8">
            <label className="block mb-4">
              <span className="block text-xs sm:text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Upload Files</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="block w-full text-xs sm:text-sm text-gray-600 dark:text-gray-400 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-200 dark:file:bg-blue-600/30 file:text-blue-800 dark:file:text-blue-400 hover:file:bg-blue-300 dark:hover:file:bg-blue-600/50 file:cursor-pointer disabled:opacity-50"
              />
            </label>
            {isUploading && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Uploading files...</p>
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
                className="bg-gray-50 dark:bg-[#1E1E1E] p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1 text-sm sm:text-base text-gray-900 dark:text-white break-words">{file.originalName}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {file.originalName.toLowerCase().endsWith('.pdf') && (
                    <button
                      onClick={() => handleViewPDF(file)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-200 dark:bg-green-600/30 hover:bg-green-300 dark:hover:bg-green-600/50 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 text-green-800 dark:text-green-400"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(file)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-200 dark:bg-blue-600/30 hover:bg-blue-300 dark:hover:bg-blue-600/50 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 text-blue-800 dark:text-blue-400"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                  {isAdminUser && (
                    <button
                      onClick={() => handleDelete(file)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Delete</span>
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
