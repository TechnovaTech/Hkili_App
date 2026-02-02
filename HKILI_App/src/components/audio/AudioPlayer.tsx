import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { AudioState } from '@/types';

interface AudioPlayerProps {
  audioUrl?: string;
  onPlaybackStatusUpdate?: (status: AudioState) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  onPlaybackStatusUpdate,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    volume: 1.0,
  });

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
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl! },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
    } catch (error) {
      console.error('Failed to load audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      const newState: AudioState = {
        isPlaying: status.isPlaying,
        currentTime: status.positionMillis / 1000,
        duration: status.durationMillis / 1000,
        playbackRate: status.rate,
        volume: status.volume,
      };
      
      setAudioState(newState);
      onPlaybackStatusUpdate?.(newState);
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;

    try {
      if (audioState.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const skipForward = async () => {
    if (!sound) return;

    try {
      const newPosition = Math.min(
        (audioState.currentTime + 10) * 1000,
        audioState.duration * 1000
      );
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Skip forward error:', error);
    }
  };

  const changePlaybackRate = async (rate: number) => {
    if (!sound) return;

    try {
      await sound.setRateAsync(rate, true);
    } catch (error) {
      console.error('Playback rate error:', error);
    }
  };

  const changeVolume = async (volume: number) => {
    if (!sound) return;

    try {
      await sound.setVolumeAsync(volume);
    } catch (error) {
      console.error('Volume error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={togglePlayback}
        >
          <Ionicons
            name={audioState.isPlaying ? 'pause' : 'play'}
            size={32}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={skipForward}
        >
          <Ionicons
            name="play-forward"
            size={24}
            color={theme.colors.text}
          />
          <Text style={styles.skipText}>10s</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>
          {formatTime(audioState.currentTime)}
        </Text>
        <Slider
          style={styles.progressSlider}
          minimumValue={0}
          maximumValue={audioState.duration}
          value={audioState.currentTime}
          onSlidingComplete={async (value) => {
            if (sound) {
              await sound.setPositionAsync(value * 1000);
            }
          }}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbStyle={{ backgroundColor: theme.colors.primary }}
        />
        <Text style={styles.timeText}>
          {formatTime(audioState.duration)}
        </Text>
      </View>

      <View style={styles.settingsRow}>
        <View style={styles.speedControls}>
          {[0.8, 1.0, 1.2].map((rate) => (
            <TouchableOpacity
              key={rate}
              style={[
                styles.speedButton,
                audioState.playbackRate === rate && styles.speedButtonActive,
              ]}
              onPress={() => changePlaybackRate(rate)}
            >
              <Text
                style={[
                  styles.speedText,
                  audioState.playbackRate === rate && styles.speedTextActive,
                ]}
              >
                {rate}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.volumeContainer}>
          <Ionicons
            name="volume-medium"
            size={20}
            color={theme.colors.textSecondary}
          />
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={audioState.volume}
            onValueChange={changeVolume}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.md,
  },
  skipText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  progressSlider: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  timeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    minWidth: 40,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedControls: {
    flexDirection: 'row',
  },
  speedButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginHorizontal: theme.spacing.xs,
  },
  speedButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  speedText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  speedTextActive: {
    color: theme.colors.text,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: 120,
  },
  volumeSlider: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
});