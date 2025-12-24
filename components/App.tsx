
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import DocumentGenerator from './DocumentGenerator';
import SmartAssistant from './SmartAssistant';
import OCRTool from './OCRTool';
import Archive from './Archive';
import Settings from './Settings';
import EngineSettings from './EngineSettings';
import CourtAlerts from './CourtAlerts';
import GuideArticle from './GuideArticle';
import { AppSection, CourtSession, AlertSettings } from '../types';
import { Moon, Sun, Menu, Scale, Bell } from 'lucide-react';

function App() {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // نظام التنبيهات
  useEffect(() => {
    const checkAlerts = () => {
      const storedSessions = localStorage.getItem('court_sessions');
      const storedSettings = localStorage.getItem('alert_settings');
      if (!storedSessions || !storedSettings) return;

      const sessions: CourtSession[] = JSON.parse(storedSessions);
      const settings: AlertSettings = JSON.parse(storedSettings);
      const now = new Date();
      const currentHour = now.getHours();

      const isMorningSlot = settings.enableMorning && (currentHour >= 9 && currentHour < 12);
      const isEveningSlot = settings.enableEvening && (currentHour >= 17 && currentHour < 18);

      if (!isMorningSlot && !isEveningSlot) return;

      const lastAlertDate = localStorage.getItem('last_alert_date');
      const todayStr = now.toDateString() + (isMorningSlot ? '_AM' : '_PM');
      if (lastAlertDate === todayStr) return;

      const upcomingSessions = sessions.filter(s => {
        const sessionDate = new Date(s.sessionDate);
        const diffTime = sessionDate.getTime() - now.getTime();
        const diffHours = diffTime / (1000 * 3600);
        return diffHours > 0 && diffHours <= (settings.notifyBefore + 12); 
      });

      if (upcomingSessions.length > 0) {
        const msg = `تذكير: لديك ${upcomingSessions.length} جلسات محكمة خلال الـ ${settings.notifyBefore} ساعة القادمة.`;
        setNotificationMsg(msg);
        setTimeout(() => setNotificationMsg(null), 8000);
        if (Notification.permission === "granted") {
           new Notification("تنبيهات المحاكم - القانوني AI", { body: msg });
        }
        localStorage.setItem('last_alert_date', todayStr);
      }
    };
    const interval = setInterval(checkAlerts, 60000);
    checkAlerts();
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleSectionChange = (section: AppSection) => {
    setCurrentSection(section);
    setIsSidebarOpen(false);
  };

  const renderSection = () => {
    switch (currentSection) {
      case AppSection.DASHBOARD: return <Dashboard setSection={handleSectionChange} />;
      case AppSection.GENERATOR: return <DocumentGenerator />;
      case AppSection.ASSISTANT: return <SmartAssistant />;
      case AppSection.OCR: return <OCRTool />;
      case AppSection.ARCHIVE: return <Archive />;
      case AppSection.SETTINGS: return <Settings />;
      case AppSection.ENGINE: return <EngineSettings />;
      case AppSection.ALERTS: return <CourtAlerts />;
      case AppSection.GUIDE: return <GuideArticle />;
      default: return <Dashboard setSection={handleSectionChange} />;
    }
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-navy-900 font-sans relative`} dir="rtl">
      
      {notificationMsg && (
        <div className="fixed top-24 left-6 z-[100] animate-bounce-in">
           <div className="bg-navy-900 text-white p-6 rounded-2xl shadow-2xl border-r-4 border-gold-500 flex items-center gap-4 max-w-sm">
              <div className="bg-gold-500 p-3 rounded-full animate-pulse"><Bell className="w-6 h-6 text-navy-900" /></div>
              <div>
                 <h4 className="font-black text-sm mb-1 text-gold-500">تنبيه قضائي عاجل</h4>
                 <p className="text-xs font-medium opacity-90">{notificationMsg}</p>
              </div>
           </div>
        </div>
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 right-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Sidebar currentSection={currentSection} setSection={handleSectionChange} onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-navy-900">
        
        {/* Header - Final Engineered Version */}
        <header className="bg-white dark:bg-navy-800 border-b-2 border-gray-100 dark:border-navy-700 h-16 sm:h-20 w-full shadow-lg z-[40] sticky top-0 print:hidden transition-colors duration-300">
          <div className="flex items-center justify-between w-full h-full px-4 sm:px-8 max-w-[100vw]">
            
            {/* جهة اليمين: اللوجو */}
            <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="lg:hidden p-2.5 text-navy-900 dark:text-white bg-gray-100 dark:bg-navy-700 rounded-xl hover:bg-gray-200 transition-all flex-shrink-0"
                aria-label="القائمة"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div 
                className="flex items-center gap-2 cursor-pointer group flex-shrink-0" 
                onClick={() => handleSectionChange(AppSection.DASHBOARD)}
              >
                <Scale className="w-6 h-6 sm:w-8 sm:h-8 text-gold-500 transition-transform group-hover:rotate-12" />
                <span className="font-black text-navy-900 dark:text-white text-base sm:text-2xl whitespace-nowrap tracking-tight">القانوني AI</span>
              </div>
            </div>

            {/* جهة اليسار: أدوات التواصل (حقن SVG مباشر) */}
            <div className="flex items-center gap-3 sm:gap-5 flex-nowrap flex-shrink-0">
              
              {/* زر فيسبوك - SVG مباشر محقون */}
              <a 
                href="https://www.facebook.com/2019sissi_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#1877F2] rounded-xl sm:rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all flex-shrink-0 border-2 border-white dark:border-navy-700"
                title="Facebook"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 16.9913 5.65684 21.1283 10.4375 21.8785V14.8906H7.89844V12H10.4375V9.79688C10.4375 7.29063 11.9305 5.90625 14.2148 5.90625C15.3086 5.90625 16.4531 6.10156 16.4531 6.10156V8.5625H15.1922C13.95 8.5625 13.5625 9.33359 13.5625 10.1242V12H16.3359L15.8926 14.8906H13.5625V21.8785C18.3432 21.1283 22 16.9913 22 12Z" />
                </svg>
              </a>

              {/* زر واتساب - SVG مباشر محقون */}
              <a 
                href="https://wa.me/201000111428" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#25D366] rounded-xl sm:rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all flex-shrink-0 border-2 border-white dark:border-navy-700"
                title="WhatsApp"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>

              {/* فاصل عمودي مرئي */}
              <div className="w-[1px] h-8 bg-gray-200 dark:bg-navy-700 mx-1 flex-shrink-0"></div>

              {/* زر تبديل الوضع الليلي */}
              <button 
                onClick={toggleDarkMode}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-100 dark:bg-navy-900 text-navy-800 dark:text-gold-500 rounded-xl sm:rounded-2xl border-2 border-transparent hover:border-gold-500 shadow-sm transition-all flex-shrink-0"
                aria-label="تبديل الوضع"
              >
                {isDarkMode ? <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

            </div>

          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
           {renderSection()}
        </div>
      </main>
    </div>
  );
}

export default App;
