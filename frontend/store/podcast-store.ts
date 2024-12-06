import { create } from 'zustand';

export interface Podcast {
  id: string;
  title: string;
  description?: string;
  duration: number;
  s3_audio_key: string;
  transcriptTxtUrl: string;
  transcriptVttUrl?: string;
  current_progress: number;
  currentSpeed: number;
}

interface PodcastProgress {
  currentPosition: number;
  playbackSpeed: number;
  completedSegments: number[];
  completionPercentage: number;
}

interface PodcastAnalytics {
  totalTimeListened: number;
  averageSpeed: number;
  numberOfSessions: number;
  completionRate: number;
}

interface PodcastStore {
  // Current states
  currentPodcast: Podcast | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  playbackRate: number;
  
  // Progress tracking
  progress: PodcastProgress | null;
  analytics: PodcastAnalytics | null;
  
  // List management
  podcasts: Podcast[];  // Initialize as empty array
  selectedPodcastId: string | null;
  
  // Actions
  setCurrentPodcast: (podcast: Podcast | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  updateProgress: (progress: Partial<PodcastProgress>) => void;
  updateAnalytics: (analytics: Partial<PodcastAnalytics>) => void;
  setPodcasts: (podcasts: Podcast[]) => void;
  setSelectedPodcastId: (id: string | null) => void;
}

export const usePodcastStore = create<PodcastStore>((set) => ({
  // Initial states
  currentPodcast: null,
  isPlaying: false,
  currentTime: 0,
  volume: 1,
  playbackRate: 1,
  progress: null,
  analytics: null,
  podcasts: [],  // Initialize as empty array
  selectedPodcastId: null,

  // Actions
  setCurrentPodcast: (podcast) => set({ currentPodcast: podcast }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setVolume: (volume) => set({ volume }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  updateProgress: (progressUpdate) => 
    set((state) => ({
      progress: { ...state.progress, ...progressUpdate } as PodcastProgress,
    })),
  updateAnalytics: (analyticsUpdate) =>
    set((state) => ({
      analytics: { ...state.analytics, ...analyticsUpdate } as PodcastAnalytics,
    })),
  setPodcasts: (podcasts) => set({ podcasts }),
  setSelectedPodcastId: (selectedPodcastId) => set({ selectedPodcastId }),
}));