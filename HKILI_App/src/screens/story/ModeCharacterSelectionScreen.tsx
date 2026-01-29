import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme';

const { width } = Dimensions.get('window');

interface Character {
  id: string;
  name: string;
  image: any;
}

const charactersByMode: Record<string, Character[]> = {
  vegetable: [
    { id: '1', name: 'Carrot Kid', image: require('../../../assets/i1.jpg') },
    { id: '2', name: 'Broccoli Boy', image: require('../../../assets/i2.jpg') },
    { id: '3', name: 'Tomato Girl', image: require('../../../assets/i3.jpg') },
    { id: '4', name: 'Potato Pete', image: require('../../../assets/i1.jpg') },
  ],
  environment: [
    { id: '1', name: 'Tree Guardian', image: require('../../../assets/i1.jpg') },
    { id: '2', name: 'River Spirit', image: require('../../../assets/i2.jpg') },
    { id: '3', name: 'Mountain Bear', image: require('../../../assets/i3.jpg') },
    { id: '4', name: 'Forest Fox', image: require('../../../assets/i1.jpg') },
  ],
  'jungle-book': [
    { id: '1', name: 'Mowgli', image: require('../../../assets/i1.jpg') },
    { id: '2', name: 'Baloo', image: require('../../../assets/i2.jpg') },
    { id: '3', name: 'Bagheera', image: require('../../../assets/i3.jpg') },
    { id: '4', name: 'King Louie', image: require('../../../assets/i1.jpg') },
  ],
  'alice-wonderland': [
    { id: '1', name: 'Alice', image: require('../../../assets/i1.jpg') },
    { id: '2', name: 'Mad Hatter', image: require('../../../assets/i2.jpg') },
    { id: '3', name: 'Cheshire Cat', image: require('../../../assets/i3.jpg') },
    { id: '4', name: 'White Rabbit', image: require('../../../assets/i1.jpg') },
  ],
  'grimms-tales': [
    { id: '1', name: 'Hansel', image: require('../../../assets/i1.jpg') },
    { id: '2', name: 'Gretel', image: require('../../../assets/i2.jpg') },
    { id: '3', name: 'Little Red', image: require('../../../assets/i3.jpg') },
    { id: '4', name: 'Goldilocks', image: require('../../../assets/i1.jpg') },
  ],
  'wizard-oz': [
    { id: '1', name: 'Dorothy', image: require('../../../assets/i1.jpg') },
    { id: '2', name: 'Scarecrow', image: require('../../../assets/i2.jpg') },
    { id: '3', name: 'Tin Man', image: require('../../../assets/i3.jpg') },
    { id: '4', name: 'Cowardly Lion', image: require('../../../assets/i1.jpg') },
  ],
};

export default function ModeCharacterSelectionScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const characters = charactersByMode[mode || 'vegetable'] || [];

  const handleCharacterSelect = (characterId: string) => {
    router.push({
      pathname: '/story/story-place-selection',
      params: { mode, character: characterId }
    });
  };

  const renderCharacter = (character: Character, index: number) => {
    const cardWidth = (width - 60) / 2;
    
    return (
      <TouchableOpacity
        key={character.id}
        style={[styles.characterCard, { width: cardWidth }]}
        onPress={() => handleCharacterSelect(character.id)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={character.image} 
            style={styles.characterImage}
            resizeMode="cover"
          />
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
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Which character should be part of the story?</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.charactersGrid}>
          {characters.map(renderCharacter)}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
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
});