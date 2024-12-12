import { create } from 'zustand';
import { fetchClient } from '@/lib/api/fetch-client';
import { API_ROUTES } from '@/config';

export interface Deck {
  id: string;
  title: string;
  description?: string;
  file_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_cards: number;
  mastered_cards: number;
  learning_cards: number;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front_content: string;
  back_content: string;
  page_number?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  last_reviewed: string;
  next_review: string;
  created_at: string;
  updated_at: string;
}

export interface FlashcardStats {
  total_decks: number;
  total_cards: number;
  mastered_cards: number;
  cards_due_today: number;
  review_streak: number;
  review_accuracy: number;
  concept_mastery: Record<string, number>;
}

interface FlashcardStore {
  // Current state
  currentDeck: Deck | null;
  decks: Deck[];
  currentCard: Flashcard | null;
  cardProgress: LearningProgress | null;
  stats: FlashcardStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentDeck: (deck: Deck | null) => void;
  setDecks: (decks: Deck[]) => void;
  setCurrentCard: (card: Flashcard | null) => void;
  setCardProgress: (progress: LearningProgress | null) => void;
  setStats: (stats: FlashcardStats) => void;

  // API integration
  fetchDecks: (fileId: string) => Promise<void>;
  createDeck: (fileId: string, data: { title: string; description?: string }) => Promise<Deck>;
  addCard: (deckId: string, data: { front: string; back: string; page?: number }) => Promise<Flashcard>;
  submitReview: (cardId: string, quality: number) => Promise<LearningProgress>;
  fetchStats: (fileId: string) => Promise<void>;
  getDueCards: (deckId?: string) => Promise<Flashcard[]>;
}

export const useFlashcardStore = create<FlashcardStore>((set, get) => ({
  // Initial state
  currentDeck: null,
  decks: [],
  currentCard: null,
  cardProgress: null,
  stats: null,
  isLoading: false,
  error: null,

  // Actions
  setCurrentDeck: (deck) => set({ currentDeck: deck }),
  setDecks: (decks) => set({ decks }),
  setCurrentCard: (card) => set({ currentCard: card }),
  setCardProgress: (progress) => set({ cardProgress: progress }),
  setStats: (stats) => set({ stats }),

  // API integration
  fetchDecks: async (fileId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchClient(`${API_ROUTES.flashcards.base}?file_id=${fileId}`);
      if (!response.ok) throw new Error('Failed to fetch decks');
      const data = await response.json();
      set({ decks: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch decks', isLoading: false });
      throw error;
    }
  },

  createDeck: async (fileId: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchClient(API_ROUTES.flashcards.base, {
        method: 'POST',
        body: JSON.stringify({ ...data, file_id: fileId })
      });
      if (!response.ok) throw new Error('Failed to create deck');
      const deck = await response.json();
      set((state) => ({ 
        decks: [...state.decks, deck],
        isLoading: false
      }));
      return deck;
    } catch (error) {
      set({ error: 'Failed to create deck', isLoading: false });
      throw error;
    }
  },

  addCard: async (deckId: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchClient(`${API_ROUTES.flashcards.base}/${deckId}/cards`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create card');
      const card = await response.json();
      set({ isLoading: false });
      return card;
    } catch (error) {
      set({ error: 'Failed to create card', isLoading: false });
      throw error;
    }
  },

  submitReview: async (cardId: string, quality: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchClient(`${API_ROUTES.flashcards.base}/cards/${cardId}/review`, {
        method: 'POST',
        body: JSON.stringify({ quality })
      });
      if (!response.ok) throw new Error('Failed to submit review');
      const progress = await response.json();
      set({ cardProgress: progress, isLoading: false });
      return progress;
    } catch (error) {
      set({ error: 'Failed to submit review', isLoading: false });
      throw error;
    }
  },

  fetchStats: async (fileId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchClient(`${API_ROUTES.flashcards.base}/stats/${fileId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const stats = await response.json();
      set({ stats, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch stats', isLoading: false });
      throw error;
    }
  },

  getDueCards: async (deckId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const url = deckId 
        ? `${API_ROUTES.flashcards.base}/due?deck_id=${deckId}`
        : `${API_ROUTES.flashcards.base}/due`;
      const response = await fetchClient(url);
      if (!response.ok) throw new Error('Failed to fetch due cards');
      const cards = await response.json();
      set({ isLoading: false });
      return cards;
    } catch (error) {
      set({ error: 'Failed to fetch due cards', isLoading: false });
      throw error;
    }
  }
}));