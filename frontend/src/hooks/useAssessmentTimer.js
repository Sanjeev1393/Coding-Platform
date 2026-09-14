import { useEffect, useState } from "react";
import { formatTime } from "../utils/formatTime";

export function useAssessmentTimer(initialDurationSeconds) {
  const [timeLeft, setTimeLeft] = useState(initialDurationSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft]);

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isTimeUp: timeLeft <= 0,
    isUrgent: timeLeft <= 5 * 60 && timeLeft > 0,
  };
}
