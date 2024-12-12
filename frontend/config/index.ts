export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_ROUTES = {
  files: {
    base: `${API_BASE_URL}/api/files`,
    upload: `${API_BASE_URL}/api/files/upload`,
    list: `${API_BASE_URL}/api/files/files`,
    delete: (id: string) => `${API_BASE_URL}/api/files/files/${id}`,
    get: (id: string) => `${API_BASE_URL}/api/files/files/${id}`,
  },
  podcasts: {
    base: `${API_BASE_URL}/api/podcasts`,
    list: `${API_BASE_URL}/api/podcasts`,
    get: (id: string) => `${API_BASE_URL}/api/podcasts/${id}`,
  },
  flashcards: {
    base: `${API_BASE_URL}/api/flashcards`,
    decks: {
      list: (fileId: string) => `${API_BASE_URL}/api/flashcards/decks/${fileId}`,
      get: (deckId: string) => `${API_BASE_URL}/api/flashcards/decks/${deckId}`,
      progress: (deckId: string) => `${API_BASE_URL}/api/flashcards/decks/${deckId}/progress`,
      cards: (deckId: string) => `${API_BASE_URL}/api/flashcards/decks/${deckId}/cards`,
    },
    cards: {
      update: (cardId: string) => `${API_BASE_URL}/api/flashcards/cards/${cardId}`,
      review: (cardId: string) => `${API_BASE_URL}/api/flashcards/cards/${cardId}/review`,
    },
    stats: `${API_BASE_URL}/api/flashcards/stats`,
    learningStatus: (fileId: string) => `${API_BASE_URL}/api/flashcards/files/${fileId}/learning-status`,
  },
};