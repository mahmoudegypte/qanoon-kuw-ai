
import { GoogleGenAI, Modality } from "@google/genai";
import { KUWAIT_LAWS_CONTEXT } from '../types';

// Fix: Initialize GoogleGenAI using process.env.API_KEY with runtime override capability from localStorage and hardcoded fallback as requested.
const getGenAI = () => {
  const customKey = (typeof window !== 'undefined') ? localStorage.getItem('custom_gemini_api_key') : null;
  // المفتاح الذي طلبه المستخدم كخيار احتياطي نهائي لضمان عمل التطبيق فوراً
  const hardcodedFallback = 'AIzaSyCgMz7efbPwiz7d1dtRIu2km2ALtrvtM3Y';
  return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY || hardcodedFallback });
};

export const generateLegalDocument = async (
  docType: string,
  partyA: string,
  partyB: string,
  details: string,
  options: {
    courtDetails?: { name: string; caseNumber: string; section: string };
    clauses?: string[];
    tone?: 'formal' | 'aggressive' | 'diplomatic';
  } = {}
): Promise<string> => {
  try {
    const ai = getGenAI();
    // استخدام أحدث موديل برو للنتائج القانونية الأكثر دقة وتعقيداً
    const modelName = 'gemini-3.1-pro-preview';
    
    const courtContext = options.courtDetails ? `
      المحكمة: ${options.courtDetails.name}
      رقم القضية: ${options.courtDetails.caseNumber}
      الدائرة: ${options.courtDetails.section}
    ` : '';

    const clausesContext = options.clauses && options.clauses.length > 0 
      ? `يجب تضمين البنود القانونية التالية وصياغتها بدقة احترافية: ${options.clauses.join('، ')}.`
      : '';

    const toneInstruction = options.tone === 'aggressive' 
      ? 'استخدم نبرة قانونية هجومية قوية تركز على مواطن الضعف لدى الخصم واستغلال الثغرات.'
      : options.tone === 'diplomatic'
      ? 'استخدم نبرة تصالحية مرنة تهدف لحل النزاع ودياً مع الحفاظ التام على الحقوق القانونية.'
      : 'استخدم نبرة رسمية أكاديمية رصينة تليق بكبار المحامين.';

    const prompt = `
      ${KUWAIT_LAWS_CONTEXT}
      المهمة: صياغة ${docType} متكاملة الأركان وفق أحكام القانون الكويتي المحدث وباللغة العربية الفصحى فقط.
      ${courtContext}
      البيانات المتاحة:
      ${details}
      
      ${clausesContext}
      النبرة المطلوبة: ${toneInstruction}
      
      المطلوب:
      1. كتابة النص القانوني كاملاً بأسلوب رصين وباللغة العربية فقط.
      2. التأكد من ذكر أسماء الأطراف وأرقامهم المدنية بوضوح في الديباجة.
      3. ترتيب البنود منطقياً (تمهيد، موضوع، شروط، خاتمة).
      4. إنتاج نص جاهز للطباعة فوراً خالي من الأخطاء الإملائية.
    `;

    // Fix: Using generateContent with thinkingConfig and direct .text property access.
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { 
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "حدث خطأ في استجابة المحرك.";
  } catch (error: any) {
    console.error("Gen Doc Error:", error);
    throw new Error(error.message || "فشل الاتصال بالمحرك القانوني");
  }
};

export const sendLegalQuery = async (
  history: {role: string, parts: any[]}[],
  message: string,
  attachment?: { mimeType: string; data: string } | null
): Promise<{ text: string; sources: { uri: string; title: string }[] }> => {
  try {
    const ai = getGenAI();
    const modelName = 'gemini-3.1-pro-preview';
    const currentParts: any[] = [{ text: message }];
    
    if (attachment) {
      currentParts.push({ 
        inlineData: { 
          mimeType: attachment.mimeType, 
          data: attachment.data 
        } 
      });
    }

    const contents = [...history, { role: 'user', parts: currentParts }];
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: { 
        systemInstruction: KUWAIT_LAWS_CONTEXT,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });
    const text = response.text || "";
    const sources: { uri: string; title: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) sources.push({ uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri });
      });
    }
    return { text, sources };
  } catch (error: any) { throw error; }
};

export const extractTextFromImage = async (base64Image: string, highPrecision: boolean = false): Promise<string> => {
  try {
    const ai = getGenAI();
    // استخدام أحدث موديل فلاش للسرعة والدقة الفائقة في استخراج النصوص
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "أنت خبير OCR قانوني كويتي. استخرج النص الموجود في هذه الصورة باللغة العربية فقط. حافظ على التنسيق الأصلي. لا تقم بالترجمة ولا تكتب أي تعليقات بالإنجليزية." }
        ]
      }
    });
    return response.text || "";
  } catch (error: any) { throw error; }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string = 'audio/mp3'): Promise<string> => {
  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Audio } },
          { text: "حول هذا التسجيل الصوتي القانوني إلى نص مكتوب باللغة العربية الفصحى الرصينة. لا تقم بالترجمة، استخرج الكلام كما هو بالعربية فقط." }
        ]
      }
    });
    return response.text || "";
  } catch (error: any) { throw error; }
};

export const generateSessionChecklist = async (sessionDetails: string): Promise<string> => {
  try {
    const ai = getGenAI();
    const prompt = `
      ${KUWAIT_LAWS_CONTEXT}
      بصفتك مستشاراً قانونياً كويتياً خبيراً، قم بإنشاء "قائمة تحقق" (Checklist) قصيرة ومركزة لتجهيز المحامي قبل حضور الجلسة التالية.
      
      تفاصيل الجلسة:
      ${sessionDetails}
      
      المطلوب:
      1. قائمة نقاط (Bullet points) بالمهام الضرورية (مثلاً: المستندات المطلوبة، الرسوم، التوكيلات).
      2. نصيحة استراتيجية واحدة في النهاية.
      3. الإجابة تكون مباشرة وبدون مقدمات طويلة.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt
    });
    return response.text || "لا توجد توصيات حالياً.";
  } catch (error: any) {
    return "تعذر توليد قائمة المهام. تأكد من الاتصال بالإنترنت.";
  }
};

/**
 * ميزة جديدة: تحويل النص القانوني إلى صوت (TTS)
 * تساعد المحامين على الاستماع للمذكرات أثناء التنقل
 */
export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `اقرأ النص القانوني التالي بنبرة رسمية وواضحة: ${text.substring(0, 1000)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || "";
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

/**
 * ميزة جديدة: توليد تصور بصري للقضية أو ملخص بياني
 */
export const generateLegalVisualization = async (caseSummary: string): Promise<string> => {
  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: `أنشئ صورة تعبيرية احترافية (Infographic style) تلخص المفهوم القانوني التالي للقانون الكويتي: ${caseSummary}. 
            يجب أن تكون الصورة رصينة، بألوان ذهبية وكحلية، توحي بالعدالة والقوة القانونية. 
            لا تضف نصوصاً معقدة، ركز على الرموز القانونية (ميزان، مطرقة، كتب قانونية، شعار دولة الكويت).`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return "";
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};
