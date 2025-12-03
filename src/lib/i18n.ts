// src/lib/i18n.ts
export type Locale = "fr" | "ar";

export const messages = {
  fr: {
    header: {
      adminDashboard: "Dashboard Administrateur",
    },
    sidebar: {
      overview: "Vue d'ensemble",
      children: "Tous les enfants",
      registrations: "Toutes les inscriptions",
      classes: "Gestion des classes",
      menus: "Menu enfant",
      users: "Tous les utilisateurs",
      settings: "Paramètres",
      logout: "Déconnexion",
      roleAdmin: "Admin",
    },
  },
  ar: {
    header: {
      adminDashboard: "لوحة تحكم الإدارة",
    },
    sidebar: {
      overview: "نظرة عامة",
      children: "كل الأطفال",
      registrations: "جميع التسجيلات",
      classes: "إدارة الفصول",
      menus: "قائمة الأطفال",
      users: "جميع المستخدمين",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      roleAdmin: "إدارة",
    },
  },
} as const;

export type Messages = typeof messages;
export type Translation = Messages["fr"];
