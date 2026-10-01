const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },
  resumes: {
    upload: async (formData: FormData) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error('Please log in to upload a resume.');
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
      }
      return response.json();
    },
    list: () => request('/resumes/', { method: 'GET' }),
    getAtsScore: (id: string) => request(`/resumes/${id}/ats-score`, { method: 'GET' }),
    analyze: (id: string, data: any) => request(`/resumes/${id}/analyze`, { method: 'POST', body: JSON.stringify(data) }),
  },
  ai: {
    rewriteBullet: (data: any) => request('/ai/rewrite-bullet', { method: 'POST', body: JSON.stringify(data) }),
  },
};
