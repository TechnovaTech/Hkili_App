import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { CharacterFormData } from '@/types/character';
import { MALE_AVATARS, FEMALE_AVATARS, ALL_AVATARS, getAvatarSource } from '../../utils/avatarUtils';

interface AppearanceTabProps {
  formData: CharacterFormData;
  updateFormData: (updates: Partial<CharacterFormData>) => void;
  onNext: () => void;
}

export default function AppearanceTab({ formData, updateFormData, onNext }: AppearanceTabProps) {
  // Filter avatars by gender if specified
  const filteredAvatars = formData.gender === 'male' 
    ? MALE_AVATARS 
    : formData.gender === 'female' 
      ? FEMALE_AVATARS 
      : ALL_AVATARS;

  const renderMiniAvatar = (av: any) => {
    const isSelected = formData.avatarUrl === av.id;

    return (
      <TouchableOpacity
        key={av.id}
        style={[styles.miniAvatarCard, isSelected && styles.miniAvatarCardActive]}
        onPress={() => updateFormData({
          avatarUrl: av.id,
          gender: av.gender as 'male' | 'female' | 'n/a'
        })}
      >
        <Image 
          source={getAvatarSource(av.id)} 
          style={styles.miniAvatarImage}
          resizeMode="cover"
        />
        {isSelected && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.avatarCard}>
          <View style={styles.avatarTop}>
            <Text style={styles.avatarTitle}>Preview Avatar</Text>
          </View>
          <View style={styles.avatarStage}>
            <View style={styles.avatarFrame}>
              <Image 
                source={getAvatarSource(formData.avatarUrl, formData.gender, formData.name)} 
                style={styles.mainAvatarImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose an Avatar</Text>
          <Text style={styles.sectionSubtitle}>
            {formData.gender === 'male' ? 'Showing male characters' : 
             formData.gender === 'female' ? 'Showing female characters' : 
             'Showing all characters'}
          </Text>
        </View>

        <View style={styles.avatarGrid}>
          {filteredAvatars.map(av => renderMiniAvatar(av))}
        </View>

        <TouchableOpacity 
          style={[styles.nextButton, !formData.avatarUrl && styles.nextButtonDisabled]} 
          onPress={onNext}
          disabled={!formData.avatarUrl}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  avatarCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  avatarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarStage: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  avatarFrame: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  mainAvatarImage: {
    width: '100%',
    height: '100%',
  },
  emptyAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAvatarText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  miniAvatarCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  miniAvatarCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  miniAvatarImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  nextButtonText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
