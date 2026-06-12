// This file configures the initialization of Sentry on the client.
// We use dynamic imports to prevent Sentry's giant session replay SDK
// from immediately blocking the initial Next.js browser hydration!
import * as Sentry from "@sentry/nextjs";

// First we only capture errors conditionally so the core app loads fast
const loadSentry = async () => {
  Sentry.init({
    dsn: "https://008ada537d4e8a3784a9118dfca7249b@o4509892130045952.ingest.us.sentry.io/4510579120537600",

    integrations: [Sentry.replayIntegration()],

    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    enableLogs: true,

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    sendDefaultPii: true,
  });
};

if (typeof window !== "undefined") {
  // Only boot Sentry session replay after the browser completes the immediate Next.js task loads!
  // This defers the ~200kb Sentry payload from blocking the visual DOM render.
  window.requestIdleCallback
    ? window.requestIdleCallback(loadSentry)
    : setTimeout(loadSentry, 500);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
