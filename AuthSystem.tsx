import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, LogIn, UserPlus, Shield } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'lawyer' | 'assistant';
  createdAt: string;
}

const AuthSystem: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'lawyer' as 'admin' | 'lawyer' | 'assistant'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (!isLogin && !formData.name) {
      newErrors.name = 'الاسم مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validateForm()) return;

    const users = JSON.parse(localStorage.getItem('auth_users') || '[]');
    const user = users.find((u: AuthUser) => u.email === formData.email);
    
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('current_user', JSON.stringify(user));
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
    } else {
      setErrors({ email: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
  };

  const handleRegister = () => {
    if (!validateForm()) return;

    const users = JSON.parse(localStorage.getItem('auth_users') || '[]');
    
    if (users.some((u: AuthUser) => u.email === formData.email)) {
      setErrors({ email: 'البريد الإلكتروني مستخدم بالفعل' });
      return;
    }

    const newUser: AuthUser = {
      id: 'user_' + Date.now(),
      email: formData.email,
      name: formData.name,
      role: formData.role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('auth_users', JSON.stringify(users));
    
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('current_user', JSON.stringify(newUser));
    localStorage.setItem('auth_token', 'mock_token_' + Date.now());
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    setFormData({ email: '', password: '', name: '', role: 'lawyer' });
  };

  if (isAuthenticated && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-blue-500">
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">مرحباً بك!</h2>
            <p className="text-gray-600">{currentUser.name}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">البريد الإلكتروني</p>
              <p className="font-bold text-gray-800">{currentUser.email}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">الدور الوظيفي</p>
              <p className="font-bold text-gray-800">
                {currentUser.role === 'admin' ? 'مدير' : currentUser.role === 'lawyer' ? 'محامي' : 'مساعد'}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">تاريخ التسجيل</p>
              <p className="font-bold text-gray-800">
                {new Date(currentUser.createdAt).toLocaleDateString('ar-EG')}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all"
          >
            تسجيل خروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
        
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white flex flex-col justify-center">
          <Shield className="w-20 h-20 mb-6" />
          <h1 className="text-4xl font-black mb-4">القانوني AI</h1>
          <p className="text-blue-100 text-lg mb-8">
            نظام إدارة قانوني متكامل مع ذكاء اصطناعي متقدم
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>إدارة القضايا والعملاء</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>مساعد ذكي متطور</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>تقارير وإحصائيات شاملة</span>
            </li>
          </ul>
        </div>

        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-full p-1 flex gap-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  isLogin ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <LogIn className="w-4 h-4 inline ml-2" />
                تسجيل دخول
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  !isLogin ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <UserPlus className="w-4 h-4 inline ml-2" />
                حساب جديد
              </button>
            </div>
          </div>

          <h2 className="text-3xl font-black text-gray-800 mb-2 text-center">
            {isLogin ? 'مرحباً بعودتك!' : 'انضم إلينا'}
          </h2>
          <p className="text-gray-600 text-center mb-8">
            {isLogin ? 'سجل دخولك للمتابعة' : 'أنشئ حساب جديد'}
          </p>

          <div className="space-y-5">
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pr-12 pl-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الدور الوظيفي</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                >
                  <option value="lawyer">محامي</option>
                  <option value="assistant">مساعد قانوني</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
            )}

            <button
              onClick={isLogin ? handleLogin : handleRegister}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;
