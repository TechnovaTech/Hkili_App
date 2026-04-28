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
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme';
import { apiClient } from '@/services/apiClient';
import { storyService } from '@/services/storyService';

export default function StoryGenerationScreen() {
  const { categoryId, mainCharacterIds, sideCharacterIds, place, moral } = useLocalSearchParams<{
    categoryId: string;
    mainCharacterIds: string;
    sideCharacterIds: string;
    place: string;
    moral: string;
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

      const response = await apiClient.post<any>('/ai/generate', {
        categoryId,
        mainCharacterIds: mainIds,
        sideCharacterIds: sideIds,
        place,
        moral,
        language: 'EN',
      });

      if (response.success && response.data) {
        generatedStoryId.current = response.data._id || response.data.id;
        setStatus('done');
      } else {
        setErrorMsg(response.error || 'Failed to generate story');
        setStatus('error');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
      setStatus('error');
    }
  };

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
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
          <TouchableOpacity style={styles.retryButton} onPress={() => router.push('/(tabs)/home')}>
            <Text style={styles.retryButtonText}>Go Back Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
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
          <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.storyEmoji}>📚</Text>
          </Animated.View>
        </View>
        <Text style={styles.bottomText}>One moment please...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1929' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0A1929',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', flex: 1, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', gap: 20 },
  description: { color: '#B0B0B0', textAlign: 'center', lineHeight: 22 },
  imageContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
  animatedContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(76,175,80,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  storyEmoji: { fontSize: 60 },
  bottomText: { color: '#4CAF50', fontSize: 14 },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16 },
  errorText: { color: '#B0B0B0', textAlign: 'center', fontSize: 15, lineHeight: 22, marginTop: 8 },
  retryButton: { marginTop: 28, backgroundColor: '#FF9800', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
