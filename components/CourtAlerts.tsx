
import React, { useState, useEffect } from 'react';
import { CourtSession, AlertSettings } from '../types';
import { StorageService } from '../services/storageService';
import { 
  Calendar, MapPin, Trash2, Plus, Gavel, Edit, 
  CalendarPlus, Clock, Share2, Printer, ArrowRightCircle,
  X, Loader2, FileText, Search, Filter, Layers, Layout
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

const CASE_TYPES = [
  "جنايات", "جنح", "تجاري كلي", "مدني كلي", "أحوال شخصية", "إيجارات", "عمالي", "إداري", "أوامر أداء", "مستعجل"
];

const CourtAlerts: React.FC = () => {
  const [sessions, setSessions] = useState<CourtSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form States
  const [caseNumber, setCaseNumber] = useState('');
  const [caseType, setCaseType] = useState(CASE_TYPES[0]);
  const [lawyerName, setLawyerName] = useState('');
  const [clientName, setClientName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [courtName, setCourtName] = useState(KUWAIT_COURTS[0]);
  const [circuit, setCircuit] = useState(''); // الدائرة
  const [hall, setHall] = useState('');       // القاعة
  const [location, setLocation] = useState(''); // الدور/المبنى
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'completed' | 'urgent'>('upcoming');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await StorageService.getSessions();
    setSessions(data);
    setLoading(false);
  };

  const handleAddSession = async () => {
    if (!caseNumber || !sessionDate) return alert("يرجى إدخال رقم القضية وتاريخ الجلسة");
    
    const newSession: CourtSession = {
      id: editId || Date.now().toString(),
      caseNumber,
      caseType,
      lawyerName,
      clientName,
      opponentName,
      courtName,
      circuit,
      hall,
      location,
      sessionDate,
      sessionTime,
      notes,
      status
    };

    let updated;
    if (editId) {
      updated = sessions.map(s => s.id === editId ? newSession : s);
    } else {
      updated = [newSession, ...sessions];
    }
    
    setSessions(updated);
    await StorageService.saveSessions(updated);
    resetForm();
  };

  const handleEdit = (s: CourtSession) => {
    setEditId(s.id);
    setCaseNumber(s.caseNumber);
    setCaseType(s.caseType || CASE_TYPES[0]);
    setClientName(s.clientName || '');
    setOpponentName(s.opponentName || '');
    setCourtName(s.courtName);
    setCircuit(s.circuit || '');
    setHall(s.hall || '');
    setLocation(s.location || '');
    setSessionDate(s.sessionDate);
    setSessionTime(s.sessionTime);
    setNotes(s.notes || '');
    setStatus(s.status);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الجلسة؟")) {
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      await StorageService.saveSessions(updated);
    }
  };

  // وظيفة الترحيل (تأجيل الجلسة)
  const handleMigrate = async (s: CourtSession) => {
    const newDate = prompt("أدخل تاريخ الجلسة القادمة (YYYY-MM-DD):", "");
    if (!newDate) return;

    const updatedSession = { ...s, sessionDate: newDate, status: 'upcoming' as const };
    const updatedList = sessions.map(item => item.id === s.id ? updatedSession : item);
    
    setSessions(updatedList);
    await StorageService.saveSessions(updatedList);
    alert(`تم ترحيل القضية رقم ${s.caseNumber} إلى تاريخ ${newDate}`);
  };

  // وظيفة المشاركة عبر واتساب
  const handleShare = (s: CourtSession) => {
    const text = `
*تذكير جلسة محكمة - ${s.courtName}*
رقم القضية: ${s.caseNumber} (${s.caseType})
الموكل: ${s.clientName}
الدائرة: ${s.circuit || '-'} | القاعة: ${s.hall || '-'}
التاريخ: ${s.sessionDate} الساعة ${s.sessionTime}
    `.trim();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // وظيفة الطباعة (رول الجلسة)
  const handlePrint = (s: CourtSession) => {
    const printContent = `
      <div style="direction: rtl; font-family: 'Tajawal', sans-serif; padding: 40px; text-align: center; border: 2px solid #000;">
        <h1 style="margin-bottom: 20px;">بطاقة جلسة محكمة</h1>
        <hr style="margin: 20px 0;" />
        <h2 style="font-size: 24px; margin-bottom: 10px;">${s.courtName}</h2>
        <h3 style="background: #eee; display: inline-block; padding: 5px 20px; border-radius: 5px;">${s.caseType || 'قضية'}</h3>
        
        <table style="width: 100%; margin-top: 30px; font-size: 18px; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">رقم القضية:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${s.caseNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">الموكل:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${s.clientName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">الخصم:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${s.opponentName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">الدائرة / القاعة:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">دائرة ${s.circuit || '-'} / قاعة ${s.hall || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">الموعد:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${s.sessionDate} - ${s.sessionTime}</td>
          </tr>
        </table>
        
        <div style="margin-top: 40px; text-align: right;">
          <strong>ملاحظات:</strong>
          <p>${s.notes || 'لا يوجد'}</p>
        </div>
      </div>
    `;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>طباعة الجلسة</title><link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet"></head><body>${printContent}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const resetForm = () => {
    setEditId(null);
    setCaseNumber('');
    setCaseType(CASE_TYPES[0]);
    setClientName('');
    setOpponentName('');
    setCourtName(KUWAIT_COURTS[0]);
    setCircuit('');
    setHall('');
    setLocation('');
    setSessionDate('');
    setSessionTime('09:00');
    setNotes('');
    setStatus('upcoming');
    setIsFormOpen(false);
  };

  const filteredSessions = sessions.filter(s => 
    s.caseNumber.includes(filter) || s.clientName?.includes(filter) || s.courtName.includes(filter)
  );

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-gold-500" /></div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in bg-gray-50 dark:bg-navy-900 min-h-screen pb-32" dir="rtl">
      
      {/* Header & Tools */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-navy-800 p-6 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-navy-700">
        <div className="flex items-center gap-5">
           <div className="bg-navy-900 p-4 rounded-3xl shadow-lg border border-gold-500/20">
             <Gavel className="w-8 h-8 text-gold-500" />
           </div>
           <div>
             <h2 className="text-2xl font-black text-navy-900 dark:text-white">أجندة الجلسات القضائية</h2>
             <p className="text-gray-500 font-bold text-xs mt-1">إدارة شاملة: مواعيد، دوائر، قاعات، وترحيل آلي</p>
           </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1">
             <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
              type="text" 
              placeholder="بحث برقم القضية أو الموكل..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-navy-900 border-2 border-transparent focus:border-gold-500 rounded-2xl outline-none text-sm font-bold transition-all"
             />
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-navy-900 dark:bg-gold-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" /> إضافة جلسة جديدة
          </button>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredSessions.length === 0 ? (
           <div className="bg-white dark:bg-navy-800 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200 dark:border-navy-700 flex flex-col items-center">
              <div className="bg-gray-100 dark:bg-navy-900 p-6 rounded-full mb-4">
                <Calendar className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-navy-900 dark:text-white">لا توجد جلسات مدرجة</h3>
              <p className="text-gray-400 font-bold mt-2 text-sm">استخدم زر "إضافة جلسة" لإنشاء ملف دعوى جديد.</p>
           </div>
        ) : (
           filteredSessions.map(session => (
             <div key={session.id} className="bg-white dark:bg-navy-800 rounded-[2.5rem] p-6 shadow-xl border border-gray-100 dark:border-navy-700 hover:shadow-2xl transition-all group relative overflow-hidden">
                {/* Status Strip */}
                <div className={`absolute top-0 right-0 w-full h-1.5 ${session.status === 'urgent' ? 'bg-red-500' : 'bg-gold-500'}`}></div>
                
                <div className="flex flex-col lg:flex-row gap-6">
                   {/* Main Info */}
                   <div className="flex-1 space-y-5">
                      <div className="flex flex-wrap items-center gap-3">
                         <span className="bg-navy-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide shadow-md">
                           {session.caseType || 'قضية'}
                         </span>
                         <span className="text-navy-900 dark:text-white font-black text-xl flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gold-500" />
                            {session.caseNumber}
                         </span>
                         <span className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-navy-900 px-3 py-1 rounded-lg">
                           {session.courtName}
                         </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div className="bg-gray-50 dark:bg-navy-900/50 p-3 rounded-2xl">
                            <span className="text-[9px] text-gray-400 font-black block mb-1">الموكل</span>
                            <span className="text-xs font-bold text-navy-800 dark:text-gray-200">{session.clientName}</span>
                         </div>
                         <div className="bg-gray-50 dark:bg-navy-900/50 p-3 rounded-2xl">
                            <span className="text-[9px] text-gray-400 font-black block mb-1">الخصم</span>
                            <span className="text-xs font-bold text-navy-800 dark:text-gray-200">{session.opponentName}</span>
                         </div>
                         <div className="bg-gray-50 dark:bg-navy-900/50 p-3 rounded-2xl">
                            <span className="text-[9px] text-gray-400 font-black block mb-1">الدائرة / القاعة</span>
                            <span className="text-xs font-bold text-navy-800 dark:text-gray-200">د ({session.circuit || '-'}) / ق ({session.hall || '-'})</span>
                         </div>
                         <div className="bg-gold-50 dark:bg-gold-900/10 p-3 rounded-2xl border border-gold-100 dark:border-gold-900/30">
                            <span className="text-[9px] text-gold-600 font-black block mb-1">موعد الجلسة</span>
                            <span className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1">
                               <Clock className="w-3 h-3" /> {session.sessionDate} ({session.sessionTime})
                            </span>
                         </div>
                      </div>
                      
                      {session.notes && (
                        <div className="text-xs text-gray-500 font-medium bg-gray-50 dark:bg-navy-900/30 p-3 rounded-xl border-r-4 border-gray-300">
                          <span className="font-black ml-1">ملاحظات:</span> {session.notes}
                        </div>
                      )}
                   </div>

                   {/* Action Bar - The New Requirement */}
                   <div className="flex flex-row lg:flex-col gap-3 justify-center items-center lg:border-r lg:pr-6 border-gray-100 dark:border-navy-700 lg:w-32 shrink-0">
                      <button onClick={() => handleMigrate(session)} className="w-full flex items-center justify-center gap-2 p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black group/btn" title="ترحيل الجلسة">
                         <ArrowRightCircle className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" /> 
                         <span className="lg:hidden">ترحيل</span>
                      </button>
                      <button onClick={() => handleEdit(session)} className="w-full flex items-center justify-center gap-2 p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-navy-900 hover:text-white transition-all text-[10px] font-black" title="تعديل">
                         <Edit className="w-4 h-4" />
                         <span className="lg:hidden">تعديل</span>
                      </button>
                      <button onClick={() => handlePrint(session)} className="w-full flex items-center justify-center gap-2 p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-navy-900 hover:text-white transition-all text-[10px] font-black" title="طباعة">
                         <Printer className="w-4 h-4" />
                         <span className="lg:hidden">طباعة</span>
                      </button>
                      <button onClick={() => handleShare(session)} className="w-full flex items-center justify-center gap-2 p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all text-[10px] font-black" title="مشاركة واتساب">
                         <Share2 className="w-4 h-4" />
                         <span className="lg:hidden">مشاركة</span>
                      </button>
                      <button onClick={() => handleDelete(session.id)} className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all text-[10px] font-black" title="حذف">
                         <Trash2 className="w-4 h-4" />
                         <span className="lg:hidden">حذف</span>
                      </button>
                   </div>
                </div>
             </div>
           ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-navy-800 w-full max-w-3xl rounded-[2.5rem] p-8 shadow-2xl border dark:border-navy-700 animate-scale-up max-h-[90vh] overflow-y-auto">
              <header className="mb-8 flex justify-between items-center border-b pb-4 dark:border-navy-700">
                 <h3 className="text-xl font-black flex items-center gap-3 text-navy-900 dark:text-white">
                   <CalendarPlus className="w-7 h-7 text-gold-500" /> 
                   {editId ? 'تعديل بيانات الجلسة' : 'إدراج جلسة جديدة'}
                 </h3>
                 <button onClick={resetForm} className="p-2 bg-gray-100 dark:bg-navy-700 rounded-full hover:bg-red-500 hover:text-white transition-all"><X className="w-5 h-5" /></button>
              </header>
              
              <div className="space-y-6">
                 {/* بيانات المحكمة */}
                 <div className="bg-gray-50 dark:bg-navy-900/50 p-5 rounded-3xl space-y-4">
                    <h4 className="text-xs font-black text-gold-600 uppercase flex items-center gap-2"><Layout className="w-4 h-4" /> تفاصيل المحكمة</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <select value={courtName} onChange={(e) => setCourtName(e.target.value)} className="p-4 bg-white dark:bg-navy-800 border-2 border-transparent rounded-2xl font-bold dark:text-white text-sm outline-none focus:border-gold-500">
                         {KUWAIT_COURTS.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="المبنى / الدور" className="p-4 bg-white dark:bg-navy-800 border-2 border-transparent rounded-2xl font-bold dark:text-white text-sm outline-none focus:border-gold-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <input type="text" value={circuit} onChange={(e) => setCircuit(e.target.value)} placeholder="الدائرة (مثال: تجاري 5)" className="p-4 bg-white dark:bg-navy-800 border-2 border-transparent rounded-2xl font-bold dark:text-white text-sm outline-none focus:border-gold-500" />
                       <input type="text" value={hall} onChange={(e) => setHall(e.target.value)} placeholder="رقم القاعة" className="p-4 bg-white dark:bg-navy-800 border-2 border-transparent rounded-2xl font-bold dark:text-white text-sm outline-none focus:border-gold-500" />
                    </div>
                 </div>

                 {/* بيانات القضية */}
                 <div className="bg-gray-50 dark:bg-navy-900/50 p-5 rounded-3xl space-y-4">
                    <h4 className="text-xs font-black text-gold-600 uppercase flex items-center gap-2"><Layers className="w-4 h-4" /> بيانات الدعوى</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input type="text" value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} placeholder="رقم القضية (الآلي)" className="p-4 bg-white dark:bg-navy-800 border-2 border-transparent rounded-2xl font-bold dark:text-white text-sm outline-none focus:border-gold-500" />
                       <select value={caseType} onChange={(e) => setCaseType(e.target.value)} className="p-4 bg-white dark:bg-navy-800 border-2 border-transparent rounded-2xl font-bold dark:text-white text-sm outline-none focus:border-gold-500">
                          {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="الموكل" className="p-4 bg-white dark:bg-navy-800 border-2 border-transparent rounded-2xl font-bold dark:text-white text-sm outline-none focus:border-gold-500" />
                       <input type="text" value={opponentName} onChange={(e) => setOpponentName(e.target.value)} placeholder="الخصم" className="p-4 bg-white dark:bg-navy-800 border-2 border-transparent rounded-2xl font-bold dark:text-white text-sm outline-none focus:border-gold-500" />
                    </div>
                 </div>

                 {/* التوقيت */}
                 <div className="grid grid-cols-2 gap-4">
                    <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="p-4 bg-gray-50 dark:bg-navy-900/50 border-2 border-transparent rounded-2xl font-bold dark:text-white text-sm outline-none focus:border-gold-500" />
                    <input type="time" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} className="p-4 bg-gray-50 dark:bg-navy-900/50 border-2 border-transparent rounded-2xl font-bold dark:text-white text-sm outline-none focus:border-gold-500" />
                 </div>

                 <button onClick={handleAddSession} className="w-full py-5 bg-navy-900 dark:bg-gold-600 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] active:scale-95 transition-all">
                    {editId ? 'حفظ التعديلات' : 'إدراج في الأجندة'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CourtAlerts;
