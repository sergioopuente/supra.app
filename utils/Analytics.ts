
// ANALYTICS ABSTRACTION LAYER
// Diseñado para conectar fácilmente con PostHog, Mixpanel o Amplitude.

const IS_PROD = process.env.NODE_ENV === 'production';

// Definición de eventos clave para estandarizar la nomenclatura
export const EVENTS = {
    APP_OPEN: 'App_Open',
    ONBOARDING_START: 'Onboarding_Start',
    ONBOARDING_STEP_COMPLETE: 'Onboarding_Step_Complete',
    ONBOARDING_COMPLETE: 'Onboarding_Complete',
    FEATURE_USED: 'Feature_Used', // props: { feature: 'meditation' | 'journal' | 'chat' }
    SESSION_COMPLETE: 'Session_Complete', // props: { type: 'meditation', duration: 60 }
    PREMIUM_VIEW: 'Premium_Paywall_View',
    PREMIUM_CONVERSION: 'Premium_Conversion',
    FEEDBACK_SUBMITTED: 'Feedback_Submitted'
};

export const Analytics = {
    init: () => {
        if (!localStorage.getItem('supra_first_open')) {
            localStorage.setItem('supra_first_open', Date.now().toString());
            Analytics.track(EVENTS.ONBOARDING_START);
        }
        console.log("📊 Analytics Initialized");
    },

    identify: (userId: string) => {
        // Aquí llamarías a: posthog.identify(userId);
        console.log(`📊 Identify User: ${userId}`);
    },

    track: (eventName: string, properties?: Record<string, any>) => {
        // Log para desarrollo
        console.log(`📊 Track: ${eventName}`, properties || '');

        // INTEGRACIÓN REAL (Ejemplo PostHog):
        // if (window.posthog) window.posthog.capture(eventName, properties);
        
        // INTEGRACIÓN REAL (Ejemplo Mixpanel):
        // if (window.mixpanel) window.mixpanel.track(eventName, properties);
    },

    // Helpers de retención
    getDaysSinceInstall: (): number => {
        const firstOpen = localStorage.getItem('supra_first_open');
        if (!firstOpen) return 0;
        const diff = Date.now() - parseInt(firstOpen);
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
};
