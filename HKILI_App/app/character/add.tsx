import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { CharacterFormData } from '@/types/character';
import BasicInfoTab from '@/components/character/BasicInfoTab';
import AppearanceTab from '@/components/character/AppearanceTab';
import InterestsTab from '@/components/character/InterestsTab';

type TabType = 'basic' | 'appearance' | 'interests';

export default function AddCharacterScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    age: '',
    gender: 'n/a',
    hairColor: '#8B4513',
    eyeColor: '#8B4513',
    interests: [],
    customInterests: [],
  });

  const updateFormData = (updates: Partial<CharacterFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    // TODO: Save character logic
    // Navigate to character selection screen after character creation
    router.push('/story/character-selection');
  };

  const handleNext = () => {
    // Navigate through tabs or to next screen
    if (activeTab === 'basic') {
      setActiveTab('appearance');
    } else if (activeTab === 'appearance') {
      setActiveTab('interests');
    } else {
      // After interests tab, go to home
      router.push('/(tabs)/home');
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Character</Text>
        <View style={styles.headerSpacer} />
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
    justifyContent: 'space-between',
    paddingTop: 70, // Extra space for mobile date/time area + more padding
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A1929', // Fixed background
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