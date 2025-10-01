import * as Sentry from '@sentry/react';

export function initErrorTracking() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      tracesSampleRate: 0.1,

      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      environment: import.meta.env.MODE,

      release: import.meta.env.VITE_APP_VERSION,

      beforeSend(event, hint) {
        if (event.message?.includes('ResizeObserver')) {
          return null;
        }

        if (event.message?.includes('Failed to fetch')) {
          return null;
        }

        return event;
      },
    });
  }
}

export function logError(error: Error, context?: Record<string, any>) {
  if (import.meta.env.DEV) {
    console.error('Error:', error, context);
  } else {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

export function setUser(user: { id: string; email?: string; name?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
}

export function clearUser() {
  Sentry.setUser(null);
}

export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  });
}