import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { CharacterFormData, HAIR_COLORS } from '@/types/character';
import { AvatarPreview } from './AvatarRender';
import { AvatarOptionGrid } from './AvatarOptionGrid';

const { width } = Dimensions.get('window');

interface AppearanceTabProps {
  formData: CharacterFormData;
  updateFormData: (updates: Partial<CharacterFormData>) => void;
  onNext: () => void;
}

const SKIN_COLORS = [
  '#FDBCB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#654321', '#FFDFC4', '#F0D5BE', '#EECEB3', '#3E2723'
];

// DiceBear Avataaars Options
const AVATAR_TOPS = {
  male: [
    'shortHair', 'shortHairTheCaesar', 'shortHairTheCaesarSidePart', 'shortHairSides', 
    'shortHairShortWaved', 'shortHairShortRound', 'shortHairShortFlat', 'shortHairShortCurly',
    'shortHairShaggyMullet', 'shortHairFrizzle', 'shortHairDreads01', 'shortHairDreads02',
    'turban', 'winterHat1', 'winterHat2', 'hat', 'noHair'
  ],
  female: [
    'longHairBigHair', 'longHairBob', 'longHairBun', 'longHairCurly', 'longHairCurvy', 
    'longHairDreads', 'longHairFrida', 'longHairFro', 'longHairFroBand', 'longHairMiaWallace', 
    'longHairNotTooLong', 'longHairShavedSides', 'longHairStraight', 'longHairStraight2', 
    'longHairStraightStrand', 'hijab', 'shortHair', 'noHair'
  ],
  'n/a': [
    'shortHair', 'longHairStraight', 'longHairCurly', 'shortHairDreads01', 'longHairBob', 
    'hat', 'winterHat1', 'noHair', 'eyepatch'
  ]
};

const FACIAL_HAIR = [
  'none', 'beardLight', 'beardMagestic', 'beardMedium', 'moustacheFancy', 'moustacheMagnum'
];

const GLASSES = [
  'none', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers'
];

const EYES = [
  'default', 'happy', 'wink', 'hearts', 'side', 'squint', 'surprised', 'cry', 'eyeRoll'
];

const MOUTHS = [
  'default', 'smile', 'sad', 'serious', 'concerned', 'grimace', 'tongue', 'twinkle', 'eating', 'vomit'
];

const EYEBROWS = [
  'default', 'defaultNatural', 'angry', 'angryNatural', 'flatNatural', 'raisedExcited', 'raisedExcitedNatural', 'sadConcerned', 'sadConcernedNatural', 'unibrowNatural', 'upDown', 'upDownNatural'
];

const CLOTHING = [
  'blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'
];

const CLOTHING_COLORS = [
  '#262E33', '#65C9FF', '#5199E4', '#25557C', '#E6E6E6', '#929598', '#3C4F5C', '#B1E2FF', '#A7FFC4', '#FFDEB5', '#FFAAF0', '#FF5C5C', '#FF4D4D'
];

export default function AppearanceTab({ formData, updateFormData, onNext }: AppearanceTabProps) {
  const [activeSection, setActiveSection] = useState('Hair'); // Hair, Face, Features, Outfit

  const renderSectionTabs = () => (
    <View style={styles.sectionTabs}>
      {['Hair', 'Face', 'Features', 'Outfit'].map((section) => (
        <TouchableOpacity
          key={section}
          style={[styles.sectionTab, activeSection === section && styles.activeSectionTab]}
          onPress={() => setActiveSection(section)}
        >
          <Text style={[styles.sectionTabText, activeSection === section && styles.activeSectionTabText]}>
            {section}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOptions = () => {
    switch (activeSection) {
      case 'Hair':
        const gender = formData.gender === 'male' || formData.gender === 'female' ? formData.gender : 'n/a';
        const stylesList = AVATAR_TOPS[gender] || AVATAR_TOPS['n/a'];
        
        return (
          <View style={styles.optionsGrid}>
            <Text style={styles.optionTitle}>Hair Style</Text>
            <AvatarOptionGrid
              formData={formData}
              options={stylesList}
              optionType="hairStyle"
              selectedOption={formData.hairStyle}
              onSelect={(val) => updateFormData({ hairStyle: val })}
            />

            <Text style={[styles.optionTitle, { marginTop: 20 }]}>Hair Color</Text>
            <View style={styles.colorGrid}>
              {HAIR_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }, formData.hairColor === color && styles.selectedColorOption]}
                  onPress={() => updateFormData({ hairColor: color })}
                >
                   {formData.hairColor === color && <Ionicons name="checkmark" size={16} color={color === '#FFFFFF' ? '#000' : '#FFF'} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'Face':
        return (
           <View style={styles.optionsGrid}>
             <Text style={styles.optionTitle}>Skin Tone</Text>
             <View style={styles.colorGrid}>
               {SKIN_COLORS.map(color => (
                 <TouchableOpacity
                   key={color}
                   style={[styles.colorOption, { backgroundColor: color }, formData.skinColor === color && styles.selectedColorOption]}
                   onPress={() => updateFormData({ skinColor: color })}
                 >
                   {formData.skinColor === color && <Ionicons name="checkmark" size={16} color={color === '#3E2723' || color === '#654321' ? '#FFF' : '#000'} />}
                 </TouchableOpacity>
               ))}
             </View>

             <Text style={[styles.optionTitle, { marginTop: 20 }]}>Mouth Expression</Text>
             <AvatarOptionGrid
              formData={formData}
              options={MOUTHS}
              optionType="mouth"
              selectedOption={formData.mouth}
              onSelect={(val) => updateFormData({ mouth: val })}
            />
            
            <Text style={[styles.optionTitle, { marginTop: 20 }]}>Eyebrows</Text>
             <AvatarOptionGrid
              formData={formData}
              options={EYEBROWS}
              optionType="eyebrows"
              selectedOption={formData.eyebrows}
              onSelect={(val) => updateFormData({ eyebrows: val })}
            />
           </View>
        );

      case 'Features':
        return (
          <View style={styles.optionsGrid}>
             <Text style={styles.optionTitle}>Facial Hair</Text>
             <AvatarOptionGrid
              formData={formData}
              options={FACIAL_HAIR}
              optionType="facialHair"
              selectedOption={formData.facialHair}
              onSelect={(val) => updateFormData({ facialHair: val })}
            />

             <Text style={[styles.optionTitle, { marginTop: 20 }]}>Glasses</Text>
             <AvatarOptionGrid
              formData={formData}
              options={GLASSES}
              optionType="glasses"
              selectedOption={formData.glasses}
              onSelect={(val) => updateFormData({ glasses: val })}
            />
          </View>
        );
      
      case 'Outfit':
        return (
          <View style={styles.optionsGrid}>
            <Text style={styles.optionTitle}>Clothing</Text>
             <AvatarOptionGrid
              formData={formData}
              options={CLOTHING}
              optionType="clothing"
              selectedOption={formData.clothing}
              onSelect={(val) => updateFormData({ clothing: val })}
            />
            
            <Text style={[styles.optionTitle, { marginTop: 20 }]}>Clothing Color</Text>
            <View style={styles.colorGrid}>
              {CLOTHING_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }, formData.clothingColor === color && styles.selectedColorOption]}
                  onPress={() => updateFormData({ clothingColor: color })}
                >
                   {formData.clothingColor === color && <Ionicons name="checkmark" size={16} color={color === '#FFFFFF' || color === '#E6E6E6' ? '#000' : '#FFF'} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Preview Section */}
      <View style={styles.previewContainer}>
        <View style={styles.previewBg} />
        <AvatarPreview formData={formData} size={260} />
      </View>

      {/* Controls Section */}
      <View style={styles.controlsContainer}>
        {renderSectionTabs()}
        {renderOptions()}
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextButtonText}>Next</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFF" />
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
  },
  previewContainer: {
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  previewBg: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  controlsContainer: {
    paddingHorizontal: 20,
  },
  sectionTabs: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeSectionTab: {
    backgroundColor: theme.colors.primary,
  },
  sectionTabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12, // Slightly smaller to fit 4 tabs
    fontWeight: '600',
  },
  activeSectionTabText: {
    color: '#FFF',
    fontWeight: '700',
  },
  optionsGrid: {
    gap: 16,
  },
  optionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorOption: {
    borderColor: '#FFF',
    transform: [{ scale: 1.1 }],
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  styleOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedStyleOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.secondary,
  },
  styleOptionText: {
    color: '#FFF',
    fontSize: 14,
  },
  selectedStyleOptionText: {
    fontWeight: '700',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
