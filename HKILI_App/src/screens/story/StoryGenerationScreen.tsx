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
import { theme } from '../../theme';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { apiClient } from '@/services/apiClient';
import { storyService } from '@/services/storyService';

export default function StoryGenerationScreen() {
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
        setErrorMsg(response.error || 'Failed to generate story');
        setStatus('error');
      }
    } catch (err: any) {
      console.error('[StoryGeneration] Exception during generation:', err);
      setErrorMsg(err.message || 'An error occurred');
      setStatus('error');
    }
  };

  if (status === 'error') {
    return (
      <ScreenBackground>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Story Generation</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.content}>
          <Ionicons name="alert-circle-outline" size={80} color="#FF9800" />
          <Text style={styles.errorTitle}>Generation Failed</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.push('/(tabs)/home')} activeOpacity={0.85}>
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.retryButtonInner}
            >
              <Text style={styles.retryButtonText}>Go Back Home</Text>
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
        <Text style={styles.headerTitle}>Generating your story...</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>
          Please wait while we craft your personalized story.
        </Text>
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
        <Text style={styles.bottomText}>One moment please...</Text>
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
  content: { flex: 1, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', gap: 20 },
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
  bottomText: { color: '#00E676', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16 },
  errorText: { color: '#B0B0B0', textAlign: 'center', fontSize: 15, lineHeight: 22, marginTop: 8 },
  retryButton: { marginTop: 28, borderRadius: 16, overflow: 'visible', ...theme.shadows.glow },
  retryButtonInner: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: 16, overflow: 'hidden' },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
