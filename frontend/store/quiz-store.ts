import { create } from 'zustand';
import { fetchClient } from '@/lib/api/fetch-client';
import { API_ROUTES } from '@/config';

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  file_id: string;
  is_active: boolean;
  total_questions: number;
  total_attempts: number;
  average_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  content: string;
  explanation: string;
  question_type: 'multiple_choice' | 'subjective';
  concepts: string[];
  is_active: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  start_time: string;
  end_time?: string;
  score?: number;
  status: 'in_progress' | 'completed';
}

export interface QuizStats {
  total_quizzes: number;
  total_questions: number;
  completion_rate: number;
  average_score: number;
  concept_mastery: Record<string, number>;
}

interface QuizStore {
  // Current quiz state
  currentQuiz: Quiz | null;
  quizzes: Quiz[];
  currentAttempt: QuizAttempt | null;
  stats: QuizStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentQuiz: (quiz: Quiz | null) => void;
  setQuizzes: (quizzes: Quiz[]) => void;
  setCurrentAttempt: (attempt: QuizAttempt | null) => void;
  setStats: (stats: QuizStats) => void;

  // API integration
  fetchQuizzes: (fileId: string) => Promise<void>;
  createQuiz: (fileId: string, data: { title: string; description?: string }) => Promise<Quiz>;
  startAttempt: (quizId: string) => Promise<QuizAttempt>;
  submitAttempt: (attemptId: string, answers: Record<string, string>) => Promise<QuizAttempt>;
  fetchStats: (fileId: string) => Promise<void>;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  // Initial state
  currentQuiz: null,
  quizzes: [],
  currentAttempt: null,
  stats: null,
  isLoading: false,
  error: null,

  // Actions
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setQuizzes: (quizzes) => set({ quizzes }),
  setCurrentAttempt: (attempt) => set({ currentAttempt: attempt }),
  setStats: (stats) => set({ stats }),

  // API integration
  fetchQuizzes: async (fileId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchClient(`${API_ROUTES.quiz.base}?file_id=${fileId}`);
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      const data = await response.json();
      set({ quizzes: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch quizzes', isLoading: false });
      throw error;
    }
  },

  createQuiz: async (fileId: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchClient(API_ROUTES.quiz.base, {
        method: 'POST',
        body: JSON.stringify({ ...data, file_id: fileId })
      });
      if (!response.ok) throw new Error('Failed to create quiz');
      const quiz = await response.json();
      set((state) => ({ 
        quizzes: [...state.quizzes, quiz],
        isLoading: false
      }));
      return quiz;
    } catch (error) {
      set({ error: 'Failed to create quiz', isLoading: false });
      throw error;
    }
  },

  startAttempt: async (quizId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchClient(`${API_ROUTES.quiz.base}/attempts`, {
        method: 'POST',
        body: JSON.stringify({ quiz_id: quizId })
      });
      if (!response.ok) throw new Error('Failed to start attempt');
      const attempt = await response.json();
      set({ currentAttempt: attempt, isLoading: false });
      return attempt;
    } catch (error) {
      set({ error: 'Failed to start attempt', isLoading: false });
      throw error;
    }
  },

  submitAttempt: async (attemptId: string, answers) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchClient(`${API_ROUTES.quiz.base}/attempts/${attemptId}`, {
        method: 'PATCH',
        body: JSON.stringify({ answers })
      });
      if (!response.ok) throw new Error('Failed to submit attempt');
      const attempt = await response.json();
      set({ currentAttempt: attempt, isLoading: false });
      return attempt;
    } catch (error) {
      set({ error: 'Failed to submit attempt', isLoading: false });
      throw error;
    }
  },

  fetchStats: async (fileId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchClient(`${API_ROUTES.quiz.base}/stats/${fileId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const stats = await response.json();
      set({ stats, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch stats', isLoading: false });
      throw error;
    }
  }
}));