import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme';
import { storyCharacterService, StoryCharacter } from '@/services/storyCharacterService';
import { playClickSound } from '@/utils/soundUtils';

const { width } = Dimensions.get('window');

export default function ModeCharacterSelectionScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const [characters, setCharacters] = useState<StoryCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mode) {
      fetchCharacters(mode);
    }
  }, [mode]);

  const fetchCharacters = async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await storyCharacterService.getByCategoryId(categoryId);
      if (response.success && response.data) {
        setCharacters(response.data);
      }
    } catch (error) {
      console.error('Error fetching story characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterSelect = async (characterId: string) => {
    await playClickSound();
    router.push({
      pathname: '/story/story-place-selection',
      params: { mode, character: characterId }
    });
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return { uri: imagePath };
    
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
    let baseUrl = apiUrl;
    
    try {
      const url = new URL(apiUrl);
      baseUrl = url.origin;
    } catch (e) {
      baseUrl = apiUrl.replace(/\/api\/?$/, '');
    }

    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return { uri: `${baseUrl}/${cleanPath}` };
  };

  const renderCharacter = (character: StoryCharacter, index: number) => {
    const cardWidth = (width - 60) / 2;
    const imageSource = getImageUrl(character.image);
    
    return (
      <TouchableOpacity
        key={character._id}
        style={[styles.characterCard, { width: cardWidth }]}
        onPress={() => handleCharacterSelect(character._id)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image 
              source={imageSource} 
              style={styles.characterImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.characterImage, { backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
               <Ionicons name="person-outline" size={40} color={theme.colors.text} />
            </View>
          )}
        </View>
        <Text style={styles.characterName}>{character.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/story/mode-selection')}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Which character should be part of the story?</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.charactersGrid}>
            {characters.length > 0 ? (
              characters.map(renderCharacter)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No characters found for this category.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  charactersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  characterCard: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    marginBottom: 12,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  characterName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});