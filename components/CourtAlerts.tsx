
import React, { useState, useEffect } from 'react';
import { CourtSession, AlertSettings, ArchiveItem } from '../types';
import { generateSessionChecklist } from '../services/geminiService';
import { 
  Calendar, MapPin, User, Trash2, Plus, Gavel, Edit, 
  CalendarPlus, Sparkles, ClipboardList, Save, X, 
  BrainCircuit, Loader2, Clock, ShieldCheck, BellOff, Bell,
  UserCheck, Users, Landmark, Printer, ArrowLeftRight, 
  CheckCircle2, AlertTriangle, FileText, Forward, FileDown
} from 'lucide-react';

const KUWAIT_COURTS = [
  "قصر العدل (مدينة الكويت)",
  "محكمة الاستئناف",
  "محكمة التمييز",
  "المحكمة الدستورية",
  "محكمة الأسرة (الكويت)",
  "مجمع محاكم حولي",
  "مجمع محاكم الفروانية",
  "مجمع محاكم الأحمدي",
  "مجمع محاكم الجهراء",
  "مجمع محاكم مبارك الكبير",
  "المحكمة الكلية",
  "محكمة الرقعي",
  "إدارة الخبراء"
];

const CourtAlerts: React.FC = () => {
  const [sessions, setSessions] = useState<CourtSession[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    notifyBefore: 24,
    enableMorning: true,
    enableEvening: true
  });
  
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // حقول النموذج
  const [caseNumber, setCaseNumber] = useState('');
  const [lawyerName, setLawyerName] = useState('');
  const [clientName, setClientName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [courtName, setCourtName] = useState(KUWAIT_COURTS[0]);
  const [location, setLocation] = useState(''); 
  const [circuit, setCircuit] = useState(''); 
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'completed' | 'urgent'>('upcoming');

  useEffect(() => {
    const stored = localStorage.getItem('court_sessions');
    if (stored) setSessions(JSON.parse(stored));
    const storedSettings = localStorage.getItem('alert_settings');
    if (storedSettings) setAlertSettings(JSON.parse(storedSettings));
  }, []);

  const handleRequestPermission = async () => {
    if (typeof Notification === 'undefined') {
      alert("متصفحك لا يدعم التنبيهات المكتبية.");
      return;
    }
    
    // إذا كان الإذن ممنوحاً بالفعل، أظهر إشعاراً تجريبياً فقط
    if (Notification.permission === 'granted') {
      new Notification("القانوني AI", {
        body: "تنبيهاتك مفعلة بالفعل ونظام الأجندة يراقب مواعيدك.",
        icon: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        new Notification("تم التفعيل بنجاح", {
          body: "شكراً لك! ستصلك تنبيهات الجلسات القضائية القادمة هنا.",
          icon: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png"
        });
      } else if (permission === 'denied') {
        alert("يرجى السماح بالتنبيهات من إعدادات المتصفح (القفل بجوار العنوان) لتصلك مواعيد الجلسات.");
      }
    } catch (error) {
      console.error("فشل طلب إذن التنبيهات:", error);
    }
  };

  const saveSessions = (newSessions: CourtSession[]) => {
    setSessions(newSessions);
    localStorage.setItem('court_sessions', JSON.stringify(newSessions));
  };

  const handleAddSession = () => {
    if (!caseNumber || !sessionDate) return alert("يرجى إدخال رقم القضية وتاريخ الجلسة");
    
    const newSession: CourtSession = {
      id: editId || Date.now().toString(),
      caseNumber,
      lawyerName,
      clientName,
      opponentName,
      courtName,
      location,
      circuit,
      sessionDate,
      sessionTime,
      notes,
      outcome,
      status
    };

    if (editId) {
      saveSessions(sessions.map(s => s.id === editId ? newSession : s));
    } else {
      saveSessions([newSession, ...sessions]);
    }
    resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setCaseNumber('');
    setLawyerName('');
    setClientName('');
    setOpponentName('');
    setCourtName(KUWAIT_COURTS[0]);
    setLocation('');
    setCircuit('');
    setSessionDate('');
    setSessionTime('09:00');
    setNotes('');
    setOutcome('');
    setStatus('upcoming');
    setIsFormOpen(false);
  };

  const deleteSession = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الجلسة؟")) {
      saveSessions(sessions.filter(s => s.id !== id));
    }
  };

  const postponeSession = (session: CourtSession) => {
    setEditId(null);
    setCaseNumber(session.caseNumber);
    setLawyerName(session.lawyerName);
    setClientName(session.clientName || '');
    setOpponentName(session.opponentName || '');
    setCourtName(session.courtName);
    setLocation(session.location || '');
    setCircuit(session.circuit || '');
    setSessionDate('');
    setSessionTime('09:00');
    setNotes(`تأجيل للجلسة القادمة - القيد السابق: ${session.sessionDate}`);
    setOutcome('');
    setStatus('upcoming');
    setIsFormOpen(true);
  };

  const transferToArchive = (session: CourtSession) => {
    if (!session.outcome) return alert("يرجى تدوين قرار الجلسة أولاً قبل الترحيل.");
    const newItem: ArchiveItem = {
      id: Date.now().toString(),
      title: `قرار جلسة: ${session.caseNumber}`,
      caseNumber: session.caseNumber,
      clientName: session.clientName,
      type: 'contract',
      content: `تقرير جلسة قضائية\nرقم القضية: ${session.caseNumber}\nالمحكمة: ${session.courtName}\nالقرار: ${session.outcome}`,
      timestamp: new Date(),
      tags: ['جلسة محكمة', 'ترحيل آلي']
    };
    const currentArchive = JSON.parse(localStorage.getItem('legal_archive') || '[]');
    localStorage.setItem('legal_archive', JSON.stringify([newItem, ...currentArchive]));
    alert("تم ترحيل البيانات للأرشيف بنجاح.");
  };

  const printFullAgenda = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>أجندة الجلسات القضائية الكاملة</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
            body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 4px solid #d97706; padding-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: right; font-size: 14px; }
            th { background-color: #0f172a; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 40px; text-align: left; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>اجندة المحكمة ونظام التنبيهات</h1>
            <p>تقرير الجلسات المجدولة الصادر بتاريخ: ${new Date().toLocaleDateString('ar-KW')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>رقم القضية</th>
                <th>المحكمة / الدائرة</th>
                <th>التاريخ والوقت</th>
                <th>الموكل</th>
                <th>الخصم</th>
                <th>القرار</th>
              </tr>
            </thead>
            <tbody>
              ${sessions.map(s => `
                <tr>
                  <td><b>${s.caseNumber}</b></td>
                  <td>${s.courtName}<br/><small>${s.circuit || '-'}</small></td>
                  <td>${s.sessionDate}<br/>${s.sessionTime}</td>
                  <td>${s.clientName || '-'}</td>
                  <td>${s.opponentName || '-'}</td>
                  <td>${s.outcome || '<i>في انتظار القرار</i>'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">القانوني AI - نظام الإدارة القانونية المتقدم</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintSession = (session: CourtSession) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head><style>@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap'); body { font-family: 'Tajawal', sans-serif; padding: 50px; }</style></head>
        <body>
          <h2 style="text-align: center; border-bottom: 2px solid #d97706; padding-bottom: 10px;">محضر جلسة قضائية منفردة</h2>
          <div style="margin-top: 30px; font-size: 18px; line-height: 2;">
            <p><b>رقم القضية:</b> ${session.caseNumber}</p>
            <p><b>المحكمة:</b> ${session.courtName} - <b>الدائرة:</b> ${session.circuit}</p>
            <p><b>المكان:</b> ${session.location || 'غير محدد'}</p>
            <p><b>الموكل:</b> ${session.clientName} / <b>الخصم:</b> ${session.opponentName}</p>
            <p><b>التاريخ:</b> ${session.sessionDate} - <b>الوقت:</b> ${session.sessionTime}</p>
            <p><b>المحامي المسؤول:</b> ${session.lawyerName}</p>
            <hr/>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 10px;">
              <h3 style="margin-top: 0;">قرار الجلسة / منطوق الحكم:</h3>
              <p>${session.outcome || 'لم يتم تدوين قرار بعد'}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in bg-gray-50 dark:bg-navy-900 min-h-screen" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-navy-800 p-6 rounded-[2rem] shadow-xl border border-gray-100 dark:border-navy-700">
        <div className="flex items-center gap-4">
           <div className="bg-navy-900 p-3 rounded-2xl shadow-lg border border-gold-500/20">
             <Gavel className="w-6 h-6 text-gold-500" />
           </div>
           <div>
             <h2 className="text-xl font-black text-navy-900 dark:text-white">اجندة المحكمة ونظام التنبيهات بالذكاء الصناعي</h2>
             <p className="text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">الإدارة الاستباقية للمواعيد والقرارات</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={printFullAgenda}
            className="bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-navy-200 transition-all border border-navy-200 dark:border-navy-600"
          >
            <Printer className="w-4 h-4" />
            طباعة الأجندة كاملة
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-navy-900 dark:bg-gold-600 text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            إضافة جلسة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-navy-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-navy-700">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-sm text-navy-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold-500" />
                  حالة التنبيه الآلي
                </h3>
                <button 
                  onClick={handleRequestPermission}
                  className={`p-2.5 rounded-xl transition-all shadow-md ${permissionStatus === 'granted' ? 'bg-gold-500 text-white' : 'bg-gray-100 text-gray-400 animate-pulse'}`}
                  title={permissionStatus === 'granted' ? "التنبيهات مفعلة" : "اضغط لتفعيل التنبيهات"}
                >
                  {permissionStatus === 'granted' ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </button>
             </div>
             
             <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">توقيت التذكير الاستباقي</p>
                <div className="grid grid-cols-3 gap-2">
                  {[24, 48, 72].map(h => (
                    <button 
                      key={h} 
                      onClick={() => setAlertSettings({...alertSettings, notifyBefore: h as any})}
                      className={`py-3 rounded-xl font-black text-[10px] border-2 transition-all ${alertSettings.notifyBefore === h ? 'border-gold-500 bg-gold-50 text-gold-600' : 'border-gray-50 dark:border-navy-700 text-gray-400 hover:border-gold-300'}`}
                    >
                      {h} ساعة
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="bg-navy-900 rounded-[2rem] p-6 text-white border border-navy-700 shadow-2xl">
             <h4 className="font-black text-gold-500 mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
               <BrainCircuit className="w-4 h-4" />
               المستشار الذكي
             </h4>
             <p className="text-xs font-bold leading-relaxed opacity-70 italic">
               "سيتم ترحيل القرارات المعتمدة آلياً إلى خزانة الملفات لضمان عدم ضياع أي معلومة قضائية."
             </p>
          </div>
        </div>

        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-6">
           {sessions.length === 0 ? (
             <div className="bg-white dark:bg-navy-800 rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100 dark:border-navy-700">
                <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-black text-navy-900 dark:text-white">الأجندة خالية</h3>
                <p className="text-gray-400 font-bold mt-2">ابدأ بإدراج جلساتك القضائية لتفعيل نظام التنبيهات.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                {sessions.map(session => (
                  <div key={session.id} className="bg-white dark:bg-navy-800 rounded-[2.5rem] p-7 shadow-xl border border-gray-100 dark:border-navy-700 hover:shadow-2xl transition-all group relative overflow-hidden">
                     <div className={`absolute top-0 left-0 w-2 h-full ${session.status === 'urgent' ? 'bg-red-500' : session.status === 'completed' ? 'bg-green-500' : 'bg-gold-500'}`}></div>
                     
                     <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                           <div className="flex flex-wrap items-center gap-3">
                              <span className="bg-navy-900 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight">{session.courtName}</span>
                              <span className="text-gold-600 font-black text-lg">رقم القضية: {session.caseNumber}</span>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold bg-gray-50 dark:bg-navy-900/40 p-5 rounded-[2rem] border dark:border-navy-700">
                              <div className="flex items-center gap-2.5">
                                 <UserCheck className="w-4 h-4 text-gold-500" />
                                 <span className="text-gray-400">الموكل:</span> {session.clientName}
                              </div>
                              <div className="flex items-center gap-2.5">
                                 <Users className="w-4 h-4 text-red-500" />
                                 <span className="text-gray-400">الخصم:</span> {session.opponentName}
                              </div>
                              <div className="flex items-center gap-2.5">
                                 <Landmark className="w-4 h-4 text-blue-500" />
                                 <span className="text-gray-400">الدائرة:</span> {session.circuit}
                              </div>
                              <div className="flex items-center gap-2.5">
                                 <MapPin className="w-4 h-4 text-green-500" />
                                 <span className="text-gray-400">المكان:</span> {session.location}
                              </div>
                           </div>

                           <div className="flex flex-wrap gap-6 text-[10px] text-gray-500 font-bold">
                              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gold-500" /> {session.sessionDate}</div>
                              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold-500" /> {session.sessionTime}</div>
                              <div className="flex items-center gap-2 bg-navy-50 dark:bg-navy-700/50 px-3 py-1 rounded-lg"><User className="w-4 h-4 text-gold-500" /> المحامي: {session.lawyerName}</div>
                           </div>

                           {session.outcome && (
                             <div className="bg-green-50 dark:bg-green-900/10 border-r-4 border-green-500 p-4 rounded-xl mt-2">
                               <p className="text-[9px] font-black text-green-600 mb-1 uppercase tracking-widest">القرار المعتمد:</p>
                               <p className="text-sm font-bold dark:text-gray-200 leading-relaxed">{session.outcome}</p>
                             </div>
                           )}
                        </div>

                        {/* أزرار العمليات */}
                        <div className="flex flex-row md:flex-col gap-2 justify-end shrink-0">
                           <button onClick={() => postponeSession(session)} className="p-4 bg-navy-900 text-white rounded-2xl hover:bg-gold-500 transition-all shadow-lg shadow-navy-900/10" title="ترحيل لموعد جديد"><CalendarPlus className="w-6 h-6" /></button>
                           <button onClick={() => handlePrintSession(session)} className="p-4 bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-white rounded-2xl hover:bg-navy-950 hover:text-white transition-all shadow-sm" title="طباعة محضر"><Printer className="w-6 h-6" /></button>
                           <button onClick={() => transferToArchive(session)} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10" title="ترحيل للأرشيف"><ArrowLeftRight className="w-6 h-6" /></button>
                           <button onClick={() => {
                              setEditId(session.id);
                              setCaseNumber(session.caseNumber);
                              setLawyerName(session.lawyerName);
                              setClientName(session.clientName || '');
                              setOpponentName(session.opponentName || '');
                              setCourtName(session.courtName);
                              setLocation(session.location || '');
                              setCircuit(session.circuit || '');
                              setSessionDate(session.sessionDate);
                              setSessionTime(session.sessionTime);
                              setNotes(session.notes || '');
                              setOutcome(session.outcome || '');
                              setStatus(session.status);
                              setIsFormOpen(true);
                           }} className="p-4 bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-white rounded-2xl hover:bg-gold-500 hover:text-white transition-all shadow-sm" title="تعديل البيانات"><Edit className="w-6 h-6" /></button>
                           <button onClick={() => deleteSession(session.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-500/10" title="حذف"><Trash2 className="w-6 h-6" /></button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={resetForm}></div>
           <div className="relative bg-white dark:bg-navy-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border dark:border-navy-700 animate-scale-up">
              <header className="p-5 bg-navy-900 text-white flex justify-between items-center shrink-0">
                 <h3 className="text-lg font-black flex items-center gap-3">
                   <CalendarPlus className="w-6 h-6 text-gold-500" />
                   {editId ? 'تحديث بيانات الجلسة' : 'إدراج جلسة جديدة'}
                 </h3>
                 <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              </header>

              <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gold-600 uppercase tracking-widest flex items-center gap-2">
                       <FileText className="w-3 h-3" /> رقم القضية (الأولوية القصوى)
                    </label>
                    <input 
                      type="text" 
                      value={caseNumber} 
                      onChange={(e) => setCaseNumber(e.target.value)} 
                      placeholder="أدخل رقم القضية (مثال: 123/2024)" 
                      className="w-full p-3.5 bg-navy-50 dark:bg-navy-900 border-2 border-navy-900/10 dark:border-navy-700 rounded-2xl font-bold outline-none focus:border-gold-500 dark:text-white text-base transition-all" 
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase">المحكمة</label>
                       <select value={courtName} onChange={(e) => setCourtName(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-navy-900 border-2 rounded-xl font-bold dark:text-white outline-none focus:border-gold-500 text-sm">
                         {KUWAIT_COURTS.map(c => <option key={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase">الدائرة</label>
                       <input type="text" value={circuit} onChange={(e) => setCircuit(e.target.value)} placeholder="تجاري / 5" className="w-full p-3 bg-gray-50 dark:bg-navy-900 border-2 rounded-xl font-bold dark:text-white text-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase">القاعة / الدور</label>
                       <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="قاعة 12" className="w-full p-3 bg-gray-50 dark:bg-navy-900 border-2 rounded-xl font-bold dark:text-white text-sm" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gold-600 uppercase flex items-center gap-1"><UserCheck className="w-3 h-3" /> الموكل</label>
                       <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="اسم الموكل" className="w-full p-3 bg-gray-50 dark:bg-navy-900 border-2 border-gold-500/10 rounded-xl font-bold dark:text-white text-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1"><Users className="w-3 h-3" /> الخصم</label>
                       <input type="text" value={opponentName} onChange={(e) => setOpponentName(e.target.value)} placeholder="اسم الخصم" className="w-full p-3 bg-gray-50 dark:bg-navy-900 border-2 border-red-500/10 rounded-xl font-bold dark:text-white text-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase">المحامي</label>
                       <input type="text" value={lawyerName} onChange={(e) => setLawyerName(e.target.value)} placeholder="المحامي المسؤول" className="w-full p-3 bg-gray-50 dark:bg-navy-900 border-2 rounded-xl font-bold dark:text-white text-sm" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase">تاريخ الجلسة</label>
                       <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-navy-900 border-2 rounded-xl font-bold dark:text-white text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase">الوقت</label>
                       <input type="time" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-navy-900 border-2 rounded-xl font-bold dark:text-white text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-navy-900 dark:text-gold-500 uppercase">حالة الجلسة</label>
                       <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full p-3 bg-navy-50 dark:bg-navy-900 border-2 border-navy-950/10 dark:border-navy-700 rounded-xl font-black dark:text-white text-sm outline-none focus:border-gold-500">
                         <option value="upcoming">قادمة</option>
                         <option value="urgent">عاجلة جداً</option>
                         <option value="completed">تم الحضور / منتهية</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> قرار الجلسة (المنطوق)
                    </label>
                    <textarea 
                      value={outcome} 
                      onChange={(e) => {
                        setOutcome(e.target.value);
                        if (e.target.value && status !== 'completed') setStatus('completed');
                      }} 
                      placeholder="دون هنا منطوق الحكم أو ما تم في الجلسة..." 
                      className="w-full p-3.5 bg-green-50/20 dark:bg-green-900/10 border-2 border-green-500/20 rounded-2xl font-bold dark:text-white min-h-[100px] outline-none text-sm transition-all focus:bg-green-50/50" 
                    />
                 </div>

                 <button onClick={handleAddSession} className="w-full py-5 bg-navy-950 dark:bg-gold-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                   <Save className="w-6 h-6" />
                   {editId ? 'حفظ التغييرات' : 'إدراج في الأجندة القضائية'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CourtAlerts;
