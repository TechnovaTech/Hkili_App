import { Platform } from 'react-native';
import { apiClient } from './apiClient';

class UploadService {
  /**
   * Upload a local image (from the gallery/camera) to Cloudinary using a signed
   * request from the backend, and return its permanent URL. Mirrors the audio
   * upload flow but uses the image resource endpoint. The backend signs only
   * { timestamp, folder }, so we must forward the same folder.
   */
  async uploadImageToCloudinary(localUri: string): Promise<string | null> {
    try {
      const sign: any = await apiClient.get<any>('/cloudinary-sign');
      if (!sign?.signature || !sign?.cloudName) {
        console.error('Cloudinary sign failed:', sign);
        return null;
      }

      const form = new FormData();

      if (Platform.OS === 'web') {
        const blob = await (await fetch(localUri)).blob();
        const ext = (blob.type.split('/')[1] || 'jpg').split(';')[0];
        form.append('file', blob, `story-image.${ext}`);
      } else {
        const ext = (localUri.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
        const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        form.append('file', {
          uri: localUri,
          type: mime,
          name: `story-image.${ext}`,
        } as any);
      }

      form.append('api_key', String(sign.apiKey));
      form.append('timestamp', String(sign.timestamp));
      form.append('signature', String(sign.signature));
      form.append('folder', String(sign.folder));

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
        { method: 'POST', body: form }
      );
      const data = await res.json();
      if (!res.ok || !data?.secure_url) {
        console.error('Cloudinary image upload failed:', JSON.stringify(data));
        return null;
      }
      return data.secure_url as string;
    } catch (error) {
      console.error('uploadImageToCloudinary error:', error);
      return null;
    }
  }
}

export const uploadService = new UploadService();
