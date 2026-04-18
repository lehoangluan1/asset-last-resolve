import type {
  AppNotification,
  Asset,
  AssetCategory,
  AssetDetail,
  Assignment,
  AuthResponse,
  BorrowRequest,
  DashboardData,
  Department,
  Discrepancy,
  Location,
  MaintenanceRecord,
  PageResponse,
  ReportSummary,
  User,
  VerificationCampaign,
  DisposalRequest,
  AuditLog,
  ApiError,
  SearchResponse,
  BorrowTargetType,
} from '@/types';
import { clearStoredSession, getStoredToken } from '@/lib/auth-storage';
import { API_BASE_URL } from '@/lib/env';

export class HttpError extends Error {
  status: number;
  data?: ApiError;

  constructor(status: number, message: string, data?: ApiError) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  const isFormData = init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearStoredSession();
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  if (!response.ok) {
    let data: ApiError | undefined;
    try {
      data = (await response.json()) as ApiError;
    } catch {
      data = undefined;
    }
    throw new HttpError(response.status, data?.message ?? 'Request failed', data);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function withQuery(path: string, query: Record<string, string | number | undefined | null>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export const api = {
  auth: {
    login: (payload: { username: string; password: string }) =>
      request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    me: () => request<User>('/api/auth/me'),
    changePassword: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      request<void>('/api/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }),
  },
  profile: {
    get: () => request<User>('/api/profile'),
    update: (payload: { phone: string; bio: string }) =>
      request<User>('/api/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  },
  dashboard: {
    get: () => request<DashboardData>('/api/dashboard'),
  },
  search: {
    global: (query: string) => request<SearchResponse>(withQuery('/api/search', { q: query })),
  },
  reference: {
    departments: () => request<Department[]>('/api/reference/departments'),
    createDepartment: (payload: { name: string; code: string; location: string }) =>
      request<Department>('/api/reference/departments', { method: 'POST', body: JSON.stringify(payload) }),
    updateDepartment: (id: string, payload: { name: string; code: string; location: string }) =>
      request<Department>(`/api/reference/departments/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteDepartment: (id: string) => request<void>(`/api/reference/departments/${id}`, { method: 'DELETE' }),
    locations: () => request<Location[]>('/api/reference/locations'),
    categories: () => request<AssetCategory[]>('/api/reference/categories'),
    usersByRoles: (roles: string[]) => request<User[]>(withQuery('/api/reference/users', { roles: roles.join(',') })),
    createCategory: (payload: Partial<AssetCategory>) =>
      request<AssetCategory>('/api/reference/categories', { method: 'POST', body: JSON.stringify(payload) }),
    updateCategory: (id: string, payload: Partial<AssetCategory>) =>
      request<AssetCategory>(`/api/reference/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteCategory: (id: string) => request<void>(`/api/reference/categories/${id}`, { method: 'DELETE' }),
  },
  assets: {
    list: (query: { search?: string; status?: string; departmentId?: string; page?: number; size?: number }) =>
      request<PageResponse<Asset>>(withQuery('/api/assets', query)),
    detail: (id: string) => request<AssetDetail>(`/api/assets/${id}`),
    create: (payload: Partial<Asset>) =>
      request<Asset>('/api/assets', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: Partial<Asset>) =>
      request<Asset>(`/api/assets/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id: string) => request<void>(`/api/assets/${id}`, { method: 'DELETE' }),
  },
  assignments: {
    list: (query: { search?: string; type?: string; page?: number; size?: number }) =>
      request<PageResponse<Assignment>>(withQuery('/api/assignments', query)),
    create: (payload: {
      assetId: string;
      toUserId: string;
      type: string;
      effectiveDate: string;
      returnDate?: string;
      notes?: string;
    }) => request<Assignment>('/api/assignments', { method: 'POST', body: JSON.stringify(payload) }),
  },
  borrowRequests: {
    list: (query: { search?: string; status?: string; page?: number; size?: number }) =>
      request<PageResponse<BorrowRequest>>(withQuery('/api/borrow-requests', query)),
    create: (payload: {
      assetId?: string;
      categoryId?: string;
      targetType?: BorrowTargetType;
      departmentId?: string;
      borrowDate: string;
      returnDate: string;
      purpose: string;
      notes?: string;
    }) =>
      request<BorrowRequest>('/api/borrow-requests', { method: 'POST', body: JSON.stringify(payload) }),
    availableAssets: (id: string) => request<Asset[]>(`/api/borrow-requests/${id}/available-assets`),
    approve: (id: string, payload?: { assetId?: string; notes?: string }) =>
      request<BorrowRequest>(`/api/borrow-requests/${id}/approve`, { method: 'POST', body: JSON.stringify(payload ?? {}) }),
    reject: (id: string, payload?: { notes?: string }) =>
      request<BorrowRequest>(`/api/borrow-requests/${id}/reject`, { method: 'POST', body: JSON.stringify(payload ?? {}) }),
  },
  maintenance: {
    list: (query: { search?: string; status?: string; page?: number; size?: number }) =>
      request<PageResponse<MaintenanceRecord>>(withQuery('/api/maintenance', query)),
    create: (payload: {
      assetId: string;
      type: string;
      description: string;
      techCondition: string;
      status: string;
      priority: string;
      assignedToUserId: string;
      scheduledDate: string;
      completedDate?: string;
      cost?: number;
      notes?: string;
    }) => request<MaintenanceRecord>('/api/maintenance', { method: 'POST', body: JSON.stringify(payload) }),
    updateStatus: (id: string, payload: { status: string; completedDate?: string; notes?: string }) =>
      request<MaintenanceRecord>(`/api/maintenance/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  },
  verification: {
    campaigns: () => request<VerificationCampaign[]>('/api/verification/campaigns'),
    campaign: (id: string) => request<VerificationCampaign>(`/api/verification/campaigns/${id}`),
    createCampaign: (payload: {
      name: string;
      code: string;
      year: number;
      description?: string;
      departmentIds: string[];
      status: string;
      dueDate: string;
      startDate: string;
    }) => request<VerificationCampaign>('/api/verification/campaigns', { method: 'POST', body: JSON.stringify(payload) }),
    updateCampaignStatus: (id: string, payload: { status: string }) =>
      request<VerificationCampaign>(`/api/verification/campaigns/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
    updateTask: (campaignId: string, taskId: string, payload: { result: string; notes?: string }) =>
      request<VerificationCampaign>(`/api/verification/campaigns/${campaignId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  },
  discrepancies: {
    list: (query: { search?: string; status?: string; severity?: string; page?: number; size?: number }) =>
      request<PageResponse<Discrepancy>>(withQuery('/api/discrepancies', query)),
    create: (payload: {
      assetId: string;
      verificationTaskId?: string;
      type: string;
      severity: string;
      expectedValue: string;
      observedValue: string;
      rootCause?: string;
      notes?: string;
    }) => request<Discrepancy>('/api/discrepancies', { method: 'POST', body: JSON.stringify(payload) }),
    reconcile: (id: string, payload?: { rootCause?: string; resolution?: string; notes?: string }) =>
      request<Discrepancy>(`/api/discrepancies/${id}/reconcile`, { method: 'POST', body: JSON.stringify(payload ?? {}) }),
    escalate: (id: string, payload?: { rootCause?: string; resolution?: string; notes?: string }) =>
      request<Discrepancy>(`/api/discrepancies/${id}/escalate`, { method: 'POST', body: JSON.stringify(payload ?? {}) }),
    maintenance: (id: string, payload?: { rootCause?: string; resolution?: string; notes?: string }) =>
      request<Discrepancy>(`/api/discrepancies/${id}/maintenance`, { method: 'POST', body: JSON.stringify(payload ?? {}) }),
  },
  disposal: {
    list: (query: { search?: string; status?: string; page?: number; size?: number }) =>
      request<PageResponse<DisposalRequest>>(withQuery('/api/disposal', query)),
    create: (payload: { assetId: string; reason: string; estimatedValue?: number; notes?: string }) =>
      request<DisposalRequest>('/api/disposal', { method: 'POST', body: JSON.stringify(payload) }),
    approve: (id: string, payload?: { notes?: string }) =>
      request<DisposalRequest>(`/api/disposal/${id}/approve`, { method: 'POST', body: JSON.stringify(payload ?? {}) }),
    reject: (id: string, payload?: { notes?: string }) =>
      request<DisposalRequest>(`/api/disposal/${id}/reject`, { method: 'POST', body: JSON.stringify(payload ?? {}) }),
    defer: (id: string, payload?: { notes?: string }) =>
      request<DisposalRequest>(`/api/disposal/${id}/defer`, { method: 'POST', body: JSON.stringify(payload ?? {}) }),
  },
  reports: {
    summary: () => request<ReportSummary>('/api/reports/summary'),
    auditLogs: (query: { search?: string; page?: number; size?: number }) =>
      request<PageResponse<AuditLog>>(withQuery('/api/reports/audit-logs', query)),
  },
  users: {
    list: (query: { search?: string; role?: string; status?: string; page?: number; size?: number }) =>
      request<PageResponse<User>>(withQuery('/api/users', query)),
    create: (payload: { username: string; name: string; email: string; role: string; departmentId: string; active: boolean; phone?: string }) =>
      request<User>('/api/users', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: { username: string; name: string; email: string; role: string; departmentId: string; active: boolean; phone?: string }) =>
      request<User>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    resetPassword: (id: string) => request<void>(`/api/users/${id}/reset-password`, { method: 'POST' }),
    toggleStatus: (id: string) => request<User>(`/api/users/${id}/toggle-status`, { method: 'POST' }),
  },
  notifications: {
    list: () => request<AppNotification[]>('/api/notifications'),
    readAll: () => request<void>('/api/notifications/read-all', { method: 'POST' }),
    read: (id: string) => request<void>(`/api/notifications/${id}/read`, { method: 'POST' }),
  },
};
