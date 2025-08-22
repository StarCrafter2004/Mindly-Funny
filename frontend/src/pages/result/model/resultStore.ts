import { create } from "zustand";
import type { Media, questionAnswer } from "@/entities/test";
import { gettestResult } from "@/entities/test/api";

type ResultState = {
  isFetched: boolean;
  testName: string | null;
  type: string | null;
  status: string | null;
  description: string | null;
  questionAnswers: questionAnswer[];
  image: Media | null;
  isLoading: boolean;
  fetchResult: (documentId: string) => Promise<void>;
  setDefault: () => void;
};

const defaultState = {
  isFetched: false,
  testName: null,
  type: null,
  status: null,
  description: null,
  questionAnswers: [],
  image: null,
  isLoading: false,
};

export const useResultStore = create<ResultState>((set) => ({
  ...defaultState,
  fetchResult: async (documentId: string) => {
    set({ isLoading: true });
    try {
      const res = await gettestResult(documentId);

      set({
        testName: res.name,
        type: res.type ?? null,
        status: res.status ?? null,
        description: res.description ?? null,
        questionAnswers: res.questionAnswers ?? [],
        image: res.image,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch test result:", error);
      set({ ...defaultState });
    } finally {
      set({ isLoading: false, isFetched: true });
    }
  },

  setDefault: () => {
    set(defaultState);
  },
}));
