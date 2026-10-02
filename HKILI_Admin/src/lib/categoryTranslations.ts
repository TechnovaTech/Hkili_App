import OpenAI from 'openai'
import Category from '../models/Category'
import Setting from '../models/Setting'

const TRANSLATE_MODEL = process.env.OPENAI_TRANSLATE_MODEL || 'gpt-4o-mini'

/**
 * Fill in missing French/Arabic category names with OpenAI and save them, so
 * the app can show story modes in the chosen language. Names entered by the
 * admin are never overwritten. On failure the app falls back to `name`.
 */
export async function fillMissingCategoryTranslations(categories: any[]) {
  const missing = categories.filter((c) => !c.nameFr || !c.nameAr)
  if (missing.length === 0) return

  try {
    const setting = await Setting.findOne()
    const apiKey = setting?.openaiApiKey || process.env.OPENAI_API_KEY
    if (!apiKey) return

    const openai = new OpenAI({ apiKey, timeout: 15000 })
    const completion = await openai.chat.completions.create({
      model: TRANSLATE_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            "Translate story category names for a children's storytelling app into French and Arabic. " +
            'Keep them short, natural and child-friendly. ' +
            'Reply with JSON: {"translations":[{"id":"<id>","fr":"<French>","ar":"<Arabic>"}]}',
        },
        {
          role: 'user',
          content: JSON.stringify(missing.map((c) => ({ id: String(c._id), name: c.name }))),
        },
      ],
    })

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}')
    for (const t of parsed.translations || []) {
      const category = missing.find((c) => String(c._id) === t.id)
      if (!category) continue

      const update: Record<string, string> = {}
      if (!category.nameFr && t.fr) update.nameFr = category.nameFr = String(t.fr).trim()
      if (!category.nameAr && t.ar) update.nameAr = category.nameAr = String(t.ar).trim()
      if (Object.keys(update).length) {
        await Category.updateOne({ _id: category._id }, update)
      }
    }
  } catch (e: any) {
    console.warn('Category translation failed (showing English names):', e?.message || e)
  }
}
