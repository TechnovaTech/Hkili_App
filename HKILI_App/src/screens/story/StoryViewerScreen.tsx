import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { storyService } from '@/services/storyService';
import { Story } from '@/types';
import { theme } from '@/theme';

export default function StoryViewerScreen() {
  const router = useRouter();
  const { storyId, storyData } = useLocalSearchParams<{ storyId: string; storyData: string }>();
  const id = Array.isArray(storyId) ? storyId[0] : storyId;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  // TTS player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);       // seconds elapsed
  const [totalDuration, setTotalDuration] = useState(0); // estimated total seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullTextRef = useRef('');

  useEffect(() => {
    if (storyData) {
      try {
        const parsed = JSON.parse(storyData);
        setStory(parsed);
        setLoading(false);
      } catch {
        if (id) fetchStory(id);
      }
    } else if (id) {
      fetchStory(id);
    }
    return () => {
      Speech.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, storyData]);

  const fetchStory = async (sid: string) => {
    try {
      const response = await storyService.getStory(sid);
      if (response.success && response.data) setStory(response.data);
    } catch (error) {
      console.error('Error fetching story:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build full story text from segments
  const getFullText = useCallback((s: Story) => {
    if (!s.content || s.content.length === 0) return s.title || '';
    return s.content.map((seg: any) => seg.text || '').filter(Boolean).join('\n\n');
  }, []);

  // Estimate reading duration: ~130 words per minute for TTS
  const estimateDuration = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    return Math.ceil((words / 130) * 60);
  };

  useEffect(() => {
    if (story) {
      const text = getFullText(story);
      fullTextRef.current = text;
      setTotalDuration(estimateDuration(text));
    }
  }, [story]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev >= totalDuration) {
          clearInterval(timerRef.current!);
          return totalDuration;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePlay = async () => {
    if (isPlaying) {
      // Pause
      await Speech.stop();
      stopTimer();
      setIsPlaying(false);
    } else {
      // Play from beginning or resume (expo-speech doesn't support resume, restart from beginning)
      const text = fullTextRef.current;
      if (!text) return;

      setElapsed(0);
      setIsPlaying(true);
      startTimer();

      Speech.speak(text, {
        language: 'en-US',
        rate: 0.9,
        pitch: 1.0,
        onDone: () => {
          setIsPlaying(false);
          setElapsed(totalDuration);
          stopTimer();
        },
        onStopped: () => {
          setIsPlaying(false);
          stopTimer();
        },
        onError: () => {
          setIsPlaying(false);
          stopTimer();
        },
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = totalDuration > 0 ? Math.min(elapsed / totalDuration, 1) : 0;

  // Content helpers
  const getImageUri = (url?: string) => (url ? { uri: url } : null);

  const renderStoryImage = (source: { uri: string } | null) => {
    if (!source) return null;
    return (
      <View style={styles.storyImageContainer}>
        <Image source={source} style={styles.storyImageFull} resizeMode="cover" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Story not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Split content into 2 halves
  let segments = story.content || [];
  if (segments.length === 1 && segments[0].text) {
    const paras = segments[0].text.split(/\n\s*\n/);
    if (paras.length > 1) {
      segments = paras.map((p: string, i: number) => ({ id: `p-${i}`, text: p.trim() })).filter((s: any) => s.text);
    }
  }
  const half = Math.ceil(segments.length / 2);
  const part1 = segments.slice(0, half);
  const part2 = segments.slice(half);

  const img1 = getImageUri(story.image1);
  const img2 = getImageUri(story.image2);
  const img3 = getImageUri(story.image3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { Speech.stop(); router.push('/(tabs)/home'); }} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Story</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Story Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.storyTitle}>{story.title}</Text>

        {/* Image 1 — Start */}
        {renderStoryImage(img1)}

        <Text style={styles.sectionTitle}>The Story</Text>

        <View style={styles.textBlock}>
          {part1.map((seg: any, i: number) => (
            <Text key={`p1-${i}`} style={styles.storyText}>{seg.text}</Text>
          ))}
        </View>

        {/* Image 2 — Middle */}
        {renderStoryImage(img2)}

        <View style={styles.textBlock}>
          {part2.map((seg: any, i: number) => (
            <Text key={`p2-${i}`} style={styles.storyText}>{seg.text}</Text>
          ))}
        </View>

        {/* Image 3 — End */}
        {renderStoryImage(img3)}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Player — always visible */}
      <View style={styles.player}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Time labels */}
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(elapsed)}</Text>
          <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePlay}
            style={styles.playBtn}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#FFFFFF"
              style={{ marginLeft: isPlaying ? 0 : 3 }}
            />
          </TouchableOpacity>
        </View>

        {isPlaying && (
          <Text style={styles.speakingLabel}>🔊 Reading story aloud...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
  iconBtn: { padding: 5 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  textBlock: { marginBottom: 20 },
  storyText: {
    fontSize: 16,
    lineHeight: 26,
    color: theme.colors.textSecondary,
    marginBottom: 15,
  },
  storyImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  storyImageFull: { width: '100%', height: '100%' },

  // Player
  player: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 12,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeText: { fontSize: 12, color: theme.colors.textMuted },
  controls: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  speakingLabel: {
    textAlign: 'center',
    color: theme.colors.primary,
    fontSize: 12,
    marginTop: 10,
  },
  errorText: { color: theme.colors.text, fontSize: 18, marginBottom: 20 },
  backBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});
