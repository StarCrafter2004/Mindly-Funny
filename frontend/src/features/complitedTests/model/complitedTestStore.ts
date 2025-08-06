import { create } from "zustand";
import type { TestResultWithTestInfo } from "./types";
import {
  getAllTestResultsWithTestInfo,
  getLastTestResultsWithTestInfo,
} from "../api";
import { useUserStore } from "@/entities/user";

interface CompletedTestsState {
  tests: TestResultWithTestInfo[];
  currentTest: TestResultWithTestInfo | null;
  loading: boolean;
  error: string | null;
  total: number | null;
  loadLastCompletedTests: () => Promise<void>;
  loadCompletedTests: () => Promise<void>;
  getTestById: (testId: string) => TestResultWithTestInfo | undefined;
  clear: () => void;
}

export const useCompletedTestsStore = create<CompletedTestsState>(
  (set, get) => ({
    tests: [],
    currentTest: null,
    loading: false,
    error: null,
    total: null,
    loadLastCompletedTests: async () => {
      const telegramId = useUserStore.getState().user?.id;
      set({ loading: true, error: null });
      try {
        if (telegramId) {
          const res = await getLastTestResultsWithTestInfo(telegramId);
          set({ tests: res.data });
          set({ total: res.total });
        }
      } catch (error) {
        set({ error: "Failed to load completed tests." });
      } finally {
        set({ loading: false });
      }
    },

    loadCompletedTests: async () => {
      const telegramId = useUserStore.getState().user?.id;

      set({ loading: true, error: null });
      try {
        if (telegramId) {
          const tests = await getAllTestResultsWithTestInfo(telegramId);
          set({ tests });
        }
      } catch (error) {
        set({ error: "Failed to load completed tests." });
      } finally {
        set({ loading: false });
      }
    },

    getTestById: (testId) => {
      return get().tests.find((test) => test.testId === testId);
    },

    clear: () => {
      set({ tests: [], error: null });
    },
  }),
);
