export type Language = "en" | "es" | "fr" | "de" | "zh" | "ja" | "hi" | "ar";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Navigation
    "header.title": "Study Buddy",
    "header.subtitle": "Here to support you",
    "header.studyMode": "Study Mode",
    "header.language": "Language",
    
    // Study Modes
    "studyMode.active": "Active Learning",
    "studyMode.break": "Break Mode",
    "studyMode.focused": "Focused",
    "studyMode.review": "Review",
    
    // Languages
    "language.en": "English",
    "language.es": "Español",
    "language.fr": "Français",
    "language.de": "Deutsch",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.hi": "हिन्दी",
    "language.ar": "العربية",
    
    // Sidebar
    "sidebar.sessions": "Sessions",
    "sidebar.newSession": "New Session",
    
    // Chat
    "chat.studyBuddy": "Study Buddy",
    "chat.placeholder": "Ask me anything about your studies...",
    "chat.send": "Send",
    
    // Study Mode Responses
    "ai.active.greeting": "Let's dive deep into active learning! Ask me questions and I'll challenge your understanding.",
    "ai.active.follow": "Great! Let me ask you a follow-up question to deepen your understanding.",
    "ai.break.greeting": "Time to relax! Let's take a breather and chat about your studies at a slower pace.",
    "ai.break.follow": "No pressure here. Take your time and let me know what's on your mind.",
    "ai.focused.greeting": "You're in focused mode. Let's minimize distractions and tackle one concept at a time.",
    "ai.focused.follow": "Let's stay focused. Here's the key point you need to understand.",
    "ai.review.greeting": "Great! Let's review what you've learned. I'll help reinforce your knowledge.",
    "ai.review.follow": "Let me quiz you on this concept to make sure you've got it down.",
    
    // Messages
    "message.defaultResponse": "That's a great question! Let me help you with that.",
    "message.encouragement": "You're doing great! Keep up the momentum.",
    "message.motivation": "The beautiful thing about learning is that no one can take it away from you.",
  },
  es: {
    "header.title": "Compañero de Estudio",
    "header.subtitle": "Aquí para apoyarte",
    "header.studyMode": "Modo de Estudio",
    "header.language": "Idioma",
    
    "studyMode.active": "Aprendizaje Activo",
    "studyMode.break": "Modo Descanso",
    "studyMode.focused": "Enfocado",
    "studyMode.review": "Revisión",
    
    "language.en": "English",
    "language.es": "Español",
    "language.fr": "Français",
    "language.de": "Deutsch",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.hi": "हिन्दी",
    "language.ar": "العربية",
    
    "sidebar.sessions": "Sesiones",
    "sidebar.newSession": "Nueva Sesión",
    
    "chat.studyBuddy": "Compañero de Estudio",
    "chat.placeholder": "Pregúntame cualquier cosa sobre tus estudios...",
    "chat.send": "Enviar",
    
    "ai.active.greeting": "¡Sumerjámonos en el aprendizaje activo! Hazme preguntas y desafiaré tu comprensión.",
    "ai.active.follow": "¡Excelente! Déjame hacerte una pregunta de seguimiento para profundizar tu comprensión.",
    "ai.break.greeting": "¡Hora de relajarse! Tomemos un respiro y charlemos sobre tus estudios con calma.",
    "ai.break.follow": "Sin presión aquí. Tómate tu tiempo y cuéntame qué te preocupa.",
    "ai.focused.greeting": "Estás en modo enfocado. Minimicemos distracciones y abordemos un concepto a la vez.",
    "ai.focused.follow": "Mantengamos el enfoque. Aquí está el punto clave que necesitas entender.",
    "ai.review.greeting": "¡Excelente! Repasemos lo que has aprendido. Te ayudaré a reforzar tu conocimiento.",
    "ai.review.follow": "Déjame cuestionarte sobre este concepto para asegurarme de que lo dominas.",
    
    "message.defaultResponse": "¡Esa es una gran pregunta! Déjame ayudarte con eso.",
    "message.encouragement": "¡Lo estás haciendo muy bien! Mantén el impulso.",
    "message.motivation": "La belleza del aprendizaje es que nadie puede quitártelo.",
  },
  fr: {
    "header.title": "Compagnon d'Étude",
    "header.subtitle": "Ici pour vous soutenir",
    "header.studyMode": "Mode d'Étude",
    "header.language": "Langue",
    
    "studyMode.active": "Apprentissage Actif",
    "studyMode.break": "Mode Pause",
    "studyMode.focused": "Concentré",
    "studyMode.review": "Révision",
    
    "language.en": "English",
    "language.es": "Español",
    "language.fr": "Français",
    "language.de": "Deutsch",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.hi": "हिन्दी",
    "language.ar": "العربية",
    
    "sidebar.sessions": "Sessions",
    "sidebar.newSession": "Nouvelle Session",
    
    "chat.studyBuddy": "Compagnon d'Étude",
    "chat.placeholder": "Posez-moi une question sur vos études...",
    "chat.send": "Envoyer",
    
    "ai.active.greeting": "Plongeons dans l'apprentissage actif! Posez-moi des questions et je mettrai votre compréhension au défi.",
    "ai.active.follow": "Excellent! Laissez-moi vous poser une question de suivi pour approfondir votre compréhension.",
    "ai.break.greeting": "C'est l'heure de se détendre! Prenons une pause et discutons de vos études à un rythme plus lent.",
    "ai.break.follow": "Pas de pression ici. Prenez votre temps et dites-moi ce qui vous préoccupe.",
    "ai.focused.greeting": "Vous êtes en mode concentré. Minimisons les distractions et abordons un concept à la fois.",
    "ai.focused.follow": "Restons concentrés. Voici le point clé que vous devez comprendre.",
    "ai.review.greeting": "Excellent! Révisons ce que vous avez appris. Je vous aiderai à renforcer vos connaissances.",
    "ai.review.follow": "Laissez-moi vous tester sur ce concept pour m'assurer que vous l'avez bien compris.",
    
    "message.defaultResponse": "C'est une excellente question! Laissez-moi vous aider.",
    "message.encouragement": "Vous faites du très bon travail! Continuez sur cette lancée.",
    "message.motivation": "La beauté de l'apprentissage, c'est que personne ne peut vous l'enlever.",
  },
  de: {
    "header.title": "Lernbuddy",
    "header.subtitle": "Hier um dich zu unterstützen",
    "header.studyMode": "Lernmodus",
    "header.language": "Sprache",
    
    "studyMode.active": "Aktives Lernen",
    "studyMode.break": "Pausenmodus",
    "studyMode.focused": "Fokussiert",
    "studyMode.review": "Wiederholung",
    
    "language.en": "English",
    "language.es": "Español",
    "language.fr": "Français",
    "language.de": "Deutsch",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.hi": "हिन्दी",
    "language.ar": "العربية",
    
    "sidebar.sessions": "Sitzungen",
    "sidebar.newSession": "Neue Sitzung",
    
    "chat.studyBuddy": "Lernbuddy",
    "chat.placeholder": "Stellen Sie mir eine Frage zu Ihrem Studium...",
    "chat.send": "Senden",
    
    "ai.active.greeting": "Lassen Sie uns ins aktive Lernen eintauchen! Stellen Sie mir Fragen und ich werde Ihr Verständnis herausfordern.",
    "ai.active.follow": "Großartig! Lassen Sie mich Ihnen eine Anschlussfrage stellen, um Ihr Verständnis zu vertiefen.",
    "ai.break.greeting": "Zeit zum Entspannen! Lassen Sie uns eine Pause machen und in einem gemächlicheren Tempo über Ihr Studium sprechen.",
    "ai.break.follow": "Kein Druck hier. Nehmen Sie sich Zeit und erzählen Sie mir, was Sie bewegt.",
    "ai.focused.greeting": "Sie sind im fokussierten Modus. Lassen Sie uns Ablenkungen minimieren und ein Konzept nach dem anderen angehen.",
    "ai.focused.follow": "Bleiben wir konzentriert. Hier ist der Schlüsselpunkt, den Sie verstehen müssen.",
    "ai.review.greeting": "Großartig! Lassen Sie uns wiederholen, was Sie gelernt haben. Ich werde Ihnen helfen, Ihr Wissen zu festigen.",
    "ai.review.follow": "Lassen Sie mich Sie zu diesem Konzept befragen, um sicherzustellen, dass Sie es beherrschen.",
    
    "message.defaultResponse": "Das ist eine großartige Frage! Lassen Sie mich Ihnen helfen.",
    "message.encouragement": "Du machst das großartig! Behalte deinen Schwung bei.",
    "message.motivation": "Das Schöne am Lernen ist, dass dir das niemand nehmen kann.",
  },
  zh: {
    "header.title": "学习伙伴",
    "header.subtitle": "这里支持你",
    "header.studyMode": "学习模式",
    "header.language": "语言",
    
    "studyMode.active": "主动学习",
    "studyMode.break": "休息模式",
    "studyMode.focused": "专注",
    "studyMode.review": "复习",
    
    "language.en": "English",
    "language.es": "Español",
    "language.fr": "Français",
    "language.de": "Deutsch",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.hi": "हिन्दी",
    "language.ar": "العربية",
    
    "sidebar.sessions": "会话",
    "sidebar.newSession": "新建会话",
    
    "chat.studyBuddy": "学习伙伴",
    "chat.placeholder": "问我任何关于你学习的问题...",
    "chat.send": "发送",
    
    "ai.active.greeting": "让我们深入主动学习吧！问我问题，我会挑战你的理解。",
    "ai.active.follow": "很好！让我问你一个后续问题来加深你的理解。",
    "ai.break.greeting": "是时候放松了！让我们休息一下，以更慢的速度讨论你的学习。",
    "ai.break.follow": "这里没有压力。花点时间告诉我你在想什么。",
    "ai.focused.greeting": "你处于专注模式。让我们减少干扰，一次解决一个概念。",
    "ai.focused.follow": "保持专注。这是你需要理解的关键点。",
    "ai.review.greeting": "很好！让我们复习一下你学到的东西。我会帮助你强化你的知识。",
    "ai.review.follow": "让我就这个概念考考你，以确保你已经掌握了。",
    
    "message.defaultResponse": "这是个很好的问题！让我帮你。",
    "message.encouragement": "你做得很好！保持动力。",
    "message.motivation": "学习的美妙之处在于没有人能把它从你身上夺走。",
  },
  ja: {
    "header.title": "学習パートナー",
    "header.subtitle": "あなたをサポートします",
    "header.studyMode": "学習モード",
    "header.language": "言語",
    
    "studyMode.active": "アクティブラーニング",
    "studyMode.break": "休憩モード",
    "studyMode.focused": "集中",
    "studyMode.review": "復習",
    
    "language.en": "English",
    "language.es": "Español",
    "language.fr": "Français",
    "language.de": "Deutsch",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.hi": "हिन्दी",
    "language.ar": "العربية",
    
    "sidebar.sessions": "セッション",
    "sidebar.newSession": "新しいセッション",
    
    "chat.studyBuddy": "学習パートナー",
    "chat.placeholder": "あなたの勉強について何でも質問してください...",
    "chat.send": "送信",
    
    "ai.active.greeting": "アクティブラーニングに飛び込みましょう！質問してください。理解度をチャレンジします。",
    "ai.active.follow": "素晴らしい！理解度を深めるための質問をさせてください。",
    "ai.break.greeting": "リラックスしましょう！休憩を取ってください。ゆっくりペースで勉強について話しましょう。",
    "ai.break.follow": "プレッシャーなしです。時間をかけて、何を考えているか教えてください。",
    "ai.focused.greeting": "フォーカスモードです。気を散らすものを最小化し、1つの概念ずつ取り組みましょう。",
    "ai.focused.follow": "集中を保ちましょう。理解する必要がある重要なポイントです。",
    "ai.review.greeting": "素晴らしい！学んだことを復習しましょう。知識を強化するのに役立ちます。",
    "ai.review.follow": "この概念についてテストさせてください。習得できているか確認します。",
    
    "message.defaultResponse": "それは素晴らしい質問です！手伝わせてください。",
    "message.encouragement": "素晴らしい頑張りです！勢いを保ちましょう。",
    "message.motivation": "学習の美しさは、誰もそれをあなたから奪うことができないということです。",
  },
  hi: {
    "header.title": "अध्ययन सहायक",
    "header.subtitle": "आपको समर्थन करने के लिए यहाँ",
    "header.studyMode": "अध्ययन मोड",
    "header.language": "भाषा",
    
    "studyMode.active": "सक्रिय शिक्षा",
    "studyMode.break": "विराम मोड",
    "studyMode.focused": "केंद्रित",
    "studyMode.review": "समीक्षा",
    
    "language.en": "English",
    "language.es": "Español",
    "language.fr": "Français",
    "language.de": "Deutsch",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.hi": "हिन्दी",
    "language.ar": "العربية",
    
    "sidebar.sessions": "सत्र",
    "sidebar.newSession": "नया सत्र",
    
    "chat.studyBuddy": "अध्ययन सहायक",
    "chat.placeholder": "अपने अध्ययन के बारे में मुझसे कुछ भी पूछें...",
    "chat.send": "भेजें",
    
    "ai.active.greeting": "आइए सक्रिय शिक्षा में गहराई से जाएं! मुझसे सवाल पूछें और मैं आपकी समझ को चुनौती दूंगा।",
    "ai.active.follow": "बहुत अच्छा! आपकी समझ को गहरा करने के लिए मुझे एक अनुवर्ती प्रश्न पूछने दें।",
    "ai.break.greeting": "आराम करने का समय है! चलिए एक ब्रेक लेते हैं और धीमी गति से अपने अध्ययन के बारे में बात करते हैं।",
    "ai.break.follow": "यहाँ कोई दबाव नहीं है। अपना समय लें और मुझे बताएं कि आप क्या सोच रहे हैं।",
    "ai.focused.greeting": "आप केंद्रित मोड में हैं। विचलन को कम करें और एक बार में एक अवधारणा से निपटें।",
    "ai.focused.follow": "ध्यान केंद्रित रहें। यह वह मुख्य बिंदु है जो आपको समझने की जरूरत है।",
    "ai.review.greeting": "बहुत अच्छा! आइए उन बातों की समीक्षा करें जो आपने सीखी हैं। मैं आपके ज्ञान को मजबूत करने में मदद करूंगा।",
    "ai.review.follow": "मुझे इस अवधारणा पर आपसे सवाल पूछने दें और सुनिश्चित करें कि आप इसे समझ गए हैं।",
    
    "message.defaultResponse": "यह एक बहुत अच्छा सवाल है! मुझे आपकी मदद करने दें।",
    "message.encouragement": "आप शानदार काम कर रहे हैं! अपनी गति को बनाए रखें।",
    "message.motivation": "सीखने की सुंदरता यह है कि कोई भी इसे आपसे नहीं ले सकता।",
  },
  ar: {
    "header.title": "رفيق الدراسة",
    "header.subtitle": "هنا لدعمك",
    "header.studyMode": "وضع الدراسة",
    "header.language": "اللغة",
    
    "studyMode.active": "التعلم النشط",
    "studyMode.break": "وضع الاستراحة",
    "studyMode.focused": "التركيز",
    "studyMode.review": "المراجعة",
    
    "language.en": "English",
    "language.es": "Español",
    "language.fr": "Français",
    "language.de": "Deutsch",
    "language.zh": "中文",
    "language.ja": "日本語",
    "language.hi": "हिन्दी",
    "language.ar": "العربية",
    
    "sidebar.sessions": "الجلسات",
    "sidebar.newSession": "جلسة جديدة",
    
    "chat.studyBuddy": "رفيق الدراسة",
    "chat.placeholder": "اسأني أي شيء عن دراستك...",
    "chat.send": "إرسال",
    
    "ai.active.greeting": "دعنا نغوص في التعلم النشط! اسأني أسئلة وسأطعن فهمك.",
    "ai.active.follow": "رائع! دعني أطرح عليك سؤالاً متابعة لتعميق فهمك.",
    "ai.break.greeting": "حان وقت الاسترخاء! دعنا نأخذ فترة راحة ونتحدث عن دراستك بوتيرة أبطأ.",
    "ai.break.follow": "لا يوجد ضغط هنا. خذ وقتك وأخبرني ما يدور في ذهنك.",
    "ai.focused.greeting": "أنت في وضع التركيز. دعنا نقلل من الانحرافات ونتعامل مع مفهوم واحد في المرة.",
    "ai.focused.follow": "دعنا نبقى مركزين. هذه هي النقطة الرئيسية التي تحتاج إلى فهمها.",
    "ai.review.greeting": "رائع! دعنا نراجع ما تعلمته. سأساعدك على تعزيز معرفتك.",
    "ai.review.follow": "دعني أختبرك على هذا المفهوم للتأكد من أنك تتقنه.",
    
    "message.defaultResponse": "هذا سؤال رائع! دعني أساعدك.",
    "message.encouragement": "أنت تقوم بعمل رائع! حافظ على الزخم.",
    "message.motivation": "جمال التعلم هو أن لا أحد يمكنه أن ينزعه منك.",
  },
};

export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] || translations["en"]?.[key] || key;
}
