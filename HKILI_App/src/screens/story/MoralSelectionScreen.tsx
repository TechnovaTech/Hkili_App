import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { playClickSound } from '@/utils/soundUtils';

const { width } = Dimensions.get('window');

interface Moral {
  id: string;
  text: string;
  emoji: string;
}

const morals: Moral[] = [
  { id: '1', text: 'No specific moral', emoji: '⏭️' },
  { id: '2', text: 'Always be kind.', emoji: '💖' },
  { id: '3', text: 'Be honest.', emoji: '👆' },
  { id: '4', text: 'Be the change you want to see in the world.', emoji: '🗺️' },
  { id: '5', text: 'Always tell the truth because a liar won\'t be trusted.', emoji: '😕' },
  { id: '6', text: 'Think before you act.', emoji: '🤔' },
  { id: '7', text: 'Never give up.', emoji: '💪' },
  { id: '8', text: 'Respect others.', emoji: '🛡️' },
  { id: '9', text: 'The importance of being a good friend.', emoji: '👫' },
  { id: '10', text: 'Learning to forgive', emoji: '🙏' },
  { id: '11', text: 'You can\'t always get what you want.', emoji: '🧝' },
  { id: '12', text: 'Good things come to those who wait.', emoji: '⏳' },
];

export default function MoralSelectionScreen() {
  const { mode, character, place } = useLocalSearchParams<{ 
    mode: string; 
    character: string; 
    place: string; 
    moral: string;
  }>();
  const [selectedMoral, setSelectedMoral] = useState<string | null>(null);

  const handleMoralSelect = async (moralId: string) => {
    await playClickSound();
    setSelectedMoral(moralId);
    router.push({
      pathname: '/story/story-generation',
      params: { mode, character, place, moral: moralId }
    });
  };

  const renderMoral = (moral: Moral, index: number) => {
    const cardWidth = (width - 60) / 2;
    const isSelected = selectedMoral === moral.id;
    
    return (
      <TouchableOpacity
        key={moral.id}
        style={[
          styles.moralCard, 
          { width: cardWidth },
          isSelected && styles.selectedCard
        ]}
        onPress={() => handleMoralSelect(moral.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.emoji}>{moral.emoji}</Text>
        <Text style={[styles.moralText, isSelected && styles.selectedMoralText]}>{moral.text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/story/story-place-selection', params: { mode, character } })}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Choose a moral for <Text style={styles.highlightText}>the story</Text>
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.moralsGrid}>
            {morals.map(renderMoral)}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 199, 132, 0.15)',
    gap: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    flex: 1,
    letterSpacing: 0.5,
  },
  highlightText: {
    color: theme.colors.accent,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  moralsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  moralCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
    ...theme.shadows.md,
  },
  selectedCard: {
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    ...theme.shadows.glow,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 10,
  },
  moralText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedMoralText: {
    color: '#81C784',
    fontWeight: '700',
  },
});