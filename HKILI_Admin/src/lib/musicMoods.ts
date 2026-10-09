// Moods shared by the background-music library (admin tags tracks) and story
// generation (the AI labels each story with one). Safe to import client-side.
export const MUSIC_MOODS = ['calm', 'happy', 'adventurous', 'magical', 'mysterious', 'funny', 'emotional'] as const

export type MusicMood = (typeof MUSIC_MOODS)[number]

export const isMusicMood = (value: unknown): value is MusicMood =>
  typeof value === 'string' && (MUSIC_MOODS as readonly string[]).includes(value)
