import { useEffect, useState } from "react";

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp }) => {
  const savedTime = localStorage.getItem("timer");
  const [time, setTime] = useState(savedTime ? +savedTime : duration);
  useEffect(() => {
    if (time <= 0) {
      onTimeUp();
      return;
    }
    const interval = setInterval(
      () =>
        setTime((prevTime) => {
          localStorage.setItem("timer", prevTime - 1);
          return prevTime - 1;
        }),
      1000,
    );
    return () => clearTimeout(interval);
  }, [time]);
  return <section></section>;
};
export default Timer;
