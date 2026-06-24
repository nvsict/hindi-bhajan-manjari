// utils/analytics.ts

export const logEvent = (action: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, params);
  } else {
    console.warn(`GA event ignored: ${action}`, params);
  }
};