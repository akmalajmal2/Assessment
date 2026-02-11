const LOG_KEY = import.meta.env.VITE_LOG_KEY;
const LOCK_KEY = import.meta.env.VITE_LOCK_KEY;

export const logEvent = (
  eventType: string,
  attemptId: string,
  questionId?: string,
  extra: any = {},
) => {
  if (localStorage.getItem(LOCK_KEY)) return;
  const event = {
    eventType,
    timestamp: new Date().toISOString(),
    attemptId,
    questionId,
    metadata: {
      browser: navigator.vendor,
      userAgent: navigator.userAgent,
      focused: document.hasFocus(),
      fullscreen: !!document.fullscreenElement,
      ...extra,
    },
  };

  const logs = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  logs.push(event);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
};
