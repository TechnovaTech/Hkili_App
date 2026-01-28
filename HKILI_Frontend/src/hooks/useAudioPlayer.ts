import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { AudioState } from '@/types';

export const useAudioPlayer = (audioUrl?: string) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    volume: 1.0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (audioUrl) {
      loadAudio();
    }
  }, [audioUrl]);

  const loadAudio = async () => {
    try {
      setLoading(true);
      setError(null);

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl! },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
    } catch (err) {
      setError('Failed to load audio');
      console.error('Audio loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setAudioState({
        isPlaying: status.isPlaying,
        currentTime: status.positionMillis / 1000,
        duration: status.durationMillis / 1000,
        playbackRate: status.rate,
        volume: status.volume,
      });
    }
  };

  const play = async () => {
    if (!sound) return;
    try {
      await sound.playAsync();
    } catch (err) {
      setError('Failed to play audio');
    }
  };

  const pause = async () => {
    if (!sound) return;
    try {
      await sound.pauseAsync();
    } catch (err) {
      setError('Failed to pause audio');
    }
  };

  const stop = async () => {
    if (!sound) return;
    try {
      await sound.stopAsync();
    } catch (err) {
      setError('Failed to stop audio');
    }
  };

  const seekTo = async (positionSeconds: number) => {
    if (!sound) return;
    try {
      await sound.setPositionAsync(positionSeconds * 1000);
    } catch (err) {
      setError('Failed to seek audio');
    }
  };

  const setPlaybackRate = async (rate: number) => {
    if (!sound) return;
    try {
      await sound.setRateAsync(rate, true);
    } catch (err) {
      setError('Failed to set playback rate');
    }
  };

  const setVolume = async (volume: number) => {
    if (!sound) return;
    try {
      await sound.setVolumeAsync(volume);
    } catch (err) {
      setError('Failed to set volume');
    }
  };

  return {
    audioState,
    loading,
    error,
    play,
    pause,
    stop,
    seekTo,
    setPlaybackRate,
    setVolume,
  };
};