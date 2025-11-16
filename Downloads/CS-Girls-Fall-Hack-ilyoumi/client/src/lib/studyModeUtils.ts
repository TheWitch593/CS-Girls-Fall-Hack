import { t, type Language } from "@/lib/translations";

type StudyMode = "active" | "break" | "focused" | "review";

export function getStudyModeGreeting(studyMode: StudyMode, language: Language): string {
  const key = `ai.${studyMode}.greeting`;
  return t(key, language);
}

export function getStudyModeResponse(studyMode: StudyMode, language: Language): string {
  const key = `ai.${studyMode}.follow`;
  return t(key, language);
}

export function generateAIResponse(
  userMessage: string,
  studyMode: StudyMode,
  language: Language,
  isFirstMessage: boolean = false
): string {
  // If this is the first message in the session, provide a greeting
  if (isFirstMessage) {
    return getStudyModeGreeting(studyMode, language);
  }

  // Generate mode-specific response
  const modeResponse = getStudyModeResponse(studyMode, language);

  // Extract keywords from user message to generate contextual responses
  const hasQuestion = userMessage.includes("?");
  const isConfused = userMessage.toLowerCase().match(/(confused|don't understand|not sure|help|stuck)/);
  const isAsking = userMessage.toLowerCase().match(/(how|what|why|when|where|who)/);

  let contextualAddition = "";

  switch (studyMode) {
    case "active":
      if (hasQuestion) {
        contextualAddition = " " + t("ai.active.follow", language);
      }
      break;
    case "break":
      if (isConfused) {
        contextualAddition = " " + t("ai.break.follow", language);
      }
      break;
    case "focused":
      if (isAsking) {
        contextualAddition = " " + t("ai.focused.follow", language);
      }
      break;
    case "review":
      if (hasQuestion || isAsking) {
        contextualAddition = " " + t("ai.review.follow", language);
      }
      break;
  }

  return modeResponse + contextualAddition;
}

// Study mode tips
export function getStudyModeTip(studyMode: StudyMode, language: Language): string {
  const tips: Record<StudyMode, Record<Language, string>> = {
    active: {
      en: "💡 Active Learning: Ask questions, test yourself, and challenge your understanding.",
      es: "💡 Aprendizaje Activo: Haz preguntas, pruébate a ti mismo y desafía tu comprensión.",
      fr: "💡 Apprentissage Actif: Posez des questions, testez-vous et défiez votre compréhension.",
      de: "💡 Aktives Lernen: Stellen Sie Fragen, testen Sie sich selbst und fordern Sie Ihr Verständnis heraus.",
      zh: "💡 主动学习: 提出问题，测试自己，挑战你的理解。",
      ja: "💡 アクティブラーニング: 質問をし、自分をテストし、理解度に挑戦します。",
      hi: "💡 सक्रिय शिक्षा: सवाल पूछें, अपने आप को परीक्षा करें, अपनी समझ को चुनौती दें।",
      ar: "💡 التعلم النشط: اطرح الأسئلة واختبر نفسك وتحدّى فهمك.",
    },
    break: {
      en: "☕ Break Mode: Relax and take your time. No pressure here!",
      es: "☕ Modo Descanso: Relájate y tómate tu tiempo. ¡Sin presión aquí!",
      fr: "☕ Mode Pause: Détendez-vous et prenez votre temps. Pas de pression ici!",
      de: "☕ Pausenmodus: Entspannen Sie sich und nehmen Sie sich Zeit. Kein Druck hier!",
      zh: "☕ 休息模式: 放松身心，慢慢来。这里没有压力！",
      ja: "☕ 休憩モード: リラックスして時間をかけてください。プレッシャーなしです!",
      hi: "☕ विराम मोड: आराम करें और अपना समय लें। यहाँ कोई दबाव नहीं है!",
      ar: "☕ وضع الاستراحة: استرخ وخذ وقتك. لا يوجد ضغط هنا!",
    },
    focused: {
      en: "🎯 Focused Mode: Minimize distractions and tackle one concept at a time.",
      es: "🎯 Modo Enfocado: Minimiza las distracciones y aborda un concepto a la vez.",
      fr: "🎯 Mode Concentré: Minimisez les distractions et abordez un concept à la fois.",
      de: "🎯 Fokussierter Modus: Minimieren Sie Ablenkungen und gehen Sie ein Konzept nach dem anderen an.",
      zh: "🎯 专注模式: 最小化干扰，一次处理一个概念。",
      ja: "🎯 集中モード: 気を散らすものを最小化し、1つの概念ずつ取り組みます。",
      hi: "🎯 केंद्रित मोड: विचलन को कम करें और एक बार में एक अवधारणा से निपटें।",
      ar: "🎯 وضع التركيز: قلل من الانحرافات وتعامل مع مفهوم واحد في كل مرة.",
    },
    review: {
      en: "📚 Review Mode: Test your knowledge and reinforce what you've learned.",
      es: "📚 Modo Revisión: Prueba tu conocimiento y refuerza lo que has aprendido.",
      fr: "📚 Mode Révision: Testez vos connaissances et renforcez ce que vous avez appris.",
      de: "📚 Wiederholungsmodus: Testen Sie Ihr Wissen und verfestigen Sie das Gelernte.",
      zh: "📚 复习模式: 测试您的知识并加强您所学到的内容。",
      ja: "📚 復習モード: 知識をテストし、学んだことを強化します。",
      hi: "📚 समीक्षा मोड: अपने ज्ञान का परीक्षण करें और जो आपने सीखा है उसे मजबूत करें।",
      ar: "📚 وضع المراجعة: اختبر معرفتك وعزز ما تعلمته.",
    },
  };

  return tips[studyMode][language] || tips[studyMode].en;
}
