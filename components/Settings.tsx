
import React, { useState, useEffect, useRef } from 'react';
import { Save, Building, Phone, Mail, Image as ImageIcon, CheckCircle, Globe, Layout, MapPin, AlignRight, AlignCenter, AlignLeft, Sun, Type, MousePointer2, Layers, Upload, Trash2 } from 'lucide-react';
import { FirmSettings } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<FirmSettings>({
    firmName: '',
    email: '',
    phone: '',
    website: '',
    logoUrl: '',
    logoOpacity: 100,
    logoPosition: 'right',
    dataPlacement: 'header',
    enableWatermark: true,
    watermarkType: 'logo',
    watermarkText: 'مكتب المحاماة',
    watermarkOpacity: 10,
  });
  
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('lawFirmSettings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  const handleSave = () => {
    localStorage.setItem('lawFirmSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSettings({ ...settings, logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setSettings({ ...settings, logoUrl: '' });
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-32 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-navy-900 dark:text-white mb-2">تخصيص الهوية البصرية الرسمية</h2>
        <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">إعداد الترويسة، التذييل، والعلامة المائية المعتمدة لمطبوعات المكتب.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-navy-700 overflow-hidden">
            <div className="p-6 sm:p-10 space-y-10">
              
              {/* قسم تحميل الشعار - الجديد والمطلوب */}
              <div className="space-y-6">
                <h3 className="font-black text-navy-900 dark:text-white text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gold-500" />
                  شعار المكتب (Logo)
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 dark:bg-navy-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-navy-700">
                  <div className="relative w-32 h-32 bg-white dark:bg-navy-800 rounded-2xl shadow-inner border dark:border-navy-700 flex items-center justify-center overflow-hidden group">
                    {settings.logoUrl ? (
                      <>
                        <img src={settings.logoUrl} className="w-full h-full object-contain p-2" alt="Logo Preview" />
                        <button 
                          onClick={removeLogo}
                          className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 font-black text-xs"
                        >
                          <Trash2 className="w-4 h-4" /> حذف
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="w-10 h-10 text-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-right space-y-3">
                    <p className="text-sm font-bold text-navy-900 dark:text-white">ارفع شعار المكتب الرسمي</p>
                    <p className="text-xs text-gray-500">يفضل أن تكون الخلفية شفافة (PNG) وبدقة عالية.</p>
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 mx-auto sm:mx-0 shadow-lg shadow-gold-500/20"
                    >
                      <Upload className="w-4 h-4" /> اختيار ملف الشعار
                    </button>
                  </div>
                </div>
              </div>

              {/* البيانات الرسمية */}
              <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-navy-700">
                <h3 className="font-black text-navy-900 dark:text-white text-lg flex items-center gap-2">
                  <Building className="w-5 h-5 text-gold-500" />
                  بيانات المكتب الرسمية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input 
                      type="text" 
                      value={settings.firmName} 
                      onChange={(e) => setSettings({...settings, firmName: e.target.value})} 
                      className="w-full p-4 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 rounded-2xl outline-none focus:border-gold-500 transition-all font-bold dark:text-white text-lg" 
                      placeholder="اسم مكتب المحاماة كاملاً"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={settings.phone} 
                    onChange={(e) => setSettings({...settings, phone: e.target.value})} 
                    className="p-4 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 rounded-2xl outline-none font-bold dark:text-white text-left" 
                    placeholder="رقم الهاتف"
                    dir="ltr"
                  />
                  <input 
                    type="email" 
                    value={settings.email} 
                    onChange={(e) => setSettings({...settings, email: e.target.value})} 
                    className="p-4 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 rounded-2xl outline-none font-bold dark:text-white text-left" 
                    placeholder="البريد الإلكتروني"
                    dir="ltr"
                  />
                  <div className="md:col-span-2 relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={settings.website} 
                      onChange={(e) => setSettings({...settings, website: e.target.value})} 
                      className="w-full p-4 pl-12 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 rounded-2xl outline-none font-bold dark:text-white text-left" 
                      placeholder="الموقع الإلكتروني (مثال: www.lawfirm.com)"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* موضع البيانات */}
              <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-navy-700">
                <h3 className="font-black text-navy-900 dark:text-white text-lg flex items-center gap-2">
                  <Layout className="w-5 h-5 text-gold-500" />
                  موضع البيانات في الصفحة
                </h3>
                <div className="grid grid-cols-3 gap-4">
                   {[
                     { id: 'header', label: 'رأس الصفحة (Header)' },
                     { id: 'footer', label: 'تذييل الصفحة (Footer)' },
                     { id: 'both', label: 'كلاهما (Header & Footer)' }
                   ].map(opt => (
                     <button
                       key={opt.id}
                       onClick={() => setSettings({...settings, dataPlacement: opt.id as any})}
                       className={`p-4 rounded-2xl border-2 font-black text-[10px] sm:text-xs transition-all ${settings.dataPlacement === opt.id ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-600' : 'border-gray-100 dark:border-navy-700 text-gray-400 hover:border-gray-200'}`}
                     >
                       {opt.label}
                     </button>
                   ))}
                </div>
              </div>

              {/* العلامة المائية */}
              <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-navy-700">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-navy-900 dark:text-white text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-gold-500" />
                    العلامة المائية (Watermark)
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500">{settings.enableWatermark ? 'مفعلة' : 'معطلة'}</span>
                    <button 
                      onClick={() => setSettings({...settings, enableWatermark: !settings.enableWatermark})}
                      className={`w-12 h-6 rounded-full transition-all relative ${settings.enableWatermark ? 'bg-gold-500' : 'bg-gray-200 dark:bg-navy-700'}`}
                    >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enableWatermark ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>

                {settings.enableWatermark && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                     <div className="space-y-4">
                        <label className="text-xs font-black text-gray-500 uppercase">نوع العلامة</label>
                        <div className="flex bg-gray-100 dark:bg-navy-900 p-1 rounded-xl">
                           <button 
                            onClick={() => setSettings({...settings, watermarkType: 'logo'})}
                            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${settings.watermarkType === 'logo' ? 'bg-white dark:bg-navy-800 shadow-sm text-gold-600' : 'text-gray-400'}`}
                           >
                             شعار المكتب
                           </button>
                           <button 
                            onClick={() => setSettings({...settings, watermarkType: 'text'})}
                            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${settings.watermarkType === 'text' ? 'bg-white dark:bg-navy-800 shadow-sm text-gold-600' : 'text-gray-400'}`}
                           >
                             نص مخصص
                           </button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-xs font-black text-gray-500 uppercase">الشفافية ({settings.watermarkOpacity}%)</label>
                        <input 
                          type="range" min="1" max="40" step="1"
                          value={settings.watermarkOpacity}
                          onChange={(e) => setSettings({...settings, watermarkOpacity: parseInt(e.target.value)})}
                          className="w-full h-2 bg-gray-200 dark:bg-navy-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                        />
                     </div>

                     {settings.watermarkType === 'text' && (
                       <div className="md:col-span-2 space-y-4 animate-scale-up">
                          <label className="text-xs font-black text-gray-500 uppercase">النص المكتوب</label>
                          <input 
                            type="text"
                            value={settings.watermarkText}
                            onChange={(e) => setSettings({...settings, watermarkText: e.target.value})}
                            className="w-full p-4 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 rounded-2xl outline-none font-bold dark:text-white"
                            placeholder="اكتب النص هنا (مثال: سري للغاية)"
                          />
                       </div>
                     )}
                  </div>
                )}
              </div>

            </div>

            <div className="p-6 bg-gray-50 dark:bg-navy-900/50 flex justify-end items-center gap-4">
               {saved && <span className="text-green-500 font-black text-xs flex items-center gap-1 animate-fade-in"><CheckCircle className="w-4 h-4"/> تم الحفظ</span>}
               <button onClick={handleSave} className="bg-navy-900 dark:bg-gold-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                  <Save className="w-6 h-6" />
                  حفظ الإعدادات
               </button>
            </div>
          </div>
        </div>

        {/* المعاينة المباشرة */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-navy-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-navy-700 overflow-hidden">
              <div className="p-5 border-b dark:border-navy-700 bg-navy-950 text-white flex items-center justify-between">
                 <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-gold-500">
                   <Layout className="w-4 h-4" />
                   معاينة المطبوعات
                 </h4>
                 <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded uppercase font-black">A4 Sheet</span>
              </div>
              
              <div className="p-8 bg-white text-navy-900 min-h-[500px] flex flex-col relative shadow-inner overflow-hidden">
                 
                 {/* العلامة المائية في الخلفية */}
                 {settings.enableWatermark && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                      {settings.watermarkType === 'logo' && settings.logoUrl ? (
                        <img 
                          src={settings.logoUrl} 
                          style={{ opacity: settings.watermarkOpacity / 100 }} 
                          className="max-w-[70%] max-h-[70%] grayscale object-contain rotate-[-30deg]" 
                        />
                      ) : (
                        <span 
                          style={{ opacity: settings.watermarkOpacity / 100 }} 
                          className="text-3xl font-black uppercase tracking-[1rem] rotate-[-30deg] whitespace-nowrap text-gray-400 select-none text-center"
                        >
                          {settings.watermarkText}
                        </span>
                      )}
                   </div>
                 )}

                 {/* الهيدر */}
                 {(settings.dataPlacement === 'header' || settings.dataPlacement === 'both') && (
                   <div className="flex w-full mb-8 relative z-10 items-start justify-between border-b pb-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                        {settings.logoUrl ? (
                          <img src={settings.logoUrl} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 text-right pr-4">
                        <h5 className="text-[10px] font-black">{settings.firmName || 'اسم المكتب'}</h5>
                        <div className="flex flex-col gap-0.5 text-[7px] font-bold text-gray-500 mt-1">
                           {settings.phone && <p>{settings.phone}</p>}
                           {settings.website && <p className="text-gold-600">{settings.website}</p>}
                        </div>
                      </div>
                   </div>
                 )}

                 {/* محتوى الصفحة الوهمي */}
                 <div className="flex-1 mt-4 space-y-2 relative z-10 opacity-10">
                    <div className="h-2 w-full bg-gray-300 rounded"></div>
                    <div className="h-2 w-full bg-gray-200 rounded"></div>
                    <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-32"></div>
                    <div className="h-2 w-full bg-gray-200 rounded"></div>
                    <div className="h-2 w-5/6 bg-gray-200 rounded"></div>
                 </div>

                 {/* الفوتر */}
                 {(settings.dataPlacement === 'footer' || settings.dataPlacement === 'both') && (
                   <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-end relative z-10">
                      <div className="text-[7px] font-bold text-gray-400">
                         <p className="font-black text-navy-900">{settings.firmName}</p>
                         <p>{settings.website}</p>
                      </div>
                      <div className="text-[7px] font-bold text-gray-400 text-left">
                         <p>{settings.phone}</p>
                         <p>الكويت</p>
                      </div>
                   </div>
                 )}
              </div>
            </div>

            <div className="bg-navy-900 p-6 rounded-[2rem] text-white">
               <h4 className="font-black text-gold-500 mb-2 flex items-center gap-2 text-sm">
                  <Sun className="w-4 h-4" />
                  نصيحة تقنية
               </h4>
               <p className="text-[10px] text-navy-100 leading-relaxed font-bold">
                  "تأكد من تفعيل خيار (طباعة خلفية الرسومات) في إعدادات متصفحك عند طباعة العقود لضمان ظهور العلامة المائية والشعار بشكل صحيح."
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
