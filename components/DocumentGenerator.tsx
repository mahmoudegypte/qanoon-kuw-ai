
import React, { useState, useEffect } from 'react';
import { generateLegalDocument } from '../services/geminiService';
import { Printer, PenTool, Loader2, Archive, Copy, Check, Layout, ShieldCheck, MessageSquare, Scale, UserCheck, Hash, FileText, Banknote, CreditCard } from 'lucide-react';
import { FirmSettings, ArchiveItem } from '../types';

const DocumentGenerator: React.FC = () => {
  const [docType, setDocType] = useState('عقد أتعاب محاماة');
  const [partyA, setPartyA] = useState('');
  const [idA, setIdA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [idB, setIdB] = useState('');
  const [courtName, setCourtName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [details, setDetails] = useState('');
  const [tone, setTone] = useState<'formal' | 'aggressive' | 'diplomatic'>('formal');
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  
  // حقول خاصة بعقد الأتعاب
  const [feeAmount, setFeeAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('دفعة واحدة عند التوقيع');
  
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<FirmSettings | null>(null);
  const [copied, setCopied] = useState(false);

  const clausesList = [
    "بند التحكيم (وفق القانون الكويتي)",
    "بند السرية وعدم الإفصاح المشدد",
    "بند القوة القاهرة (قانون مدني)",
    "بند الاختصاص القضائي (محاكم الكويت)",
    "بند الشرط الجزائي (التعويض الاتفاقي)",
    "بند إنهاء العقد بالإرادة المنفردة",
    "بند التجديد التلقائي"
  ];

  const templates = [
    "عقد أتعاب محاماة",
    "عقد عمل أهلي (محدد المدة)",
    "عقد عمل أهلي (غير محدد المدة)",
    "عقد توريد بضائع ونموذج طلب",
    "عقد تأسيس شركة (شركة الشخص الواحد)",
    "عقد تأسيس شركة (ذات مسؤولية محدودة)",
    "عقد إيجار (سكن خاص)",
    "عقد إيجار (محلات تجارية/استثماري)",
    "عقد مقاولة بناء (مقطوعية)",
    "عقد إدارة وتشغيل مرافق",
    "صحيفة دعوى (مدني كلي)",
    "صحيفة دعوى (تجاري)",
    "صحيفة دعوى (عمالي)",
    "مذكرة دفاع (أمام محكمة أول درجة)",
    "مذكرة رَد (أمام محكمة الاستئناف)",
    "اتفاقية صلح وإبراء ذمة نهائي",
    "إنذار رسمي على يد محضر (تكليف بالوفاء)",
    "توكيل رسمي خاص (للتصرف والإدارة)",
    "عقد بيع ابتدائي (عقار)",
    "عقد بيع مركبة/آلية",
    "عقد شراكة (محاصة)"
  ];

  useEffect(() => {
    const saved = localStorage.getItem('lawFirmSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      // تعبئة الطرف الأول تلقائياً من إعدادات المكتب إذا كان النموذج عقد أتعاب
      if (docType === 'عقد أتعاب محاماة' && parsed.firmName) {
        setPartyA(parsed.firmName);
      }
    }
  }, [docType]);

  const toggleClause = (clause: string) => {
    setSelectedClauses(prev => 
      prev.includes(clause) ? prev.filter(c => c !== clause) : [...prev, clause]
    );
  };

  const handleCopy = () => {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!partyA || !partyB) return alert("يرجى تعبئة بيانات الأطراف الأساسية (الاسم)");
    setLoading(true);
    try {
      const courtDetails = caseNumber ? { name: courtName, caseNumber: caseNumber, section: '' } : undefined;
      
      let enrichedDetails = `
        الطرف الأول: ${partyA} - الرقم المدني/الترخيص: ${idA || 'غير محدد'}
        الطرف الثاني: ${partyB} - الرقم المدني: ${idB || 'غير محدد'}
        نوع الوثيقة: ${docType}
      `;

      if (docType === 'عقد أتعاب محاماة') {
        enrichedDetails += `
          المطلوب صياغة "عقد أتعاب محاماة" مطابق تماماً للنص التالي، مع تعبئة المتغيرات (المبلغ، الأطراف، الموضوع):

          [بداية النموذج]
          أنه في يوم ....... الموافق ....... انعقد هذا العقد بين كل من:
          أولاً: مكتب المحامي/ ${partyA} (طرف أول)
          ثانياً: السيد/ ${partyB} - الرقم المدني (${idB}) (طرف ثان)

          تمهيد:
          قام الطرف الثاني بتوكيل الطرف الأول هو أو من ينوب عنه في مباشرة: ${details}

          البند الأول:
          يعد التمهيد السابق جزء لا يتجزأ من هذا العقد وهو مكمل له ولا حق به.

          البند الثاني:
          يلتزم الطرف الأول بمباشرة الأعمال القانونية اللازمة بشأن الموضوع المبين بالتمهيد الوارد بصدر هذا العقد ويكون الطرف الأول ملزم ببذل العناية اللازمة في العمل الموكل فيه ولا يكون ملزم بتحقيق نتيجة حيث أن القرار الصادر في العمل القانوني بيد الجهة القضائية.

          البند الثالث:
          1- اتفق الطرفان على أن يدفع الطرف الثاني مبلغ وقدره ${feeAmount} د.ك (فقط ${feeAmount} دينار كويتي لا غير) قيمة الأتعاب للطرف الأول.
          2- طريقة السداد: ${paymentMethod} (يلتزم الطرف الثاني بدفع الأتعاب وفقاً لهذا الاتفاق).

          البند الرابع:
          لا تعد ذمة الطرف الثاني مبرئة من أية التزامات مالية (مقدم أتعاب أو مؤخر أتعاب) تجاه الطرف الأول إلا بعد حصوله على سند قبض مذيل بتوقيع الطرف الأول.

          البند الخامس:
          يستحق الطرف الأول كامل الأتعاب في حالة عزوف الطرف الثاني عن الاستمرار في الخصومة أو في حالة التصالح مع الخصم أو إذا أخل ببنود هذا العقد مع مراعاة ما ورد بالفقرة 2 من البند الثالث.

          البند السادس:
          يلتزم الطرف الثاني بدفع الرسوم القضائية والمصاريف الخاصة بالعمل المكلف به الطرف الأول من مصاريف تصوير ورسوم رفع الدعاوى القضائية وأمانات الخبرة مع تحمله المسئولية كاملة في حالة تقاعسه عن دفع الرسوم والأمانات والمصاريف الخاصة بالدعاوى كما يتعهد بالإعلان بالإرشاد على عنوان خصمه ويتحمل مسئولية الإعلان كاملة في حالة عدم تمامه.

          البند السابع:
          كذلك يلتزم الطرف الثاني بتسليم الطرف الأول المستندات والأوراق الخاصة بالدعاوى أو أي إجراء قانوني قبل فترة كافية من تقديم تلك المستندات للمحكمة أو للجهات المختصة كما أنه ملزم بترجمة ما يستلزم من مستندات وتكون الترجمة على نفقته الخاصة في جهة معتمدة وفي حال تأخر الطرف الثاني عن تسليم الطرف الأول تلك المستندات فأن الطرف الأول لا يكون مسئولاً عما يترتب عن ذلك من عواقب.

          البند الثامن:
          يلتزم الطرف الثاني بالحضور إلى المحكمة متى طلب منه ذلك وكذلك يتعهد بإحضار الشهود أيضاً سواء كانوا شهود الإثبات أو شهود النفي ويتحمل الطرف الثاني المسئولية كاملة في حالة عدم إحضار شهوده أو الإدلاء بأي بيانات خاطئة للطرف الأول بخصوص القيام بالعمل القانوني المبين في مقدمة هذا العقد.

          البند التاسع:
          للطرف الأول استيفاء ما قد يتبقى من أتعاب من المبالغ المحصلة من الأعمال القانونية الموضحة بالتمهيد الوارد بصدر هذا العقد كما للطرف الأول استيفاء ما له من أتعاب مستحقة لدى الطرف الثاني من أي أموال خاصة به حق تتبعها في أي يد تكون.

          البند العاشر:
          تم الاتفاق بين الطرفين على أن الطعن بالتمييز هو طريق غير عادي للطعن على الأحكام القضائية ويتم تقديم الطعن المذكور بناء على طلب الطرف الثاني مع تحمل الطرف الثاني على الأتعاب التي تم الاتفاق عليها بخصوص الطعن بالتمييز، كما يلتزم الطرف الثاني بسداد الرسم القانوني المقرر للطعن بالتمييز لدى القضاء.

          البند الحادي عشر:
          أطلع الطرفان على ما جاء ببنود هذا العقد وناقشوها واتفقوا على ما جاء بها وأقروها.

          البند الثاني عشر:
          محاكم دولة الكويت هي المختصة بتفسير بنود هذا العقد وبنظر أي نزاع قد ينشأ لا قدر الله بين الطرفين.

          (توقيع الطرف الأول)                               (توقيع الطرف الثاني)
          [نهاية النموذج]
        `;
      } else {
        enrichedDetails += `\nالوقائع والبنود الخاصة: ${details}`;
      }

      const result = await generateLegalDocument(docType, partyA, partyB, enrichedDetails, {
        courtDetails,
        clauses: selectedClauses,
        tone
      });
      setGeneratedDoc(result);
    } catch (err) {
      alert('حدث خطأ أثناء التوليد. يرجى التحقق من اتصال الإنترنت أو مفتاح API.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = () => {
    if (!generatedDoc) return;
    const newItem: ArchiveItem = {
      id: Date.now().toString(),
      title: `${docType} - ${partyA}`,
      caseNumber: caseNumber || 'بدون رقم',
      clientName: partyB, // في عقد الأتعاب الطرف الثاني هو الموكل
      type: 'contract',
      content: generatedDoc,
      timestamp: new Date(),
      tags: ['توليد آلي', ...selectedClauses]
    };
    const currentArchive = JSON.parse(localStorage.getItem('legal_archive') || '[]');
    localStorage.setItem('legal_archive', JSON.stringify([newItem, ...currentArchive]));
    alert("تم الأرشفة بنجاح.");
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-24 space-y-8 animate-fade-in bg-[#f8fafc] dark:bg-navy-900">
      <div className="mb-6">
        <h2 className="text-4xl font-black text-navy-900 dark:text-white mb-2">صياغة العقود والمذكرات</h2>
        <p className="text-navy-700 dark:text-gray-400 font-bold">المحرك القانوني المعتمد لصياغة المستندات الكويتية الرسمية.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* قسم إدخال البيانات - تباين عالي */}
        <div className="bg-white dark:bg-navy-800 p-8 rounded-[2rem] shadow-2xl border-2 border-navy-200 dark:border-navy-700 space-y-8">
          
          <div className="space-y-4">
            <label className="text-sm font-black text-navy-900 dark:text-gold-500 uppercase tracking-widest block">نوع النموذج القانوني</label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-5 bg-navy-50 dark:bg-navy-900 border-2 border-navy-900 dark:border-navy-600 rounded-2xl font-black outline-none focus:border-gold-500 transition-all text-navy-900 dark:text-white text-lg"
            >
              {templates.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* الطرف الأول */}
            <div className="space-y-2">
              <label className="text-xs font-black text-navy-900 dark:text-gray-300 flex items-center gap-2">
                <Scale className="w-4 h-4 text-gold-600" /> {docType === 'عقد أتعاب محاماة' ? 'الطرف الأول (المكتب/المحامي)' : 'الطرف الأول'}
              </label>
              <input type="text" value={partyA} onChange={(e) => setPartyA(e.target.value)} placeholder="الاسم الكامل" className="w-full p-4 bg-white dark:bg-navy-900 border-2 border-navy-900 dark:border-navy-600 rounded-2xl font-black outline-none focus:border-gold-500 text-navy-900 dark:text-white placeholder:text-gray-400" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-navy-900 dark:text-gray-300 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gold-600" /> الرقم المدني/الترخيص
              </label>
              <input type="text" value={idA} onChange={(e) => setIdA(e.target.value)} placeholder="رقم الهوية/القيد" className="w-full p-4 bg-white dark:bg-navy-900 border-2 border-navy-900 dark:border-navy-600 rounded-2xl font-black outline-none focus:border-gold-500 text-navy-900 dark:text-white placeholder:text-gray-400" />
            </div>

            {/* الطرف الثاني */}
            <div className="space-y-2">
              <label className="text-xs font-black text-navy-900 dark:text-gray-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-red-600" /> {docType === 'عقد أتعاب محاماة' ? 'الطرف الثاني (الموكل)' : 'الطرف الثاني'}
              </label>
              <input type="text" value={partyB} onChange={(e) => setPartyB(e.target.value)} placeholder="الاسم الكامل" className="w-full p-4 bg-white dark:bg-navy-900 border-2 border-navy-900 dark:border-navy-600 rounded-2xl font-black outline-none focus:border-gold-500 text-navy-900 dark:text-white placeholder:text-gray-400" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-navy-900 dark:text-gray-300 flex items-center gap-2">
                <Hash className="w-4 h-4 text-red-600" /> الرقم المدني (الطرف 2)
              </label>
              <input type="text" value={idB} onChange={(e) => setIdB(e.target.value)} placeholder="أدخل 12 خانة" className="w-full p-4 bg-white dark:bg-navy-900 border-2 border-navy-900 dark:border-navy-600 rounded-2xl font-black outline-none focus:border-gold-500 text-navy-900 dark:text-white placeholder:text-gray-400" />
            </div>

            {/* حقول خاصة بعقد الأتعاب */}
            {docType === 'عقد أتعاب محاماة' && (
              <>
                <div className="md:col-span-2 grid grid-cols-2 gap-6 bg-gold-50 dark:bg-gold-900/10 p-4 rounded-2xl border border-gold-200 dark:border-gold-900/30">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-navy-900 dark:text-gold-500 flex items-center gap-2">
                      <Banknote className="w-4 h-4" /> مبلغ الأتعاب (د.ك)
                    </label>
                    <input type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} placeholder="30000" className="w-full p-4 bg-white dark:bg-navy-900 border-2 border-gold-500/30 rounded-2xl font-black outline-none focus:border-gold-500 text-navy-900 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-navy-900 dark:text-gold-500 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> طريقة السداد
                    </label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-4 bg-white dark:bg-navy-900 border-2 border-gold-500/30 rounded-2xl font-black outline-none focus:border-gold-500 text-navy-900 dark:text-white text-sm">
                      <option>دفعة واحدة عند التوقيع</option>
                      <option>مقدم 50% والباقي عند الحكم</option>
                      <option>أقساط شهرية</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-navy-900 dark:text-gray-300">
                {docType === 'عقد أتعاب محاماة' ? 'موضوع القضية / الجناية (للتمهيد)' : 'تفاصيل إضافية / وقائع النزاع'}
              </label>
              <textarea 
                value={details} 
                onChange={(e) => setDetails(e.target.value)} 
                placeholder={docType === 'عقد أتعاب محاماة' ? "مثال: جناية مخدرات والمتهم فيها السيد/..." : "اكتب هنا أي تفاصيل تريد أن يراعيها المحرك..."}
                className="w-full p-4 bg-white dark:bg-navy-900 border-2 border-navy-900 dark:border-navy-600 rounded-2xl font-black outline-none focus:border-gold-500 text-navy-900 dark:text-white min-h-[150px] placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-gold-600 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> تخصيص البنود الذكية
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {clausesList.map(clause => (
                <button
                  key={clause}
                  onClick={() => toggleClause(clause)}
                  className={`p-3 rounded-xl text-[10px] font-black transition-all border-2 ${selectedClauses.includes(clause) ? 'bg-navy-900 text-white border-navy-900 shadow-lg' : 'bg-white dark:bg-navy-900 text-navy-800 dark:text-gray-400 border-gray-200 dark:border-navy-700'}`}
                >
                  {clause}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full py-6 bg-navy-950 dark:bg-gold-600 text-white rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 shadow-2xl hover:bg-black transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <PenTool className="w-8 h-8" />}
            {loading ? 'جاري الصياغة...' : 'بدء التوليد القانوني'}
          </button>
        </div>

        {/* منطقة المعاينة - تحسين جذري للرؤية والتباين */}
        <div className="bg-white dark:bg-navy-800 rounded-[2rem] shadow-2xl border-[3px] border-navy-950 dark:border-navy-700 overflow-hidden sticky top-8 flex flex-col h-[850px]">
          <div className="p-5 bg-navy-950 text-white flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
               <Scale className="w-6 h-6 text-gold-500" />
               <h3 className="font-black text-lg uppercase tracking-tight">معاينة النص القانوني المولد</h3>
             </div>
             <div className="flex gap-2">
                {generatedDoc && (
                  <>
                    <button onClick={handleCopy} className="p-3 bg-white text-navy-950 hover:bg-gold-500 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-black shadow-lg" title="نسخ النص كاملاً">
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'تم النسخ' : 'نسخ النص'}
                    </button>
                    <button onClick={handleArchive} className="p-3 bg-navy-800 hover:bg-gold-600 text-white rounded-xl transition-all shadow-lg" title="أرشفة في المجلدات"><Archive className="w-4 h-4" /></button>
                    <button onClick={() => window.print()} className="p-3 bg-navy-800 hover:bg-gold-600 text-white rounded-xl transition-all shadow-lg" title="طباعة فورية"><Printer className="w-4 h-4" /></button>
                  </>
                )}
             </div>
          </div>
          
          {/* خلفية منطقة النص: أبيض ناصع وخط أسود داكن جداً لأفضل رؤية */}
          <div className="flex-1 p-8 sm:p-12 overflow-y-auto bg-white">
             {generatedDoc ? (
               <div className="font-serif text-2xl leading-[2.6] text-black font-medium whitespace-pre-wrap text-justify selection:bg-gold-200">
                 {generatedDoc}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <FileText className="w-24 h-24 text-navy-200" />
                  <p className="font-black text-2xl text-navy-900">المستند جاهز للتوليد عند إدخال البيانات</p>
               </div>
             )}
          </div>
        </div>
      </div>

      <div id="print-area" className="hidden print:block p-16 bg-white text-black font-serif text-xl leading-[2.5]">
          {generatedDoc}
      </div>
    </div>
  );
};

export default DocumentGenerator;
