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
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { theme } from '../../theme';
import { characterService } from '@/services/characterService';
import { getAvatarSource } from '../../utils/avatarUtils';
import { storyCharacterService } from '@/services/storyCharacterService';
import { authService } from '@/services/authService';
import { settingsService } from '@/services/settingsService';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../hooks/useRTL';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { isRTL, textAlign, flexDirection } = useRTL();
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
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.fixedHeader, { flexDirection }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>{t('home.title')}</Text>
        <LinearGradient
          colors={theme.gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.coinsContainer, { flexDirection }]}
        >
          <Text style={styles.coinsText}>{coins}</Text>
          <Ionicons name="layers" size={16} color="#5D4037" />
        </LinearGradient>
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
            <View style={[styles.sectionHeader, { flexDirection }]}>
              <Text style={[styles.sectionTitle, { textAlign }]}>
                {t('home.selectMainCharacters')}
              </Text>
            </View>

            <View style={[styles.charactersContainer, { flexDirection }]}>
              {mainCharacters.map((c: any) => {
                const isSelected = selectedMainCharacters.includes(c.id || c._id);
                return (
                  <TouchableOpacity
                    key={c.id || c._id}
                    style={[styles.characterCard, isSelected && styles.selectedCharacterCard]}
                    onPress={() => toggleMainCharacterSelection(c.id || c._id)}
                  >
                    <LinearGradient
                      colors={isSelected ? theme.gradients.highlight : theme.gradients.card}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatarContainer}
                    >
                      <View style={styles.characterAvatar}>
                        <Image 
                          source={getAvatarSource(c.avatarUrl, c.gender, c.name)} 
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
                    </LinearGradient>
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
            <Text style={[styles.sectionTitle, { textAlign, marginBottom: 20 }]}>
              {t('home.selectSideCharacters')}
            </Text>
            
            <View style={[styles.sideCharactersContainer, { flexDirection }]}>
              {sideCharacters.map((c: any) => {
                const isSelected = selectedSideCharacters.includes(c.id || c._id);
                const isStoryCharacter = storyCharacters.some(sc => (sc.id || sc._id) === (c.id || c._id));
                
                return (
                  <TouchableOpacity
                    key={c.id || c._id}
                    style={[styles.sideCharacterCard, isSelected && styles.selectedCharacterCard]}
                    onPress={() => toggleSideCharacterSelection(c.id || c._id)}
                  >
                    <LinearGradient
                      colors={isSelected ? theme.gradients.highlight : theme.gradients.card}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.sideAvatarContainer}
                    >
                      <View style={styles.characterAvatar}>
                        <Image 
                          source={getAvatarSource(c.avatarUrl, c.gender, c.name)} 
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
                    </LinearGradient>
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
          style={[styles.startButtonWrapper, canStart && styles.startButtonGlow]}
          onPress={handleStart}
          disabled={!canStart}
          activeOpacity={0.85}
        >
          {canStart ? (
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.startButton, { flexDirection }]}
            >
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>
                {storyCost} {t('home.start')}
              </Text>
            </LinearGradient>
          ) : (
            <View style={[styles.startButton, styles.startButtonDisabled, { flexDirection }]}>
              <Ionicons name="layers-outline" size={20} color="#64B5F6" />
              <Text style={[styles.startButtonText, styles.startButtonTextDisabled]}>
                {storyCost} {t('home.start')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {selectedMainCharacters.length > 0 && coins < storyCost && (
          <Text style={styles.insufficientCoinsText}>
            {t('home.insufficientCoins', { cost: storyCost })}
          </Text>
        )}
      </View>
    </ScreenBackground>
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
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 199, 132, 0.15)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 0,
  },
  coinsText: {
    fontSize: 15,
    color: '#5D4037',
    fontWeight: '800',
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
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 0,
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
    elevation: 0,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  startButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGlow: {
    overflow: 'visible',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 0,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  startButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  startButtonTextDisabled: {
    color: '#64B5F6',
  },
});