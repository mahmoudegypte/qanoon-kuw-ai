
import React, { useState, useEffect } from 'react';
import { Key, Cpu, Brain, AlertCircle, Save, CheckCircle, Zap, ShieldCheck, Eye, EyeOff, Copy, Lock, Activity } from 'lucide-react';

const EngineSettings: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<'flash' | 'pro'>('flash');
  const [activeModel, setActiveModel] = useState<'flash' | 'pro'>('flash');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // تثبيت المفتاح المطلوب
  const FIXED_API_KEY = "AIzaSyCT3QmmVozgMKOPbgK6buqz5MXbnO8Y7ao";

  useEffect(() => {
    // جلب الإعداد المحفوظ، وإذا لم يوجد نعتبر Flash هو الافتراضي
    const savedModel = localStorage.getItem('preferred_legal_model') as 'flash' | 'pro';
    if (savedModel) {
      setSelectedModel(savedModel);
      setActiveModel(savedModel);
    } else {
      // الوضع الافتراضي عند أول دخول
      setSelectedModel('flash');
      setActiveModel('flash');
      localStorage.setItem('preferred_legal_model', 'flash');
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('preferred_legal_model', selectedModel);
    setActiveModel(selectedModel);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(FIXED_API_KEY);
    alert("تم نسخ المفتاح إلى الحافظة");
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-32 animate-fade-in bg-[#f8fafc] dark:bg-navy-950 min-h-screen">
      <div className="mb-10 border-b-4 border-gold-500 pb-6 flex items-center justify-between">
        <div className="text-right">
          <h2 className="text-4xl font-black text-navy-900 dark:text-white mb-2 tracking-tight">إعدادات محرك الذكاء الاصطناعي</h2>
          <div className="flex items-center gap-2 text-navy-700 dark:text-gray-400 font-bold text-lg">
            <span>إدارة قوة المعالجة القانونية</span>
            <span className="mx-2 text-gray-300">|</span>
            <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm">
              <Activity className="w-4 h-4 animate-pulse" />
              المحرك النشط: {activeModel === 'flash' ? 'Flash 3.0 (القياسي)' : 'Pro 3.0 (المتقدم)'}
            </div>
          </div>
        </div>
        <div className="bg-navy-900 p-4 rounded-3xl shadow-xl border-2 border-gold-500/50">
          <Zap className="w-10 h-10 text-gold-500 animate-pulse" />
        </div>
      </div>

      <div className="space-y-10">
        {/* قسم مفتاح API */}
        <div className="bg-white dark:bg-navy-800 rounded-[3rem] shadow-2xl border-2 border-navy-200 dark:border-navy-700 overflow-hidden">
          <div className="p-8 sm:p-12 space-y-8">
            <div className="flex items-center gap-4">
              <div className="bg-gold-500 p-4 rounded-2xl shadow-lg">
                <Key className="w-8 h-8 text-navy-950" />
              </div>
              <div className="text-right">
                <h3 className="font-black text-navy-900 dark:text-white text-2xl">مفتاح الربط النشط</h3>
                <p className="text-sm text-gray-500 font-bold mt-1">المفتاح القانوني المعتمد للاتصال بمحرك Gemini.</p>
              </div>
            </div>

            <div className="bg-navy-50 dark:bg-navy-900/50 p-8 rounded-[2rem] border-2 border-navy-100 dark:border-navy-700 space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                  <label className="text-sm font-black text-navy-900 dark:text-gold-500 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    المفتاح الحالي:
                  </label>
                  <button onClick={() => setShowKey(!showKey)} className="text-navy-400 hover:text-gold-600 transition-colors flex items-center gap-2 text-xs font-black">
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showKey ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>
                
                <div className="relative group">
                  <input 
                    type={showKey ? "text" : "password"}
                    readOnly
                    value={FIXED_API_KEY}
                    className="w-full p-6 bg-white dark:bg-navy-950 border-2 border-gold-500/30 dark:border-navy-600 rounded-2xl font-mono text-xl outline-none shadow-inner text-navy-950 dark:text-gold-500 text-center tracking-widest"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <button onClick={copyToClipboard} className="p-3 bg-gray-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-white rounded-xl transition-all shadow-md">
                      <Copy className="w-5 h-5 text-gray-500 hover:text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* قسم اختيار الموديل */}
        <div className="bg-white dark:bg-navy-800 rounded-[3rem] shadow-xl border-2 border-navy-100 dark:border-navy-700 p-8 sm:p-12 space-y-8">
           <div className="flex items-center gap-4 mb-4">
              <div className="bg-navy-900 p-3 rounded-xl shadow-lg">
                <Cpu className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="font-black text-navy-900 dark:text-white text-2xl tracking-tight">تخصيص قوة المعالجة</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Flash 3.0 Card (Default/Free) */}
              <button 
                onClick={() => setSelectedModel('flash')}
                className={`p-10 rounded-[3rem] border-4 flex flex-col items-center gap-6 transition-all duration-300 relative overflow-hidden group ${selectedModel === 'flash' ? 'border-navy-950 bg-navy-950 text-white shadow-2xl scale-[1.02]' : 'border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/30 text-navy-400 hover:border-gold-300'}`}
              >
                  {activeModel === 'flash' && (
                    <div className="absolute top-6 left-6 flex items-center gap-2 bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-fade-in shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      المحرك النشط حالياً
                    </div>
                  )}
                  <div className={`p-6 rounded-3xl ${selectedModel === 'flash' ? 'bg-gold-500 shadow-lg shadow-gold-500/20' : 'bg-gray-200 dark:bg-navy-800'}`}>
                    <Cpu className={`w-14 h-14 ${selectedModel === 'flash' ? 'text-navy-950' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-3xl">Flash 3.0</p>
                    <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em] mb-2">الخيار القياسي / المجاني</p>
                    <p className="text-sm opacity-70 font-bold mt-3 leading-relaxed">سرعة فائقة في المعالجة. مثالي للتحويل الفوري (OCR) والمهام اليومية البسيطة.</p>
                  </div>
                  {selectedModel === 'flash' && activeModel !== 'flash' && (
                    <div className="absolute bottom-4 bg-white/10 px-4 py-1 rounded-full text-[10px] font-black">مختار للتفعيل</div>
                  )}
              </button>

              {/* Pro 3.0 Card */}
              <button 
                onClick={() => setSelectedModel('pro')}
                className={`p-10 rounded-[3rem] border-4 flex flex-col items-center gap-6 transition-all duration-300 relative overflow-hidden group ${selectedModel === 'pro' ? 'border-gold-600 bg-gold-600 text-navy-950 shadow-2xl scale-[1.02]' : 'border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/30 text-navy-400 hover:border-gold-300'}`}
              >
                  {activeModel === 'pro' && (
                    <div className="absolute top-6 left-6 flex items-center gap-2 bg-navy-950 text-gold-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-fade-in shadow-lg">
                      <div className="w-2 h-2 bg-gold-500 rounded-full animate-ping"></div>
                      المحرك النشط حالياً
                    </div>
                  )}
                  <div className={`p-6 rounded-3xl ${selectedModel === 'pro' ? 'bg-navy-950 shadow-lg shadow-navy-950/20' : 'bg-gray-200 dark:bg-navy-800'}`}>
                    <Brain className={`w-14 h-14 ${selectedModel === 'pro' ? 'text-gold-500' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-3xl">Pro 3.0</p>
                    <p className="text-[10px] font-black text-navy-950 uppercase tracking-[0.2em] mb-2">الخيار المتقدم / المدفوع</p>
                    <p className="text-sm opacity-70 font-bold mt-3 leading-relaxed">تحليل قانوني معمق وثغرات استراتيجية. الأفضل لصياغة المذكرات المعقدة والبحث القضائي.</p>
                  </div>
                  {selectedModel === 'pro' && activeModel !== 'pro' && (
                    <div className="absolute bottom-4 bg-black/10 px-4 py-1 rounded-full text-[10px] font-black">مختار للتفعيل</div>
                  )}
              </button>
           </div>

           <div className="pt-8 flex justify-center">
             <button 
              onClick={handleSave} 
              disabled={selectedModel === activeModel && !saved}
              className={`px-20 py-6 rounded-3xl font-black text-2xl shadow-2xl transition-all flex items-center gap-4 border-b-4 
                ${selectedModel === activeModel && !saved
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300' 
                  : 'bg-navy-950 dark:bg-gold-600 text-white hover:scale-[1.05] active:scale-95 border-navy-800/50'}`}
             >
                <Save className="w-8 h-8" />
                {saved ? 'تم تفعيل المحرك الجديد!' : (selectedModel === activeModel ? 'هذا المحرك نشط بالفعل' : 'تفعيل المحرك المختار')}
             </button>
           </div>
        </div>

        {/* تنبيه الأمان والخصوصية */}
        <div className="bg-navy-900 p-10 rounded-[3.5rem] border-4 border-gold-500/20 flex flex-col sm:flex-row items-center gap-10 shadow-2xl">
           <div className="w-28 h-28 bg-white/5 rounded-[2.5rem] flex items-center justify-center shadow-inner shrink-0 border border-white/10 relative">
              <ShieldCheck className="w-14 h-14 text-gold-500" />
              <div className="absolute -top-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-navy-900 animate-pulse"></div>
           </div>
           <div className="text-right flex-1">
              <h4 className="font-black text-gold-500 text-2xl mb-3">حماية بيانات المكتب</h4>
              <p className="text-lg text-navy-100 font-medium leading-relaxed opacity-80">
                 يتم استخدام مفتاح الربط لإجراء الاتصال الآمن مع خوادم الذكاء الاصطناعي. كافة العمليات القانونية مشفرة ولا يتم تخزين بيانات عملائك خارج جهازك الشخصي.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EngineSettings;
