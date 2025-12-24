
import React from 'react';
import { Gavel, BrainCircuit, FileText, ScanText, Archive, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

const GuideArticle: React.FC = () => {
  const sections = [
    {
      title: "أجندة المحاكم الذكية",
      icon: <Gavel className="w-6 h-6 text-blue-600" />,
      desc: "نظام تتبع استباقي للجلسات في الكويت. لا يكتفي بجدولة المواعيد، بل يتيح ترحيل القرارات آلياً وتنبيه الموكلين عبر واتساب، مع تذكيرات ذكية قبل الجلسة بـ 24-72 ساعة.",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "المستشار القانوني (AI Assistant)",
      icon: <BrainCircuit className="w-6 h-6 text-gold-600" />,
      desc: "شريكك في التفكير الاستراتيجي. مدرب على القوانين الكويتية ومبادئ محكمة التمييز. يمكنه تحليل مذكرات الخصم، استخراج الثغرات، والبحث الحي عن أحدث التعديلات التشريعية.",
      bg: "bg-gold-50 dark:bg-gold-900/20"
    },
    {
      title: "مولد العقود والمذكرات",
      icon: <FileText className="w-6 h-6 text-purple-600" />,
      desc: "صياغة قانونية رصينة في ثوانٍ. يضم نماذج جاهزة لعقود العمل، تأسيس الشركات، وصحف الدعاوى، مع إمكانية التحكم في نبرة الصياغة لتكون هجومية أو تصالحية.",
      bg: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "مركز استخراج النصوص (OCR)",
      icon: <ScanText className="w-6 h-6 text-green-600" />,
      desc: "تحويل المذكرات الورقية، الأحكام المطبوعة، وحتى خط اليد العربي الصعب إلى نصوص رقمية قابلة للتعديل بدقة متناهية، بالإضافة لتفريغ التسجيلات الصوتية للجلسات.",
      bg: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "خزانة الملفات (Archive)",
      icon: <Archive className="w-6 h-6 text-navy-600" />,
      desc: "أرشفة إلكترونية ذكية تربط كافة المستندات والقرارات برقم القضية واسم الموكل، مما يسهل الوصول للمعلومة في ثوانٍ معدودة من أي مكان.",
      bg: "bg-gray-100 dark:bg-navy-900/30"
    }
  ];

  return (
    <div className="p-4 sm:p-12 max-w-5xl mx-auto space-y-12 animate-fade-in pb-32">
      <div className="text-center space-y-4">
        <div className="bg-gold-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl mb-6">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-navy-900 dark:text-white tracking-tight">"القانوني AI"</h1>
        <p className="text-xl font-bold text-gold-600">الثورة الرقمية الشاملة لإدارة مكاتب المحاماة في الكويت</p>
        <div className="w-24 h-1 bg-navy-900 dark:bg-gold-500 mx-auto rounded-full"></div>
      </div>

      <p className="text-xl leading-relaxed text-navy-800 dark:text-gray-300 font-medium text-center max-w-3xl mx-auto">
        جامعاً بين دقة القوانين المحلية وقوة الذكاء الاصطناعي، تم تصميم "القانوني AI" ليكون العمود الفقري لمكتب المحاماة العصري.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className={`${section.bg} p-8 rounded-[2.5rem] shadow-sm border border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
             <div className="bg-white dark:bg-navy-800 p-3 rounded-2xl w-fit mb-4 shadow-sm">{section.icon}</div>
             <h3 className="text-2xl font-black text-navy-900 dark:text-white mb-3">{section.title}</h3>
             <p className="text-sm text-gray-600 dark:text-gray-400 font-bold leading-relaxed">{section.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-navy-900 text-white p-10 rounded-[3rem] border-4 border-gold-500/20 shadow-2xl flex flex-col md:flex-row items-center gap-8">
        <ShieldCheck className="w-20 h-20 text-gold-500 shrink-0" />
        <div>
          <h3 className="text-2xl font-black mb-4">أمان البيانات والخصوصية</h3>
          <p className="text-lg opacity-80 leading-relaxed font-bold">
            نظام "القانوني AI" يعمل بمبدأ الخصوصية المطلقة؛ كافة ملفاتك وأبحاثك تتم معالجتها وتخزينها محلياً على جهازك، ولا يتم تخزين أي بيانات سرية خارج نطاق مكتبك.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuideArticle;
