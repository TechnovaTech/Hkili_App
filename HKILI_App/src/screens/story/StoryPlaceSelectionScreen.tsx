import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme';
import { storyCharacterService, StoryCharacter } from '@/services/storyCharacterService';
import { playClickSound } from '@/utils/soundUtils';

export default function StoryPlaceSelectionScreen() {
  const { mode, character } = useLocalSearchParams<{ mode: string; character: string }>();
  const [storyPlace, setStoryPlace] = useState('');
  const [characterData, setCharacterData] = useState<StoryCharacter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (character) {
      fetchCharacter(character);
    }
  }, [character]);

  const fetchCharacter = async (id: string) => {
    try {
      setLoading(true);
      const response = await storyCharacterService.getById(id);
      if (response.success && response.data) {
        setCharacterData(response.data);
      }
    } catch (error) {
      console.error('Error fetching character:', error);
    } finally {
      setLoading(false);
    }
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

  const handleSave = async () => {
    await playClickSound();
    console.log('Save clicked, navigating to moral selection');
    router.push({
      pathname: '/story/moral-selection',
      params: { mode, character, place: storyPlace || 'Default Place' }
    });
  };

  const imageSource = characterData ? getImageUrl(characterData.image) : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/story/mode-character-selection', params: { mode } })}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Choose a place for <Text style={styles.highlightText}>the story</Text>
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : imageSource ? (
            <Image 
              source={imageSource} 
              style={styles.placeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeImage, { backgroundColor: '#2A3B4D', justifyContent: 'center', alignItems: 'center' }]}>
               <Ionicons name="person-outline" size={60} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.questionText}>
            Where should the story take place?
            <Text style={styles.asterisk}>*</Text>
          </Text>
          
          <TextInput
            style={styles.textInput}
            placeholder="e.g.: Kindergarden"
            placeholderTextColor={theme.colors.textMuted}
            value={storyPlace}
            onChangeText={setStoryPlace}
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0A1929',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    gap: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  highlightText: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    marginTop: 40,
    marginBottom: 60,
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  inputSection: {
    width: '100%',
    marginBottom: 40,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 20,
  },
  asterisk: {
    color: theme.colors.primary,
  },
  textInput: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: theme.colors.text,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: theme.borderRadius.md,
    width: '100%',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
});