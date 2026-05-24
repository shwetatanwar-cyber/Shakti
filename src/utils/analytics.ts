declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
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

export default trackGAEvent;