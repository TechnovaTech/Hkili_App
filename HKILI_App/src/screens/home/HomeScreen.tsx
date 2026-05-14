import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { characterService } from '@/services/characterService';
import { getAvatarSource } from '../../utils/avatarUtils';
import { storyCharacterService } from '@/services/storyCharacterService';
import { authService } from '@/services/authService';
import { settingsService } from '@/services/settingsService';
import { useCallback } from 'react';

export default function HomeScreen() {
  const [selectedMainCharacters, setSelectedMainCharacters] = useState<string[]>([]);
  const [selectedSideCharacters, setSelectedSideCharacters] = useState<string[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [storyCharacters, setStoryCharacters] = useState<any[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [coins, setCoins] = useState(0);
  const [storyCost, setStoryCost] = useState(1);

  const fetchCharacters = useCallback(async () => {
    setLoadingCharacters(true);
    try {
      const [charRes, storyCharRes] = await Promise.all([
        characterService.getAll(),
        storyCharacterService.getAll()
      ]);

      if (charRes.success && charRes.data) {
        setCharacters(charRes.data as any[]);
      }
      if (storyCharRes.success && storyCharRes.data) {
        setStoryCharacters(storyCharRes.data as any[]);
      }
    } finally {
      setLoadingCharacters(false);
    }
  }, []);

  const mainCharacters = characters.filter(c => c.isMainCharacter !== false);
  const userSideCharacters = characters.filter(c => c.isMainCharacter === false);
  const sideCharacters = [...userSideCharacters, ...storyCharacters];

  const fetchUserCoins = useCallback(async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data) {
        setCoins(res.data.coins || 0);
      }
    } catch (error) {
      console.error('Error fetching user coins:', error);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await settingsService.getSettings();
      if (res.success && res.data) {
        setStoryCost(Number(res.data.storyCost) || 1);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCharacters();
      fetchUserCoins();
      fetchSettings();
    }, [fetchCharacters, fetchUserCoins, fetchSettings])
  );

  const handleAddMainCharacter = () => {
    router.push({
      pathname: '/character/add',
      params: { mode: 'create', isMain: 'true' }
    });
  };

  const handleAddSideCharacter = () => {
    router.push({
      pathname: '/character/add',
      params: { mode: 'create', isMain: 'false' }
    });
  };

  const handleEditCharacter = (character: any) => {
    router.push({
      pathname: '/character/add',
      params: { mode: 'edit', id: character.id || character._id }
    });
  };

  const toggleMainCharacterSelection = (id: string) => {
    setSelectedMainCharacters(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSideCharacterSelection = (id: string) => {
    setSelectedSideCharacters(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const canStart = selectedMainCharacters.length > 0 && coins >= storyCost;

  const handleStart = () => {
    if (canStart) {
      router.push({
        pathname: '/story/language-selection',
        params: {
          mainCharacterIds: JSON.stringify(selectedMainCharacters),
          sideCharacterIds: JSON.stringify(selectedSideCharacters),
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
      
      <View style={styles.fixedHeader}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Home</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>{coins}</Text>
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
              {mainCharacters.map((c: any) => {
                const isSelected = selectedMainCharacters.includes(c.id || c._id);
                return (
                  <TouchableOpacity
                    key={c.id || c._id}
                    style={[styles.characterCard, isSelected && styles.selectedCharacterCard]}
                    onPress={() => toggleMainCharacterSelection(c.id || c._id)}
                  >
                    <View style={styles.avatarContainer}>
                      <View style={styles.characterAvatar}>
                        <Image 
                          source={getAvatarSource(c.avatarUrl, c.gender)} 
                          style={styles.avatarImage} 
                          resizeMode="cover"
                        />
                      </View>
                      <TouchableOpacity 
                        style={styles.cardEditButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleEditCharacter(c);
                        }}
                      >
                        <Ionicons name="pencil" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.characterName, isSelected && styles.selectedCharacterName]}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
              
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
            
            <View style={styles.sideCharactersContainer}>
              {sideCharacters.map((c: any) => {
                const isSelected = selectedSideCharacters.includes(c.id || c._id);
                const isStoryCharacter = storyCharacters.some(sc => (sc.id || sc._id) === (c.id || c._id));
                
                return (
                  <TouchableOpacity
                    key={c.id || c._id}
                    style={[styles.sideCharacterCard, isSelected && styles.selectedCharacterCard]}
                    onPress={() => toggleSideCharacterSelection(c.id || c._id)}
                  >
                    <View style={styles.sideAvatarContainer}>
                      <View style={styles.characterAvatar}>
                        <Image 
                          source={getAvatarSource(c.avatarUrl, c.gender)} 
                          style={styles.avatarImage} 
                          resizeMode="cover"
                        />
                      </View>
                      {!isStoryCharacter && (
                        <TouchableOpacity 
                          style={styles.cardEditButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleEditCharacter(c);
                          }}
                        >
                          <Ionicons name="pencil" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                      {isSelected && (
                        <View style={styles.selectedBadge}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.characterName, isSelected && styles.selectedCharacterName]}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
              
              <TouchableOpacity
                style={styles.addSideCharacterButton}
                onPress={handleAddSideCharacter}
              >
                <Ionicons name="add" size={24} color="#81C784" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.startButtonContainer}>
       

        <TouchableOpacity 
          style={[styles.startButton, !canStart && styles.startButtonDisabled]} 
          onPress={handleStart}
          disabled={!canStart}
        >
          <Ionicons name="layers-outline" size={20} color={canStart ? "#FFFFFF" : "#64B5F6"} />
          <Text style={[styles.startButtonText, !canStart && styles.startButtonTextDisabled]}>{storyCost} Start</Text>
        </TouchableOpacity>
        
        {selectedMainCharacters.length > 0 && coins < storyCost && (
          <Text style={styles.insufficientCoinsText}>Required: {storyCost} coins</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
  },
  insufficientCoinsText: {
    marginTop: 8,
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  characterCard: {
    width: '30%', // Three in one row for main characters
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 20,
    padding: 4,
    marginBottom: 8,
  },
  sideCharactersContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  sideCharacterCard: {
    width: '22%', // Four in one row for side characters
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 16,
    padding: 2,
    marginBottom: 8,
  },
  selectedCharacterCard: {
    borderColor: '#81C784',
    backgroundColor: 'rgba(129, 199, 132, 0.1)',
  },
  avatarContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sideAvatarContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#81C784',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center', 
    borderWidth: 2,
    borderColor: '#0A1929', 
    zIndex: 11,
  },
  cardEditButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  characterAvatar: {
    width: '80%',
    height: '80%', 
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  characterFace: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterEyes: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  characterName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedCharacterName: {
    color: '#81C784', 
    fontWeight: 'bold',
  },
  addCharacterButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addSideCharacterButton: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    marginBottom: 8,
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