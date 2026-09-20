import { useEffect, useState } from "react";
import { formatTime } from "../utils/formatTime";

/**
 * Custom hook that manages the assessment countdown timer lifecycle.
 *
 * @param {number} initialDurationSeconds - Initial time limit in seconds
 * @param {Object} [options] - Timer configuration options
 * @param {boolean} [options.isActive=true] - Whether the timer is actively counting down (set to IS_ASSESSMENT_TIMER_ACTIVE in production to guard countdown)
 * @returns {{ timeLeft: number, formattedTime: string, isTimeUp: boolean, isUrgent: boolean, isTimerActive: boolean }}
 */
export function useAssessmentTimer(
  initialDurationSeconds,
  { isActive = true } = {}
) {
  const [timeLeft, setTimeLeft] = useState(initialDurationSeconds);

  useEffect(() => {
    // If timer is guarded/disabled or has already completed, bypass timeout scheduling
    if (!isActive || timeLeft <= 0) return;

    const timerId = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, isActive]);

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isTimeUp: isActive ? timeLeft <= 0 : false,
    isUrgent: isActive ? timeLeft <= 5 * 60 && timeLeft > 0 : false,
    isTimerActive: isActive,
  };
}
