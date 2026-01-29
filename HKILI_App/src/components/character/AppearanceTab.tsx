import React, { useState } from 'react';
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

const MALE_FACES = [
  { id: 1, name: 'Classic', shape: 'square' },
  { id: 2, name: 'Round', shape: 'round' },
  { id: 3, name: 'Angular', shape: 'angular' },
  { id: 4, name: 'Oval', shape: 'oval' },
  { id: 5, name: 'Heart', shape: 'heart' },
  { id: 6, name: 'Diamond', shape: 'diamond' },
  { id: 7, name: 'Long', shape: 'long' },
  { id: 8, name: 'Wide', shape: 'wide' },
  { id: 9, name: 'Narrow', shape: 'narrow' },
  { id: 10, name: 'Strong', shape: 'strong' },
];

const FEMALE_FACES = [
  { id: 1, name: 'Soft', shape: 'soft' },
  { id: 2, name: 'Round', shape: 'round' },
  { id: 3, name: 'Elegant', shape: 'elegant' },
  { id: 4, name: 'Oval', shape: 'oval' },
  { id: 5, name: 'Heart', shape: 'heart' },
  { id: 6, name: 'Diamond', shape: 'diamond' },
  { id: 7, name: 'Delicate', shape: 'delicate' },
  { id: 8, name: 'Classic', shape: 'classic' },
  { id: 9, name: 'Sweet', shape: 'sweet' },
  { id: 10, name: 'Bold', shape: 'bold' },
];

const SKIN_COLORS = [
  '#FDBCB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#654321'
];

const HAIR_STYLES = {
  male: ['Short', 'Buzz Cut', 'Wavy', 'Curly', 'Spiky', 'Long', 'Bald'],
  female: ['Long', 'Bob', 'Curly', 'Wavy', 'Straight', 'Pixie', 'Braided']
};

const FACIAL_HAIR = ['None', 'Mustache', 'Beard', 'Goatee', 'Full Beard'];

export default function AppearanceTab({ formData, updateFormData, onNext }: AppearanceTabProps) {
  const [selectedFace, setSelectedFace] = useState(1);
  const [selectedSkinColor, setSelectedSkinColor] = useState('#FDBCB4');
  const [selectedHairStyle, setSelectedHairStyle] = useState('Short');
  const [selectedFacialHair, setSelectedFacialHair] = useState('None');

  const faces = formData.gender === 'male' ? MALE_FACES : 
               formData.gender === 'female' ? FEMALE_FACES : 
               [...MALE_FACES.slice(0, 5), ...FEMALE_FACES.slice(0, 5)];

  const renderFaceSelector = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="person-outline" size={20} color="#4CAF50" />
        <Text style={styles.sectionTitle}>Face Shape</Text>
      </View>
      <View style={styles.faceGrid}>
        {faces.map((face) => (
          <TouchableOpacity
            key={face.id}
            style={[
              styles.faceButton,
              selectedFace === face.id && styles.selectedFaceButton,
            ]}
            onPress={() => setSelectedFace(face.id)}
          >
            <View style={[styles.facePreview, { backgroundColor: selectedSkinColor }]}>
              <View style={[styles.faceEyes, { backgroundColor: formData.eyeColor, left: 10 }]} />
              <View style={[styles.faceEyes, { backgroundColor: formData.eyeColor, right: 10 }]} />
            </View>
            <Text style={styles.faceName}>{face.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSkinColorPicker = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="color-palette-outline" size={20} color="#4CAF50" />
        <Text style={styles.sectionTitle}>Skin Color</Text>
      </View>
      <View style={styles.colorGrid}>
        {SKIN_COLORS.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              selectedSkinColor === color && styles.selectedColorButton,
            ]}
            onPress={() => setSelectedSkinColor(color)}
          >
            {selectedSkinColor === color && (
              <View style={styles.selectedIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderHairStylePicker = () => {
    const hairStyles = formData.gender === 'male' || formData.gender === 'female' 
      ? HAIR_STYLES[formData.gender] 
      : HAIR_STYLES.male.slice(0, 4);
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cut-outline" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Hair Style</Text>
        </View>
        <View style={styles.styleGrid}>
          {hairStyles.map((style, index) => (
            <TouchableOpacity
              key={`hair-${index}`}
              style={[
                styles.styleButton,
                selectedHairStyle === style && styles.selectedStyleButton,
              ]}
              onPress={() => setSelectedHairStyle(style)}
            >
              <Text style={styles.styleName}>{style}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderFacialHairPicker = () => {
    if (formData.gender !== 'male') return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="man-outline" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Facial Hair</Text>
        </View>
        <View style={styles.styleGrid}>
          {FACIAL_HAIR.map((style, index) => (
            <TouchableOpacity
              key={`facial-${index}`}
              style={[
                styles.styleButton,
                selectedFacialHair === style && styles.selectedStyleButton,
              ]}
              onPress={() => setSelectedFacialHair(style)}
            >
              <Text style={styles.styleName}>{style}</Text>
            </TouchableOpacity>
          ))}
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
    <View style={styles.section}>
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

  const renderPreview = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="eye-outline" size={20} color="#4CAF50" />
        <Text style={styles.sectionTitle}>Preview</Text>
      </View>
      <View style={styles.previewContainer}>
        <View style={styles.avatarContainer}>
          <View style={[styles.face, { backgroundColor: selectedSkinColor }]}>
            <View style={[styles.hair, { backgroundColor: formData.hairColor }]} />
            <View style={styles.eyesContainer}>
              <View style={[styles.eye, { backgroundColor: formData.eyeColor }]} />
              <View style={[styles.eye, { backgroundColor: formData.eyeColor }]} />
            </View>
            {selectedFacialHair !== 'None' && (
              <View style={[styles.facialHair, { backgroundColor: formData.hairColor }]} />
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {renderPreview()}
        {renderFaceSelector()}
        {renderSkinColorPicker()}
        {renderHairStylePicker()}
        {renderColorPicker(
          'Hair Color',
          HAIR_COLORS,
          formData.hairColor,
          (color) => updateFormData({ hairColor: color }),
          'cut-outline'
        )}
        {renderColorPicker(
          'Eye Color',
          EYE_COLORS,
          formData.eyeColor,
          (color) => updateFormData({ eyeColor: color }),
          'eye-outline'
        )}
        {renderFacialHairPicker()}

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
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  faceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  faceButton: {
    width: 60,
    alignItems: 'center',
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedFaceButton: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  facePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  faceEyes: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    top: 12,
  },
  faceName: {
    fontSize: 10,
    color: theme.colors.text,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedColorButton: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  styleButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStyleButton: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  styleName: {
    fontSize: 12,
    color: theme.colors.text,
  },
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  face: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hair: {
    position: 'absolute',
    top: -5,
    left: 5,
    right: 5,
    height: 35,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  eyesContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 22,
    gap: 12,
  },
  eye: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  facialHair: {
    position: 'absolute',
    bottom: 15,
    width: 30,
    height: 15,
    borderRadius: 8,
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