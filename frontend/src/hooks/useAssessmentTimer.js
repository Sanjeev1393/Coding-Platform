import { useEffect, useState } from "react";

export function useAssessmentTimer(initialDurationSeconds) {
  const [timeLeft, setTimeLeft] = useState(initialDurationSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    timeLeft,
    formattedTime,
    isTimeUp: timeLeft <= 0,
    isUrgent: timeLeft <= 5 * 60 && timeLeft > 0,
  };
}
