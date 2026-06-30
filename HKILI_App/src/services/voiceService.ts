import { Platform } from 'react-native';
import { apiClient } from './apiClient';
import { ApiResponse, VoiceProfile } from '@/types';

class VoiceService {
  /**
   * Upload a locally-recorded audio file to Cloudinary using a signed request
   * from the backend, and return its permanent URL. The backend signs only
   * { timestamp, folder }, so we must send folder=hkili-app to match.
   */
  async uploadSampleToCloudinary(localUri: string): Promise<string | null> {
    try {
      // 1. Get a signature from our backend.
      const sign: any = await apiClient.get<any>('/cloudinary-sign');
      if (!sign?.signature || !sign?.cloudName) {
        console.error('Cloudinary sign failed:', sign);
        return null;
      }

      // 2. Upload the audio file directly to Cloudinary (resource_type=video for audio).
      const form = new FormData();

      if (Platform.OS === 'web') {
        // On web the recording URI is a blob: URL — FormData needs a real Blob,
        // not the React-Native { uri, type, name } object (which serializes to
        // "[object Object]" and makes Cloudinary return 400).
        const blob = await (await fetch(localUri)).blob();
        const ext = (blob.type.split('/')[1] || 'webm').split(';')[0];
        form.append('file', blob, `voice-sample.${ext}`);
      } else {
        // Native (iOS/Android): pass the local file descriptor object.
        const ext = (localUri.split('.').pop() || 'm4a').toLowerCase();
        form.append('file', {
          uri: localUri,
          type: `audio/${ext === 'm4a' ? 'm4a' : ext}`,
          name: `voice-sample.${ext}`,
        } as any);
      }

      form.append('api_key', String(sign.apiKey));
      form.append('timestamp', String(sign.timestamp));
      form.append('signature', String(sign.signature));
      form.append('folder', String(sign.folder));

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/video/upload`,
        { method: 'POST', body: form }
      );
      const data = await res.json();
      if (!res.ok || !data?.secure_url) {
        // Surface Cloudinary's actual reason (e.g. "Invalid Signature").
        console.error('Cloudinary upload failed:', JSON.stringify(data));
        return null;
      }
      return data.secure_url as string;
    } catch (error) {
      console.error('uploadSampleToCloudinary error:', error);
      return null;
    }
  }

  async listVoices(): Promise<ApiResponse<VoiceProfile[]>> {
    return apiClient.get<VoiceProfile[]>('/voice');
  }

  async cloneVoice(data: {
    name: string;
    sampleUrl: string;
    language?: string;
  }): Promise<ApiResponse<VoiceProfile>> {
    return apiClient.post<VoiceProfile>('/voice', data);
  }

  async deleteVoice(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/voice/${id}`);
  }

  /**
   * Generate story narration in a cloned voice. Pass the exact `text` the
   * viewer displays so the audio matches the on-screen story. Returns an
   * audio URL hosted on Cloudinary.
   */
  async synthesize(data: {
    voiceId: string;
    text?: string;
    storyId?: string;
    language?: string;
  }): Promise<ApiResponse<{ audioUrl: string }>> {
    return apiClient.post<{ audioUrl: string }>('/voice/synthesize', data);
  }
}

export const voiceService = new VoiceService();
