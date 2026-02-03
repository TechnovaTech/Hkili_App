export interface User {
  id: string;
  email: string;
  name?: string;
  isGuest: boolean;
  subscription?: {
    type: 'free' | 'premium';
    expiresAt?: string;
  };
  coins: number;
}

export interface Character {
  id: string;
  name: string;
  age?: number;
  gender: 'male' | 'female' | 'n/a';
  appearance: {
    hairColor: string;
    eyeColor: string;
  };
  interests: string[];
  isMainCharacter: boolean;
  avatarUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  content: StorySegment[];
  audioUrl?: string;
  imageUrl?: string;
  genre: StoryGenre;
  childName: string;
  childAge: number;
  createdAt: string;
  isFavorite: boolean;
  isDownloaded: boolean;
  duration?: number;
}

export interface StorySegment {
  id: string;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  startTime?: number;
  endTime?: number;
}

export type StoryGenre = 
  | 'adventure'
  | 'fantasy'
  | 'educational'
  | 'bedtime'
  | 'friendship'
  | 'animals'
  | 'science';

export type StoryLength = 'short' | 'medium' | 'long';

export interface StoryGenerationRequest {
  childName?: string;
  childAge?: number;
  genre?: StoryGenre;
  characters?: string[];
  moralLesson?: string;
  length?: StoryLength;
  voiceId?: string;
  categoryId?: string;
  storyCharacterId?: string;
  place?: string;
  moral?: string;
  language?: string;
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
}

export type Language = 'en' | 'fr' | 'ar';

export interface AppSettings {
  language: Language;
  textSize: 'small' | 'medium' | 'large';
  offlineStorageLimit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}