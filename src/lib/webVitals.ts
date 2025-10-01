import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

interface VitalsConfig {
  analyticsEndpoint?: string;
  debug?: boolean;
}

export function initWebVitals(config: VitalsConfig = {}) {
  const { analyticsEndpoint, debug = false } = config;

  const sendToAnalytics = (metric: Metric) => {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
      url: window.location.href,
    });

    if (debug) {
      console.log('📊 Web Vital:', metric.name, metric.value, metric.rating);
    }

    if (analyticsEndpoint) {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(analyticsEndpoint, body);
      } else {
        fetch(analyticsEndpoint, {
          body,
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
        }).catch(console.error);
      }
    }

    storeVitalInDB(metric);
  };

  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
}

async function storeVitalInDB(metric: Metric) {
  try {
    const { supabase } = await import('@/integrations/supabase/client');

    await supabase.from('web_vitals').insert({
      metric_name: metric.name,
      value: metric.value,
      rating: metric.rating,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to store web vital:', error);
    }
  }
}

export function getVitalsThresholds() {
  return {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    LCP: { good: 2500, needsImprovement: 4000 },
    TTFB: { good: 800, needsImprovement: 1800 },
    INP: { good: 200, needsImprovement: 500 },
    FID: { good: 100, needsImprovement: 300 },
  };
}