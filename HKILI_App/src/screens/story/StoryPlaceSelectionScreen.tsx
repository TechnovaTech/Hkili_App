import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme';
import { playClickSound } from '@/utils/soundUtils';

const { width } = Dimensions.get('window');

const morals = [
  { id: '1', text: 'No specific moral', emoji: '⏭️' },
  { id: '2', text: 'Always be kind.', emoji: '💖' },
  { id: '3', text: 'Be honest.', emoji: '👆' },
  { id: '4', text: 'Be the change you want to see in the world.', emoji: '🗺️' },
  { id: '5', text: "Always tell the truth because a liar won't be trusted.", emoji: '😕' },
  { id: '6', text: 'Think before you act.', emoji: '🤔' },
  { id: '7', text: 'Never give up.', emoji: '💪' },
  { id: '8', text: 'Respect others.', emoji: '🛡️' },
  { id: '9', text: 'The importance of being a good friend.', emoji: '👫' },
  { id: '10', text: 'Learning to forgive', emoji: '🙏' },
  { id: '11', text: "You can't always get what you want.", emoji: '🧝' },
  { id: '12', text: 'Good things come to those who wait.', emoji: '⏳' },
];

export default function StoryPlaceSelectionScreen() {
  const params = useLocalSearchParams<{
    categoryId: string;
    mainCharacterIds: string;
    sideCharacterIds: string;
  }>();
  const { categoryId, mainCharacterIds, sideCharacterIds } = params;

  const [storyPlace, setStoryPlace] = useState('');
  const [selectedMoral, setSelectedMoral] = useState<string | null>(null);

  const cardWidth = (width - 60) / 2;

  const handleStart = async () => {
    if (!storyPlace.trim() || !selectedMoral) return;
    await playClickSound();
    const moralText = morals.find(m => m.id === selectedMoral)?.text || '';
    router.push({
      pathname: '/story/story-generation',
      params: {
        categoryId,
        mainCharacterIds,
        sideCharacterIds,
        place: storyPlace.trim(),
        moral: moralText,
      },
    });
  };

  const canProceed = storyPlace.trim().length > 0 && selectedMoral !== null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Set up your <Text style={styles.highlight}>story</Text>
        </Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Place Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Where should the story take place?<Text style={styles.asterisk}> *</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g.: Kindergarten"
            placeholderTextColor={theme.colors.textMuted}
            value={storyPlace}
            onChangeText={setStoryPlace}
          />
        </View>

        {/* Moral Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Choose a moral for the story:</Text>
          <View style={styles.moralsGrid}>
            {morals.map((moral) => {
              const isSelected = selectedMoral === moral.id;
              return (
                <TouchableOpacity
                  key={moral.id}
                  style={[styles.moralCard, { width: cardWidth }, isSelected && styles.selectedCard]}
                  onPress={() => setSelectedMoral(moral.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emoji}>{moral.emoji}</Text>
                  <Text style={styles.moralText}>{moral.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, !canProceed && styles.startButtonDisabled]}
          onPress={handleStart}
          disabled={!canProceed}
        >
          <Text style={styles.startButtonText}>Generate Story</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    gap: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, flex: 1 },
  highlight: { color: theme.colors.primary },
  scroll: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 28 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 14 },
  asterisk: { color: theme.colors.primary },
  textInput: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: theme.colors.text,
  },
  moralsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moralCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectedCard: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  emoji: { fontSize: 22, marginBottom: 8 },
  moralText: { fontSize: 13, fontWeight: '500', color: theme.colors.text, textAlign: 'center', lineHeight: 18 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 36,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  startButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.15)' },
  startButtonText: { fontSize: 17, fontWeight: '600', color: theme.colors.text },
});
