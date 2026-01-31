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

const SKIN_COLORS = [
  '#FDBCB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#654321'
];

const HAIR_STYLES = {
  male: ['Short', 'Buzz Cut', 'Wavy', 'Curly', 'Spiky', 'Long', 'Bald'],
  female: ['Long', 'Bob', 'Curly', 'Wavy', 'Straight', 'Pixie', 'Braided']
};

export default function AppearanceTab({ formData, updateFormData, onNext }: AppearanceTabProps) {
  const [activeSection, setActiveSection] = useState<'skin' | 'hair' | 'eyes'>('skin');
  const [selectedSkinColor, setSelectedSkinColor] = useState('#F1C27D');
  const [selectedHairStyle, setSelectedHairStyle] = useState('Short');

  const hairStyles = formData.gender === 'male' || formData.gender === 'female'
    ? HAIR_STYLES[formData.gender]
    : HAIR_STYLES.male.slice(0, 4);

  const renderSectionTabs = () => (
    <View style={styles.sectionTabs}>
      {[
        { key: 'skin', label: 'Skin', icon: 'happy-outline' },
        { key: 'hair', label: 'Hair', icon: 'cut-outline' },
        { key: 'eyes', label: 'Eyes', icon: 'eye-outline' },
      ].map((tab) => {
        const isActive = activeSection === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.sectionTab, isActive && styles.sectionTabActive]}
            onPress={() => setActiveSection(tab.key as 'skin' | 'hair' | 'eyes')}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={isActive ? theme.colors.text : theme.colors.textSecondary}
            />
            <Text style={[styles.sectionTabText, isActive && styles.sectionTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderColorRow = (
    colors: string[],
    selectedColor: string,
    onSelect: (color: string) => void
  ) => (
    <View style={styles.colorRow}>
      {colors.map((color, index) => {
        const isActive = selectedColor === color;
        return (
          <TouchableOpacity
            key={`${color}-${index}`}
            style={[
              styles.colorDot,
              { backgroundColor: color },
              isActive && styles.colorDotActive,
            ]}
            onPress={() => onSelect(color)}
          >
            {isActive && <View style={styles.colorDotInner} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStyleChips = () => (
    <View style={styles.chipRow}>
      {hairStyles.map((style) => {
        const isActive = selectedHairStyle === style;
        return (
          <TouchableOpacity
            key={style}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => setSelectedHairStyle(style)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{style}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderHair = () => {
    if (selectedHairStyle === 'Bald') {
      return null;
    }

    const colorStyle = { backgroundColor: formData.hairColor };

    if (selectedHairStyle === 'Buzz Cut') {
      return <View style={[styles.avatarHairBuzz, colorStyle]} />;
    }

    if (selectedHairStyle === 'Pixie') {
      return <View style={[styles.avatarHairPixie, colorStyle]} />;
    }

    if (selectedHairStyle === 'Spiky') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairSpike, styles.hairSpikeOne, colorStyle]} />
          <View style={[styles.hairSpike, styles.hairSpikeTwo, colorStyle]} />
          <View style={[styles.hairSpike, styles.hairSpikeThree, colorStyle]} />
        </>
      );
    }

    if (selectedHairStyle === 'Wavy') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairWave, styles.hairWaveOne, colorStyle]} />
          <View style={[styles.hairWave, styles.hairWaveTwo, colorStyle]} />
          <View style={[styles.hairWave, styles.hairWaveThree, colorStyle]} />
        </>
      );
    }

    if (selectedHairStyle === 'Curly') {
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

    if (selectedHairStyle === 'Long') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairBack, colorStyle]} />
          <View style={[styles.hairSideLeft, colorStyle]} />
          <View style={[styles.hairSideRight, colorStyle]} />
        </>
      );
    }

    if (selectedHairStyle === 'Bob') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairBobBack, colorStyle]} />
          <View style={[styles.hairBobSideLeft, colorStyle]} />
          <View style={[styles.hairBobSideRight, colorStyle]} />
        </>
      );
    }

    if (selectedHairStyle === 'Straight') {
      return (
        <>
          <View style={[styles.avatarHairBase, colorStyle]} />
          <View style={[styles.hairStraightBack, colorStyle]} />
          <View style={[styles.hairSideLeft, colorStyle]} />
          <View style={[styles.hairSideRight, colorStyle]} />
        </>
      );
    }

    if (selectedHairStyle === 'Braided') {
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.avatarCard}>
          <View style={styles.avatarTop}>
           
            <Text style={styles.avatarTitle}>Preview Avatar</Text>
           
          </View>
          <View style={styles.avatarStage}>
            <View style={styles.avatarArc} />
            <View style={styles.avatarFrame}>
              <View style={[styles.avatarFace, { backgroundColor: selectedSkinColor }]}>
                {renderHair()}
                <View style={styles.avatarEyes}>
                  <View style={[styles.avatarEye, { backgroundColor: formData.eyeColor }]} />
                  <View style={[styles.avatarEye, { backgroundColor: formData.eyeColor }]} />
                </View>
                <View style={styles.avatarMouth} />
              </View>
            </View>
          </View>
        </View>

        {renderSectionTabs()}

        <View style={styles.sectionCard}>
          {activeSection === 'skin' && (
            <>
              <Text style={styles.sectionLabel}>Skin tone</Text>
              {renderColorRow(SKIN_COLORS, selectedSkinColor, setSelectedSkinColor)}
            </>
          )}

          {activeSection === 'hair' && (
            <>
              <Text style={styles.sectionLabel}>Hair color</Text>
              {renderColorRow(HAIR_COLORS, formData.hairColor, (color) => updateFormData({ hairColor: color }))}
              <Text style={styles.sectionLabel}>Hair style</Text>
              {renderStyleChips()}
            </>
          )}

          {activeSection === 'eyes' && (
            <>
              <Text style={styles.sectionLabel}>Eye color</Text>
              {renderColorRow(EYE_COLORS, formData.eyeColor, (color) => updateFormData({ eyeColor: color }))}
            </>
          )}
        </View>

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
  avatarArc: {
    position: 'absolute',
    top: 0,
    width: 240,
    height: 160,
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 160,
    backgroundColor: 'transparent',
  },
  avatarFrame: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarFace: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHairBase: {
    position: 'absolute',
    top: -6,
    left: 10,
    right: 10,
    height: 55,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  avatarHairBuzz: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    height: 36,
    borderRadius: 18,
  },
  avatarHairPixie: {
    position: 'absolute',
    top: -2,
    left: 14,
    right: 14,
    height: 42,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  hairFringe: {
    position: 'absolute',
    top: 32,
    left: 24,
    width: 36,
    height: 14,
    borderRadius: 8,
  },
  hairWave: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    top: 16,
  },
  hairWaveOne: {
    left: 18,
  },
  hairWaveTwo: {
    left: 48,
  },
  hairWaveThree: {
    right: 18,
  },
  hairCurl: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 20,
  },
  hairCurlOne: {
    left: 14,
  },
  hairCurlTwo: {
    left: 36,
  },
  hairCurlThree: {
    right: 36,
  },
  hairCurlFour: {
    right: 14,
  },
  hairSpike: {
    position: 'absolute',
    width: 10,
    height: 22,
    borderRadius: 6,
    top: -8,
  },
  hairSpikeOne: {
    left: 24,
    transform: [{ rotate: '-18deg' }],
  },
  hairSpikeTwo: {
    left: 50,
    transform: [{ rotate: '8deg' }],
  },
  hairSpikeThree: {
    right: 24,
    transform: [{ rotate: '18deg' }],
  },
  hairBack: {
    position: 'absolute',
    top: 44,
    left: 8,
    right: 8,
    height: 52,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  hairSideLeft: {
    position: 'absolute',
    left: 4,
    top: 38,
    width: 18,
    height: 46,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  hairSideRight: {
    position: 'absolute',
    right: 4,
    top: 38,
    width: 18,
    height: 46,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  hairBobBack: {
    position: 'absolute',
    top: 44,
    left: 12,
    right: 12,
    height: 36,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  hairBobSideLeft: {
    position: 'absolute',
    left: 8,
    top: 40,
    width: 16,
    height: 30,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  hairBobSideRight: {
    position: 'absolute',
    right: 8,
    top: 40,
    width: 16,
    height: 30,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  hairStraightBack: {
    position: 'absolute',
    top: 42,
    left: 10,
    right: 10,
    height: 56,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  hairBraid: {
    position: 'absolute',
    right: 18,
    top: 46,
    width: 14,
    height: 46,
    borderRadius: 7,
  },
  hairBraidSegment: {
    position: 'absolute',
    right: 18,
    width: 14,
    height: 10,
    borderRadius: 5,
  },
  hairBraidSegmentOne: {
    top: 50,
  },
  hairBraidSegmentTwo: {
    top: 62,
  },
  hairBraidSegmentThree: {
    top: 74,
  },
  avatarEyes: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  avatarEye: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  avatarMouth: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginTop: 10,
    opacity: 0.6,
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 6,
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionTabActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  sectionTabText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  sectionTabTextActive: {
    color: theme.colors.text,
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: theme.spacing.md,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: theme.colors.text,
  },
  colorDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipActive: {
    backgroundColor: '#4CAF50',
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: theme.colors.text,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  nextButtonText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
