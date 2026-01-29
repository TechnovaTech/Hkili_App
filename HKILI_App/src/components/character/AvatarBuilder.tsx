import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { createAvatar } from '@dicebear/core';
import * as AvataaarsModule from '@dicebear/avataaars';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { AVATAR_OPTIONS, AVATAR_LABELS } from '@/constants/avatarOptions';

interface AvatarBuilderProps {
  config: Record<string, any>;
  onChange: (newConfig: Record<string, any>) => void;
}

const CATEGORIES = Object.keys(AVATAR_OPTIONS) as (keyof typeof AVATAR_OPTIONS)[];

export default function AvatarBuilder({ config, onChange }: AvatarBuilderProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof AVATAR_OPTIONS>('top');
  const resolvedStyle = (AvataaarsModule as any).avataaars ?? (AvataaarsModule as any).default ?? AvataaarsModule;

  const avatarSvg = useMemo(() => {
    if (!resolvedStyle || !(resolvedStyle as any).schema) {
      return getFallbackSvg(200);
    }
    return createAvatar(resolvedStyle, {
      ...config,
      size: 128,
    }).toString();
  }, [config, resolvedStyle]);

  const handleOptionSelect = (option: string) => {
    onChange({
      ...config,
      [activeCategory]: [option],
    });
  };

  const renderCategoryIcon = (category: string) => {
    let iconName: keyof typeof Ionicons.glyphMap = 'help-outline';
    switch (category) {
      case 'top': iconName = 'person-outline'; break;
      case 'accessories': iconName = 'glasses-outline'; break;
      case 'hairColor': iconName = 'color-palette-outline'; break;
      case 'facialHair': iconName = 'man-outline'; break;
      case 'clothes': iconName = 'shirt-outline'; break;
      case 'eyes': iconName = 'eye-outline'; break;
      case 'eyebrow': iconName = 'remove-outline'; break;
      case 'mouth': iconName = 'happy-outline'; break;
      case 'skinColor': iconName = 'body-outline'; break;
    }
    return <Ionicons name={iconName} size={24} color={activeCategory === category ? theme.colors.primary : theme.colors.textSecondary} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        <View style={styles.avatarWrapper}>
          <SvgXml xml={avatarSvg} width={200} height={200} />
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesList}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                activeCategory === category && styles.activeCategoryTab,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              {renderCategoryIcon(category)}
              <Text 
                style={[
                  styles.categoryLabel,
                  activeCategory === category && styles.activeCategoryLabel
                ]}
              >
                {AVATAR_LABELS[category]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView 
          style={styles.optionsArea} 
          contentContainerStyle={styles.optionsGrid}
        >
          {AVATAR_OPTIONS[activeCategory].map((option: string) => {
            const isSelected = config[activeCategory]?.[0] === option || (Array.isArray(config[activeCategory]) && config[activeCategory].includes(option));
            const isColor = activeCategory.toLowerCase().includes('color');
            
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOptionButton,
                  isColor && { backgroundColor: theme.colors.surface }
                ]}
                onPress={() => handleOptionSelect(option)}
              >
                {isColor ? (
                   <View style={[styles.colorPreview, { backgroundColor: getColorHex(option) }]} />
                ) : (
                  <Text style={[
                    styles.optionLabel,
                    isSelected && styles.selectedOptionLabel
                  ]}>
                    {formatOptionName(option)}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const formatOptionName = (name: string) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

const getColorHex = (name: string) => {
  const colors: Record<string, string> = {
    aurora: '#EDF4FA',
    black: '#262E33',
    blonde: '#B58143',
    blondeGolden: '#D6B370',
    brown: '#724133',
    brownDark: '#4A312C',
    pastelPink: '#F59797',
    platinum: '#ECF0F2',
    red: '#A55728',
    silverGray: '#E8E1E1',
    tanned: '#FD9841',
    yellow: '#F8D25C',
    pale: '#FFDBB4',
    light: '#EDB98A',
    darkBrown: '#A55729',
    white: '#FFFFFF',
    blue: '#65C9FF',
    green: '#A7FFC4',
  };
  return colors[name] || '#CCCCCC';
};

const getFallbackSvg = (size: number) => {
  const safeSize = Math.max(10, size);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${safeSize}" height="${safeSize}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#E6E6E6"/><circle cx="35" cy="45" r="6" fill="#8B8B8B"/><circle cx="65" cy="45" r="6" fill="#8B8B8B"/><path d="M30 70 Q50 80 70 70" stroke="#8B8B8B" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlsContainer: {
    flex: 1,
  },
  categoriesList: {
    maxHeight: 80,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoriesContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  categoryTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  activeCategoryTab: {
    backgroundColor: theme.colors.primary + '20', // 20% opacity
  },
  categoryLabel: {
    fontSize: 12,
    marginTop: 4,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeCategoryLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  optionsArea: {
    flex: 1,
    padding: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  optionButton: {
    width: 80,
    height: 80,
    margin: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  selectedOptionButton: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.primary + '10',
  },
  optionLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: theme.colors.text,
  },
  selectedOptionLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
