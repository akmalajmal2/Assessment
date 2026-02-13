import { useEffect, useState, useRef } from "react";
import { QUESTIONS } from "../data/questions";

const API = import.meta.env.VITE_API_URL;

interface StartResponse {
  attemptId: string;
  endTime: string;
  warningAt: number;
}

interface Log {
  id: number;
  attempt_id: string;
  question_id: string | null;
  action: string;
  message: string;
  created_at: string;
}

export default function AssessmentPage() {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [warningAt, setWarningAt] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const current = QUESTIONS[currentIndex];

  const warningSent = useRef<boolean>(false);

  // Restore after refresh
  useEffect(() => {
    const savedAttempt = localStorage.getItem("attemptId");
    if (savedAttempt) {
      startTest(savedAttempt);
    }
  }, []);

  // Countdown effect
  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const diff = new Date(endTime).getTime() - Date.now();
      const seconds = Math.max(0, Math.floor(diff / 1000));

      setRemaining(seconds);

      if (seconds <= warningAt && !warningSent.current) {
        sendWarning();
        warningSent.current = true;
      }

      if (seconds <= 0 && started) {
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  // Start / Resume
  const startTest = async (existingId?: string) => {
    const response = await fetch(`${API}/timer/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId: existingId ?? null }),
    });

    const data: StartResponse = await response.json();

    localStorage.setItem("attemptId", data.attemptId);

    setAttemptId(data.attemptId);
    setEndTime(data.endTime);
    setWarningAt(data.warningAt);
    setStarted(true);
    setCompleted(false);
    setLogs([]);
    setCurrentIndex(0);
    setAnswers({});
    setRemaining(0);
    warningSent.current = false;
  };

  // Warning logger
  const sendWarning = async () => {
    if (!attemptId) return;

    await fetch(`${API}/timer/warning`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId }),
    });
  };

  // Question attempt logger
  const attemptQuestion = async (questionId: string) => {
    if (!attemptId) return;

    await fetch(`${API}/timer/question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, questionId }),
    });
  };

  // Submit
  const handleSubmit = async () => {
    if (!attemptId) return;

    await fetch(`${API}/timer/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId }),
    });

    localStorage.removeItem("attemptId");

    setStarted(false);
    setCompleted(true);
    setEndTime(null);
  };

  // Load logs
  const loadLogs = async () => {
    if (!attemptId) return;

    const res = await fetch(`${API}/timer/logs/${attemptId}`);
    const data: Log[] = await res.json();

    setLogs(data);
  };

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));

    // keep your existing backend logger
    attemptQuestion(current.id);
  };

  // Next / Submit
  const nextQuestion = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <section className="w-full h-full flex flex-col pt-4">
      <h1 className="font-bold text-xl md:text-2xl lg:text-3xl text-center">
        Assessment
      </h1>

      {!started && !completed && (
        <div className="flex flex-col gap-4 items-center justify-center flex-1">
          <h2>
            <strong>Total Questions:</strong> {QUESTIONS.length}
          </h2>
          <h2>
            <strong> Total Time:</strong> {minutes}:{seconds}
          </h2>
          <button
            className="bg-blue-400 hover:bg-blue-500 hover:scale-105 active:scale-95 px-6 py-3 leading-none rounded-3xl text-white font-semibold text-lg md:text-xl lg:text-2xl cursor-pointer"
            onClick={() => startTest()}
          >
            Start Test
          </button>
        </div>
      )}

      {started && (
        <div className=" flex-1">
          <div className="flex flex-row-reverse gap-4 justify-start p-4">
            <h2 className="text-lg md:text-xl lg:text-2xl font-normal md:font-semibold">
              <strong className="font-semibold">Time Left: </strong>
              <span className="text-base md:text-lg lg:text-xl font-normal">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </h2>

            {remaining <= warningAt && remaining > 0 && (
              <h3 className="text-lg md:text-xl lg:text-2xl font-normal md:font-semibold">
                <strong className="font-semibold">⚠ Warning:</strong> Only few
                minutes left!
              </h3>
            )}
          </div>

          <div className="flex flex-col gap-3 text-center justify-center max-w-3xl bg-blue-100 mx-auto rounded-xl md:rounded-2xl p-7">
            <h3 className="text-lg md:text-xl lg:text-2xl font-normal md:font-semibold">
              Question {currentIndex + 1} of {QUESTIONS.length}
            </h3>

            <p className=" text-xl md:text-2xl font-semibold text-start">
              {current?.text}
            </p>
            <div className="flex flex-wrap gap-6 items-start mt-3">
              {current.options.map((opt: string) => (
                <label key={opt} style={{ display: "block" }}>
                  <input
                    type="radio"
                    className="mr-1"
                    name={current.id}
                    value={opt}
                    checked={answers[current.id] === opt}
                    onChange={() => handleAnswer(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>

            <br />

            <button
              className="px-7 py-2.5 bg-green-400 rounded-3xl text-white w-fit ml-auto text-xl font-semibold leading-none hover:bg-green-500 hover:scale-105 active:scale-95 cursor-pointer mt-0.5 disabled:bg-gray-400 disabled:cursor-default"
              disabled={!answers[current.id]}
              onClick={nextQuestion}
            >
              {currentIndex === QUESTIONS.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      )}

      {completed && (
        <>
          <h2 className="text-center my-4 text-lg md:text-xl xltext-3xl font-semibold">
            Assessment Completed
          </h2>
          <div>
            <button
              className="bg-orange-400 hover:bg-orange-500 hover:scale-105 active:scale-95 px-6 py-3 leading-none rounded-3xl text-white font-semibold text-lg md:text-xl lg:text-2xl cursor-pointer w-fit mr-6"
              onClick={() => startTest()}
            >
              Start Again
            </button>

            <button
              className="px-7 py-2.5 bg-green-400 rounded-sm text-white ml-auto text-xl font-semibold leading-none hover:bg-green-500 hover:scale-105 active:scale-95 cursor-pointer mt-0.5 disabled:bg-gray-400 disabled:cursor-default w-fit mr-6"
              onClick={loadLogs}
            >
              View Logs
            </button>
            <button
              className="bg-blue-400 hover:bg-blue-500 hover:scale-105 active:scale-95 px-6 py-3 leading-none rounded-3xl text-white font-semibold text-lg md:text-xl lg:text-2xl cursor-pointer w-fit mr-6"
              onClick={() => window.location.reload()}
            >
              Go to Home
            </button>
          </div>
        </>
      )}

      {logs.length > 0 && (
        <div className="mt-10 p-8 bg-amber-200 rounded-2xl">
          <h3>Logs</h3>

          {logs.map((log) => (
            <div key={log.id}>
              <strong>{log.action}</strong> - {log.message}
              <br />
              <small>
                {new Date(log.created_at).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </small>
              <hr />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
