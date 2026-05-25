declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
  }
}

export const trackGAEvent = (
  eventName: string,
  params: Record<string, any> = {}
): void => {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (e) {
    // swallow analytics errors to avoid disrupting UX
    console.warn('[analytics] failed to track', eventName, e);
  }
};

export const trackMetaEvent = (
  eventName: string,
  params?: Record<string, any>
): void => {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.fbq === 'function') {
      window.fbq('track', eventName, params);
    } else {
      console.log(`[Meta Pixel Debug] Event: ${eventName}`, params);
    }
  } catch (e) {
    console.warn('[analytics] failed to track Meta event', eventName, e);
  }
};

export default trackGAEvent;