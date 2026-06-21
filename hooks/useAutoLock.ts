import { useEffect, useRef, useCallback, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../store/authStore";

const AUTO_LOCK_MS = 5 * 60 * 1000;

export function useAutoLock() {
  const { isPINVerified, setPINVerified } = useAuthStore();
  const lastActiveRef = useRef(Date.now());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lock = useCallback(() => {
    setPINVerified(false);
    router.replace("/(auth)/pin-verify");
  }, [setPINVerified]);

  const resetTimer = useCallback(() => {
    lastActiveRef.current = Date.now();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        appStateRef.current === "active" &&
        (nextState === "inactive" || nextState === "background")
      ) {
        lastActiveRef.current = Date.now();
      }

      if (
        (appStateRef.current === "inactive" || appStateRef.current === "background") &&
        nextState === "active"
      ) {
        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed >= AUTO_LOCK_MS && isPINVerified) {
          lock();
        }
      }

      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [isPINVerified, lock]);

  useEffect(() => {
    if (isPINVerified) {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed >= AUTO_LOCK_MS) {
          lock();
        }
      }, 30000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPINVerified, lock]);

  return { resetTimer, lock };
}
