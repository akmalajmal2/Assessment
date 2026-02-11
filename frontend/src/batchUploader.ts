const LOG_KEY = import.meta.env.VITE_LOG_KEY;
const API_URL = import.meta.env.VITE_API_URL;

export const startBatchUploader = (attemptId: string) => {
  setInterval(async () => {
    const logs = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
    if (!logs.length) return;
    try {
      await fetch(`${API_URL}/logs/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, logs }),
      });
      localStorage.removeItem(LOG_KEY);
    } catch (error) {
      console.log("error", error);
    }
  }, 5000);
};
