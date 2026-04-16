"use client";

import { useEffect, useState } from "react";

export function useTimer(
  initialTime: number,
  isFrozen: boolean,
  onTimeout?: () => void,
) {
  const [timer, setTimer] = useState(initialTime);

  useEffect(() => {
    setTimer(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (timer === 0) {
      onTimeout?.();
    }
  }, [timer, onTimeout]);

  useEffect(() => {
    if (isFrozen || timer <= 0) return;

    const intervalId = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isFrozen, timer]);

  return timer;
}
