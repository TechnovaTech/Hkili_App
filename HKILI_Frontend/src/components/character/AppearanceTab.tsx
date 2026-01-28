import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { CharacterFormData, HAIR_COLORS, EYE_COLORS } from '@/types/character';

interface AppearanceTabProps {
  formData: CharacterFormData;
  updateFormData: (updates: Partial<CharacterFormData>) => void;
  onNext: () => void;
}

export default function AppearanceTab({ formData, updateFormData, onNext }: AppearanceTabProps) {
  const renderColorPicker = (
    title: string,
    colors: string[],
    selectedColor: string,
    onColorSelect: (color: string) => void,
    icon: string
  ) => (
    <View style={styles.colorSection}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={20} color="#4CAF50" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.colorGrid}>
        {colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColorButton,
            ]}
            onPress={() => onColorSelect(color)}
          >
            {selectedColor === color && (
              <View style={styles.selectedIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {renderColorPicker(
          'Hair color',
          HAIR_COLORS,
          formData.hairColor,
          (color) => updateFormData({ hairColor: color }),
          'cut-outline'
        )}

        {renderColorPicker(
          'Eye color',
          EYE_COLORS,
          formData.eyeColor,
          (color) => updateFormData({ eyeColor: color }),
          'eye-outline'
        )}

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
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
  colorSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  colorGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorButton: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
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