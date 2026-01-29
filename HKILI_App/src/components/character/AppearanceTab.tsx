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

const AVATAR_STYLES = [
  { id: 1, emoji: '👤', name: 'Default' },
  { id: 2, emoji: '👦', name: 'Boy' },
  { id: 3, emoji: '👧', name: 'Girl' },
  { id: 4, emoji: '🧒', name: 'Child' },
  { id: 5, emoji: '👨', name: 'Man' },
  { id: 6, emoji: '👩', name: 'Woman' },
  { id: 7, emoji: '🧑', name: 'Person' },
  { id: 8, emoji: '👴', name: 'Old Man' },
  { id: 9, emoji: '👵', name: 'Old Woman' },
  { id: 10, emoji: '🤴', name: 'Prince' },
  { id: 11, emoji: '👸', name: 'Princess' },
  { id: 12, emoji: '🧙‍♂️', name: 'Wizard' },
  { id: 13, emoji: '🧙‍♀️', name: 'Witch' },
  { id: 14, emoji: '🦸‍♂️', name: 'Hero' },
  { id: 15, emoji: '🦸‍♀️', name: 'Heroine' },
  { id: 16, emoji: '🧚‍♂️', name: 'Fairy' },
];

export default function AppearanceTab({ formData, updateFormData, onNext }: AppearanceTabProps) {
  const renderAvatarPreview = () => {
    const selectedHair = formData.hairColor;
    const selectedEyes = formData.eyeColor;
    
    return (
      <View style={styles.colorSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Character Preview</Text>
        </View>
        <View style={styles.avatarPreview}>
          <View style={styles.avatarContainer}>
            {/* Face */}
            <View style={styles.face}>
              {/* Hair */}
              <View style={[styles.hair, { backgroundColor: selectedHair }]} />
              {/* Eyes */}
              <View style={styles.eyesContainer}>
                <View style={[styles.eye, { backgroundColor: selectedEyes }]} />
                <View style={[styles.eye, { backgroundColor: selectedEyes }]} />
              </View>
              {/* Nose */}
              <View style={styles.nose} />
              {/* Mouth */}
              <View style={styles.mouth} />
            </View>
          </View>
        </View>
      </View>
    );
  };
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
        {renderAvatarPreview()}
        
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedColorButton: {
    borderColor: '#4CAF50',
    borderWidth: 4,
    transform: [{ scale: 1.1 }],
  },
  selectedIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
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
  avatarGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarButton: {
    width: 70,
    height: 80,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  selectedAvatarButton: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  avatarEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  avatarName: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  face: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDBCB4',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  hair: {
    position: 'absolute',
    top: -8,
    left: 8,
    right: 8,
    height: 45,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  eyesContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 28,
    gap: 18,
  },
  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  nose: {
    position: 'absolute',
    top: 45,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8A598',
  },
  mouth: {
    position: 'absolute',
    top: 55,
    width: 16,
    height: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#FF6B6B',
  },
});