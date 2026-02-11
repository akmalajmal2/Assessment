import { useEffect, useRef, useState } from "react";
import { TIMER_CONFIG } from "../config/timerConfig";
import { logEvent } from "../logger";
const API_URL = import.meta.env.VITE_API_URL;
const LOCK_KEY = import.meta.env.VITE_LOCK_KEY;

interface TimerProps {
  attemptId: string;
}

const EnforcedTimer: React.FC<TimerProps> = ({ attemptId }: any) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const firedWarnings = useRef<Set<number>>(new Set());

  useEffect(() => {
    const initialTimer = async () => {
      const response = await fetch(`${API_URL}/timer/start`, {
        method: "POST",
        headers: { "Content-Type": "applicaton/json" },
        body: JSON.stringify({
          attemptId,
          duration: TIMER_CONFIG?.TOTAL_DURATION,
        }),
      });
      const data = await response.json();
      const remaining = new Date(data.endTime).getTime() - Date.now();
      setTimeLeft(Math.floor(remaining / 1000));
      logEvent("TIMER_STARTED", attemptId);
    };
    initialTimer();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      logEvent("TIMER_EXPIRED", attemptId);
      autoSubmit();
      return;
    }
    TIMER_CONFIG.WARNING_THRESHOLDS.forEach((time) => {
      if (timeLeft === time && !firedWarnings.current.has(time)) {
        firedWarnings.current.add(time);
        alert(`${time / 60} minutes remaining`);
        logEvent("WARNING_THRESHOLD_REACHED", attemptId, undefined, {
          threshold: time,
        });
      }
    });

    const i = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(i);
  }, [timeLeft]);

  const autoSubmit = async () => {
    logEvent("AUTO_SUBMISSION_TRIGGERED", attemptId);
    localStorage.setItem(LOCK_KEY, "true");
    await fetch(`${API_URL}/timer/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId }),
    });
  };

  return (
    <section>
      <h3>
        ⏱ {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </h3>
    </section>
  );
};
export default EnforcedTimer;
