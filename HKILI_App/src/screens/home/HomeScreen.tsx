import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { characterService } from '@/services/characterService';
import CharacterAvatar from '@/components/character/CharacterAvatar';
import { useCallback } from 'react';

export default function HomeScreen() {
  const [selectedMainCharacters, setSelectedMainCharacters] = useState([]);
  const [selectedSideCharacters, setSelectedSideCharacters] = useState([]);
  const [hasSelectedCharacter, setHasSelectedCharacter] = useState(false);
  const [characters, setCharacters] = useState<any[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);

  const fetchCharacters = useCallback(async () => {
    setLoadingCharacters(true);
    try {
      const res = await characterService.getAll();
      if (res.success && res.data) {
        setCharacters(res.data as any[]);
        setHasSelectedCharacter((res.data as any[]).length > 0);
      }
    } finally {
      setLoadingCharacters(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCharacters();
    }, [fetchCharacters])
  );

  const handleAddMainCharacter = () => {
    router.push('/character/add');
  };

  const handleSelectCharacter = () => {
    setHasSelectedCharacter(true);
  };

  const handleStart = () => {
    if (hasSelectedCharacter) {
      router.push('/story/mode-selection');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
      
      <View style={styles.fixedHeader}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Home</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>2</Text>
          <Ionicons name="layers-outline" size={20} color="#4CAF50" />
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Select the main characters for your story:
              </Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.charactersContainer}>
              {characters.map((c: any) => (
                <TouchableOpacity
                  key={c.id || c._id}
                  style={styles.characterCard}
                  onPress={handleSelectCharacter}
                >
                  <View style={styles.avatarContainer}>
                    <CharacterAvatar 
                      config={c.avatarConfig} 
                      seed={c.name}
                      size={70}
                    />
                  </View>
                  <Text style={styles.characterName}>{c.name}</Text>
                  {/* Selection Indicator */}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.addCharacterButton}
                onPress={handleAddMainCharacter}
              >
                <Ionicons name="add" size={32} color="#81C784" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select side characters:</Text>
            
            <TouchableOpacity
              style={styles.addSideCharacterButton}
              onPress={handleAddMainCharacter}
            >
              <Ionicons name="add" size={24} color="#81C784" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.startButtonContainer}>
        <TouchableOpacity style={styles.languageButton}>
          <Text style={styles.languageText}>🇬🇧 EN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.startButton, !hasSelectedCharacter && styles.startButtonDisabled]} 
          onPress={handleStart}
          disabled={!hasSelectedCharacter}
        >
          <Ionicons name="layers-outline" size={20} color={hasSelectedCharacter ? "#FFFFFF" : "#64B5F6"} />
          <Text style={[styles.startButtonText, !hasSelectedCharacter && styles.startButtonTextDisabled]}>1 Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
  },
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0A1929',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 16,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  charactersContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  characterCard: {
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterFace: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  characterEyes: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  characterName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addCharacterButton: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  addSideCharacterButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  bottomSpacing: {
    height: 100,
  },
  startButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
    gap: 12,
    backgroundColor: '#0A1929',
  },
  languageButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  startButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  startButtonTextDisabled: {
    color: '#64B5F6',
  },
});