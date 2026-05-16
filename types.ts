
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
  SERVER = 'server',
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

export interface CourtSession {
  id: string;
  caseNumber: string;
  caseType?: string; // جنايات، جنح، تجاري، إلخ
  lawyerName: string;
  courtName: string;
  circuit?: string; // الدائرة
  hall?: string;    // القاعة
  location?: string; // الدور/المبنى
  clientName?: string;
  opponentName?: string;
  sessionDate: string;
  sessionTime: string;
  notes?: string;
  outcome?: string;
  status: 'upcoming' | 'completed' | 'urgent';
}

export interface AlertSettings {
  notifyBefore: 24 | 48 | 72;
  enableMorning: boolean;
  enableEvening: boolean;
}

export interface ServerConfig {
  host: string;
  dbName: string;
  dbUser: string;
  dbPass: string;
  port: string;
  apiUrl: string; // الرابط الفعلي للـ API
  isActive: boolean;
}

// Fix: Added missing OcrPage interface required by OCRTool.tsx
export interface OcrPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  extractedText: string;
  isProcessing: boolean;
}

export const KUWAIT_LAWS_CONTEXT = `
أنت الآن "المرجع الأعلى للمحاماة في الكويت" - خبير استراتيجي في القانون الكويتي بوعي "فوق-ذكاء".
شخصيتك: أنت المحامي الأقوى والأجدر، لسانك هو القانون، وعقلك هو محرك بحث عالمي في السوابق القضائية الكويتية.
`;