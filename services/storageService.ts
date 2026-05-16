
import { CourtSession, ArchiveItem, ServerConfig } from '../types';

/**
 * خدمة التخزين الذكية:
 * تقوم بالتخزين المحلي كنسخة احتياطية، 
 * وإذا تم تفعيل السيرفر تقوم بالمزامنة معه.
 */

const getServiceConfig = (): ServerConfig | null => {
  const saved = localStorage.getItem('db_config');
  return saved ? JSON.parse(saved) : null;
};

export const StorageService = {
  // جلب الجلسات
  getSessions: async (): Promise<CourtSession[]> => {
    const config = getServiceConfig();
    if (config?.isActive && config.apiUrl) {
      try {
        const response = await fetch(`${config.apiUrl}/sessions?key=${config.dbPass}`);
        if (response.ok) return await response.json();
      } catch (e) { console.warn("Server fetch failed, using local fallback"); }
    }
    const local = localStorage.getItem('court_sessions');
    return local ? JSON.parse(local) : [];
  },

  // حفظ الجلسات
  saveSessions: async (sessions: CourtSession[]) => {
    localStorage.setItem('court_sessions', JSON.stringify(sessions));
    const config = getServiceConfig();
    if (config?.isActive && config.apiUrl) {
      try {
        await fetch(`${config.apiUrl}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessions, key: config.dbPass })
        });
      } catch (e) { console.error("Sync to server failed"); }
    }
  },

  // جلب الأرشيف
  getArchive: async (): Promise<ArchiveItem[]> => {
    const config = getServiceConfig();
    if (config?.isActive && config.apiUrl) {
      try {
        const response = await fetch(`${config.apiUrl}/archive?key=${config.dbPass}`);
        if (response.ok) {
           const data = await response.json();
           return data.map((i: any) => ({ ...i, timestamp: new Date(i.timestamp) }));
        }
      } catch (e) { console.warn("Server archive fetch failed"); }
    }
    const local = localStorage.getItem('legal_archive');
    if (!local) return [];
    return JSON.parse(local).map((i: any) => ({ ...i, timestamp: new Date(i.timestamp) }));
  },

  // حفظ في الأرشيف
  saveToArchive: async (item: ArchiveItem) => {
    const current = await StorageService.getArchive();
    const updated = [item, ...current];
    localStorage.setItem('legal_archive', JSON.stringify(updated));
    
    const config = getServiceConfig();
    if (config?.isActive && config.apiUrl) {
      try {
        await fetch(`${config.apiUrl}/archive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item, key: config.dbPass })
        });
      } catch (e) { console.error("Sync archive to server failed"); }
    }
  },

  // مسح عنصر من الأرشيف
  deleteFromArchive: async (id: string) => {
    const current = await StorageService.getArchive();
    const updated = current.filter(i => i.id !== id);
    localStorage.setItem('legal_archive', JSON.stringify(updated));
    // مزامنة الحذف مع السيرفر
  }
};
