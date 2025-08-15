import { create } from "zustand";
import type { Question } from "@/entities/test"; // проверь путь
import { getTestByDocumentId } from "../api";
import { toast } from "react-toastify";

import type { AnswerRecord, QuestionImage } from "./types";

type TestState = {
  documentId: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: AnswerRecord[];
  timeLimit: number | null; // Текущие оставшиеся секунды
  initialTimeLimit: number | null; // Максимальное время в секундах
  Images: QuestionImage[];
  isTestFree: boolean;
  isReportFree: boolean;

  loading: boolean;
  error: string | null;
  isResultPurchased: boolean;
  resultsStars: number | null;
  resultsTon: number | null;
  setQuestions: (questions: Question[]) => void;
  fetchTestByDocumentId: (id: string) => Promise<void>;
  answerQuestion: (answerIndex: number) => void;

  nextQuestion: () => void;

  tickTime: () => void;
  setLoading: (loading: boolean) => void;
  setDefault: () => void;
  setIsResultPurchased: (isResultPurchased: boolean) => void;
  autoFillRemainingAnswers: () => void;
  setResultPurchased: (bool: boolean) => void;
};

const defaultState = {
  documentId: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  timeLimit: null,
  initialTimeLimit: null,

  loading: false,
  error: null,
  Images: [],
  isTestFree: false,
  isReportFree: false,
  isResultPurchased: false,
  resultsStars: null,
  resultsTon: null,
};

export const useTestStore = create<TestState>((set) => ({
  ...defaultState,

  setQuestions: (questions) =>
    set({ questions, currentQuestionIndex: 0, answers: [] }),

  fetchTestByDocumentId: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await getTestByDocumentId(id);
      const test = res.data;
      if (!test) throw new Error("Test not found");

      const timeLimitInSeconds =
        typeof test.timeLimit === "number" ? test.timeLimit * 60 : null;

      set({
        documentId: test.documentId,
        questions: test.questions,
        currentQuestionIndex: 0,
        answers: [],
        timeLimit: timeLimitInSeconds,
        initialTimeLimit: timeLimitInSeconds,
        Images: test.Images ?? [],
        isTestFree: test.isTestFree,
        isReportFree: test.isReportFree,
        isResultPurchased: test.isResultPurchased,
        resultsStars: test.resultsStars,
        resultsTon: test.resultsTon,
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
        set({ error: e.message });
      } else {
        toast.error("Неизвестная ошибка");
        set({ error: "Неизвестная ошибка" });
      }
    } finally {
      set({ loading: false });
    }
  },

  answerQuestion: (answerIndex) => {
    set((state) => {
      const newAnswerRecord = {
        questionIndex: state.currentQuestionIndex,
        answerIndex,
      };

      return {
        answers: [...state.answers, newAnswerRecord],
      };
    });
  },

  autoFillRemainingAnswers: () => {
    set((state) => {
      const newAnswerRecords = [];

      for (
        let i = state.currentQuestionIndex;
        i < state.questions.length;
        i++
      ) {
        const question = state.questions[i];
        const correctAnswerIndex = question.answers.findIndex(
          (a) => a.isCorrect,
        );

        newAnswerRecords.push({
          questionIndex: i,
          answerIndex: -1,
          isCorrect: false,
          correctAnswerIndex,
        });
      }

      return {
        answers: [...state.answers, ...newAnswerRecords],
        isFinished: true,
      };
    });
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    }));
  },
  setLoading: (loading: boolean) => {
    set({ loading });
  },

  tickTime: () =>
    set((state) => {
      if (state.timeLimit !== null) {
        return { timeLimit: Math.max((state.timeLimit ?? 0) - 1, 0) };
      }
      return {};
    }),

  setDefault: () => set(defaultState),
  setIsResultPurchased: (isResultPurchased: boolean) =>
    set({ isResultPurchased }),

  setResultPurchased: (bool: boolean) => {
    set({ isResultPurchased: bool });
  },
}));
