
import React, { useState, useEffect, useMemo } from 'react';
import { ArchiveItem, ArchiveItemType, CaseFolder } from '../types';
import { Search, FileText, Mic, Image as ImageIcon, Trash2, Copy, Check, AlertCircle, Folder, LayoutGrid, List, ChevronLeft, Calendar, User, Hash } from 'lucide-react';

const Archive: React.FC = () => {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'folders'>('folders');
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('legal_archive');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItems(parsed.map((i: any) => ({ ...i, timestamp: new Date(i.timestamp) })));
      } catch (e) { console.error("Archive parse error", e); }
    }
  }, []);

  const folders = useMemo(() => {
    const group: Record<string, CaseFolder> = {};
    items.forEach(item => {
      const key = item.caseNumber || 'غير محدد';
      if (!group[key]) {
        group[key] = {
          caseNumber: key,
          clientName: item.clientName || 'غير معروف',
          items: [],
          lastUpdated: item.timestamp
        };
      }
      group[key].items.push(item);
      if (item.timestamp > group[key].lastUpdated) group[key].lastUpdated = item.timestamp;
    });
    return Object.values(group).sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }, [items]);

  const filteredItems = items.filter(item => {
    const searchLower = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) || 
      (item.caseNumber && item.caseNumber.toLowerCase().includes(searchLower)) || 
      (item.clientName && item.clientName.toLowerCase().includes(searchLower))
    );
  });

  const deleteItem = (id: string) => {
    if (!window.confirm("حذف المستند نهائياً؟")) return;
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('legal_archive', JSON.stringify(updated));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeIcon = (type: ArchiveItemType) => {
    switch (type) {
      case 'audio': return <Mic className="w-5 h-5 text-purple-500" />;
      case 'ocr': return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'contract': return <FileText className="w-5 h-5 text-gold-500" />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-navy-900 transition-colors">
      
      {/* القائمة الجانبية للأرشيف */}
      <div className="w-96 border-l dark:border-navy-700 bg-white dark:bg-navy-800 flex flex-col shadow-xl z-20">
        <div className="p-6 space-y-4 border-b dark:border-navy-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-navy-900 dark:text-white">خزانة الملفات</h2>
            <div className="flex bg-gray-100 dark:bg-navy-900 p-1 rounded-xl">
              <button onClick={() => setViewMode('folders')} className={`p-2 rounded-lg transition-all ${viewMode === 'folders' ? 'bg-white dark:bg-navy-800 shadow-sm text-gold-600' : 'text-gray-400'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-navy-800 shadow-sm text-gold-600' : 'text-gray-400'}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="بحث في القضايا..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-navy-700 border-0 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {viewMode === 'folders' && !activeFolder ? (
            folders.map(folder => (
              <div 
                key={folder.caseNumber}
                onClick={() => setActiveFolder(folder.caseNumber)}
                className="p-5 bg-gray-50 dark:bg-navy-900/50 rounded-[2rem] border-2 border-transparent hover:border-gold-500/30 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gold-500/10 p-3 rounded-2xl group-hover:bg-gold-500 group-hover:text-white transition-all">
                    <Folder className="w-6 h-6 text-gold-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-navy-900 dark:text-white text-sm">{folder.caseNumber}</h4>
                    <p className="text-[10px] text-gray-500 font-bold">{folder.clientName}</p>
                  </div>
                  <span className="bg-white dark:bg-navy-800 px-2 py-1 rounded-lg text-[9px] font-black">{folder.items.length} ملف</span>
                </div>
              </div>
            ))
          ) : activeFolder ? (
            <div className="space-y-4">
               <button onClick={() => setActiveFolder(null)} className="flex items-center gap-2 text-[10px] font-black text-gold-600 mb-4 hover:underline">
                 <ChevronLeft className="w-4 h-4 rotate-180" /> العودة للمجلدات
               </button>
               {folders.find(f => f.caseNumber === activeFolder)?.items.map(item => (
                 <div key={item.id} onClick={() => setSelectedItem(item)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedItem?.id === item.id ? 'border-gold-500 bg-gold-50 dark:bg-navy-900 shadow-lg' : 'border-transparent hover:bg-gray-100 dark:hover:bg-navy-900/40'}`}>
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <span className="font-bold text-xs truncate dark:text-white">{item.title}</span>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} onClick={() => setSelectedItem(item)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedItem?.id === item.id ? 'border-gold-500 bg-gold-50 dark:bg-navy-900 shadow-lg' : 'border-transparent hover:bg-gray-100 dark:hover:bg-navy-900/40'}`}>
                 <div className="flex items-center gap-3">
                   {getTypeIcon(item.type)}
                   <span className="font-bold text-xs truncate dark:text-white">{item.title}</span>
                 </div>
                 <div className="flex justify-between mt-2">
                    <span className="text-[9px] text-gray-400">{item.caseNumber}</span>
                    <span className="text-[9px] text-gray-400">{item.timestamp.toLocaleDateString('ar-KW')}</span>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* منطقة عرض المستند */}
      <div className="flex-1 flex flex-col bg-white dark:bg-navy-950">
        {selectedItem ? (
          <div className="flex flex-col h-full animate-fade-in">
             <header className="p-6 border-b dark:border-navy-700 flex justify-between items-center bg-white dark:bg-navy-900/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-navy-800 rounded-xl">{getTypeIcon(selectedItem.type)}</div>
                  <div>
                     <h3 className="text-xl font-black text-navy-900 dark:text-white">{selectedItem.title}</h3>
                     <div className="flex gap-4 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold"><Hash className="w-3 h-3 text-gold-500" /> {selectedItem.caseNumber}</span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold"><User className="w-3 h-3 text-gold-500" /> {selectedItem.clientName}</span>
                     </div>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleCopy(selectedItem.content)} className="p-3 bg-gray-50 dark:bg-navy-800 rounded-xl hover:bg-gold-500 hover:text-white transition-all">
                     {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                   </button>
                   <button onClick={() => deleteItem(selectedItem.id)} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>
             </header>

             <div className="flex-1 overflow-y-auto p-12 flex justify-center">
                <div className="w-full max-w-4xl bg-white dark:bg-navy-900 p-16 shadow-2xl rounded-3xl min-h-full border dark:border-navy-700 font-serif text-xl leading-[2.5] dark:text-gray-100 whitespace-pre-wrap text-justify">
                   {selectedItem.thumbnail && selectedItem.type === 'ocr' && (
                     <div className="mb-10 text-center"><img src={selectedItem.thumbnail} className="max-h-96 mx-auto rounded-xl shadow-lg border-4 border-gray-50" /></div>
                   )}
                   {selectedItem.content}
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
             <div className="w-32 h-32 bg-gray-50 dark:bg-navy-900/50 rounded-full flex items-center justify-center mb-8 border-2 border-dashed border-gray-200 dark:border-navy-700">
                <Folder className="w-12 h-12 text-gray-200" />
             </div>
             <h3 className="text-2xl font-black text-navy-900 dark:text-white mb-2">خزانة الملفات الذكية</h3>
             <p className="text-gray-400 max-w-sm">اختر مجلد قضية أو مستنداً من القائمة الجانبية لاستعراض محتوياته وإدارته.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
