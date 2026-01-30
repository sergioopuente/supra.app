
export type Language = 'es' | 'en' | 'pt';

export const getLanguage = (): Language => {
  const stored = localStorage.getItem('supra_language');
  if (stored) return stored as Language;
  
  const browser = navigator.language.split('-')[0];
  if (browser === 'pt') return 'pt';
  if (browser === 'en') return 'en';
  return 'es';
};

export const setLanguage = (lang: Language) => {
    localStorage.setItem('supra_language', lang);
    window.location.reload(); // Recarga simple para aplicar cambios en toda la app
};

export const t = (key: string): string => {
    const lang = getLanguage();
    const keys = key.split('.');
    let value: any = translations[lang];
    
    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            return key; // Fallback to key if missing
        }
    }
    return value;
};

const translations = {
  es: {
    common: {
      back: "volver",
      loading: "cargando",
      close: "cerrar",
      save: "guardar",
      saved: "guardado",
      saving: "guardando..."
    },
    welcome: {
      title: "encuentra tu \ncalma interior.",
      subtitle: "bienestar emocional para la nueva generación. simple, preventivo y empoderador.",
      enter: "entrar",
      start: "comenzar",
      footer: "basado en estoicismo moderno & psicología conductual"
    },
    dashboard: {
      greeting: {
        morning: "buenos días",
        afternoon: "buenas tardes",
        night: "buenas noches"
      },
      streak: "días",
      priority: "prioridad",
      sync_mind: "sincronizar\nmente",
      pending: "registro de estado pendiente",
      meditation_title: "reset sistema nervioso",
      meditation_desc: "tu historial muestra picos de estrés. hackea tu nervio vago en 3 minutos.",
      meditation_btn: "calmar mente",
      prayer_title: "pausa de rendición",
      prayer_desc: "neuro-teología aplicada. suelta el control y descansa en la providencia.",
      prayer_btn: "iniciar oración",
      quote_label: "filosofía activa",
      spiritual_label: "maná diario"
    },
    meditation: {
      title: "reset mental • 3 min",
      sync_voice: "sincronizando voz humana...",
      eco_mode: "modo eco activo",
      phases: {
        1: { title: "reset del sistema", guide: "hackeando el nervio vago", subtext: "inhala en 4... exhala en 8... dile a tu cerebro que estás a salvo." },
        2: { title: "escaneo somático", guide: "relajación progresiva", subtext: "suelta la mandíbula. baja los hombros. apaga la defensa." },
        3: { title: "reencuadre cognitivo", guide: "metacognición activa", subtext: "no eres tus pensamientos. eres quien los observa." }
      },
      complete_title: "mente reseteada",
      complete_desc: "has reducido tu cortisol y activado tu sistema parasimpático.",
      back_home: "volver al dashboard"
    },
    profile: {
      title: "perfil",
      identity: "identidad",
      syncing: "sincronizando...",
      rank: "rango",
      next: "siguiente",
      trophies: "sala de trofeos",
      ikigai_title: "mi ikigai",
      ikigai_placeholder: "¿qué te mueve cuando todo falla?",
      system: "sistema & preferencias",
      dark_mode: "modo oscuro",
      dark_desc: "interfaz de inmersión total",
      light_desc: "modo claridad activo",
      lux_mode: "modo lux",
      lux_desc: "apartarte del ruido para escuchar a Dios",
      language: "idioma",
      lang_desc: "selecciona tu región",
      export: "exportar data",
      manage: "gestionar",
      upgrade: "mejorar"
    }
  },
  en: {
    common: {
      back: "back",
      loading: "loading",
      close: "close",
      save: "save",
      saved: "saved",
      saving: "saving..."
    },
    welcome: {
      title: "find your \ninner calm.",
      subtitle: "emotional well-being for the new generation. simple, preventive and empowering.",
      enter: "login",
      start: "get started",
      footer: "based on modern stoicism & behavioral psychology"
    },
    dashboard: {
      greeting: {
        morning: "good morning",
        afternoon: "good afternoon",
        night: "good evening"
      },
      streak: "days",
      priority: "priority",
      sync_mind: "sync\nmind",
      pending: "status check-in pending",
      meditation_title: "nervous system reset",
      meditation_desc: "your history shows stress spikes. hack your vagus nerve in 3 minutes.",
      meditation_btn: "calm mind",
      prayer_title: "surrender pause",
      prayer_desc: "applied neuro-theology. let go of control and rest in providence.",
      prayer_btn: "start prayer",
      quote_label: "active philosophy",
      spiritual_label: "daily manna"
    },
    meditation: {
      title: "mental reset • 3 min",
      sync_voice: "syncing human voice...",
      eco_mode: "eco mode active",
      phases: {
        1: { title: "system reset", guide: "hacking the vagus nerve", subtext: "inhale for 4... exhale for 8... tell your brain you are safe." },
        2: { title: "somatic scan", guide: "progressive relaxation", subtext: "drop your jaw. lower your shoulders. power down defense." },
        3: { title: "cognitive reframing", guide: "active metacognition", subtext: "you are not your thoughts. you are the observer." }
      },
      complete_title: "mind reset",
      complete_desc: "you have lowered cortisol and activated your parasympathetic system.",
      back_home: "back to dashboard"
    },
    profile: {
      title: "profile",
      identity: "identity",
      syncing: "syncing...",
      rank: "rank",
      next: "next",
      trophies: "trophy room",
      ikigai_title: "my ikigai",
      ikigai_placeholder: "what drives you when everything fails?",
      system: "system & preferences",
      dark_mode: "dark mode",
      dark_desc: "total immersion interface",
      light_desc: "clarity mode active",
      lux_mode: "lux mode",
      lux_desc: "step away from noise to hear God",
      language: "language",
      lang_desc: "select your region",
      export: "export data",
      manage: "manage",
      upgrade: "upgrade"
    }
  },
  pt: {
    common: {
      back: "voltar",
      loading: "carregando",
      close: "fechar",
      save: "salvar",
      saved: "salvo",
      saving: "salvando..."
    },
    welcome: {
      title: "encontre sua \ncalma interior.",
      subtitle: "bem-estar emocional para a nova geração. simples, preventivo e empoderador.",
      enter: "entrar",
      start: "começar",
      footer: "baseado no estoicismo moderno & psicologia comportamental"
    },
    dashboard: {
      greeting: {
        morning: "bom dia",
        afternoon: "boa tarde",
        night: "boa noite"
      },
      streak: "dias",
      priority: "prioridade",
      sync_mind: "sincronizar\nmente",
      pending: "check-in pendente",
      meditation_title: "reset sistema nervoso",
      meditation_desc: "seu histórico mostra picos de estresse. hackeie seu nervo vago em 3 minutos.",
      meditation_btn: "acalmar a mente",
      prayer_title: "pausa de rendição",
      prayer_desc: "neuroteologia aplicada. solte o controle e descanse na providência.",
      prayer_btn: "iniciar oração",
      quote_label: "filosofia ativa",
      spiritual_label: "maná diário"
    },
    meditation: {
      title: "reset mental • 3 min",
      sync_voice: "sincronizando voz humana...",
      eco_mode: "modo eco ativo",
      phases: {
        1: { title: "reset do sistema", guide: "hackeando o nervo vago", subtext: "inspire em 4... expire em 8... diga ao seu cérebro que está seguro." },
        2: { title: "escaneamento somático", guide: "relaxamento progressivo", subtext: "solte a mandíbula. baixe os ombros. desligue a defesa." },
        3: { title: "ressignificação cognitiva", guide: "metacognição ativa", subtext: "você não é seus pensamentos. você é o observador." }
      },
      complete_title: "mente resetada",
      complete_desc: "você reduziu seu cortisol e ativou seu sistema parassimpático.",
      back_home: "voltar ao dashboard"
    },
    profile: {
      title: "perfil",
      identity: "identidade",
      syncing: "sincronizando...",
      rank: "rank",
      next: "próximo",
      trophies: "sala de troféus",
      ikigai_title: "meu ikigai",
      ikigai_placeholder: "o que te move quando tudo falha?",
      system: "sistema & preferências",
      dark_mode: "modo escuro",
      dark_desc: "interface de imersão total",
      light_desc: "modo claridade ativo",
      lux_mode: "modo lux",
      lux_desc: "afaste-se do ruído para ouvir a Deus",
      language: "idioma",
      lang_desc: "selecione sua região",
      export: "exportar dados",
      manage: "gerenciar",
      upgrade: "melhorar"
    }
  }
};
