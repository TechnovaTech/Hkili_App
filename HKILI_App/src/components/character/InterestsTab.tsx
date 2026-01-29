import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { CharacterFormData, PREDEFINED_INTERESTS } from '@/types/character';

interface InterestsTabProps {
  formData: CharacterFormData;
  updateFormData: (updates: Partial<CharacterFormData>) => void;
  onNext: () => void;
}

const INTEREST_ICONS: { [key: string]: string } = {
  'Sports': 'basketball-outline',
  'Music': 'musical-notes-outline',
  'Art': 'color-palette-outline',
  'Reading': 'book-outline',
  'Science': 'flask-outline',
  'Animals': 'paw-outline',
  'Nature': 'leaf-outline',
  'Cooking': 'restaurant-outline',
  'Dancing': 'body-outline',
  'Space': 'rocket-outline',
  'Video Games': 'game-controller-outline',
  'Superheroes': 'shield-outline',
  'Princesses': 'heart-outline',
  'Cars': 'car-outline',
  'Magic': 'star-outline',
};

export default function InterestsTab({ formData, updateFormData, onNext }: InterestsTabProps) {
  const [customInterestInput, setCustomInterestInput] = useState('');
  const maxSelections = 5;
  const remainingSlots = maxSelections - formData.interests.length;

  const toggleInterest = (interest: string) => {
    const currentInterests = formData.interests;
    if (currentInterests.includes(interest)) {
      updateFormData({
        interests: currentInterests.filter(i => i !== interest)
      });
    } else if (currentInterests.length < maxSelections) {
      updateFormData({
        interests: [...currentInterests, interest]
      });
    }
  };

  const addCustomInterest = () => {
    if (customInterestInput.trim() && formData.interests.length < maxSelections) {
      const customInterests = customInterestInput
        .split(',')
        .map(interest => interest.trim())
        .filter(interest => interest.length > 0);
      
      const availableSlots = maxSelections - formData.interests.length;
      const interestsToAdd = customInterests.slice(0, availableSlots);
      
      updateFormData({
        interests: [...formData.interests, ...interestsToAdd],
        customInterests: [...formData.customInterests, ...interestsToAdd]
      });
      setCustomInterestInput('');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Interests</Text>
          <Text style={styles.remainingText}>
            {remainingSlots} slots remaining
          </Text>
        </View>

        {/* Predefined Interests */}
        <View style={styles.interestsGrid}>
          {PREDEFINED_INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestButton,
                formData.interests.includes(interest) && styles.selectedInterest,
                formData.interests.length >= maxSelections && 
                !formData.interests.includes(interest) && styles.disabledInterest,
              ]}
              onPress={() => toggleInterest(interest)}
              disabled={formData.interests.length >= maxSelections && !formData.interests.includes(interest)}
            >
              <Ionicons
                name={INTEREST_ICONS[interest] as any}
                size={20}
                color={formData.interests.includes(interest) ? theme.colors.text : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.interestText,
                  formData.interests.includes(interest) && styles.selectedInterestText,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Interests */}
        <View style={styles.customSection}>
          <Text style={styles.customTitle}>Add Custom Interests</Text>
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              value={customInterestInput}
              onChangeText={setCustomInterestInput}
              placeholder="Games, Cartoons, Dogs, etc."
              placeholderTextColor={theme.colors.textMuted}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                (!customInterestInput.trim() || formData.interests.length >= maxSelections) && 
                styles.disabledAddButton,
              ]}
              onPress={addCustomInterest}
              disabled={!customInterestInput.trim() || formData.interests.length >= maxSelections}
            >
              <Ionicons name="add" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.customHint}>
            Separate multiple interests with commas
          </Text>
        </View>
        {/* Next Button */}
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={onNext}
        >
          <Text style={styles.nextButtonText}>Finish & Save</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  remainingText: {
    ...theme.typography.body,
    color: '#4CAF50',
    fontWeight: '600',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedInterest: {
    backgroundColor: '#4CAF50',
  },
  disabledInterest: {
    opacity: 0.5,
  },
  interestText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  selectedInterestText: {
    color: theme.colors.text,
  },
  customSection: {
    marginTop: theme.spacing.lg,
  },
  customTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  customInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    minHeight: 56,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: theme.borderRadius.md,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledAddButton: {
    opacity: 0.5,
  },
  customHint: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  nextButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
});