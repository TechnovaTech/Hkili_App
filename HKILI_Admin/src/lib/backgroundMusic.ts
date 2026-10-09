import mongoose from 'mongoose'
import BackgroundMusic from '../models/BackgroundMusic'
import { isMusicMood } from './musicMoods'

/**
 * Pick the best background track for a story from the music library.
 * A matching mood scores 2 and a matching story category scores 1; the best
 * available track wins even if nothing matches. Ties are broken by the story id,
 * so a story keeps the same track until the library changes. Picked on every
 * request, so newly uploaded tracks also reach older stories.
 */
export async function pickBackgroundMusic(story: { _id: unknown; mood?: string; categoryId?: any }) {
  const tracks = await BackgroundMusic.find({ isActive: true }).sort({ createdAt: 1 }).lean<any[]>()
  if (tracks.length === 0) return null

  const categoryId = story.categoryId ? String(story.categoryId._id ?? story.categoryId) : undefined
  const score = (track: any) =>
    (story.mood && track.moods?.includes(story.mood) ? 2 : 0) +
    (categoryId && track.categoryIds?.some((c: unknown) => String(c) === categoryId) ? 1 : 0)

  const best = Math.max(...tracks.map(score))
  const candidates = tracks.filter((track) => score(track) === best)
  const hash = String(story._id).split('').reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 0)
  return candidates[hash % candidates.length]
}

/** Whitelist the editable track fields from an admin request body. */
export const musicFieldsFromBody = (body: any) => ({
  name: String(body?.name ?? '').trim(),
  url: String(body?.url ?? '').trim(),
  moods: Array.isArray(body?.moods) ? body.moods.filter(isMusicMood) : [],
  categoryIds: Array.isArray(body?.categoryIds)
    ? body.categoryIds.filter((id: unknown) => mongoose.isValidObjectId(id))
    : [],
  isActive: body?.isActive !== false,
})
