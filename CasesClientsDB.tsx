import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Plus, Search, Edit, Trash2, Phone, Mail, Calendar, DollarSign, FileText, Filter, X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  nationalId: string;
  createdAt: string;
}

interface Case {
  id: string;
  clientId: string;
  title: string;
  caseNumber: string;
  court: string;
  status: 'pending' | 'active' | 'closed' | 'won' | 'lost';
  type: 'civil' | 'criminal' | 'commercial' | 'family' | 'administrative';
  nextHearing: string;
  fees: number;
  description: string;
  createdAt: string;
}

const CasesClientsDB: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'cases'>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddCase, setShowAddCase] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCase, setEditingCase] = useState<Case | null>(null);

  const [clientForm, setClientForm] = useState({
    name: '', phone: '', email: '', address: '', nationalId: ''
  });

  const [caseForm, setCaseForm] = useState({
    clientId: '', title: '', caseNumber: '', court: '', status: 'pending' as Case['status'],
    type: 'civil' as Case['type'], nextHearing: '', fees: 0, description: ''
  });

  useEffect(() => {
    const savedClients = localStorage.getItem('legal_clients');
    const savedCases = localStorage.getItem('legal_cases');
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedCases) setCases(JSON.parse(savedCases));
  }, []);

  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem('legal_clients', JSON.stringify(newClients));
  };

  const saveCases = (newCases: Case[]) => {
    setCases(newCases);
    localStorage.setItem('legal_cases', JSON.stringify(newCases));
  };

  const addClient = () => {
    if (!clientForm.name || !clientForm.phone) return;
    const newClient: Client = {
      id: 'client_' + Date.now(),
      ...clientForm,
      createdAt: new Date().toISOString()
    };
    saveClients([...clients, newClient]);
    setClientForm({ name: '', phone: '', email: '', address: '', nationalId: '' });
    setShowAddClient(false);
  };

  const updateClient = () => {
    if (!editingClient) return;
    const updated = clients.map(c => c.id === editingClient.id ? { ...editingClient, ...clientForm } : c);
    saveClients(updated);
    setEditingClient(null);
    setClientForm({ name: '', phone: '', email: '', address: '', nationalId: '' });
  };

  const deleteClient = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      saveClients(clients.filter(c => c.id !== id));
      saveCases(cases.filter(c => c.clientId !== id));
    }
  };

  const addCase = () => {
    if (!caseForm.clientId || !caseForm.title) return;
    const newCase: Case = {
      id: 'case_' + Date.now(),
      ...caseForm,
      createdAt: new Date().toISOString()
    };
    saveCases([...cases, newCase]);
    setCaseForm({ clientId: '', title: '', caseNumber: '', court: '', status: 'pending', type: 'civil', nextHearing: '', fees: 0, description: '' });
    setShowAddCase(false);
  };

  const updateCase = () => {
    if (!editingCase) return;
    const updated = cases.map(c => c.id === editingCase.id ? { ...editingCase, ...caseForm } : c);
    saveCases(updated);
    setEditingCase(null);
    setCaseForm({ clientId: '', title: '', caseNumber: '', court: '', status: 'pending', type: 'civil', nextHearing: '', fees: 0, description: '' });
  };

  const deleteCase = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه القضية؟')) {
      saveCases(cases.filter(c => c.id !== id));
    }
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'غير معروف';
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.caseNumber.includes(searchTerm) ||
                         getClientName(c.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    pending: 'معلقة',
    active: 'نشطة',
    closed: 'مغلقة',
    won: 'رابحة',
    lost: 'خاسرة'
  };

  const typeLabels = {
    civil: 'مدنية',
    criminal: 'جنائية',
    commercial: 'تجارية',
    family: 'أحوال شخصية',
    administrative: 'إدارية'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">إدارة القضايا والعملاء</h1>
              <p className="text-gray-600">نظام متكامل لإدارة العملاء والقضايا القانونية</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'clients' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Users className="w-5 h-5 inline ml-2" />
                العملاء ({clients.length})
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'cases' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Briefcase className="w-5 h-5 inline ml-2" />
                القضايا ({cases.length})
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث..."
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            {activeTab === 'cases' && (
              <div className="relative">
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none appearance-none"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">معلقة</option>
                  <option value="active">نشطة</option>
                  <option value="won">رابحة</option>
                  <option value="lost">خاسرة</option>
                  <option value="closed">مغلقة</option>
                </select>
              </div>
            )}
            <button
              onClick={() => activeTab === 'clients' ? setShowAddClient(true) : setShowAddCase(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 inline ml-2" />
              إضافة {activeTab === 'clients' ? 'عميل' : 'قضية'}
            </button>
          </div>

          {activeTab === 'clients' && (
            <div className="grid gap-4">
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">لا يوجد عملاء حالياً</p>
                </div>
              ) : (
                filteredClients.map(client => (
                  <div key={client.id} className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-black text-gray-800 mb-1">{client.name}</h3>
                        <p className="text-sm text-gray-600">معرف: {client.nationalId || 'غير محدد'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingClient(client);
                            setClientForm({
                              name: client.name,
                              phone: client.phone,
                              email: client.email,
                              address: client.address,
                              nationalId: client.nationalId
                            });
                          }}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span>{client.email || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span>{client.address || 'غير محدد'}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      تاريخ الإضافة: {new Date(client.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="grid gap-4">
              {filteredCases.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">لا توجد قضايا حالياً</p>
                </div>
              ) : (
                filteredCases.map(c => (
                  <div key={c.id} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-black text-gray-800">{c.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[c.status]}`}>
                            {statusLabels[c.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">رقم القضية: {c.caseNumber}</p>
                        <p className="text-sm text-gray-600">العميل: {getClientName(c.clientId)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCase(c);
                            setCaseForm({
                              clientId: c.clientId,
                              title: c.title,
                              caseNumber: c.caseNumber,
                              court: c.court,
                              status: c.status,
                              type: c.type,
                              nextHearing: c.nextHearing,
                              fees: c.fees,
                              description: c.description
                            });
                          }}
                          className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCase(c.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Briefcase className="w-4 h-4 text-purple-500" />
                        <span>{typeLabels[c.type]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span>{c.nextHearing ? new Date(c.nextHearing).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign className="w-4 h-4 text-purple-500" />
                        <span>{c.fees} د.ك</span>
                      </div>
                    </div>
                    {c.description && (
                      <p className="text-sm text-gray-600 bg-white/50 p-3 rounded-lg">{c.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {(showAddClient || editingClient) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">{editingClient ? 'تعديل عميل' : 'إضافة عميل جديد'}</h2>
              <button onClick={() => { setShowAddClient(false); setEditingClient(null); setClientForm({ name: '', phone: '', email: '', address: '', nationalId: '' }); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" value={clientForm.name} onChange={(e) => setClientForm({...clientForm, name: e.target.value})} placeholder="الاسم الكامل *" className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:outline-none" />
              <input type="tel" value={clientForm.phone} onChange={(e) => setClientForm({...clientForm, phone: e.target.value})} placeholder="رقم الهاتف *" className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:outline-none" />
              <input type="email" value={clientForm.email} onChange={(e) => setClientForm({...clientForm, email: e.target.value})} placeholder="البريد الإلكتروني" className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:outline-none" />
              <input type="text" value={clientForm.nationalId} onChange={(e) => setClientForm({...clientForm, nationalId: e.target.value})} placeholder="الرقم المدني" className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:outline-none" />
              <textarea value={clientForm.address} onChange={(e) => setClientForm({...clientForm, address: e.target.value})} placeholder="العنوان" rows={3} className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:outline-none" />
              <button onClick={editingClient ? updateClient : addClient} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
                {editingClient ? 'حفظ التعديلات' : 'إضافة العميل'}
              </button>
            </div>
          </div>
        </div>
      )}

      {(showAddCase || editingCase) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">{editingCase ? 'تعديل قضية' : 'إضافة قضية جديدة'}</h2>
              <button onClick={() => { setShowAddCase(false); setEditingCase(null); setCaseForm({ clientId: '', title: '', caseNumber: '', court: '', status: 'pending', type: 'civil', nextHearing: '', fees: 0, description: '' }); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <select value={caseForm.clientId} onChange={(e) => setCaseForm({...caseForm, clientId: e.target.value})} className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none">
                <option value="">اختر العميل *</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="text" value={caseForm.title} onChange={(e) => setCaseForm({...caseForm, title: e.target.value})} placeholder="عنوان القضية *" className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none" />
              <input type="text" value={caseForm.caseNumber} onChange={(e) => setCaseForm({...caseForm, caseNumber: e.target.value})} placeholder="رقم القضية" className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none" />
              <input type="text" value={caseForm.court} onChange={(e) => setCaseForm({...caseForm, court: e.target.value})} placeholder="المحكمة" className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none" />
              <div className="grid md:grid-cols-2 gap-4">
                <select value={caseForm.type} onChange={(e) => setCaseForm({...caseForm, type: e.target.value as Case['type']})} className="px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none">
                  <option value="civil">مدنية</option>
                  <option value="criminal">جنائية</option>
                  <option value="commercial">تجارية</option>
                  <option value="family">أحوال شخصية</option>
                  <option value="administrative">إدارية</option>
                </select>
                <select value={caseForm.status} onChange={(e) => setCaseForm({...caseForm, status: e.target.value as Case['status']})} className="px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none">
                  <option value="pending">معلقة</option>
                  <option value="active">نشطة</option>
                  <option value="won">رابحة</option>
                  <option value="lost">خاسرة</option>
                  <option value="closed">مغلقة</option>
                </select>
              </div>
              <input type="date" value={caseForm.nextHearing} onChange={(e) => setCaseForm({...caseForm, nextHearing: e.target.value})} className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none" />
              <input type="number" value={caseForm.fees} onChange={(e) => setCaseForm({...caseForm, fees: Number(e.target.value)})} placeholder="الأتعاب (د.ك)" className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none" />
              <textarea value={caseForm.description} onChange={(e) => setCaseForm({...caseForm, description: e.target.value})} placeholder="وصف القضية" rows={3} className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none" />
              <button onClick={editingCase ? updateCase : addCase} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700">
                {editingCase ? 'حفظ التعديلات' : 'إضافة القضية'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasesClientsDB;
