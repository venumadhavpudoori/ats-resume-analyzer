'use client';

import React, { useState, useEffect } from 'react';
import { Plus, FileText, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Resume } from '@/types/api';

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    setIsLoading(true);
    try {
      // Backend currently doesn't have a /resumes list endpoint
      // I'll implement a mock or we can add it to backend.
      // For now, I'll implement the UI and we'll add the backend endpoint next.
      const data = await api.resumes.list(); // This will fail until we add the endpoint
    } catch (err: any) {
      setError("Could not fetch resumes. Please upload your first resume!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Resumes</h1>
          <p className="text-slate-500">Manage your documents and track ATS scores</p>
        </div>

        <button
          onClick={() => router.push('/upload')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="h-5 w-5" />
          <span>Upload New</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-sm">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No resumes found</h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => router.push('/upload')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Upload your first resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-blue-50 transition-colors">
                  <FileText className="h-6 w-6 text-slate-600 group-hover:text-blue-600" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/analysis/${resume.id}`)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Analyze"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 truncate mb-1" title={resume.filename}>
                {resume.filename}
              </h3>
              <p className="text-xs text-slate-400 mb-4">Uploaded on {new Date().toLocaleDateString()}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Latest ATS Score</span>
                <span className="text-lg font-bold text-blue-600">--</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
