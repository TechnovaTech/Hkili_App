import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { theme } from '../../theme';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { apiClient } from '@/services/apiClient';
import { storyService } from '@/services/storyService';

// Rough expected wall-clock for a full generation (text + a few images), in
// seconds. Only used to render a *smooth* progress bar — the real finish is
// driven by the API response, so the bar is capped at 95% until that returns.
const EXPECTED_SECONDS = 45;

export default function StoryGenerationScreen() {
  const { t } = useTranslation();
  const { categoryId, mainCharacterIds, sideCharacterIds, place, moral, language } = useLocalSearchParams<{
    categoryId: string;
    mainCharacterIds: string;
    sideCharacterIds: string;
    place: string;
    moral: string;
    language: string;
  }>();

  const [scaleAnim] = useState(new Animated.Value(1));
  const [status, setStatus] = useState<'generating' | 'done' | 'error'>('generating');
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const generatedStoryId = useRef<string | null>(null);

  useEffect(() => {
    generateStory();
    const animate = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]).start(() => animate());
    };
    animate();
  }, []);

  // Live elapsed-time counter — ticks only while the request is in flight, so
  // the number the user sees is the *actual* time the AI is taking.
  useEffect(() => {
    if (status !== 'generating') return;
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [status]);

  useEffect(() => {
    if (status === 'done' && generatedStoryId.current) {
      const storyId = generatedStoryId.current;
      // Await addToLibrary before navigating so the story is guaranteed in the library
      storyService.addToLibrary(storyId)
        .catch(() => {})
        .finally(() => {
          router.replace({ pathname: '/story/viewer', params: { storyId } });
        });
    }
  }, [status]);

  const generateStory = async () => {
    try {
      const mainIds = mainCharacterIds ? JSON.parse(mainCharacterIds) : [];
      const sideIds = sideCharacterIds ? JSON.parse(sideCharacterIds) : [];

      console.log('[StoryGeneration] Requesting story generation...', { categoryId, mainIds, sideIds, place, moral, language });

      const response = await apiClient.post<any>('/ai/generate', {
        categoryId,
        mainCharacterIds: mainIds,
        sideCharacterIds: sideIds,
        place,
        moral,
        language: language || 'EN',
      });

      console.log('[StoryGeneration] API Response received:', response);

      if (response.success && response.data) {
        const story = response.data;
        console.log('[StoryGeneration] Story generated successfully:', {
          id: story._id || story.id,
          image1: story.image1 ? 'URL present' : 'MISSING',
          image2: story.image2 ? 'URL present' : 'MISSING',
          image3: story.image3 ? 'URL present' : 'MISSING'
        });
        generatedStoryId.current = response.data._id || response.data.id;
        setStatus('done');
      } else {
        console.error('[StoryGeneration] Generation failed:', response.error);
        setErrorMsg(response.error || t('storyFlow.genFailed'));
        setStatus('error');
      }
    } catch (err: any) {
      console.error('[StoryGeneration] Exception during generation:', err);
      setErrorMsg(err.message || t('storyFlow.genFailed'));
      setStatus('error');
    }
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Which stage message to show, derived from how long we've been waiting.
  // Mirrors what the backend actually does: writes the text first, then draws
  // the per-chapter illustrations, then finalizes.
  const stageKey =
    elapsed < 12 ? 'storyFlow.genStatusWriting'
      : elapsed < 32 ? 'storyFlow.genStatusIllustrating'
        : 'storyFlow.genStatusFinishing';

  const progress = Math.min(elapsed / EXPECTED_SECONDS, 0.95);

  if (status === 'error') {
    return (
      <ScreenBackground>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('storyFlow.genHeader')}</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.content}>
            <Ionicons name="alert-circle-outline" size={80} color="#FF9800" />
            <Text style={styles.errorTitle}>{t('storyFlow.genFailed')}</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => router.push('/(tabs)/home')} activeOpacity={0.85}>
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.retryButtonInner}
              >
                <Text style={styles.retryButtonText}>{t('storyFlow.genGoHome')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('storyFlow.genTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.content}>
          <Text style={styles.description}>{t('storyFlow.genSubtitle')}</Text>
          <View style={styles.imageContainer}>
            <Animated.View style={[styles.animatedGlow, { transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.animatedContainer}
              >
                <Text style={styles.storyEmoji}>📚</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Live elapsed timer */}
          <Text style={styles.timer}>{fmtTime(elapsed)}</Text>

          {/* Progress bar (smooth estimate, finishes when the API returns) */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>

          {/* Stage message reflecting what the AI is doing right now */}
          <Text style={styles.bottomText}>{t(stageKey)}</Text>
          <Text style={styles.waitText}>{t('storyFlow.genWait')}</Text>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 199, 132, 0.15)',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', flex: 1, textAlign: 'center', letterSpacing: 0.5 },
  content: { flex: 1, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', gap: 18 },
  description: { color: '#B0B0B0', textAlign: 'center', lineHeight: 22 },
  imageContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
  animatedGlow: {
    width: 150,
    height: 150,
    borderRadius: 75,
    ...theme.shadows.glow,
  },
  animatedContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 230, 118, 0.4)',
  },
  storyEmoji: { fontSize: 60 },
  timer: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 3,
  },
  bottomText: { color: '#00E676', fontSize: 15, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },
  waitText: { color: '#8899A6', fontSize: 13, textAlign: 'center' },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16 },
  errorText: { color: '#B0B0B0', textAlign: 'center', fontSize: 15, lineHeight: 22, marginTop: 8 },
  retryButton: { marginTop: 28, borderRadius: 16, overflow: 'visible', ...theme.shadows.glow },
  retryButtonInner: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: 16, overflow: 'hidden' },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
