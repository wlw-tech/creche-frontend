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
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

    // ---- MENUS ----

  listMenus(page = 1, pageSize = 50, statut?: "Brouillon" | "Publie") {
    return this.client.get("/menus", {
      params: { page, pageSize, statut },
    });
  }

  createMenu(data: {
    date: string;
    entree: string;
    plat: string;
    dessert: string;
    allergenes: string[];
  }) {
    return this.client.post("/menus", data);
  }

  updateMenu(
    id: string,
    data: {
      entree?: string;
      plat?: string;
      dessert?: string;
      allergenes?: string[];
      statut?: "Brouillon" | "Publie";
    }
  ) {
    return this.client.patch(`/menus/${id}`, data);
  }




  publishMenu(id: string) {
    return this.client.post(`/menus/${id}/publish`, {});
  }

  deleteMenu(id: string) {
    return this.client.delete(`/menus/${id}`);
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

  listUsers() {
    return this.client.get('/admin/users');
  }

  updateUserStatus(id: string, statut: 'INVITED' | 'ACTIVE' | 'DISABLED') {
    return this.client.patch(`/admin/users/${id}/status`, { statut });
  }

  deleteUser(id: string) {
    return this.client.delete(`/admin/users/${id}`);
  }

  // ---- CLASSES (Admin) ----
  listClasses() {
    return this.client.get('/admin/classes');
  }

  createClass(data: {
    nom: string;
    capacite?: number | null;
    trancheAge?: string | null;
    active?: boolean;
  }) {
    return this.client.post('/admin/classes', data);
  }

  updateClass(
    id: string,
    data: {
      nom?: string;
      capacite?: number | null;
      trancheAge?: string | null;
      active?: boolean;
    }
  ) {
    return this.client.patch(`/admin/classes/${id}`, data);
  }

  deleteClass(id: string) {
    return this.client.delete(`/admin/classes/${id}`);
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

  // Children (Admin)
  listChildren(page = 1, pageSize = 50) {
    return this.client.get('/admin/enfants', {
      params: { page, pageSize },
    });
  }

  createChild(data: any) {
    return this.client.post('/admin/enfants', data);
  }

  listChildFamilies() {
    return this.client.get('/admin/enfants/familles');
  }

  getChild(id: string) {
    return this.client.get(`/admin/enfants/${id}`);
  }

  updateChild(id: string, data: any) {
    return this.client.patch(`/admin/enfants/${id}`, data);
  }

  deleteChild(id: string) {
    return this.client.delete(`/admin/enfants/${id}`);
  }

  updateChildStatus(id: string, statut: string) {
    return this.client.patch(`/admin/enfants/${id}/status`, { statut });
  }

  // Admin Inscriptions (protected)
  listAdminInscriptions() {
    return this.client.get('/admin/inscriptions');
  }

  getAdminInscription(id: string) {
    return this.client.get(`/admin/inscriptions/${id}`);
  }

  acceptAdminInscription(id: string) {
    return this.client.post(`/admin/inscriptions/${id}/accept`, {});
  }

  rejectAdminInscription(id: string, raison?: string) {
    return this.client.patch(`/admin/inscriptions/${id}/reject`, { raison });
  }

  updateAdminInscriptionStatus(
    id: string,
    statut: 'EN_COURS' | 'ACTIF' | 'REJETEE',
    notes?: string,
  ) {
    return this.client.patch(`/admin/inscriptions/${id}/status`, { statut, notes });
  }

  // Public Inscription (no auth required)
  createPublicInscription(data: any) {
    // Create a separate client instance without auth for public endpoints
    const publicClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicClient.post('/public/inscriptions', data);
  }
}

export const apiClient = new ApiClient();
