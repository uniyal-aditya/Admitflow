import { API_BASE_URL } from '@/constants/theme';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async getMe() {
    return this.get<{ user: any | null }>('/api/auth/me');
  }

  async getColleges() {
    return this.get<{ colleges: any[] }>('/api/admin/colleges');
  }

  async getNotices(params?: { type?: string; status?: string; collegeId?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.collegeId) searchParams.set('collegeId', params.collegeId);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return this.get<{ notices: any[] }>(`/api/admin/notices${query ? `?${query}` : ''}`);
  }

  async getNotice(id: string) {
    return this.get<{ notice: any }>(`/api/admin/notices/${id}`);
  }

  async getCollege(id: string) {
    return this.get<{ college: any }>(`/api/admin/colleges/${id}`);
  }

  async getCommunityPosts(params?: { page?: number; limit?: number; tag?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.tag) searchParams.set('tag', params.tag);
    const query = searchParams.toString();
    return this.get<{ posts: any[]; total: number; page: number; totalPages: number }>(
      `/api/community/posts${query ? `?${query}` : ''}`
    );
  }

  async createPost(data: { title?: string; content: string; media?: any[]; tags?: string[] }) {
    return this.post<{ post: any }>('/api/community/posts', data);
  }

  async getPostComments(postId: string) {
    return this.get<{ comments: any[] }>(`/api/community/posts/${postId}/comments`);
  }

  async createComment(postId: string, content: string, media?: any[]) {
    return this.post<{ comment: any }>(`/api/community/posts/${postId}/comments`, { content, media });
  }

  async chat(message: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Chat request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }

    return result;
  }

  async getNotifications() {
    return this.get<{ notifications: any[] }>('/api/notifications');
  }

  async subscribePush(subscription: { endpoint: string; p256dh: string; auth: string }) {
    return this.post<{ ok: boolean }>('/api/notifications/subscribe', subscription);
  }

  async getBanner() {
    return this.get<{ banner: any }>('/api/banner');
  }

  async getAdminStats() {
    return this.get<{ stats: any }>('/api/admin/stats');
  }

  async getAdminColleges() {
    return this.get<{ colleges: any[] }>('/api/admin/colleges');
  }

  async getAdminNotices() {
    return this.get<{ notices: any[] }>('/api/admin/notices');
  }

  async getAdminUsers() {
    return this.get<{ users: any[] }>('/api/admin/users');
  }

  async loginWithGoogle() {
    return `${this.baseUrl}/api/auth/google/authorize`;
  }

  async logout() {
    return this.post<{ ok: boolean }>('/api/auth/logout');
  }

  async getFavorites() {
    return this.get<{ favorites: any[] }>('/api/auth/me/favorites');
  }

  async addFavorite(collegeId: string) {
    return this.post<{ ok: boolean }>('/api/auth/me/favorites', { collegeId });
  }

  async removeFavorite(collegeId: string) {
    return this.delete<{ ok: boolean }>('/api/auth/me/favorites', { collegeId });
  }

  async getSuggestions() {
    return this.get<{ suggestions: any[] }>('/api/admin/suggestions');
  }

  async submitSuggestion(data: any) {
    return this.post<{ ok: boolean }>('/api/suggest', data);
  }

  async getSearchResults(query: string) {
    return this.get<{ notices: any[]; colleges: any[] }>(`/api/search?q=${encodeURIComponent(query)}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
