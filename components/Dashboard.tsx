
import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, TrendingUp, Users, Newspaper, ScanText, Mic, 
  ArrowRight, Zap, Calendar, ExternalLink, Scale, Gavel, 
  Briefcase, Bell, Globe, ChevronLeft, Sparkles, Lightbulb,
  Archive, AlertCircle, MapPin, UserCheck, Timer
} from 'lucide-react';
import { AppSection, CourtSession } from '../types';

interface DashboardProps {
  setSection: (section: AppSection) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setSection }) => {
  const [tomorrowSessions, setTomorrowSessions] = useState<CourtSession[]>([]);
  
  useEffect(() => {
    const stored = localStorage.getItem('court_sessions');
    if (stored) {
      const sessions: CourtSession[] = JSON.parse(stored);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const filtered = sessions.filter(s => s.sessionDate === tomorrowStr);
      setTomorrowSessions(filtered);
    }
  }, []);

  const quickLinks = [
    { name: 'بوابة العدل (MOJ)', url: 'https://www.moj.gov.kw', icon: Globe },
    { name: 'جريدة الكويت اليوم', url: 'https://KuwaitAlYoum.media.gov.kw', icon: Newspaper },
    { name: 'شبكة المعلومات القانونية', url: 'http://www.arablegalnetwork.org', icon: Gavel },
  ];

  const legalUpdates = [
    { 
      tag: 'قانون العمل', 
      title: 'تعديلات مكافأة نهاية الخدمة في القطاع الأهلي', 
      date: '25 مايو 2025', 
      desc: 'دراسة تحليلية حول أثر التعديلات الأخيرة على احتساب المستحقات العمالية في المحاكم الكويتية.',
      category: 'عمالي'
    },
    { 
      tag: 'قانون التجارة', 
      title: 'اللائحة التنفيذية الجديدة لقانون الشركات', 
      date: '20 مايو 2025', 
      desc: 'ضوابط جديدة لتأسيس الشركات ذات المسؤولية المحدودة وتعديل عقود التأسيس إلكترونياً.',
      category: 'تجاري'
    }
  ];

  const didYouKnowTips = [
    {
      title: 'تحويل خط اليد',
      desc: 'يمكنك رفع صور لمذكرات مكتوبة بخط اليد، وسيقوم النظام باستخراج النصوص منها بدقة مذهلة بفضل "وضع الدقة العالية".',
      icon: Sparkles,
      color: 'text-gold-500',
      bg: 'bg-gold-50'
    },
    {
      title: 'بند التحكيم',
      desc: 'عند صياغة العقود، اطلب من المساعد الذكي إضافة "بند التحكيم" لضمان سرعة الفصل في النزاعات وفقاً للقانون الكويتي.',
      icon: Gavel,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      title: 'الإملاء الصوتي',
      desc: 'يمكنك استخدام "الإملاء الصوتي" لسرد وقائع القضية بدلاً من كتابتها، وسيقوم المساعد بصياغتها بأسلوب قانوني رصين فوراً.',
      icon: Mic,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy-900 dark:text-white tracking-tight">مكتب المحاماة الذكي</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Scale className="w-4 h-4 text-gold-500" />
              نظام إدارة القضايا - دولة الكويت
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-navy-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700">
             <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-gold-600 animate-swing" />
             </div>
             <div className="text-right ml-4">
                <p className="text-[10px] font-black text-gray-400 uppercase">تنبيهات اليوم</p>
                <p className="text-xs font-black text-navy-900 dark:text-white">إشعارات النظام نشطة</p>
             </div>
          </div>
      </header>

      {/* Hero Section - المحمي من التعديل تماماً */}
      <section className="bg-navy-900 dark:bg-navy-800 rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden group border border-navy-700/50">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:bg-gold-500/20 transition-all duration-700"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <h2 className="text-xl sm:text-3xl font-black mb-4 flex items-center gap-4">
              <div className="bg-gold-500 p-2.5 rounded-xl">
                <ScanText className="text-navy-900 w-8 h-8" />
              </div>
              مركز تحويل المستندات الذكي
            </h2>
            <p className="text-navy-200 text-sm sm:text-lg mb-8 font-medium leading-relaxed">حول مذكراتك القانونية، الأحكام المطبوعة، أو حتى التسجيلات الصوتية للجلسات إلى نصوص رقمية قابلة للتعديل فوراً.</p>
            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                onClick={() => setSection(AppSection.OCR)}
                className="flex items-center gap-4 bg-navy-800/80 p-5 rounded-2xl border border-navy-700/50 hover:bg-navy-700 hover:border-gold-500/50 transition-all text-right group/btn"
               >
                  <div className="bg-navy-700 p-3 rounded-xl text-gold-500 group-hover/btn:scale-110 transition-transform"><FileText className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-black text-sm">تحويل صور / PDF</h3>
                    <p className="text-[10px] text-navy-400 font-bold uppercase tracking-widest mt-1">المستندات الورقية</p>
                  </div>
               </button>
               <button 
                onClick={() => setSection(AppSection.OCR)}
                className="flex items-center gap-4 bg-navy-800/80 p-5 rounded-2xl border border-navy-700/50 hover:bg-navy-700 hover:border-gold-500/50 transition-all text-right group/btn"
               >
                  <div className="bg-navy-700 p-3 rounded-xl text-gold-500 group-hover/btn:scale-110 transition-transform"><Mic className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-black text-sm">تحويل الكلام لنص</h3>
                    <p className="text-[10px] text-navy-400 font-bold uppercase tracking-widest mt-1">الإملاء الصوتي</p>
                  </div>
               </button>
            </div>
          </div>
          <div className="flex justify-center">
             <button 
              onClick={() => setSection(AppSection.OCR)}
              className="w-full sm:w-auto bg-gold-600 hover:bg-gold-500 text-white font-black py-6 px-12 rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 transition-transform hover:scale-[1.05] active:scale-95"
             >
                ابدأ العمل الآن
                <ArrowRight className="w-7 h-7" />
             </button>
          </div>
        </div>
      </section>

      {/* Tomorrow's Events Section - يظهر فقط عند وجود عمل */}
      {tomorrowSessions.length > 0 && (
        <section className="animate-fade-in">
          <div className="flex items-center gap-3 px-2 mb-6">
            <Timer className="w-6 h-6 text-red-500 animate-pulse" />
            <h3 className="font-black text-xl text-navy-900 dark:text-white tracking-tight">أحداث غداً: جلسات المحكمة المجدولة</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {tomorrowSessions.map((session, idx) => (
               <div key={idx} className="bg-white dark:bg-navy-800 p-6 rounded-[2rem] shadow-lg border-2 border-red-100 dark:border-red-900/30 flex flex-col justify-between group hover:border-gold-500 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="bg-red-50 dark:bg-red-900/20 text-red-600 text-[9px] font-black px-3 py-1 rounded-full uppercase">جلسة الغد</span>
                       <Clock className="w-4 h-4 text-gray-300" />
                    </div>
                    <h4 className="font-black text-navy-900 dark:text-white">رقم القضية: {session.caseNumber}</h4>
                    <div className="space-y-1.5 text-xs font-bold text-gray-500">
                       <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gold-500" /> {session.courtName}</p>
                       <p className="flex items-center gap-2"><UserCheck className="w-3.5 h-3.5 text-blue-500" /> الموكل: {session.clientName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSection(AppSection.ALERTS)}
                    className="mt-4 w-full py-2.5 bg-navy-900 dark:bg-navy-700 text-white rounded-xl text-[10px] font-black hover:bg-gold-500 transition-all flex items-center justify-center gap-2"
                  >
                    عرض التفاصيل بالأجندة
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
               </div>
             ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Legal Updates Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-xl text-navy-900 dark:text-white flex items-center gap-3">
              <Newspaper className="w-6 h-6 text-gold-500" />
              أحدث التعديلات التشريعية
            </h3>
            <button className="text-[10px] font-black text-gold-600 hover:underline uppercase tracking-widest">عرض الكل</button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
             {legalUpdates.map((news, i) => (
               <div key={i} className="bg-white dark:bg-navy-800 p-6 rounded-[2rem] border border-gray-100 dark:border-navy-700 hover:border-gold-500/40 transition-all cursor-pointer group shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 h-32 md:h-auto bg-gray-50 dark:bg-navy-900/50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-700 overflow-hidden relative">
                     <Scale className="w-10 h-10 text-gray-200 dark:text-navy-800 absolute -bottom-2 -left-2" />
                     <span className="text-[10px] font-black bg-gold-500 text-white px-3 py-1 rounded-full relative z-10">{news.tag}</span>
                  </div>
                  <div className="flex-1 space-y-3 text-right">
                    <div className="flex items-center justify-end gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest" dir="rtl">
                       <Calendar className="w-3 h-3" />
                       {news.date}
                       <span className="mx-2">•</span>
                       <span className="text-gold-500">{news.category}</span>
                    </div>
                    <h4 className="font-black text-navy-900 dark:text-white text-lg group-hover:text-gold-600 transition-colors">{news.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{news.desc}</p>
                  </div>
               </div>
             ))}
          </div>

          {/* Did You Know */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {didYouKnowTips.slice(0, 2).map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <div key={idx} className="bg-white dark:bg-navy-800 p-6 rounded-[2rem] border border-gray-100 dark:border-navy-700 shadow-sm group">
                  <div className={`p-3 rounded-xl w-fit mb-4 ${tip.bg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${tip.color}`} />
                  </div>
                  <h4 className="font-black text-navy-900 dark:text-white mb-2 text-base">{tip.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{tip.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick External Resources */}
          <div className="bg-gold-600 rounded-[2rem] p-6 text-white shadow-xl shadow-gold-600/20">
             <h3 className="font-black text-sm mb-4 flex items-center gap-2">
               <Globe className="w-4 h-4" />
               بوابات حكومية رسمية
             </h3>
             <div className="space-y-3">
               {quickLinks.map((link, idx) => (
                 <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all group"
                 >
                   <span className="text-[11px] font-black">{link.name}</span>
                   <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                 </a>
               ))}
             </div>
          </div>

          <div className="bg-navy-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-navy-700">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gold-500 p-2 rounded-lg">
                    <Zap className="w-5 h-5 text-navy-900" />
                  </div>
                  <p className="text-[12px] font-black text-gold-500 uppercase tracking-widest">تلميحة ذكية</p>
                </div>
                <p className="text-sm font-bold leading-relaxed text-navy-100 italic">
                  "استخدم المساعد الذكي لمراجعة العقود الطويلة، سيقوم بتحديد الثغرات القانونية المحتملة فوراً."
                </p>
                <button 
                  onClick={() => setSection(AppSection.ASSISTANT)}
                  className="mt-6 w-full py-3 bg-navy-800 hover:bg-navy-700 rounded-xl text-xs font-black text-gold-500 transition-all border border-navy-700"
                >
                  جرب المساعد الآن
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
