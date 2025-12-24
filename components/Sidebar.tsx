
import React, { useRef } from 'react';
import { LayoutDashboard, FileText, Bot, ScanText, Scale, Settings, Archive, Download, Upload, Zap, X, Gavel } from 'lucide-react';
import { AppSection } from '../types';

interface SidebarProps {
  currentSection: AppSection;
  setSection: (section: AppSection) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentSection, setSection, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: AppSection.DASHBOARD, label: 'الرئيسية', icon: LayoutDashboard },
    { id: AppSection.ALERTS, label: 'أجندة المحاكم', icon: Gavel },
    { id: AppSection.OCR, label: 'تحويل المستندات', icon: ScanText },
    { id: AppSection.ASSISTANT, label: 'المساعد الذكي', icon: Bot },
    { id: AppSection.GENERATOR, label: 'صياغة العقود', icon: FileText },
    { id: AppSection.ARCHIVE, label: 'خزانة الملفات', icon: Archive },
    { id: AppSection.GUIDE, label: 'دليل النظام', icon: Zap },
    { id: AppSection.SETTINGS, label: 'إعدادات المكتب', icon: Settings },
    { id: AppSection.ENGINE, label: 'إعدادات المحرك', icon: Zap },
  ];

  // وظيفة حفظ النسخة الاحتياطية (Export)
  const handleExportBackup = () => {
    const backupKeys = [
      'court_sessions',
      'alert_settings',
      'legal_archive',
      'lawFirmSettings',
      'preferred_legal_model',
      'theme'
    ];
    
    const backupData: Record<string, string | null> = {};
    backupKeys.forEach(key => {
      backupData[key] = localStorage.getItem(key);
    });

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qanoon_ai_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // وظيفة استعادة النسخة الاحتياطية (Import)
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (typeof data !== 'object') throw new Error("الملف غير صالح");

        Object.entries(data).forEach(([key, value]) => {
          if (value !== null) {
            localStorage.setItem(key, value as string);
          }
        });

        alert("تمت استعادة كافة البيانات والملفات بنجاح! سيتم الآن تحديث النظام.");
        window.location.reload();
      } catch (err) {
        alert("فشل في قراءة ملف النسخ الاحتياطي. تأكد من صحة الملف.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full bg-navy-900 text-white h-screen flex flex-col shadow-2xl relative overflow-visible">
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-4 left-4 p-2 bg-navy-800 rounded-full text-white hover:bg-navy-700 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 flex items-center gap-3 border-b border-navy-800 bg-navy-950/40">
        <div className="bg-gold-500 p-2 rounded-xl shadow-lg shadow-gold-500/20 shrink-0">
           <Scale className="w-6 h-6 text-navy-900" />
        </div>
        <div className="min-w-0 text-right">
          <h1 className="text-xl font-black tracking-tight text-white truncate">القانوني AI</h1>
          <p className="text-[10px] text-gold-500 font-bold uppercase tracking-widest truncate">نظام الكويت المتكامل</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gold-600 text-white shadow-xl shadow-gold-600/30 scale-[1.02]' 
                  : 'text-gray-400 hover:bg-navy-800/60 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 bg-navy-950/95 border-t border-navy-800/50 space-y-4 relative">
        <div className="grid grid-cols-2 gap-2">
           <button 
            onClick={handleExportBackup} 
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black text-gray-500 border border-navy-800 hover:bg-navy-800 hover:text-white transition-all shadow-sm"
           >
             <Download className="w-3 h-3" /> حفظ النسخة
           </button>
           <button 
            onClick={() => fileInputRef.current?.click()} 
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black text-gray-500 border border-navy-800 hover:bg-navy-800 hover:text-white transition-all shadow-sm"
           >
             <Upload className="w-3 h-3" /> استعادة
           </button>
           <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json" 
            onChange={handleImportBackup}
           />
        </div>
        <div className="text-center pt-1 border-t border-navy-800/30">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">م/ محمود السيسى</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
