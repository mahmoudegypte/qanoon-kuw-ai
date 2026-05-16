
import React, { useState, useEffect } from 'react';
import { Cpu, Brain, Save, Zap, Activity } from 'lucide-react';

const EngineSettings: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<'flash' | 'pro'>('flash');
  const [activeModel, setActiveModel] = useState<'flash' | 'pro'>('flash');
  const [customKey, setCustomKey] = useState('');
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    // جلب الإعداد المحفوظ، وإذا لم يوجد نعتبر Flash هو الافتراضي
    const savedModel = localStorage.getItem('preferred_legal_model') as 'flash' | 'pro';
    const savedKey = localStorage.getItem('custom_gemini_api_key');
    
    // إذا لم يكن هناك مفتاح محفوظ، نضع المفتاح الذي زوده المستخدم كافتراضي
    if (!savedKey) {
      const defaultKey = 'AIzaSyCgMz7efbPwiz7d1dtRIu2km2ALtrvtM3Y';
      setCustomKey(defaultKey);
      localStorage.setItem('custom_gemini_api_key', defaultKey);
    } else {
      setCustomKey(savedKey);
    }
    
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
    localStorage.setItem('custom_gemini_api_key', customKey);
    setActiveModel(selectedModel);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
        {/* قسم إدارة مفتاح API */}
        <div className="bg-white dark:bg-navy-800 rounded-[3rem] shadow-xl border-2 border-navy-100 dark:border-navy-700 p-8 sm:p-12 space-y-8">
           <div className="flex items-center gap-4 mb-4">
              <div className="bg-navy-900 p-3 rounded-xl shadow-lg">
                <Zap className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="font-black text-navy-900 dark:text-white text-2xl tracking-tight">مفتاح الوصول (API Key)</h3>
           </div>
           
           <div className="space-y-4">
              <p className="text-sm text-navy-700 dark:text-gray-400 font-bold leading-relaxed">
                يمكنك إدخال مفتاح API الخاص بك لتجاوز الحدود العامة وضمان استقرار الخدمة. يتم تخزين المفتاح محلياً في متصفحك فقط.
              </p>
              <div className="relative">
                <input 
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="أدخل مفتاح AIza..."
                  className="w-full p-6 bg-gray-50 dark:bg-navy-900 border-2 border-navy-900 dark:border-navy-600 rounded-3xl font-mono text-sm outline-none focus:border-gold-500 transition-all text-navy-900 dark:text-white"
                />
                <button 
                  onClick={() => {
                    setCustomKey('');
                    localStorage.removeItem('custom_gemini_api_key');
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="مسح المفتاح"
                >
                  مسح
                </button>
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
      </div>
    </div>
  );
};

export default EngineSettings;