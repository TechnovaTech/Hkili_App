import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme';
import { CharacterFormData } from '@/types/character';
import BasicInfoTab from '@/components/character/BasicInfoTab';
import AppearanceTab from '@/components/character/AppearanceTab';
import InterestsTab from '@/components/character/InterestsTab';
import { characterService } from '@/services/characterService';

type TabType = 'basic' | 'appearance' | 'interests';

export default function AddCharacterScreen() {
  const { mode, id } = useLocalSearchParams<{ mode: string; id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    age: '',
    gender: 'n/a',
    hairColor: '#8B4513',
    eyeColor: '#8B4513',
    skinColor: '#F1C27D',
    hairStyle: 'Short',
    interests: [],
    customInterests: [],
  });

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        name: '',
        age: '',
        gender: 'n/a',
        hairColor: '#8B4513',
        eyeColor: '#8B4513',
        skinColor: '#F1C27D',
        hairStyle: 'Short',
        interests: [],
        customInterests: [],
      });
      setActiveTab('basic');
    } else if (mode === 'edit' && id) {
      loadCharacter(id);
    }
  }, [mode, id]);

  const loadCharacter = async (characterId: string) => {
    setLoading(true);
    try {
      const res = await characterService.getById(characterId);
      if (res.success && res.data) {
        const c = res.data as any; // Using any to handle potential structure mismatch
        
        // Handle potential nested appearance object or flat structure
        const appearance = c.appearance || {};
        
        setFormData({
          name: c.name || '',
          age: c.age?.toString() || '',
          gender: (c.gender || 'n/a').toLowerCase(), // Normalize gender
          hairColor: c.hairColor || appearance.hairColor || '#8B4513',
          eyeColor: c.eyeColor || appearance.eyeColor || '#8B4513',
          skinColor: c.skinColor || appearance.skinColor || '#F1C27D',
          hairStyle: c.hairStyle || appearance.hairStyle || 'Short',
          interests: c.interests || [],
          customInterests: [],
        });
      }
    } catch (error) {
      console.error('Error loading character:', error);
      Alert.alert('Error', 'Failed to load character');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: Partial<CharacterFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (mode === 'edit' && id) {
        console.log('Updating character with data:', formData);
        const response = await characterService.update(id, formData);
        console.log('Character service update response:', response);
      } else {
        console.log('Creating character with data:', formData);
        const response = await characterService.create(formData);
        console.log('Character service create response:', response);
      }
      
      // Always redirect regardless of API response for now
      console.log('Redirecting to home...');
      router.push('/home');
      
    } catch (error: any) {
      console.error('Character save error:', error);
      // Still redirect even on error
      router.push('/home');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Navigate through tabs or to next screen
    if (activeTab === 'basic') {
      if (!formData.name) {
        Alert.alert('Error', 'Please enter a name');
        return;
      }
      setActiveTab('appearance');
    } else if (activeTab === 'appearance') {
      setActiveTab('interests');
    } else {
      // After interests tab, save and go to home
      handleSave();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicInfoTab formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 'appearance':
        return <AppearanceTab formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 'interests':
        return <InterestsTab formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Character</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'basic' && styles.activeTab]}
          onPress={() => setActiveTab('basic')}
        >
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={activeTab === 'basic' ? theme.colors.text : theme.colors.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'basic' && styles.activeTabText
          ]}>
            Basic Info
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'appearance' && styles.activeTab]}
          onPress={() => setActiveTab('appearance')}
        >
          <Ionicons 
            name="color-palette-outline" 
            size={20} 
            color={activeTab === 'appearance' ? theme.colors.text : theme.colors.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'appearance' && styles.activeTabText
          ]}>
            Appearance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'interests' && styles.activeTab]}
          onPress={() => setActiveTab('interests')}
        >
          <Ionicons 
            name="heart-outline" 
            size={20} 
            color={activeTab === 'interests' ? theme.colors.text : theme.colors.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'interests' && styles.activeTabText
          ]}>
            Interests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
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
    justifyContent: 'center',
    paddingTop: 70, // Extra space for mobile date/time area + more padding
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A1929',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    // Keep header fixed
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 32, // Same width as back button for centering
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
});
