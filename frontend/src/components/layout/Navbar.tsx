'use client';

import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => router.push('/dashboard')}
      >
        <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-xl">RAI</div>
        <span className="text-xl font-bold text-slate-900 hidden sm:inline-block">ResumeAI</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 mr-4 hidden md:flex">
          <User className="h-4 w-4" />
          <span>{user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
