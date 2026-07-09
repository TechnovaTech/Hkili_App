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
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { storyService } from '@/services/storyService';
import { voiceService } from '@/services/voiceService';
import { Story, VoiceProfile } from '@/types';
import { theme } from '@/theme';
import { ScreenBackground } from '../../components/ui/ScreenBackground';


export default function StoryViewerScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { storyId, storyData } = useLocalSearchParams<{ storyId: string; storyData: string }>();
  const id = Array.isArray(storyId) ? storyId[0] : storyId;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  // Content alignment based on story language.
  // Normalize to a 2-letter code (story.language may be 'EN'/'AR'/'FR' or 'en-US').
  const storyLang = ((story?.language || i18n.language) || 'en').toLowerCase().slice(0, 2);
  const isStoryRTL = storyLang === 'ar';
  const storyTextAlign = isStoryRTL ? 'right' : 'left';
  const storyFlexDirection = isStoryRTL ? 'row-reverse' : 'row';

  // Translate UI labels in the STORY's language, not the app's UI language,
  // so a French/Arabic story doesn't show English labels (and vice-versa).
  const tStory = (key: string) => t(key, { lng: storyLang });

  // TTS player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullTextRef = useRef('');
  const pausedAtRef = useRef(0); // tracks word index where we paused

  // Narrator / voice-cloning state
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null); // null = default narrator (device TTS)
  const [voicePickerVisible, setVoicePickerVisible] = useState(false);
  const [synthLoading, setSynthLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  // In-memory cache of synthesized audio URLs for this story, keyed by voiceId.
  const audioUrlCacheRef = useRef<Record<string, string>>({});

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId) || null;


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
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [id, storyData]);

  // Load the user's cloned voices so they can pick a narrator.
  useEffect(() => {
    (async () => {
      try {
        const res = await voiceService.listVoices();
        if (res.success && res.data) setVoices(res.data);
      } catch {
        // non-fatal — default narrator still works
      }
    })();
  }, []);

  const fetchStory = async (sid: string) => {
    try {
      console.log(`[StoryViewer] Fetching story with ID: ${sid}`);
      const response = await storyService.getStory(sid);
      if (response.success && response.data) {
        const s = response.data;
        console.log('[StoryViewer] Story data received:', {
          title: s.title,
          image1: s.image1 ? 'URL present' : 'MISSING',
          image2: s.image2 ? 'URL present' : 'MISSING',
          image3: s.image3 ? 'URL present' : 'MISSING',
          fullData: s // Log full object for inspection
        });
        setStory(s);
      } else {
        console.error('[StoryViewer] Failed to fetch story:', response.error);
      }
    } catch (error) {
      console.error('[StoryViewer] Error fetching story:', error);
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

  const startTimer = (fromSeconds = 0) => {
    if (timerRef.current) clearInterval(timerRef.current);
    let current = fromSeconds;
    timerRef.current = setInterval(() => {
      current += 1;
      setElapsed(current);
      if (current >= totalDuration) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Speak from a given elapsed-seconds offset by skipping already-read words
  const speakFrom = (fromSeconds: number) => {
    const fullText = fullTextRef.current;
    if (!fullText) return;
    const words = fullText.split(/\s+/);
    const wps = (0.9 * 130) / 60;
    const skipWords = Math.floor(fromSeconds * wps);
    const remainingText = words.slice(Math.min(skipWords, words.length - 1)).join(' ');

    // Map story language to BCP 47 language tag for TTS
    // Priority: story.language -> i18n.language
    const langToUse = (story?.language || i18n.language).toLowerCase();
    
    const ttsLanguage = langToUse === 'ar' ? 'ar-SA' : 
                        langToUse === 'fr' ? 'fr-FR' : 
                        'en-US';

    Speech.speak(remainingText, {
      language: ttsLanguage,
      rate: 0.9,
      pitch: 1.0,
      onDone: () => { setIsPlaying(false); setElapsed(totalDuration); pausedAtRef.current = 0; stopTimer(); },
      onStopped: () => { setIsPlaying(false); stopTimer(); },
      onError: () => { setIsPlaying(false); stopTimer(); },
    });
  };

  // ---- Cloned-voice playback (expo-av) ----------------------------------

  // Get a synthesized audio URL for the chosen cloned voice, using a cache
  // (memory + AsyncStorage) so we don't pay to regenerate the same story.
  const getClonedAudioUrl = async (voiceId: string): Promise<string | null> => {
    if (audioUrlCacheRef.current[voiceId]) return audioUrlCacheRef.current[voiceId];

    const cacheKey = `clonedAudio:${id}:${voiceId}`;
    try {
      const stored = await AsyncStorage.getItem(cacheKey);
      if (stored) {
        audioUrlCacheRef.current[voiceId] = stored;
        return stored;
      }
    } catch {}

    const res = await voiceService.synthesize({
      voiceId,
      storyId: id,
      text: fullTextRef.current,
      language: storyLang.toUpperCase(),
    });
    if (res.success && res.data?.audioUrl) {
      audioUrlCacheRef.current[voiceId] = res.data.audioUrl;
      AsyncStorage.setItem(cacheKey, res.data.audioUrl).catch(() => {});
      return res.data.audioUrl;
    }
    return null;
  };

  const onSoundStatus = (status: any) => {
    if (!status.isLoaded) return;
    if (typeof status.durationMillis === 'number') {
      setTotalDuration(Math.ceil(status.durationMillis / 1000));
    }
    setElapsed(Math.floor((status.positionMillis ?? 0) / 1000));
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setElapsed(Math.ceil((status.durationMillis ?? 0) / 1000));
    }
  };

  const playClonedVoice = async (voiceId: string) => {
    try {
      // Resume if already loaded.
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }
      setSynthLoading(true);
      const url = await getClonedAudioUrl(voiceId);
      setSynthLoading(false);
      if (!url) {
        Alert.alert(tStory('storyViewer.yourStory'), tStory('voice.synthError'));
        return;
      }
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        onSoundStatus
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (e) {
      setSynthLoading(false);
      console.error('playClonedVoice error:', e);
      Alert.alert(tStory('storyViewer.yourStory'), tStory('voice.synthError'));
    }
  };

  const handlePlay = async () => {
    // Cloned-voice path
    if (selectedVoiceId) {
      if (isPlaying && soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await playClonedVoice(selectedVoiceId);
      }
      return;
    }

    // Default narrator path (device TTS)
    if (isPlaying) {
      pausedAtRef.current = elapsed;
      await Speech.stop();
      stopTimer();
      setIsPlaying(false);
    } else {
      const from = pausedAtRef.current;
      setIsPlaying(true);
      startTimer(from);
      speakFrom(from);
    }
  };

  // Switch narrator: stop whatever is playing and reset position.
  const handleSelectVoice = async (voiceId: string | null) => {
    Speech.stop();
    stopTimer();
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    pausedAtRef.current = 0;
    setElapsed(0);
    setIsPlaying(false);
    setSelectedVoiceId(voiceId);
    setVoicePickerVisible(false);
    // Reset duration estimate for default narrator; cloned will set real duration on play.
    if (!voiceId && story) setTotalDuration(estimateDuration(fullTextRef.current));
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
      <ScreenBackground>
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenBackground>
    );
  }

  if (!story) {
    return (
      <ScreenBackground>
        <View style={[styles.container, styles.center]}>
          <Text style={styles.errorText}>{tStory('storyViewer.notFound')}</Text>
          <TouchableOpacity style={styles.backBtnWrapper} onPress={() => router.back()} activeOpacity={0.85}>
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>{tStory('storyViewer.goBack')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  // Build the chapter list. AI stories arrive as segments each carrying its
  // own per-chapter imageUrl. Older/plain stories may be a single blob → split
  // into paragraphs so they still render as readable chunks.
  let segments = story.content || [];
  if (segments.length === 1 && segments[0].text) {
    const paras = segments[0].text.split(/\n\s*\n/);
    if (paras.length > 1) {
      segments = paras.map((p: string, i: number) => ({ id: `p-${i}`, text: p.trim() })).filter((s: any) => s.text);
    }
  }

  // Prefer the per-chapter image embedded in each segment. Fall back to the
  // legacy image1/2/3 fields (spread across chapters) for older stories that
  // predate per-segment images.
  const hasSegmentImages = segments.some((s: any) => s.imageUrl);
  const legacyImages = [story.image1, story.image2, story.image3].filter(Boolean) as string[];
  const imageForChapter = (seg: any, index: number): string | undefined => {
    if (seg.imageUrl) return seg.imageUrl;
    if (hasSegmentImages) return undefined;
    return legacyImages[index];
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { Speech.stop(); router.push('/(tabs)/home'); }} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tStory('storyViewer.yourStory')}</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Story Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.storyTitle, { textAlign: storyTextAlign }]}>{story.title}</Text>

        {/* One illustration per chapter, followed by that chapter's text */}
        {segments.map((seg: any, i: number) => {
          const chapterImg = getImageUri(imageForChapter(seg, i));
          return (
            <View key={seg.id || `seg-${i}`} style={styles.chapterBlock}>
              {renderStoryImage(chapterImg)}

              <LinearGradient
                colors={theme.gradients.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.contentCard}
              >
                {segments.length > 1 && (
                  <Text style={[styles.sectionTitle, { textAlign: storyTextAlign }]}>
                    {tStory('storyViewer.chapter')} {i + 1}
                  </Text>
                )}
                <Text style={[styles.storyText, { textAlign: storyTextAlign }]}>{seg.text}</Text>
              </LinearGradient>
            </View>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Player — always visible */}
      <View style={styles.player}>
        {/* Progress bar with times on each side */}
        <View style={styles.progressRow}>
          <Text style={styles.timeText}>{formatTime(elapsed)}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
        </View>

        {/* Controls row: play button centered, narrator button at right corner */}
        <View style={styles.controls}>
          <View style={{ width: 52 }} />

          <TouchableOpacity onPress={handlePlay} style={styles.playBtnWrapper} activeOpacity={0.85} disabled={synthLoading}>
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playBtn}
            >
              {synthLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={28}
                  color="#FFFFFF"
                  style={{ marginLeft: isPlaying ? 0 : 3 }}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Narrator picker button */}
          <TouchableOpacity
            onPress={() => setVoicePickerVisible(true)}
            style={styles.voiceBtn}
            activeOpacity={0.8}
          >
            <Ionicons
              name={selectedVoiceId ? 'person' : 'person-outline'}
              size={20}
              color={selectedVoiceId ? '#4CAF50' : '#81C784'}
            />
          </TouchableOpacity>
        </View>

        {/* Current narrator label */}
        <Text style={styles.narratorLabel} numberOfLines={1}>
          {tStory('voice.narrator')}: {selectedVoice ? selectedVoice.name : tStory('voice.defaultNarrator')}
        </Text>
      </View>

      {/* Narrator picker modal */}
      <Modal
        visible={voicePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVoicePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVoicePickerVisible(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{tStory('voice.chooseNarrator')}</Text>

            {/* Default narrator */}
            <TouchableOpacity
              style={[styles.voiceOption, !selectedVoiceId && styles.voiceOptionActive]}
              onPress={() => handleSelectVoice(null)}
            >
              <Ionicons name="volume-medium-outline" size={22} color="#81C784" />
              <Text style={styles.voiceOptionText}>{tStory('voice.defaultNarrator')}</Text>
              {!selectedVoiceId && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
            </TouchableOpacity>

            {/* Cloned voices */}
            {voices.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.voiceOption, selectedVoiceId === v.id && styles.voiceOptionActive]}
                onPress={() => handleSelectVoice(v.id)}
              >
                <Ionicons name="person-circle-outline" size={22} color="#81C784" />
                <Text style={styles.voiceOptionText}>{v.name}</Text>
                {selectedVoiceId === v.id && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
              </TouchableOpacity>
            ))}

            {/* Add / manage voices */}
            <TouchableOpacity
              style={styles.addVoiceBtn}
              onPress={() => { setVoicePickerVisible(false); router.push('/voice/my-voice' as any); }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
              <Text style={styles.addVoiceText}>
                {voices.length === 0 ? tStory('voice.recordYourVoice') : tStory('voice.manageVoices')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 199, 132, 0.15)',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.primary, letterSpacing: 0.5 },
  iconBtn: { padding: 5 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  storyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  chapterBlock: { marginBottom: 4 },
  contentCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
    padding: 18,
    marginBottom: 20,
    ...theme.shadows.md,
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
    backgroundColor: 'rgba(10, 25, 41, 0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(129, 199, 132, 0.18)',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 32 : 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  timeText: { fontSize: 12, color: '#888888', width: 36, textAlign: 'center' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },

  playBtnWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'visible',
    ...theme.shadows.glow,
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  narratorLabel: {
    fontSize: 12,
    color: '#81C784',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#102A43',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  voiceOptionActive: {
    backgroundColor: 'rgba(76,175,80,0.12)',
  },
  voiceOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  addVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  addVoiceText: { color: '#4CAF50', fontSize: 15, fontWeight: '600' },

  errorText: { color: theme.colors.text, fontSize: 18, marginBottom: 20 },
  backBtnWrapper: {
    borderRadius: 12,
    overflow: 'visible',
    ...theme.shadows.glow,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});
