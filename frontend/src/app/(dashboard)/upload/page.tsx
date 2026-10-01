'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        setErrorMessage('Please upload a PDF or DOCX file.');
        setFile(null);
        return;
      }
      setErrorMessage(null);
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus('idle');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.resumes.upload(formData);
      setStatus('success');
      // Redirect to analysis page for the newly uploaded resume
      setTimeout(() => {
        router.push(`/analysis/${response.resume_id}`);
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Your Resume</h1>
        <p className="text-slate-500">We'll parse your document and provide an instant ATS compatibility score</p>
      </div>

      <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center transition-all hover:border-blue-400 group">
        {!file ? (
          <div className="space-y-4">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Upload className="h-10 w-10 text-blue-600" />
            </div>
            <div className="max-w-xs mx-auto">
              <label className="block">
                <span className="sr-only">Choose file</span>
                <input
                  type="file"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-xs text-slate-400">PDF or DOCX only. Max file size 5MB.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <div className="text-lg font-medium text-slate-900 truncate max-w-md mx-auto">
              {file.name}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setFile(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
              >
                Remove file
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isUploading ? 'Uploading...' : 'Start Analysis'}
              </button>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6 flex items-center justify-center gap-2 text-green-600 font-medium animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>Resume uploaded and parsed successfully! Redirecting...</span>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 flex items-center justify-center gap-2 text-red-600 font-medium animate-in fade-in slide-in-from-bottom-2">
            <XCircle className="h-5 w-5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
