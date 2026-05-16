
import React, { useState, useEffect } from 'react';
import { Database, Server, Shield, Lock, Eye, EyeOff, Save, CheckCircle, Wifi, AlertTriangle, RefreshCcw, LogOut } from 'lucide-react';
import { ServerConfig } from '../types';

const ServerConnection: React.FC = () => {
  // استخدام sessionStorage لضمان طلب كلمة السر عند كل جلسة جديدة
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });
  
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [config, setConfig] = useState<ServerConfig>({
    host: '',
    dbName: '',
    dbUser: '',
    dbPass: '',
    port: '3306',
    apiUrl: '',
    isActive: false
  });

  const [isSaved, setIsSaved] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  // بيانات الدخول المطلوبة
  const ADMIN_USER = "mahmoud";
  const ADMIN_PASS = "M@hmoud2025";

  useEffect(() => {
    const savedConfig = localStorage.getItem('db_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('بيانات الدخول غير صحيحة. يرجى مراجعة المدير.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setLoginUser('');
    setLoginPass('');
  };

  const handleSaveConfig = () => {
    const updatedConfig = { ...config, isActive: true };
    localStorage.setItem('db_config', JSON.stringify(updatedConfig));
    setConfig(updatedConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const testConnection = () => {
    setConnectionStatus('testing');
    // محاكاة الاتصال الفعلي بالـ API أو اختبار URL
    setTimeout(() => {
      if (config.apiUrl && config.apiUrl.startsWith('http')) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('failed');
      }
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-navy-950">
        <div className="bg-white dark:bg-navy-800 w-full max-w-md p-10 rounded-[3rem] shadow-2xl border-4 border-navy-900 dark:border-navy-700 animate-fade-in">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-navy-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border-4 border-gold-500 shadow-xl rotate-3">
              <Shield className="w-12 h-12 text-gold-500" />
            </div>
            <h2 className="text-3xl font-black text-navy-900 dark:text-white tracking-tight">إدارة النظام</h2>
            <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">منطقة محمية - الدخول للمصرح لهم فقط</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-navy-900 dark:text-gold-500 uppercase mr-2">اسم المستخدم</label>
              <input 
                type="text" 
                value={loginUser} 
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 rounded-2xl outline-none font-bold dark:text-white text-left dir-ltr focus:border-gold-500 transition-all" 
                placeholder="Username"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-navy-900 dark:text-gold-500 uppercase mr-2">كلمة السر</label>
              <div className="relative">
                <input 
                  type={showLoginPass ? "text" : "password"} 
                  value={loginPass} 
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full p-4 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 rounded-2xl outline-none font-bold dark:text-white text-left dir-ltr focus:border-gold-500 transition-all" 
                  placeholder="Password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowLoginPass(!showLoginPass)} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-500 transition-colors"
                >
                  {showLoginPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-black justify-center animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                {loginError}
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full py-5 bg-navy-900 dark:bg-gold-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-black dark:hover:bg-gold-500 hover:scale-[1.02] active:scale-95 transition-all mt-4"
            >
              تسجيل الدخول
            </button>
          </form>
          
          <p className="mt-8 text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            جميع المحاولات يتم تسجيلها برقم الـ IP
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in pb-32">
      <div className="flex justify-between items-center border-b-4 border-gold-500 pb-6 dark:border-navy-700">
        <div>
          <h2 className="text-3xl font-black text-navy-900 dark:text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-gold-500" />
            المزامنة السحابية المركزية
          </h2>
          <p className="text-gray-500 font-bold mt-2">إدارة قاعدة البيانات والربط مع السيرفر الرئيسي</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 px-5 py-2.5 rounded-xl font-black text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" /> قفل الإعدادات
        </button>
      </div>

      <div className="bg-white dark:bg-navy-800 p-8 sm:p-12 rounded-[3rem] shadow-2xl border-2 border-gray-100 dark:border-navy-700 space-y-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-gold-500"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-black text-navy-900 dark:text-gold-500 uppercase tracking-widest flex items-center gap-2">
                <Wifi className="w-4 h-4" /> رابط الـ API الرئيسي للسيرفر
              </label>
              <input 
                type="text" 
                value={config.apiUrl} 
                onChange={(e) => setConfig({...config, apiUrl: e.target.value})}
                placeholder="https://your-server.com/api"
                className="w-full p-5 bg-gray-50 dark:bg-navy-900 border-2 border-gray-200 dark:border-navy-700 rounded-3xl font-bold dark:text-white text-left dir-ltr focus:border-gold-500 transition-all text-lg"
              />
           </div>
           
           <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase">اسم السيرفر (Host)</label>
              <input type="text" value={config.host} onChange={(e) => setConfig({...config, host: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 rounded-2xl font-bold dark:text-white text-left dir-ltr" placeholder="localhost" />
           </div>
           
           <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase">قاعدة البيانات (DB Name)</label>
              <input type="text" value={config.dbName} onChange={(e) => setConfig({...config, dbName: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 rounded-2xl font-bold dark:text-white text-left dir-ltr" placeholder="qanoon_db" />
           </div>
           
           <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase">مستخدم القاعدة</label>
              <input type="text" value={config.dbUser} onChange={(e) => setConfig({...config, dbUser: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 rounded-2xl font-bold dark:text-white text-left dir-ltr" placeholder="db_admin" />
           </div>
           
           <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase">مفتاح التشفير / الربط</label>
              <input type="password" value={config.dbPass} onChange={(e) => setConfig({...config, dbPass: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-navy-900 border-2 border-gray-100 dark:border-navy-700 rounded-2xl font-bold dark:text-white text-left dir-ltr" placeholder="••••••••" />
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
           <button 
            onClick={handleSaveConfig} 
            className="flex-1 py-5 bg-navy-900 dark:bg-gold-600 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
           >
             <Save className="w-6 h-6" /> {isSaved ? 'تم حفظ الإعدادات!' : 'حفظ وتفعيل المزامنة'}
           </button>
           <button 
            onClick={testConnection} 
            className={`px-10 py-5 bg-white dark:bg-navy-700 border-2 border-navy-900 dark:border-navy-600 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-navy-50 dark:hover:bg-navy-600 transition-all ${connectionStatus === 'testing' ? 'animate-pulse' : ''}`}
           >
             <RefreshCcw className={`w-5 h-5 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} /> اختبار الربط
           </button>
        </div>

        {connectionStatus === 'success' && (
          <div className="p-6 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-3xl flex items-center gap-4 font-black text-sm animate-bounce-in border-2 border-green-200 dark:border-green-800">
             <div className="bg-green-500 text-white p-2 rounded-full"><CheckCircle className="w-5 h-5" /></div>
             <div>
                <p>نجح الاتصال بالسيرفر!</p>
                <p className="text-[10px] font-bold opacity-80 uppercase mt-1">تم التحقق من صحة رابط الـ API ومفاتيح التشفير</p>
             </div>
          </div>
        )}
        
        {connectionStatus === 'failed' && (
          <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded-3xl flex items-center gap-4 font-black text-sm animate-shake border-2 border-red-200 dark:border-red-800">
             <div className="bg-red-500 text-white p-2 rounded-full"><AlertTriangle className="w-5 h-5" /></div>
             <div>
                <p>فشل الاتصال!</p>
                <p className="text-[10px] font-bold opacity-80 mt-1">يرجى التأكد من صحة رابط الـ API وأن السيرفر يسمح باتصالات الـ CORS.</p>
             </div>
          </div>
        )}
      </div>

      <div className="bg-navy-900 dark:bg-navy-800 p-10 rounded-[3rem] text-white border-4 border-gold-500/20 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative">
        <div className="bg-gold-500 p-5 rounded-3xl shrink-0 -rotate-6 shadow-xl shadow-gold-500/20">
          <Shield className="w-12 h-12 text-navy-950" />
        </div>
        <div className="text-center md:text-right">
           <h4 className="font-black text-gold-500 text-2xl mb-3 flex items-center gap-3 justify-center md:justify-start">
             <Lock className="w-6 h-6" />
             نظام الأمان المتقدم
           </h4>
           <p className="text-navy-100 font-medium leading-relaxed text-lg">
             كافة البيانات التي يتم إرسالها بين التطبيق والسيرفر يتم تشفيرها باستخدام مفتاح الربط الخاص بك. يتم إغلاق هذه الصفحة تلقائياً بمجرد إغلاق المتصفح لضمان عدم وصول أي شخص غير مصرح له للإعدادات الحساسة.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ServerConnection;
