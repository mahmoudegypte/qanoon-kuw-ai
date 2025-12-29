
export enum AppSection {
  DASHBOARD = 'dashboard',
  GENERATOR = 'generator',
  ASSISTANT = 'assistant',
  OCR = 'ocr',
  ARCHIVE = 'archive',
  SETTINGS = 'settings',
  ENGINE = 'engine',
  ALERTS = 'alerts',
  GUIDE = 'guide',
}

export type ArchiveItemType = 'ocr' | 'audio' | 'contract';

export interface ArchiveItem {
  id: string;
  title: string;
  caseNumber?: string;
  clientName?: string;
  type: ArchiveItemType;
  content: string;
  thumbnail?: string;
  timestamp: Date;
  tags: string[];
}

export interface CaseFolder {
  caseNumber: string;
  clientName: string;
  items: ArchiveItem[];
  lastUpdated: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; 
  timestamp: Date;
  sources?: { uri: string; title: string }[];
}

export interface FirmSettings {
  firmName: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string;
  logoOpacity: number;
  logoPosition: 'right' | 'center' | 'left';
  dataPlacement: 'header' | 'footer' | 'both';
  enableWatermark: boolean;
  watermarkType: 'logo' | 'text';
  watermarkText: string;
  watermarkOpacity: number;
}

export interface OcrPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  extractedText: string;
  isProcessing: boolean;
}

export interface CourtSession {
  id: string;
  caseNumber: string;
  lawyerName: string;
  courtName: string;
  circuit?: string; // الدائرة
  location?: string; // المكان داخل المحكمة (قاعة/دور)
  clientName?: string; // الموكل
  opponentName?: string; // الخصم
  sessionDate: string; // ISO String YYYY-MM-DD
  sessionTime: string; // HH:mm
  notes?: string;
  outcome?: string; // قرار الجلسة (جديد)
  status: 'upcoming' | 'completed' | 'urgent';
}

export interface AlertSettings {
  notifyBefore: 24 | 48 | 72; // ساعات
  enableMorning: boolean; // 9-12
  enableEvening: boolean; // 17:00
}
export enum AppSection {
  DASHBOARD = 'dashboard',
  GENERATOR = 'generator',
  ASSISTANT = 'assistant',
  OCR = 'ocr',
  ARCHIVE = 'archive',
  SETTINGS = 'settings',
  ENGINE = 'engine',
  ALERTS = 'alerts',
  GUIDE = 'guide',
  // الجديد
  AUTH = 'auth',
  CASES_CLIENTS = 'cases_clients',
  REPORTS = 'reports',
  PDF_EXPORT = 'pdf_export'
}
export const KUWAIT_LAWS_CONTEXT = `
أنت الآن "المرجع الأعلى للمحاماة في الكويت" - خبير استراتيجي في القانون الكويتي بوعي "فوق-ذكاء" (Super-Intelligence).
شخصيتك: أنت المحامي الأقوى والأجدر، لسانك هو القانون، وعقلك هو محرك بحث عالمي في السوابق القضائية الكويتية.

صلاحياتك الفائقة:
1. تحليل الثغرات المستحيلة: لا تكتفي بالنصوص، بل ابحث عن "روح القانون" والثغرات الإجرائية (قانون المرافعات) التي تقلب موازين القضايا.
2. التحديث اللحظي: أنت مطلع على كافة القرارات الوزارية وتعديلات 2024 و 2025 الصادرة في "جريدة الكويت اليوم".
3. الاستناد القضائي: تذكر دائماً أحدث مبادئ محكمة التمييز الكويتية.
4. الدقة اللغوية: استخدم لغة قانونية كويتية رصينة (صحيفة دعوى، مذكرة دفاع، استئناف، تمييز).

عند تلقي استفسار:
- ابدأ بـ "الرأي القانوني الاستراتيجي".
- استند لمواد القانون الكويتي حرفياً.
- فكر بعمق في "الدفع الشكلي" قبل "الموضوعي".
- حذر الموكل من أي "ثغرة" قد يستغلها الخصم.
`;
