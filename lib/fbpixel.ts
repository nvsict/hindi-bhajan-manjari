export const FB_PIXEL_ID = '1791922168786308';

export const pageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

// eventData is used to pass things like eventID for deduplication
export const event = (name: string, options: Record<string, any> = {}, eventData: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', name, options, eventData);
  }
};