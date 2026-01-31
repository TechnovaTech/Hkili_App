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
import { authService } from '@/services/authService';
import { useCallback } from 'react';

export default function HomeScreen() {
  const [selectedMainCharacters, setSelectedMainCharacters] = useState([]);
  const [selectedSideCharacters, setSelectedSideCharacters] = useState([]);
  const [hasSelectedCharacter, setHasSelectedCharacter] = useState(false);
  const [characters, setCharacters] = useState<any[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [coins, setCoins] = useState(0);

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

  useFocusEffect(
    useCallback(() => {
      fetchCharacters();
      fetchUserCoins();
    }, [fetchCharacters, fetchUserCoins])
  );

  const handleAddMainCharacter = () => {
    router.push({
      pathname: '/character/add',
      params: { mode: 'create' }
    });
  };

  const handleEditCharacter = (character: any) => {
    router.push({
      pathname: '/character/add',
      params: { mode: 'edit', id: character.id || character._id }
    });
  };

  const handleSelectCharacter = () => {
    setHasSelectedCharacter(true);
  };

  const handleStart = () => {
    if (hasSelectedCharacter) {
      router.push('/story/mode-selection');
    }
  };

  const renderCharacterHair = (c: any) => {
    const style = c.hairStyle || 'Short';
    const color = c.hairColor || '#8B4513';
    const colorStyle = { backgroundColor: color };

    if (style === 'Bald') return null;

    if (style === 'Buzz Cut') {
      return <View style={[styles.avatarHairBuzz, colorStyle]} />;
    }

    if (style === 'Pixie') {
      return <View style={[styles.avatarHairPixie, colorStyle]} />;
    }

    if (style === 'Spiky') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairSpike, styles.hairSpikeOne, colorStyle]} />
          <View style={[styles.hairSpike, styles.hairSpikeTwo, colorStyle]} />
          <View style={[styles.hairSpike, styles.hairSpikeThree, colorStyle]} />
        </>
      );
    }

    if (style === 'Wavy') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairWave, styles.hairWaveOne, colorStyle]} />
          <View style={[styles.hairWave, styles.hairWaveTwo, colorStyle]} />
          <View style={[styles.hairWave, styles.hairWaveThree, colorStyle]} />
        </>
      );
    }

    if (style === 'Curly') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairCurl, styles.hairCurlOne, colorStyle]} />
          <View style={[styles.hairCurl, styles.hairCurlTwo, colorStyle]} />
          <View style={[styles.hairCurl, styles.hairCurlThree, colorStyle]} />
          <View style={[styles.hairCurl, styles.hairCurlFour, colorStyle]} />
        </>
      );
    }

    if (style === 'Long') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairBack, colorStyle]} />
          <View style={[styles.hairSideLeft, colorStyle]} />
          <View style={[styles.hairSideRight, colorStyle]} />
        </>
      );
    }

    if (style === 'Bob') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairBobBack, colorStyle]} />
          <View style={[styles.hairBobSideLeft, colorStyle]} />
          <View style={[styles.hairBobSideRight, colorStyle]} />
        </>
      );
    }

    if (style === 'Straight') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairStraightBack, colorStyle]} />
          <View style={[styles.hairSideLeft, colorStyle]} />
          <View style={[styles.hairSideRight, colorStyle]} />
        </>
      );
    }

    if (style === 'Braided') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairBraid, colorStyle]} />
          <View style={[styles.hairBraidSegment, styles.hairBraidSegmentOne, colorStyle]} />
          <View style={[styles.hairBraidSegment, styles.hairBraidSegmentTwo, colorStyle]} />
          <View style={[styles.hairBraidSegment, styles.hairBraidSegmentThree, colorStyle]} />
        </>
      );
    }

    return (
      <>
        <View style={[styles.avatarHairBase, colorStyle]} />
        <View style={[styles.hairFringe, colorStyle]} />
      </>
    );
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
              {characters.map((c: any) => (
                <TouchableOpacity
                  key={c.id || c._id}
                  style={styles.characterCard}
                  onPress={handleSelectCharacter}
                >
                  <View style={styles.avatarContainer}>
                    <View style={styles.characterAvatar}>
                      <View style={[styles.characterFace, { backgroundColor: c.skinColor || '#FDBCB4' }]}>
                        {renderCharacterHair(c)}
                        <View style={styles.characterEyesRow}>
                          <View style={[styles.characterEyes, { backgroundColor: c.eyeColor || '#8B4513' }]} />
                          <View style={[styles.characterEyes, { backgroundColor: c.eyeColor || '#8B4513' }]} />
                        </View>
                        <View style={styles.characterMouth} />
                      </View>
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
                  </View>
                  <Text style={styles.characterName}>{c.name}</Text>
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
   // Character Appearance Styles
  characterEyesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    zIndex: 2,
  },
  characterMouth: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 5,
    zIndex: 2,
  },
  avatarHairBase: {
    position: 'absolute',
    top: -3,
    left: 5,
    right: 5,
    height: 27.5,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 1,
  },
  avatarHairBuzz: {
    position: 'absolute',
    top: 5,
    left: 8,
    right: 8,
    height: 18,
    borderRadius: 9,
    zIndex: 1,
  },
  avatarHairPixie: {
    position: 'absolute',
    top: -1,
    left: 7,
    right: 7,
    height: 21,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    zIndex: 1,
  },
  hairFringe: {
    position: 'absolute',
    top: 16,
    left: 12,
    width: 18,
    height: 7,
    borderRadius: 4,
    zIndex: 1,
  },
  hairWave: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    top: 8,
    zIndex: 1,
  },
  hairWaveOne: { left: 9 },
  hairWaveTwo: { left: 24 },
  hairWaveThree: { right: 9 },
  hairCurl: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    top: 10,
    zIndex: 1,
  },
  hairCurlOne: { left: 7 },
  hairCurlTwo: { left: 18 },
  hairCurlThree: { right: 18 },
  hairCurlFour: { right: 7 },
  hairSpike: {
    position: 'absolute',
    width: 5,
    height: 11,
    borderRadius: 3,
    top: -4,
    zIndex: 1,
  },
  hairSpikeOne: { left: 12, transform: [{ rotate: '-18deg' }] },
  hairSpikeTwo: { left: 25, transform: [{ rotate: '8deg' }] },
  hairSpikeThree: { right: 12, transform: [{ rotate: '18deg' }] },
  hairBack: {
    position: 'absolute',
    top: 22,
    left: 4,
    right: 4,
    height: 26,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
    zIndex: 0,
  },
  hairSideLeft: {
    position: 'absolute',
    left: 2,
    top: 19,
    width: 9,
    height: 23,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    zIndex: 2,
  },
  hairSideRight: {
    position: 'absolute',
    right: 2,
    top: 19,
    width: 9,
    height: 23,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    zIndex: 2,
  },
  hairBobBack: {
    position: 'absolute',
    top: 22,
    left: 6,
    right: 6,
    height: 18,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    zIndex: 0,
  },
  hairBobSideLeft: {
    position: 'absolute',
    left: 4,
    top: 20,
    width: 8,
    height: 15,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    zIndex: 2,
  },
  hairBobSideRight: {
    position: 'absolute',
    right: 4,
    top: 20,
    width: 8,
    height: 15,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    zIndex: 2,
  },
  hairStraightBack: {
    position: 'absolute',
    top: 21,
    left: 5,
    right: 5,
    height: 28,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
    zIndex: 0,
  },
  hairBraid: {
    position: 'absolute',
    right: 9,
    top: 23,
    width: 7,
    height: 23,
    borderRadius: 3.5,
    zIndex: 2,
  },
  hairBraidSegment: {
    position: 'absolute',
    right: 9,
    width: 7,
    height: 5,
    borderRadius: 2.5,
    zIndex: 2,
  },
  hairBraidSegmentOne: { top: 25 },
  hairBraidSegmentTwo: { top: 31 },
  hairBraidSegmentThree: { top: 37 },
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
    flexWrap: 'wrap',
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
  cardEditButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  characterAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // Match AppearanceTab frame
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // Scaled down from 6
    shadowOpacity: 0.25,
    shadowRadius: 5, // Scaled down from 10
    elevation: 3, // Scaled down
  },
  characterFace: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Removed flexDirection: 'row' to stack eyes and mouth vertically
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