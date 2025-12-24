
import React, { useState, useRef, useEffect } from 'react';
import { extractTextFromImage, transcribeAudio } from '../services/geminiService';
import { OcrPage, ArchiveItem } from '../types';
import { Upload, FileText, Trash2, Copy, Check, Printer, Mic, Square, Sparkles, FileAudio, ScanText, Archive, X, AlertCircle, Loader2 } from 'lucide-react';

const OCRTool: React.FC = () => {
  const [pages, setPages] = useState<OcrPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [copied, setCopied] = useState(false);
  const [highPrecision, setHighPrecision] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) processFiles(Array.from(event.target.files));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav');
      if (!isImage && !isAudio) continue;

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const cleanBase64 = base64Data.split(',')[1];
        const audioPlaceholder = "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`);

        const newPage: OcrPage = {
          id: Date.now().toString() + Math.random().toString(),
          pageNumber: pages.length + 1,
          imageUrl: isImage ? base64Data : audioPlaceholder,
          extractedText: "جاري المعالجة العربية...",
          isProcessing: true,
        };
        setPages(prev => [...prev, newPage]);
        if (!selectedPageId) setSelectedPageId(newPage.id);

        let text = "";
        try {
          if (isImage) text = await extractTextFromImage(cleanBase64, highPrecision);
          else text = await transcribeAudio(cleanBase64, file.type || 'audio/mp3');
        } catch (error) { text = "عذراً، فشل استخراج النص العربي من هذا الملف."; }
        
        setPages(prev => prev.map(p => p.id === newPage.id ? { ...p, extractedText: text, isProcessing: false } : p));
      };
      reader.readAsDataURL(file);
    }
  };

  const checkMicrophone = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMic = devices.some(device => device.kind === 'audioinput');
      if (!hasMic) {
        setMicError("لم يتم العثور على ميكروفون متصل بجهازك.");
        return false;
      }
      return true;
    } catch (e) {
      setMicError("فشل الوصول إلى أجهزة التسجيل.");
      return false;
    }
  };

  const handleStartRecording = async () => {
    setMicError(null);
    const hasDevice = await checkMicrophone();
    if (!hasDevice) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const newId = Date.now().toString();
          
          const placeholderPage: OcrPage = { 
            id: newId, 
            pageNumber: pages.length + 1, 
            imageUrl: "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`), 
            extractedText: "جاري استخراج النص العربي من الصوت...", 
            isProcessing: true 
          };
          
          setPages(prev => [...prev, placeholderPage]);
          setSelectedPageId(newId);

          try {
            const text = await transcribeAudio(base64, 'audio/mp3');
            setPages(prev => prev.map(p => p.id === newId ? { ...p, extractedText: text, isProcessing: false } : p));
          } catch (err) {
            setPages(prev => prev.map(p => p.id === newId ? { ...p, extractedText: "فشل التحويل الصوتي العربي.", isProcessing: false } : p));
          }
        };
        reader.readAsDataURL(audioBlob);
        streamRef.current?.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setMicError("يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deletePage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("حذف هذه الصفحة من القائمة؟")) return;
    
    const updated = pages.filter(p => p.id !== id);
    setPages(updated);
    if (selectedPageId === id) {
      setSelectedPageId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleCopy = () => {
    const active = pages.find(p => p.id === selectedPageId);
    if (!active) return;
    navigator.clipboard.writeText(active.extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleArchive = () => {
    const active = pages.find(p => p.id === selectedPageId);
    if (!active || active.isProcessing) return;

    const caseNum = window.prompt("أدخل رقم القضية (اختياري):") || "";
    const client = window.prompt("أدخل اسم الموكل (اختياري):") || "";

    const newItem: ArchiveItem = {
      id: Date.now().toString(),
      title: active.imageUrl.includes('svg') ? `إملاء صوّتي عربي - ${new Date().toLocaleDateString('ar-KW')}` : `مستند عربي - ${new Date().toLocaleDateString('ar-KW')}`,
      caseNumber: caseNum,
      clientName: client,
      type: active.imageUrl.includes('svg') ? 'audio' : 'ocr',
      content: active.extractedText,
      thumbnail: active.imageUrl,
      timestamp: new Date(),
      tags: [active.imageUrl.includes('svg') ? 'صوت' : 'صورة', 'عربي']
    };

    const currentArchive = JSON.parse(localStorage.getItem('legal_archive') || '[]');
    localStorage.setItem('legal_archive', JSON.stringify([newItem, ...currentArchive]));
    alert("تم الحفظ في الأرشيف العربي بنجاح.");
  };

  const activePage = pages.find(p => p.id === selectedPageId);

  return (
    <div 
      className={`h-screen flex flex-col p-4 sm:p-6 max-w-7xl mx-auto dark:bg-navy-900 transition-colors duration-300 relative ${isDragging ? 'scale-[0.99] opacity-80' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-gold-500/10 border-4 border-dashed border-gold-500 rounded-3xl flex flex-col items-center justify-center backdrop-blur-[2px] pointer-events-none animate-pulse">
           <div className="bg-white dark:bg-navy-800 p-8 rounded-full shadow-2xl mb-4">
              <Upload className="w-16 h-16 text-gold-500" />
           </div>
           <h3 className="text-3xl font-black text-navy-900 dark:text-white mb-2">أفلت المستندات العربية</h3>
           <p className="text-navy-700 dark:text-gray-300 font-bold">سيتم استخراج النصوص العربية فوراً</p>
        </div>
      )}

      {/* Mic Error Banner */}
      {micError && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-center justify-between text-red-700 dark:text-red-400 animate-fade-in">
           <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold text-sm">{micError}</span>
           </div>
           <button onClick={() => setMicError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 print:hidden gap-4">
        <div>
           <h2 className="text-2xl font-black text-navy-900 dark:text-white flex items-center gap-2">
             مركز استخراج النصوص العربية
             {highPrecision && <Sparkles className="w-5 h-5 text-gold-500 animate-pulse" />}
           </h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">حول المذكرات العربية المكتوبة بخط اليد أو التسجيلات الصوتية إلى نصوص رقمية.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex bg-gray-200 dark:bg-navy-800 p-1.5 rounded-xl border dark:border-navy-700 shadow-inner">
               <button 
                onClick={() => setHighPrecision(false)} 
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${!highPrecision ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-navy-900 dark:hover:text-white'}`}
               >
                 مطبوعات
               </button>
               <button 
                onClick={() => setHighPrecision(true)} 
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${highPrecision ? 'bg-gold-600 text-white shadow-lg' : 'text-gray-500 hover:text-navy-900 dark:hover:text-white'}`}
               >
                 خط يدوي
               </button>
            </div>

            <div className="flex gap-2 flex-1 lg:flex-none">
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-navy-900 dark:bg-navy-700 text-white px-5 py-2.5 rounded-xl font-black hover:bg-navy-800 transition-all shadow-md active:scale-95">
                <Upload className="w-4 h-4" /> 
                <span className="hidden sm:inline">رفع مستند عربي</span>
              </button>
              <input type="file" multiple accept="image/*,audio/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              
              <button 
                onClick={isRecording ? handleStopRecording : handleStartRecording} 
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-white transition-all shadow-lg active:scale-95 ${isRecording ? 'bg-red-600 ring-4 ring-red-500/20' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isRecording ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                    <span>إنهاء الإملاء</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>إملاء عربي</span>
                  </>
                )}
              </button>
            </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden print:hidden">
        {/* Pages Sidebar List */}
        <div className="hidden sm:block w-48 bg-gray-100 dark:bg-navy-800 rounded-[2rem] p-4 overflow-y-auto space-y-4 border dark:border-navy-700 scrollbar-hide">
          {pages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
               <ScanText className="w-8 h-8 text-gray-300 mb-2" />
               <p className="text-[10px] text-gray-400 font-bold leading-relaxed">بانتظار المستندات العربية</p>
            </div>
          ) : (
            pages.map((page) => (
              <div 
                key={page.id} 
                onClick={() => setSelectedPageId(page.id)} 
                className={`relative group cursor-pointer border-2 rounded-2xl overflow-hidden bg-white dark:bg-navy-700 transition-all ${selectedPageId === page.id ? 'border-gold-500 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                {page.imageUrl ? <img src={page.imageUrl} className="w-full h-24 object-contain p-2" /> : <div className="h-24 flex items-center justify-center"><FileAudio className="text-gold-500 w-8 h-8" /></div>}
                
                <button 
                  onClick={(e) => deletePage(page.id, e)}
                  className="absolute top-1 left-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {page.isProcessing && (
                  <div className="absolute inset-0 bg-white/70 dark:bg-navy-800/70 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-white dark:bg-navy-800 rounded-[2rem] shadow-2xl border dark:border-navy-700 flex flex-col overflow-hidden">
           {activePage ? (
             <div className="flex h-full flex-col">
               <div className="p-4 bg-navy-950 border-b dark:border-navy-700 flex justify-between items-center px-6 shadow-md z-10 text-white">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-black text-xs text-gold-500 uppercase tracking-widest">المستند العربي المختار</span>
                      <span className="font-bold text-sm">صفحة {activePage.pageNumber}</span>
                    </div>
                    <button 
                      onClick={handleArchive}
                      disabled={activePage.isProcessing}
                      className="hidden sm:flex items-center gap-1.5 text-xs bg-gold-600 hover:bg-gold-500 text-white px-4 py-2 rounded-xl transition-all font-black disabled:opacity-50 shadow-lg"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      أرشفة بالعربية
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCopy} 
                      className="p-3 bg-navy-900 hover:bg-navy-800 border border-navy-800 rounded-xl transition-all flex items-center gap-2 text-xs px-4"
                    >
                      {copied ? <Check className="text-green-400 w-4 h-4" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      <span className="font-bold">نسخ النص</span>
                    </button>
                    <button 
                      onClick={() => window.print()} 
                      className="p-3 bg-navy-900 hover:bg-navy-800 border border-navy-800 rounded-xl transition-all flex items-center gap-2 text-xs px-4"
                    >
                      <Printer className="w-4 h-4 text-gray-400" />
                      <span className="font-bold">طباعة</span>
                    </button>
                  </div>
               </div>
               
               <div className="flex-1 relative flex flex-col">
                  {activePage.isProcessing && (
                    <div className="absolute inset-0 z-20 bg-white/40 dark:bg-navy-900/40 backdrop-blur-[1px] flex items-center justify-center flex-col gap-4">
                       <div className="bg-white dark:bg-navy-800 p-8 rounded-full shadow-2xl">
                          <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
                       </div>
                       <p className="font-black text-navy-900 dark:text-white animate-pulse">جاري استخراج الكلمات العربية بدقة...</p>
                    </div>
                  )}
                  <textarea 
                    value={activePage.extractedText} 
                    onChange={(e) => setPages(prev => prev.map(p => p.id === activePage.id ? {...p, extractedText: e.target.value} : p))} 
                    className="flex-1 p-6 sm:p-12 dark:bg-navy-800 dark:text-white text-lg sm:text-2xl leading-[2.2] resize-none focus:outline-none font-serif scrollbar-thin selection:bg-gold-200 dark:selection:bg-gold-900/50" 
                    dir="rtl"
                    placeholder="سيظهر النص العربي المستخرج هنا..."
                  ></textarea>
               </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8 text-center bg-gray-50/50 dark:bg-navy-900/20">
                <div className="bg-white dark:bg-navy-800 p-10 rounded-full mb-6 shadow-xl border dark:border-navy-700 group transition-all hover:scale-105">
                  <ScanText className="w-20 h-20 opacity-20 group-hover:opacity-40 transition-opacity" />
                </div>
                <h3 className="font-black text-xl text-navy-900 dark:text-white mb-2">بانتظار المستندات العربية...</h3>
                <p className="text-sm font-medium mt-2 max-w-xs leading-relaxed">قم برفع مذكرات عربية، صور أحكام، أو استخدم الإملاء الصوتي لتحويل كلامك فوراً إلى نصوص قانونية رقمية باللغة العربية حصراً.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default OCRTool;
