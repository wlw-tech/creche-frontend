import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token
    this.client.interceptors.request.use((config) => {
      const token = Cookies.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expiré, rediriger vers login
          Cookies.remove('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  loginAdmin(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  loginUser(email: string, password: string) {
    return this.client.post('/auth/login-user', { email, password });
  }

  // Users (Admin)
  createUser(data: any) {
    return this.client.post('/admin/users', data);
  }

  listUsers(page = 1, limit = 25) {
    return this.client.get('/admin/users', { params: { page, limit } });
  }

  // Classes (Admin)
  createClass(data: any) {
    return this.client.post('/admin/classes', data);
  }

  listClasses() {
    return this.client.get('/admin/classes');
  }

  getClassWithChildren(classeId: string) {
    return this.client.get(`/admin/classes/${classeId}/enfants`);
  }

  assignTeacherToClass(classeId: string, teacherId: string) {
    return this.client.post(`/admin/classes/${classeId}/enseignants/${teacherId}`, {});
  }

  // Presences (Teacher)
  recordPresences(data: any) {
    return this.client.post('/presences/class', data);
  }

  getPresences(classeId: string, date?: string) {
    return this.client.get('/presences', { params: { classeId, date } });
  }

  // Daily Resumes (Teacher)
  createResume(data: any) {
    return this.client.post('/daily-resumes', data);
  }

  getResumes(classeId: string, date?: string) {
    return this.client.get('/daily-resumes', { params: { classeId, date } });
  }

  // Menus (Admin)
  createMenu(data: any) {
    return this.client.post('/menus', data);
  }

  publishMenu(menuId: string) {
    return this.client.post(`/menus/${menuId}/publish`, {});
  }

  // Parent Dashboard
  getParentProfile() {
    return this.client.get('/parent/me');
  }

  getChildPresences(enfantId: string, page = 1, pageSize = 30) {
    return this.client.get(`/parent/enfants/${enfantId}/presences`, {
      params: { page, pageSize },
    });
  }

  getChildResume(enfantId: string, date?: string) {
    return this.client.get(`/parent/enfants/${enfantId}/resume`, { params: { date } });
  }

  getClassJournal(classeId: string) {
    return this.client.get(`/parent/classes/${classeId}/journal/latest`);
  }

  getClassMenu(classeId: string, date?: string) {
    return this.client.get(`/parent/classes/${classeId}/menu`, { params: { date } });
  }

  changePassword(oldPassword: string, newPassword: string) {
    return this.client.post('/parent/me/change-password', { oldPassword, newPassword });
  }
}

export const apiClient = new ApiClient();

