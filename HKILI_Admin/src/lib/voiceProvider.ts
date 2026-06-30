/**
 * Provider-agnostic voice-cloning adapter.
 *
 * The rest of the app only talks to this module — never directly to a vendor.
 * To switch providers you only change env vars (and, for Fish/Replicate, fill
 * in the two stubbed methods). Nothing else in the codebase needs to change.
 *
 *   VOICE_PROVIDER = elevenlabs | fish | replicate   (default: elevenlabs)
 *   ELEVENLABS_API_KEY = <key>                        (when provider=elevenlabs)
 *
 * Contract:
 *   - isConfigured(): is the selected provider ready to use?
 *   - cloneVoice():   register a user's recorded sample, return a provider voice id
 *   - synthesize():   turn story text into spoken audio (mp3 bytes) in that voice
 *   - deleteVoice():  remove the cloned voice from the provider
 */

export type VoiceLanguage = 'EN' | 'FR' | 'AR'

export interface CloneVoiceParams {
  name: string
  sampleUrl: string // Cloudinary URL of the recorded sample
  language?: VoiceLanguage
}

export interface SynthesizeParams {
  text: string
  providerVoiceId: string
  language?: VoiceLanguage
}

export interface VoiceProvider {
  readonly name: string
  isConfigured(): boolean
  cloneVoice(params: CloneVoiceParams): Promise<{ providerVoiceId: string }>
  synthesize(params: SynthesizeParams): Promise<Buffer>
  deleteVoice(providerVoiceId: string): Promise<void>
}

/** Thrown when a provider isn't configured; routes turn this into a clean 400. */
export class VoiceProviderError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

// ---------------------------------------------------------------------------
// ElevenLabs (recommended) — fully implemented.
// Free tier does NOT include cloning; the cheapest plan with Instant Voice
// Cloning is "Starter" (~$5/mo). eleven_multilingual_v2 covers EN/FR/AR.
// ---------------------------------------------------------------------------
const ELEVEN_BASE = 'https://api.elevenlabs.io/v1'

const elevenLabsProvider: VoiceProvider = {
  name: 'elevenlabs',

  isConfigured() {
    return !!process.env.ELEVENLABS_API_KEY
  },

  async cloneVoice({ name, sampleUrl }) {
    const apiKey = process.env.ELEVENLABS_API_KEY!
    // Download the recorded sample, then forward it to ElevenLabs as a file.
    const sampleRes = await fetch(sampleUrl)
    if (!sampleRes.ok) {
      throw new VoiceProviderError('Could not read the recorded voice sample')
    }
    const sampleBuf = Buffer.from(await sampleRes.arrayBuffer())
    // Preserve the real audio format so ElevenLabs detects it correctly.
    const contentType = sampleRes.headers.get('content-type') || 'audio/mpeg'
    const ext = (sampleUrl.split('?')[0].split('.').pop() || 'mp3').toLowerCase()

    const form = new FormData()
    form.append('name', name)
    form.append(
      'files',
      new Blob([sampleBuf], { type: contentType }),
      `sample.${ext}`
    )

    const res = await fetch(`${ELEVEN_BASE}/voices/add`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey },
      body: form,
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new VoiceProviderError(
        `ElevenLabs voice cloning failed: ${res.status} ${detail}`.trim(),
        res.status === 401 ? 401 : 400
      )
    }

    const data: any = await res.json()
    if (!data?.voice_id) {
      throw new VoiceProviderError('ElevenLabs did not return a voice id')
    }
    return { providerVoiceId: data.voice_id }
  },

  async synthesize({ text, providerVoiceId }) {
    const apiKey = process.env.ELEVENLABS_API_KEY!
    const res = await fetch(
      `${ELEVEN_BASE}/text-to-speech/${providerVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          // Multilingual model auto-detects EN / FR / AR from the text.
          model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    )

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new VoiceProviderError(
        `ElevenLabs synthesis failed: ${res.status} ${detail}`.trim(),
        res.status === 401 ? 401 : 400
      )
    }

    return Buffer.from(await res.arrayBuffer())
  },

  async deleteVoice(providerVoiceId) {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) return
    // Best-effort: don't fail account/voice cleanup if the remote delete errors.
    await fetch(`${ELEVEN_BASE}/voices/${providerVoiceId}`, {
      method: 'DELETE',
      headers: { 'xi-api-key': apiKey },
    }).catch(() => {})
  },
}

// ---------------------------------------------------------------------------
// Fish Audio — STUB. Fill these two methods + set FISH_API_KEY to enable.
// Docs: https://docs.fish.audio  (model create + /v1/tts)
// ---------------------------------------------------------------------------
const fishProvider: VoiceProvider = {
  name: 'fish',
  isConfigured() {
    return !!process.env.FISH_API_KEY
  },
  async cloneVoice() {
    throw new VoiceProviderError(
      'Fish Audio provider is not implemented yet. Set VOICE_PROVIDER=elevenlabs or implement fishProvider.'
    )
  },
  async synthesize() {
    throw new VoiceProviderError('Fish Audio provider is not implemented yet.')
  },
  async deleteVoice() {
    /* no-op until implemented */
  },
}

// ---------------------------------------------------------------------------
// Replicate (XTTS-v2) — STUB. Pay-per-use, no monthly fee.
// Fill these + set REPLICATE_API_TOKEN to enable.
// ---------------------------------------------------------------------------
const replicateProvider: VoiceProvider = {
  name: 'replicate',
  isConfigured() {
    return !!process.env.REPLICATE_API_TOKEN
  },
  async cloneVoice() {
    // XTTS does zero-shot cloning at synth time (no separate "clone" step):
    // store the sampleUrl as the providerVoiceId and pass it as speaker on synth.
    throw new VoiceProviderError(
      'Replicate provider is not implemented yet. Set VOICE_PROVIDER=elevenlabs or implement replicateProvider.'
    )
  },
  async synthesize() {
    throw new VoiceProviderError('Replicate provider is not implemented yet.')
  },
  async deleteVoice() {
    /* no-op until implemented */
  },
}

const PROVIDERS: Record<string, VoiceProvider> = {
  elevenlabs: elevenLabsProvider,
  fish: fishProvider,
  replicate: replicateProvider,
}

export function getVoiceProvider(): VoiceProvider {
  const key = (process.env.VOICE_PROVIDER || 'elevenlabs').toLowerCase()
  const provider = PROVIDERS[key]
  if (!provider) {
    throw new VoiceProviderError(
      `Unknown VOICE_PROVIDER "${key}". Use one of: ${Object.keys(PROVIDERS).join(', ')}`
    )
  }
  return provider
}

/** Guard used by routes to fail fast with a clear, user-facing message. */
export function assertVoiceConfigured(provider: VoiceProvider) {
  if (!provider.isConfigured()) {
    throw new VoiceProviderError(
      `Voice cloning is not configured on the server. Set the API key for "${provider.name}" (e.g. ELEVENLABS_API_KEY).`,
      503
    )
  }
}
