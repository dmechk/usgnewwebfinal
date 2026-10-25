/**
 * Centralized API Client Service for Ubumwe SACCO Gakenke Portal
 * Seamlessly integrates the React frontend with WebUSG backend.
 */

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Backend server host for static files
export const getUploadUrl = (relativePath: string): string => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
    return relativePath;
  }
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  // If API_BASE_URL starts with http:// or https://, derive host from it
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    const urlObj = new URL(API_BASE_URL);
    return `${urlObj.origin}${cleanPath}`;
  }
  return cleanPath;
};

// Token management
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('ubumwe_access_token');
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem('ubumwe_access_token', token);
  } catch {}
};

export const clearAuthToken = (): void => {
  try {
    localStorage.removeItem('ubumwe_access_token');
    localStorage.removeItem('ubumwe_auth_user');
    localStorage.removeItem('ubumwe_manager_session');
    localStorage.removeItem('ubumwe_manager_name');
    localStorage.removeItem('ubumwe_user_role');
  } catch {}
};

// Generic fetch wrapper with timeout, token injection, and JSON handling
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 12000
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data?.message) ||
        (typeof data === 'string' && data) ||
        `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Network request timed out. Please check that the backend server is running.');
    }
    throw err;
  }
}

// 1. Authentication Service
export const authApi = {
  async login(credentials: { email: string; password: string }) {
    const res = await request<{
      success: boolean;
      message: string;
      data: {
        accessToken: string;
        tokenType: string;
        expiresIn: number;
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          isActive: boolean;
          permissions: string[];
          dashboardUrl: string;
        };
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (res.data?.accessToken) {
      setAuthToken(res.data.accessToken);
    }
    return res.data;
  },

  async getMe() {
    return request<{
      success: boolean;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          isActive: boolean;
          permissions: string[];
          dashboardUrl: string;
        };
      };
    }>('/auth/me');
  },

  async changePassword(passwords: { currentPassword: string; newPassword: string }) {
    return request<{ success: boolean; message: string; data: { user: any } }>(
      '/auth/change-password',
      {
        method: 'POST',
        body: JSON.stringify(passwords),
      }
    );
  },

  async getRoles() {
    return request<{
      success: boolean;
      data: {
        roles: string[];
        matrix: Record<string, string[]>;
      };
    }>('/auth/roles');
  },
};

// 2. Gallery Service
export const galleryApi = {
  async list(params?: { category?: string; isPublished?: boolean; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.isPublished !== undefined) searchParams.set('isPublished', String(params.isPublished));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{
      success: boolean;
      data: {
        items: Array<{
          id: string;
          title: string;
          description: string;
          imageUrl: string;
          category: string;
          isPublished: boolean;
          publishedAt?: string;
          createdAt: string;
        }>;
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>(`/gallery${qs}`);
  },

  async get(id: string) {
    return request<{ success: boolean; data: { item: any } }>(`/gallery/${id}`);
  },

  async create(data: { title: string; description?: string; imageUrl: string; category?: string; isPublished?: boolean }) {
    return request<{ success: boolean; message: string; data: { item: any } }>('/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: { title?: string; description?: string; imageUrl?: string; category?: string }) {
    return request<{ success: boolean; message: string; data: { item: any } }>(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async publish(id: string, isPublished: boolean) {
    return request<{ success: boolean; message: string; data: { item: any } }>(`/gallery/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ isPublished }),
    });
  },

  async delete(id: string) {
    return request<{ success: boolean; message: string }>(`/gallery/${id}`, {
      method: 'DELETE',
    });
  },
};

// 3. News & Announcements Service
export const newsApi = {
  async list(params?: { category?: string; isPublished?: boolean; search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.isPublished !== undefined) searchParams.set('isPublished', String(params.isPublished));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{
      success: boolean;
      data: {
        articles: Array<{
          id: string;
          title: string;
          summary: string;
          content: string;
          category: string;
          featuredImage?: string;
          isPublished: boolean;
          publishedAt?: string;
          createdAt: string;
        }>;
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>(`/news${qs}`);
  },

  async get(id: string) {
    return request<{ success: boolean; data: { article: any } }>(`/news/${id}`);
  },

  async create(data: {
    title: string;
    content: string;
    summary?: string;
    category?: string;
    featuredImage?: string;
    isPublished?: boolean;
  }) {
    return request<{ success: boolean; message: string; data: { article: any } }>('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return request<{ success: boolean; message: string; data: { article: any } }>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async publish(id: string, isPublished: boolean) {
    return request<{ success: boolean; message: string; data: { article: any } }>(`/news/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ isPublished }),
    });
  },

  async delete(id: string) {
    return request<{ success: boolean; message: string }>(`/news/${id}`, {
      method: 'DELETE',
    });
  },
};

// 4. Careers Service
export const careersApi = {
  async list(params?: { department?: string; isPublished?: boolean; search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.department) searchParams.set('department', params.department);
    if (params?.isPublished !== undefined) searchParams.set('isPublished', String(params.isPublished));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{
      success: boolean;
      data: {
        careers: Array<{
          id: string;
          title: string;
          department: string;
          location: string;
          employmentType: string;
          description: string;
          requirements: string[];
          deadline?: string;
          isPublished: boolean;
          publishedAt?: string;
          createdAt: string;
        }>;
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>(`/careers${qs}`);
  },

  async get(id: string) {
    return request<{ success: boolean; data: { career: any } }>(`/careers/${id}`);
  },

  async create(data: {
    title: string;
    department: string;
    location?: string;
    employmentType?: string;
    description: string;
    requirements?: string[];
    deadline?: string;
    isPublished?: boolean;
  }) {
    return request<{ success: boolean; message: string; data: { career: any } }>('/careers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return request<{ success: boolean; message: string; data: { career: any } }>(`/careers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async publish(id: string, isPublished: boolean) {
    return request<{ success: boolean; message: string; data: { career: any } }>(`/careers/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ isPublished }),
    });
  },

  async delete(id: string) {
    return request<{ success: boolean; message: string }>(`/careers/${id}`, {
      method: 'DELETE',
    });
  },
};

// 5. Job Applicants Service
export const applicantsApi = {
  async submit(data: {
    careerId?: string;
    jobId?: string;
    jobTitle?: string;
    fullName: string;
    email: string;
    phone?: string;
    nationalId?: string;
    residenceSector?: string;
    educationLevel?: string;
    yearsExperience?: number;
    resumeUrl?: string;
    cvFileName?: string;
    cvFileData?: string;
    coverLetter?: string;
    motivationLetterUrl?: string;
    motivationLetterFileName?: string;
    motivationLetterFileData?: string;
  }) {
    return request<{
      success: boolean;
      message: string;
      data: { applicant: any };
    }>('/applicants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async list(params?: { status?: string; careerId?: string; search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.careerId) searchParams.set('careerId', params.careerId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{
      success: boolean;
      data: {
        applicants: Array<any>;
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>(`/applicants${qs}`);
  },

  async get(id: string) {
    return request<{ success: boolean; data: { applicant: any } }>(`/applicants/${id}`);
  },

  async update(id: string, data: { status?: string; rating?: number; notes?: string; comment?: string }) {
    return request<{ success: boolean; message: string; data: { applicant: any } }>(`/applicants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: string, status: string) {
    return request<{ success: boolean; message: string; data: { applicant: any } }>(`/applicants/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async addFeedback(id: string, data: { rating: number; comment: string }) {
    return request<{ success: boolean; message: string; data: { applicant: any } }>(`/applicants/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async listMessages(id: string) {
    return request<{ success: boolean; data: { messages: any[] } }>(`/applicants/${id}/messages`);
  },

  async addMessage(id: string, message: string) {
    return request<{ success: boolean; message: string; data: { messages: any[] } }>(`/applicants/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  async delete(id: string) {
    return request<{ success: boolean; message: string; data: { id: string } }>(`/applicants/${id}`, {
      method: 'DELETE',
    });
  },
};

// 6. User Management Service is defined as usersApi at the bottom with full MongoDB CRUD, password reset, and role permissions capabilities.

// 7. Analytics & Executive Reports Service
export const reportsApi = {
  async getOverview() {
    return request<{
      success: boolean;
      data: {
        metrics: {
          totalUsers: number;
          totalGalleryItems: number;
          totalNews: number;
          totalCareers: number;
          totalApplicants: number;
          totalAuditLogs: number;
        };
        timestamp: string;
      };
    }>('/reports/overview');
  },

  async getGalleryNews() {
    return request<{
      success: boolean;
      data: {
        gallery: { total: number; published: number; draft: number };
        news: { total: number; published: number; draft: number };
      };
    }>('/reports/gallery-news');
  },

  async getRecruitment() {
    return request<{
      success: boolean;
      data: {
        totalApplicants: number;
        pipelineBreakdown: Record<string, number>;
      };
    }>('/reports/recruitment');
  },

  async getCareers() {
    return request<{
      success: boolean;
      data: {
        totalCareers: number;
        activeCareers: number;
        draftCareers: number;
        departments: Array<{ department: string; count: number }>;
      };
    }>('/reports/careers');
  },
};

// 8. Audit Logs Service
export const auditApi = {
  async list(params?: { page?: number; limit?: number; action?: string; actorRole?: string; outcome?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.action) searchParams.set('action', params.action);
    if (params?.actorRole) searchParams.set('actorRole', params.actorRole);
    if (params?.outcome) searchParams.set('outcome', params.outcome);

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{
      success: boolean;
      data: {
        logs: Array<{
          id: string;
          actor: { id: string; name: string; email: string; role: string };
          action: string;
          resourceType: string;
          resourceId?: string;
          details?: any;
          outcome: 'SUCCESS' | 'FAILURE';
          ipAddress?: string;
          createdAt: string;
        }>;
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>(`/audit-logs${qs}`);
  },
};

// 9. File Upload Service
export const uploadApi = {
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await request<{
      success: boolean;
      message: string;
      data: {
        fileUrl: string;
        filename: string;
        originalName: string;
        size: number;
        mimetype: string;
      };
    }>('/upload', {
      method: 'POST',
      body: formData,
    });

    return res.data;
  },
};

// 10. IT Admin User Management Service (Connected directly to MongoDB)
export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  isActive: boolean;
  passwordChangeRequired?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export const usersApi = {
  async list(params?: UserListParams) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.role && params.role !== 'ALL') searchParams.set('role', params.role);
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    if (params?.search && params.search.trim()) searchParams.set('search', params.search.trim());

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{
      success: boolean;
      data: {
        users: SystemUser[];
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>(`/users${qs}`);
  },

  async get(id: string) {
    return request<{
      success: boolean;
      data: { user: SystemUser };
    }>(`/users/${id}`);
  },

  async create(userData: {
    name: string;
    email: string;
    role: string;
    phone?: string;
    department?: string;
    password?: string;
    passwordChangeRequired?: boolean;
  }) {
    return request<{
      success: boolean;
      message: string;
      temporaryPassword?: string;
      data: { user: SystemUser };
    }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async update(id: string, userData: {
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    department?: string;
    isActive?: boolean;
  }) {
    return request<{
      success: boolean;
      message: string;
      data: { user: SystemUser };
    }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async updateRole(id: string, role: string) {
    return request<{
      success: boolean;
      message: string;
      data: { user: SystemUser };
    }>(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async updateStatus(id: string, isActive: boolean) {
    return request<{
      success: boolean;
      message: string;
      data: { user: SystemUser };
    }>(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },

  async resetPassword(id: string, newPassword?: string) {
    return request<{
      success: boolean;
      message: string;
      temporaryPassword: string;
      data: { user: SystemUser };
    }>(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(newPassword ? { newPassword } : {}),
    });
  },

  async delete(id: string) {
    return request<{
      success: boolean;
      message: string;
      data: { id: string };
    }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  async getRolesAndPermissions() {
    return request<{
      success: boolean;
      data: {
        roles: string[];
        allRoles: Record<string, string>;
        permissions: Record<string, string>;
        rolePermissions: Record<string, string[]>;
        roleDashboards: Record<string, string>;
      };
    }>('/users/roles-permissions');
  },
};

/**
 * Inquiries and Member Feedback Service (CRUD & Role-Based Response)
 */
export const inquiryService = {
  async getAll(params?: {
    status?: string;
    priority?: string;
    source?: string;
    sector?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params?.source && params.source !== 'all') query.set('source', params.source);
    if (params?.sector && params.sector !== 'all') query.set('sector', params.sector);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return request<{
      success: boolean;
      data: {
        inquiries: any[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      };
    }>(`/inquiries${qs ? `?${qs}` : ''}`);
  },

  async getById(id: string) {
    return request<{
      success: boolean;
      data: { inquiry: any };
    }>(`/inquiries/${id}`);
  },

  async create(data: Record<string, any>) {
    return request<{
      success: boolean;
      message: string;
      data: { inquiry: any };
    }>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Record<string, any>) {
    return request<{
      success: boolean;
      message: string;
      data: { inquiry: any };
    }>(`/inquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return request<{
      success: boolean;
      message: string;
      data: { id: string };
    }>(`/inquiries/${id}`, {
      method: 'DELETE',
    });
  },

  async sendFeedback(
    id: string,
    payload: {
      message: string;
      newStatus?: string;
      internalNotes?: string;
    }
  ) {
    return request<{
      success: boolean;
      message: string;
      data: {
        inquiry: any;
        feedback: any;
      };
    }>(`/inquiries/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};


