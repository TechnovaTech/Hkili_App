import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { CharacterFormData } from '@/types/character';
import { getDiceBearUrl } from './AvatarRender';

interface AvatarOptionGridProps {
  formData: CharacterFormData;
  options: string[];
  optionType: 'hairStyle' | 'facialHair' | 'glasses' | 'mouth' | 'eyebrows' | 'clothing';
  selectedOption: string | undefined;
  onSelect: (value: string) => void;
}

export const AvatarOptionGrid: React.FC<AvatarOptionGridProps> = ({
  formData,
  options,
  optionType,
  selectedOption,
  onSelect,
}) => {
  return (
    <View style={styles.gridContainer}>
      {options.map((option) => {
        // Generate a preview URL for this specific option
        // Use 'lean' mode to strip unrelated attributes and improve loading performance
        const previewUrl = getDiceBearUrl(formData, {
          focusedPart: optionType,
          focusedValue: option,
          lean: true, 
        });

        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionItem,
              selectedOption === option && styles.selectedOptionItem,
            ]}
            onPress={() => onSelect(option)}
          >
            <View style={styles.previewWrapper}>
              <Image
                source={{ uri: previewUrl }}
                style={styles.previewImage}
                resizeMode="contain"
              />
              {/* Overlay for selection */}
              {selectedOption === option && (
                <View style={styles.checkOverlay}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center', // Center items if they don't fill the row
  },
  optionItem: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOptionItem: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  previewWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  checkOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFF',
    borderRadius: 10,
    overflow: 'hidden',
  },
});
