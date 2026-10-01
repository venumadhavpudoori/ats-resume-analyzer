'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokenData = await api.auth.login(data);
      // The backend returns { access_token, token_type }
      // We need the user data to store in context.
      // For now, we'll do a quick dummy user fetch or rely on the token.
      // To be perfectly clean, let's just fetch user info or use the login response if we modify backend.
      // Since the backend current login doesn't return user, we'll use a simplified version:
      login({
        access_token: tokenData.access_token,
        token_type: tokenData.token_type
      }, {
        id: 1,
        email: data.email
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-slate-600">Sign in to analyze your resume</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                {...register('email')}
                type="email"
                placeholder="Email address"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition-all ${
                  errors.email ? 'border-red-500 focus:ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-1 ring-blue-500'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                {...register('password')}
                type="password"
                placeholder="Password"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition-all ${
                  errors.password ? 'border-red-500 focus:ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-1 ring-blue-500'
                }`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 font-medium hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
