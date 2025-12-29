import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, DollarSign, Users, Briefcase, Calendar, Award, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Case {
  id: string;
  clientId: string;
  title: string;
  status: 'pending' | 'active' | 'closed' | 'won' | 'lost';
  type: 'civil' | 'criminal' | 'commercial' | 'family' | 'administrative';
  fees: number;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  createdAt: string;
}

const ReportsAnalytics: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');

  useEffect(() => {
    const savedCases = localStorage.getItem('legal_cases');
    const savedClients = localStorage.getItem('legal_clients');
    if (savedCases) setCases(JSON.parse(savedCases));
    if (savedClients) setClients(JSON.parse(savedClients));
  }, []);

  const filterByTimeRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    
    if (timeRange === 'week') return days <= 7;
    if (timeRange === 'month') return days <= 30;
    if (timeRange === 'year') return days <= 365;
    return true;
  };

  const filteredCases = cases.filter(c => filterByTimeRange(c.createdAt));
  const filteredClients = clients.filter(c => filterByTimeRange(c.createdAt));

  const stats = {
    totalCases: filteredCases.length,
    totalClients: filteredClients.length,
    activeCases: filteredCases.filter(c => c.status === 'active').length,
    wonCases: filteredCases.filter(c => c.status === 'won').length,
    lostCases: filteredCases.filter(c => c.status === 'lost').length,
    pendingCases: filteredCases.filter(c => c.status === 'pending').length,
    totalRevenue: filteredCases.reduce((sum, c) => sum + c.fees, 0),
    avgFees: filteredCases.length > 0 ? filteredCases.reduce((sum, c) => sum + c.fees, 0) / filteredCases.length : 0
  };

  const casesByType = {
    civil: filteredCases.filter(c => c.type === 'civil').length,
    criminal: filteredCases.filter(c => c.type === 'criminal').length,
    commercial: filteredCases.filter(c => c.type === 'commercial').length,
    family: filteredCases.filter(c => c.type === 'family').length,
    administrative: filteredCases.filter(c => c.type === 'administrative').length
  };

  const winRate = stats.wonCases + stats.lostCases > 0 
    ? ((stats.wonCases / (stats.wonCases + stats.lostCases)) * 100).toFixed(1)
    : 0;

  const typeColors = {
    civil: 'bg-blue-500',
    criminal: 'bg-red-500',
    commercial: 'bg-green-500',
    family: 'bg-purple-500',
    administrative: 'bg-yellow-500'
  };

  const typeLabels = {
    civil: 'مدنية',
    criminal: 'جنائية',
    commercial: 'تجارية',
    family: 'أحوال شخصية',
    administrative: 'إدارية'
  };

  const maxCasesByType = Math.max(...Object.values(casesByType));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">التقارير والإحصائيات</h1>
              <p className="text-gray-600">تحليل شامل لأداء المكتب القانوني</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['week', 'month', 'year', 'all'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    timeRange === range 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range === 'week' ? 'أسبوع' : range === 'month' ? 'شهر' : range === 'year' ? 'سنة' : 'الكل'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
              <Briefcase className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-sm opacity-90 mb-1">إجمالي القضايا</p>
              <p className="text-3xl font-black">{stats.totalCases}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
              <Users className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-sm opacity-90 mb-1">إجمالي العملاء</p>
              <p className="text-3xl font-black">{stats.totalClients}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
              <DollarSign className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-sm opacity-90 mb-1">إجمالي الإيرادات</p>
              <p className="text-3xl font-black">{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs opacity-75">د.ك</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-2xl text-white">
              <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-sm opacity-90 mb-1">متوسط الأتعاب</p>
              <p className="text-3xl font-black">{stats.avgFees.toFixed(0)}</p>
              <p className="text-xs opacity-75">د.ك</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-blue-600" />
                حالات القضايا
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-bold text-gray-700">نشطة</span>
                  </div>
                  <span className="text-2xl font-black text-blue-600">{stats.activeCases}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-bold text-gray-700">رابحة</span>
                  </div>
                  <span className="text-2xl font-black text-green-600">{stats.wonCases}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="font-bold text-gray-700">خاسرة</span>
                  </div>
                  <span className="text-2xl font-black text-red-600">{stats.lostCases}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="font-bold text-gray-700">معلقة</span>
                  </div>
                  <span className="text-2xl font-black text-yellow-600">{stats.pendingCases}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                القضايا حسب النوع
              </h3>
              <div className="space-y-4">
                {(Object.entries(casesByType) as [keyof typeof casesByType, number][]).map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-700">{typeLabels[type]}</span>
                      <span className="text-xl font-black text-gray-800">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full ${typeColors[type]} transition-all duration-500`}
                        style={{ width: maxCasesByType > 0 ? `${(count / maxCasesByType) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200">
              <Award className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-lg font-black text-gray-800 mb-2">معدل النجاح</h3>
              <p className="text-4xl font-black text-green-600 mb-2">{winRate}%</p>
              <p className="text-sm text-gray-600">من القضايا المكتملة</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
              <Calendar className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-black text-gray-800 mb-2">القضايا النشطة</h3>
              <p className="text-4xl font-black text-blue-600 mb-2">{stats.activeCases}</p>
              <p className="text-sm text-gray-600">تحتاج متابعة</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200">
              <Users className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-black text-gray-800 mb-2">عملاء جدد</h3>
              <p className="text-4xl font-black text-purple-600 mb-2">{filteredClients.length}</p>
              <p className="text-sm text-gray-600">في الفترة المحددة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
