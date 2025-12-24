
import React, { useState, useRef, useEffect } from 'react';
import { sendLegalQuery, transcribeAudio } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Globe, Search, X, Camera, ZoomIn, BrainCircuit, Mic, Square, Loader2, AlertCircle, Key, RefreshCw, Paperclip, FileText, File } from 'lucide-react';

const SmartAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'أهلاً بك زميلي العزيز. أنا مستشارك القانوني الاستراتيجي "الأقوى والأجدر" لعام 2025. تم تفعيل "وضع التفكير العميق" للبحث في أعقد الثغرات والقوانين الكويتية المحدثة. كيف يمكنني إبهارك اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // إدارة الملفات والمرفقات
  const [selectedAttachment, setSelectedAttachment] = useState<{name: string, data: string, mimeType: string, type: 'image' | 'file'} | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // للصور
  const docInputRef = useRef<HTMLInputElement>(null); // للمستندات (PDF)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isLoading, lastError]);

  const handleOpenKeySelector = async () => {
    try {
      if (typeof (window as any).aistudio?.openSelectKey === 'function') {
        await (window as any).aistudio.openSelectKey();
        setLastError(null); // إعادة التصفير بعد المحاولة
      } else {
        alert("يرجى مراجعة إعدادات المحرك وتحديث مفتاح API يدوياً.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
          setIsTranscribing(true);
          try {
            const text = await transcribeAudio(base64);
            setInputValue(prev => prev + (prev ? " " : "") + text);
          } catch (err: any) {
            setLastError(`خطأ في تحويل الصوت: ${err.message}`);
          } finally {
            setIsTranscribing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("يرجى السماح بالوصول إلى الميكروفون للتحدث.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // معالجة رفع الصور
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedAttachment({
          name: file.name,
          data: base64,
          mimeType: file.type,
          type: 'image'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // معالجة رفع المستندات (PDF/Text)
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      const wordTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (wordTypes.includes(file.type) || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        alert("تنبيه: محرك الذكاء الاصطناعي يدعم ملفات PDF للحفاظ على التنسيق القانوني. يرجى حفظ ملف Word بصيغة PDF ثم إعادة المحاولة.");
        if (docInputRef.current) docInputRef.current.value = ''; // تصفير الحقل
        return;
      }

      // السماح بـ PDF والنصوص فقط
      const supportedTypes = ['application/pdf', 'text/plain', 'text/csv', 'text/html'];
      if (!supportedTypes.includes(file.type) && !file.type.startsWith('image/')) {
        alert("نوع الملف غير مدعوم. يرجى استخدام ملفات PDF.");
        if (docInputRef.current) docInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedAttachment({
          name: file.name,
          data: base64,
          mimeType: file.type,
          type: 'file'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedAttachment) return;
    setLastError(null);
    
    // إعداد المرفق للعرض في الشات
    let displayImage: string | undefined = undefined;
    if (selectedAttachment?.type === 'image') {
      displayImage = `data:${selectedAttachment.mimeType};base64,${selectedAttachment.data}`;
    }

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: inputValue || (selectedAttachment ? `مرفق ملف: ${selectedAttachment.name}. أرجو تحليله قانونياً.` : "أرجو الإفادة."), 
      image: displayImage,
      timestamp: new Date() 
    };

    setMessages(prev => [...prev, userMsg]);
    
    const payloadAttachment = selectedAttachment ? {
      mimeType: selectedAttachment.mimeType,
      data: selectedAttachment.data
    } : null;

    setInputValue('');
    setSelectedAttachment(null);
    setIsLoading(true);

    try {
      // تجهيز التاريخ مع استبعاد الرسائل الخاطئة
      const history = messages
        .filter(m => m.id !== 'welcome' && m.id !== 'err')
        .map(m => {
          const parts: any[] = [{ text: m.text }];
          if (m.image) {
            // ملاحظة: التاريخ هنا يدعم الصور فقط حالياً كعرض، الملفات ترسل في الطلب الحالي
            parts.push({ inlineData: { mimeType: 'image/jpeg', data: m.image.split(',')[1] } });
          }
          return { role: m.role, parts };
        });
      
      const { text, sources } = await sendLegalQuery(history, userMsg.text, payloadAttachment);
      
      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: text || "عذراً، لم أتمكن من المعالجة القانونية المطلوبة.", 
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error("Assistant Error:", error);
      let errorMsg = "حدث خطأ غير متوقع في التواصل مع المحرك القانوني.";
      
      // تحسين رسائل الخطأ
      if (error.message?.includes("API_KEY_INVALID")) errorMsg = "مفتاح API غير صالح. يرجى اختيار مفتاح جديد.";
      if (error.message?.includes("429")) errorMsg = "تم تجاوز حد الطلبات المسموح به. يرجى المحاولة لاحقاً.";
      if (error.message?.includes("quota")) errorMsg = "انتهت حصة الاستخدام (Quota) للمفتاح الحالي.";
      if (error.message?.includes("INVALID_ARGUMENT") || error.message?.includes("MIME type")) {
         errorMsg = "نوع الملف المرفق غير مدعوم من قبل المحرك. يرجى استخدام PDF أو صور فقط.";
      }
      
      setLastError(`${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-navy-900 transition-colors duration-300 relative">
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-up" />
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-navy-800 border-b dark:border-navy-700 px-6 py-4 shadow-sm z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-gold-500 p-2 rounded-xl"><BrainCircuit className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-xl font-black text-navy-900 dark:text-white tracking-tight">المستشار القانوني الاستراتيجي</h2>
              <p className="text-[10px] text-gold-600 font-black uppercase tracking-widest">وضع التفكير العميق + بحث حي 2025</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSearchVisible(!isSearchVisible)} className={`p-2 rounded-full transition-colors ${isSearchVisible ? 'bg-gold-100 text-gold-600' : 'text-gray-500 hover:bg-gray-100'}`}><Search className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 max-w-5xl ${msg.role === 'user' ? 'mr-auto flex-row-reverse' : ''}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-navy-800 text-white' : 'bg-gold-500 text-white'}`}>
              {msg.role === 'user' ? <User className="w-7 h-7" /> : <Bot className="w-7 h-7" />}
            </div>
            <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`relative rounded-3xl p-6 shadow-xl text-lg leading-relaxed ${
                msg.role === 'user' ? 'bg-navy-900 text-white rounded-tr-none' : 'bg-white dark:bg-navy-800 text-navy-900 dark:text-gray-100 border border-gray-100 dark:border-navy-700 rounded-tl-none'
              }`}>
                {msg.image && <img src={msg.image} className="max-w-sm rounded-2xl mb-4 border dark:border-navy-600 cursor-zoom-in" onClick={() => setLightboxImage(msg.image!)} />}
                
                <div className="space-y-4 font-serif" dir="rtl">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={line.includes('قانون') || line.includes('المادة') ? 'font-black text-gold-600' : ''}>{line}</p>
                  ))}
                </div>
                
                {msg.sources && (
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-navy-700 flex flex-wrap gap-2">
                    {msg.sources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" className="text-[11px] font-bold bg-navy-50 dark:bg-navy-700 text-navy-700 dark:text-gold-500 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-gold-500 hover:text-white transition-all">
                        {source.title.substring(0, 30)}...
                      </a>
                    ))}
                  </div>
                )}
                <span className="text-[10px] block mt-4 font-black text-gray-400 opacity-60">
                    {msg.timestamp.toLocaleTimeString('ar-AE', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-gold-200 dark:bg-navy-800 flex items-center justify-center"><BrainCircuit className="w-6 h-6 text-gold-500 animate-spin" /></div>
            <p className="text-[10px] text-gold-600 font-black">جاري التفكير بعمق في استراتيجية الرد...</p>
          </div>
        )}

        {lastError && (
          <div className="flex items-center gap-4 max-w-5xl mr-auto flex-row-reverse animate-fade-in">
             <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg"><AlertCircle className="w-7 h-7" /></div>
             <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-6 rounded-3xl shadow-xl flex flex-col gap-4 max-w-xl items-end">
                <p className="text-red-700 dark:text-red-400 font-black text-right" dir="rtl">{lastError}</p>
                <div className="flex gap-2">
                   <button 
                    onClick={handleSend}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-red-700 transition-all"
                   >
                     <RefreshCw className="w-4 h-4" /> إعادة المحاولة
                   </button>
                   <button 
                    onClick={handleOpenKeySelector}
                    className="flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-navy-800 transition-all"
                   >
                     <Key className="w-4 h-4" /> تحديد مفتاح API جديد
                   </button>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white dark:bg-navy-800 border-t dark:border-navy-700 shadow-2xl">
        <div className="max-w-5xl mx-auto">
          {/* عرض الملف المرفق */}
          {selectedAttachment && (
            <div className="mb-4 flex items-center gap-4 p-3 bg-gold-50 dark:bg-gold-900/10 rounded-2xl border border-gold-200 animate-bounce-in max-w-fit">
              {selectedAttachment.type === 'image' ? (
                 <img src={`data:${selectedAttachment.mimeType};base64,${selectedAttachment.data}`} className="w-12 h-12 object-cover rounded-xl" />
              ) : (
                 <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                 </div>
              )}
              <div className="flex flex-col">
                 <span className="text-xs font-black text-navy-900 dark:text-white truncate max-w-[200px]">{selectedAttachment.name}</span>
                 <span className="text-[9px] text-gray-500 font-bold uppercase">{selectedAttachment.type === 'file' ? 'مستند قضية' : 'صورة'}</span>
              </div>
              <button onClick={() => setSelectedAttachment(null)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {/* زر رفع المستندات (الدبوس) */}
              <button 
                onClick={() => (docInputRef.current as any).click()} 
                className="p-4 bg-gray-100 dark:bg-navy-700 text-navy-600 dark:text-gray-300 rounded-2xl hover:bg-gold-500 hover:text-white transition-all shadow-md active:scale-90"
                title="إرفاق ملف قضية (PDF)"
              >
                <Paperclip className="w-6 h-6" />
              </button>

              <button 
                onClick={() => (fileInputRef.current as any).click()} 
                className="p-4 bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gold-500 hover:text-white transition-all shadow-md active:scale-90"
                title="إرفاق صورة"
              >
                <Camera className="w-6 h-6" />
              </button>
              
              <button 
                onClick={isRecording ? stopRecording : startRecording} 
                className={`p-4 rounded-2xl transition-all shadow-md active:scale-90 ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 hover:bg-gold-600 hover:text-white'}`}
                title="إملاء صوتي"
              >
                {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            </div>

            {/* Hidden Inputs */}
            <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
            <input type="file" className="hidden" ref={docInputRef} accept=".pdf,.txt" onChange={handleDocUpload} />
            
            <div className="relative flex-1">
              <input 
                type="text" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder={isTranscribing ? "جاري تحويل صوتك إلى نص قانوني..." : "اسأل المستشار أو أرفق ملف PDF للقضية..."} 
                className="w-full pl-16 pr-6 py-5 bg-gray-100 dark:bg-navy-900 border-0 text-navy-900 dark:text-white rounded-[2rem] focus:ring-4 focus:ring-gold-500/20 transition-all font-bold text-lg shadow-inner disabled:opacity-50" 
                disabled={isTranscribing}
              />
              <button 
                onClick={handleSend} 
                disabled={(!inputValue.trim() && !selectedAttachment) || isLoading || isTranscribing} 
                className="absolute left-3 top-2.5 p-3 bg-navy-900 dark:bg-gold-600 text-white rounded-full hover:scale-110 active:scale-95 disabled:opacity-30 transition-all shadow-xl"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAssistant;
