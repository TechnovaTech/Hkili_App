import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme';

export default function StoryPlaceSelectionScreen() {
  const { mode, character } = useLocalSearchParams<{ mode: string; character: string }>();
  const [storyPlace, setStoryPlace] = useState('');

  const handleSave = () => {
    console.log('Save clicked, navigating to moral selection');
    router.push({
      pathname: '/story/moral-selection',
      params: { mode, character, place: storyPlace || 'Default Place' }
    });
  };

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
          <Image 
            source={require('../../../assets/i1.jpg')} 
            style={styles.placeImage}
            resizeMode="cover"
          />
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